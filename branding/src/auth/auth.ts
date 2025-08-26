import settings from "../settings";
import { Log, SigninRedirectArgs, User, UserManager } from "oidc-client-ts";

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
  const redirectUrl = getCurrentUrl();
  redirectUrl.searchParams.set("login", "vbp");

  const post_logout_redirect_uri = getCurrentUrl();
  post_logout_redirect_uri.searchParams.set("logout", "vbp");

  const manager = new UserManager({
    authority: settings.auth.oidc.authority,
    client_id: settings.auth.oidc.clientId,
    redirect_uri: redirectUrl.href,
    post_logout_redirect_uri: post_logout_redirect_uri.href,
    scope: "openid email ala/roles",
    includeIdTokenInSilentSignout: true,
    //       userStore: new WebStorageStateStore({
    //         store: window.session,
    //       }),
    silent_redirect_uri: `${settings.domain}?login=vbp`,
    automaticSilentRenew: false,
    monitorSession: false,
  });
  await handleAuthCallbacks(manager);

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

  manager.events.addAccessTokenExpiring(async () => {
    console.warn("Access token expiring");
    await silentLogin(manager);
  });
  manager.events.addAccessTokenExpired(async function () {
    console.warn("Access token expired");
    await silentLogin(manager);
  });
  manager.events.addSilentRenewError(async (user) => {
    console.error("Silent renew error", user);
    await manager.removeUser();
  });

  const user = await manager.getUser();

  if (user) {
    if (user.expired) {
      await silentLogin(manager);
    }
  } else {
    if (Cookies.get(settings.auth.ala.authCookieName)) {
      await silentLogin(manager);
    }
  }
  await authServiceWorker.setAccessToken(user);

  return manager;
}

async function handleAuthCallbacks(manager: UserManager) {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("login") !== null) {
    await manager.signinCallback();
    window.history.pushState(null, document.title, getCurrentUrl());
  } else if (urlParams.get("logout") !== null) {
    await manager.signoutCallback();
    window.history.pushState(null, document.title, getCurrentUrl());
  }
}

async function silentLogin(manager: UserManager) {
  try {
    await manager.signinSilent();
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

function getCurrentUrl() {
  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.searchParams.delete("login");
  cleanedUrl.searchParams.delete("logout");
  cleanedUrl.searchParams.delete("code");
  cleanedUrl.searchParams.delete("state");
  cleanedUrl.searchParams.delete("sessionState");
  return cleanedUrl;
}

export async function login(args?: SigninRedirectArgs | any) {
  clearAlaAuthCookies();
  setAlaAuthCookie();
  await authServiceWorker.reset();
  const mgr = await userManagerPromise;
  await mgr.signinRedirect(args);
}

export async function logout() {
  const mgr = await userManagerPromise;
  await mgr.removeUser();
  await mgr.signoutRedirect();
}

export async function getUser(): Promise<User | null> {
  const mgr = await userManagerPromise;
  return await mgr.getUser();
}

export async function isLoggedIn() {
  return getUser() !== null;
}
