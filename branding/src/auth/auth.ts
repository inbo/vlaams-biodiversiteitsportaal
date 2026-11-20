import settings from "../settings";
import {
    Log,
    SigninRedirectArgs,
    SignoutRedirectArgs,
    User,
    UserManager,
} from "oidc-client-ts";
import { getVBPAuthClient } from "@inbo/vbp-branding/auth";

Log.setLogger(console);

/**
 * OIDC authentication for the static portal pages and the header/footer of
 * the Grails services.
 *
 * All behaviour (callbacks, the shared VBP-AUTH cookie, renewal, the service
 * worker, login/logout) lives in `VBPAuthClient` from `@inbo/vbp-branding`,
 * which the React applications (lists-ui) use as well, so they cannot drift
 * apart. This module only feeds it the portal's settings.
 */
const authClient = getVBPAuthClient({
    domain: settings.domain,
    authority: settings.auth.oidc.authority,
    clientId: settings.auth.oidc.clientId,
    prompt: settings.auth.oidc.prompt,
    authCookieName: settings.auth.ala.authCookieName,
    authCookieDomain: settings.auth.ala.authCookieDomain,
    serviceWorkerUrl: "/service-worker.js",
});

/** Resolves once the auth callback (if any) is handled and the startup state is reconciled. */
export const userManagerPromise: Promise<UserManager> = authClient.ready.then(
    () => authClient.userManager,
);

export async function login(args?: SigninRedirectArgs) {
    await authClient.login(args);
}

export async function logout(args?: SignoutRedirectArgs) {
    await authClient.logout(args);
}

export async function getUser(): Promise<User | null> {
    await authClient.ready;
    return await authClient.getUser();
}

export async function isLoggedIn(): Promise<boolean> {
    await authClient.ready;
    return await authClient.isLoggedIn();
}
