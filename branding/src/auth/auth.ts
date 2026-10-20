import settings from "../settings";
import {
    Log,
    SigninRedirectArgs,
    SignoutRedirectArgs,
    User,
    UserManager,
    WebStorageStateStore,
} from "oidc-client-ts";

import Cookies from "js-cookie";
import {
    AUTH_RENEW_REQUEST_EVENT,
    reportAuthFailure,
} from "./auth-events";
import { AuthServiceWorker } from "./service-worker-registration";

Log.setLogger(console);

/**
 * Module that handles OIDC authentication for the portal when it is not served by a Grails application.
 * When logged in, a additional cookie is set.
 * This cookie is used by all the services to determine if they should log the user in immediately when he does not have a running session.
 * Thus avoiding the need to log in multiple times.
 * This logic is part of the ala-security project.
 */

const authServiceWorker = new AuthServiceWorker();
export const userManagerPromise = initUserManager(authServiceWorker);

/** Keycloak SSO idle timeout. Also the cookie's own Max-Age: the browser
 * deletes the cookie once the session chain it promises can no longer be
 * honored, so cookie-exists ⇒ fresh by construction and no staleness checks
 * are needed anywhere. */
const SSO_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

async function initUserManager(
    authServiceWorker: AuthServiceWorker,
): Promise<UserManager> {
    console.debug("Initializing OIDC UserManager");
    authServiceWorker.reset();

    const redirectUrl = cleanupUrl(window.location.href);
    redirectUrl.searchParams.set("front-auth-action", "login");

    const post_logout_redirect_uri = cleanupUrl(window.location.href);
    post_logout_redirect_uri.searchParams.set("front-auth-action", "logout");

    const manager = new UserManager({
        authority: settings.auth.oidc.authority,
        client_id: settings.auth.oidc.clientId,
        redirect_uri: redirectUrl.href,
        post_logout_redirect_uri: post_logout_redirect_uri.href,
        scope: "openid email ala/roles image-service/read",
        includeIdTokenInSilentSignout: true,
        prompt: settings.auth.oidc.prompt,
        silent_redirect_uri: `${settings.domain}?front-auth-action=login`,
        automaticSilentRenew: true,
        monitorSession: false,
        // Only session storage makes sense as all the ALA services use server side sessions, so it would never work properly
        // userStore: new WebStorageStateStore({ store: window.localStorage }),
    });

    manager.events.addUserLoaded(async (user) => {
        console.log("User loaded", user);
        setAlaAuthCookie(user);
        await authServiceWorker.setAccessToken(user);
    });
    manager.events.addUserUnloaded(async () => {
        console.log("User unloaded");
        clearAlaAuthCookies();
        await authServiceWorker.setAccessToken(null);
    });

    manager.events.addAccessTokenExpired(async function () {
        console.warn("Access token expired");
        // Background tabs throttle timers and cannot renew reliably (the silent
        // renew iframe needs third-party cookies); renew when the tab is visible again
        if (!document.hidden) {
            await attemptSilentLogin(manager);
        }
    });
    manager.events.addSilentRenewError(async (error) => {
        console.error("Silent renew error", error);
        if (document.hidden) {
            return;
        }
        await attemptSilentLogin(manager);
    });

    // The service worker asked for a renewed token (e.g. a request was
    // rejected with 401 or the stored token expired)
    window.addEventListener(AUTH_RENEW_REQUEST_EVENT, async () => {
        if (document.hidden) {
            return;
        }
        const user = await manager.getUser();
        if (!user) {
            return;
        }
        if (!user.expired) {
            // The user's token is still valid on our side: republish it so the
            // service worker can pick it up without a roundtrip to Keycloak
            await authServiceWorker.setAccessToken(user);
            return;
        }
        await attemptSilentLogin(manager);
    });

    // Renew proactively when the user returns to the tab, before the first
    // request they trigger can hit a backend with an expired token
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState !== "visible") {
            return;
        }
        const user = await manager.getUser();
        if (!user || !user.expires_at) {
            return;
        }
        const expiresAtMs = user.expires_at * 1000;
        if (expiresAtMs <= Date.now() + 60_000) {
            await attemptSilentLogin(manager);
        }
    });

    await handleAuthCallbacks(manager);

    const user = await manager.getUser();
    const authCookie = Cookies.get(settings.auth.ala.authCookieName);
    if (authCookie) {
        if (!user) {
            // The cookie exists ⇒ it was written recently by a renewal or a
            // service dance: pick up the live session silently.
            await manager.signinRedirect();
        } else {
            await authServiceWorker.setAccessToken(user);
        }
    } else {
        if (user) {
            await manager.removeUser();
        } else {
            await authServiceWorker.setAccessToken(null);
        }
    }

    return manager;
}

async function handleAuthCallbacks(manager: UserManager) {
    const urlParams = new URLSearchParams(window.location.search);

    const frontAuthAction = urlParams.get("front-auth-action");
    if (frontAuthAction) {
        try {
            switch (frontAuthAction) {
                case "login":
                    await manager.signinCallback();
                    break;
                case "logout":
                    await manager.signoutCallback();
                    break;
            }
        } catch (error) {
            // Can occur in case of refresh / old url in history, etc.
            if (
                error.message &&
                error.message.includes("No matching state found in storage")
            ) {
                console.warn(error.message);
            } else {
                console.error("Error handling auth callback", error);
            }
        }

        await manager.clearStaleState();
        window.history.pushState(
            null,
            document.title,
            cleanupUrl(window.location.href),
        );
    }
}

const renewalRetryDelaysMs = [1_000, 2_000, 4_000];

let silentRenewalInFlight: Promise<User | null> | null = null;

/**
 * Attempt to renew the session silently, with retries and backoff.
 * Concurrent calls share a single renewal. The user is only dropped when
 * renewal definitively failed (e.g. Keycloak reports login_required) or all
 * retries were exhausted.
 */
function attemptSilentLogin(manager: UserManager): Promise<User | null> {
    if (!silentRenewalInFlight) {
        silentRenewalInFlight = doSilentLogin(manager).finally(() => {
            silentRenewalInFlight = null;
        });
    }
    return silentRenewalInFlight;
}

async function doSilentLogin(manager: UserManager): Promise<User | null> {
    if (!(await manager.getUser())) {
        return null;
    }
    for (let attempt = 0; ; attempt++) {
        try {
            return await manager.signinSilent();
        } catch (error) {
            console.error("Silent login failed", error);
            if (
                isDefinitiveRenewalFailure(error) ||
                attempt >= renewalRetryDelaysMs.length
            ) {
                reportAuthFailure({
                    source: "renewal",
                    service: "",
                    path: "",
                    recovered: false,
                    hadToken: false,
                    hadCookie: !!Cookies.get(settings.auth.ala.authCookieName),
                });
                await manager.removeUser();
                return null;
            }
            await new Promise((resolve) =>
                setTimeout(resolve, renewalRetryDelaysMs[attempt])
            );
        }
    }
}

/**
 * Renewal failures that retrying cannot fix. login_required-class errors mean
 * the Keycloak session is gone; invalid_grant means the refresh token died
 * with it (e.g. the SSO session idled out while the tab was hidden). In both
 * cases the correct outcome is dropping the user, per the "logged in
 * everywhere properly, or not at all" rule.
 */
function isDefinitiveRenewalFailure(error: unknown): boolean {
    const err = error as { error?: string; message?: string };
    const definitiveErrors = [
        "interaction_required",
        "login_required",
        "consent_required",
        "invalid_grant",
    ];
    return definitiveErrors.includes(err?.error ?? "") ||
        definitiveErrors.some((e) => err?.message?.includes(e));
}

function setAlaAuthCookie(user?: User) {
    const cookieValue = JSON.stringify({
        userId: user?.profile.sub,
        refreshedAt: Date.now(),
    });

    Cookies.set(settings.auth.ala.authCookieName, cookieValue, {
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
        domain: settings.auth.ala.authCookieDomain,
        // Browser-enforced freshness: the cookie disappears SSO_IDLE_TIMEOUT_MS
        // after the last renewal, so its existence is the freshness signal.
        expires: new Date(Date.now() + SSO_IDLE_TIMEOUT_MS),
    });
}

function clearAlaAuthCookies() {
    Cookies.remove(settings.auth.ala.authCookieName, {
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
        domain: settings.auth.ala.authCookieDomain,
    });
    [
        "alerts",
        "apikey",
        "bie-hub",
        "bie-index",
        "biocache-hub",
        "biocache-service",
        "collectory",
        "data-quality-filter-service",
        "image-service",
        "logger",
        "regions",
        "sandbox-hub",
        "sandbox-service",
        "sensitive-data-service",
        "spatial-hub",
        "spatial-service",
        "species-list",
    ].forEach((path) => {
        Cookies.remove("JSESSIONID", {
            path: `/${path}`,
            sameSite: "lax",
            secure: window.location.protocol === "https:",
        });
    });
}

function cleanupUrl(url: string) {
    const cleanedUrl = new URL(url);
    cleanedUrl.searchParams.delete("front-auth-action");
    cleanedUrl.searchParams.delete("code");
    cleanedUrl.searchParams.delete("state");
    cleanedUrl.searchParams.delete("sessionState");
    cleanedUrl.searchParams.delete("session_state");
    cleanedUrl.searchParams.delete("iss");
    return cleanedUrl;
}

export async function login(args?: SigninRedirectArgs) {
    const mgr = await userManagerPromise;
    clearAlaAuthCookies();
    await mgr.signinRedirect(args);
}

export async function logout(args?: SignoutRedirectArgs) {
    const mgr = await userManagerPromise;
    clearAlaAuthCookies();
    await mgr.signoutRedirect(args);
}

export async function getUser(): Promise<User | null> {
    const mgr = await userManagerPromise;
    return await mgr.getUser();
}

export async function isLoggedIn() {
    return (
        Cookies.get(settings.auth.ala.authCookieName) &&
        (await getUser()) !== null
    );
}
