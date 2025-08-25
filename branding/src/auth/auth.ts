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

async function initUserManager(authServiceWorker: AuthServiceWorker) {
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
    automaticSilentRenew: false,
    monitorSession: false,
  });
  await handleAuthCallbacks(manager);

  if (
    Cookies.get(settings.auth.ala.authCookieName)
  ) {
    const user = await manager.getUser();
    if (!user || user.expired) {
      silentLogin();
    }
  }

  authServiceWorker.setAccessToken(await manager.getUser());

  manager.events.addAccessTokenExpiring(() => {
    console.warn("Access token expiring");
    silentLogin();
  });
  manager.events.addAccessTokenExpired(function () {
    console.warn("Access token expired");
    silentLogin();
  });
  manager.events.addSilentRenewError((user) => {
    console.error("Silent renew error", user);
    logout(false);
  });

  return manager;
}

async function handleAuthCallbacks(manager: UserManager) {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("login") !== null) {
    const user = await manager.signinCallback();
    setAlaAuthCookie(user);
    authServiceWorker.setAccessToken(user);

    window.location.replace(getCurrentUrl());
  } else if (urlParams.get("logout") !== null) {
    await manager.signoutCallback();

    window.history.pushState(null, document.title, getCurrentUrl());
  }
}

async function silentLogin() {
  const manager = await userManagerPromise;
  try {
    const user = await manager.signinSilent();
    authServiceWorker.setAccessToken(user!);
    setAlaAuthCookie(user!);
  } catch (error) {
    console.error("Silent login failed", error);
    logout(false);
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
  authServiceWorker.reset();
  const mgr = await userManagerPromise;
  await mgr.signinRedirect(args);
}

export async function logout(reload: boolean = true) {
  const mgr = await userManagerPromise;
  clearAlaAuthCookies();
  authServiceWorker.setAccessToken(null);
  mgr.removeUser();
  if (reload) {
    window.location.reload();
  }
}

export async function getUser(): Promise<User | null> {
  const mgr = await userManagerPromise;
  return await mgr.getUser();
}

export async function isLoggedIn() {
  return getUser() !== null;
}
