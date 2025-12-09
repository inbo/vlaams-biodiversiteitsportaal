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
    scope: "openid email ala/roles",
    includeIdTokenInSilentSignout: true,
    prompt: settings.auth.oidc.prompt,
    //       userStore: new WebStorageStateStore({
    //         store: window.session,
    //       }),

    silent_redirect_uri: `${settings.domain}?front-auth-action=login`,
    automaticSilentRenew: false,
    monitorSession: false,
    userStore: new WebStorageStateStore({ store: localStorage }),
  });

  async function refreshToken() {
    if (!document.hidden) {
      await silentLogin(manager);
    }
  }

  window.addEventListener("focus", async function () {
    const user = await manager.getUser();
    if (user && user.expires_at && user.expires_at > Date.now() - 60_000) {
      console.debug("Window focused, and access token expired, refreshing");
      refreshToken();
    }
  }, false);

  manager.events.addUserLoaded(async (user) => {
    console.log("User loaded", user);
    setAlaAuthCookie(user);
    await authServiceWorker.setAccessToken(
      user,
      refreshToken,
    );
  });
  manager.events.addUserUnloaded(async () => {
    console.log("User unloaded");
    clearAlaAuthCookies();
    await authServiceWorker.setAccessToken(null, null);
  });

  manager.events.addAccessTokenExpiring(async () => {
    console.warn("Access token expiring soon");
    await refreshToken();
  });

  manager.events.addAccessTokenExpired(async function () {
    console.warn("Access token expired");
    await refreshToken();
  });
  manager.events.addSilentRenewError(async (user) => {
    console.error("Silent renew error", user);
    await manager.removeUser();
  });

  await handleAuthCallbacks(manager);

  const user = await manager.getUser();
  if (Cookies.get(settings.auth.ala.authCookieName)) {
    if (!user) {
      await manager.signinRedirect();
    } else {
      await authServiceWorker.setAccessToken(user, refreshToken);
    }
  } else {
    if (user) {
      await manager.removeUser();
    } else {
      await authServiceWorker.setAccessToken(null, null);
    }
  }

  return manager;
}

async function handleAuthCallbacks(manager: UserManager) {
  const urlParams = new URLSearchParams(window.location.search);

  const frontAuthAction = urlParams.get("front-auth-action");
  if (frontAuthAction) {
    switch (frontAuthAction) {
      case "login":
        await manager.signinCallback();
        await manager.clearStaleState();
        break;
      case "logout":
        await manager.signoutCallback();
        await manager.clearStaleState();
        break;
    }

    window.history.pushState(
      null,
      document.title,
      cleanupUrl(window.location.href),
    );
  }
}

async function silentLogin(manager: UserManager) {
  try {
    await manager.signinSilent({ silentRequestTimeoutInSeconds: 2 });
  } catch (error) {
    console.error("Silent login failed", error);
    await manager.removeUser();
  }
}

function setAlaAuthCookie(user?: User) {
  Cookies.set(
    settings.auth.ala.authCookieName,
    user?.profile?.sub || "vbp",
    {
      path: "/",
      sameSite: "lax",
      secure: window.location.protocol === "https:",
      domain: settings.auth.ala.authCookieDomain,
    },
  );
}

function clearAlaAuthCookies() {
  Cookies.remove(
    settings.auth.ala.authCookieName,
    {
      path: "/",
      sameSite: "lax",
      secure: window.location.protocol === "https:",
      domain: settings.auth.ala.authCookieDomain,
    },
  );
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

export async function login(args?: SigninRedirectArgs | any) {
  const mgr = await userManagerPromise;
  clearAlaAuthCookies();
  await mgr.signinRedirect(args);
}

export async function logout(args?: SignoutRedirectArgs | any) {
  const mgr = await userManagerPromise;
  clearAlaAuthCookies();
  await mgr.signoutRedirect(args);
}

export async function getUser(): Promise<User | null> {
  const mgr = await userManagerPromise;
  return await mgr.getUser();
}

export async function isLoggedIn() {
  return Cookies.get(settings.auth.ala.authCookieName) &&
    (await getUser()) !== null;
}
