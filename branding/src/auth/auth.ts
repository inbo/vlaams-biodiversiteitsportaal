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
    silent_redirect_uri: `${settings.domain}?login=vbp`,
    automaticSilentRenew: false,
    monitorSession: false,
  });
  await handleAuthCallbacks(manager);

  manager.events.addAccessTokenExpiring(async () => {
    console.warn("Access token expiring");
    await silentLogin();
  });
  manager.events.addAccessTokenExpired(async function () {
    console.warn("Access token expired");
    await silentLogin();
  });
  manager.events.addSilentRenewError(async (user) => {
    console.error("Silent renew error", user);
    await handleLogout();
  });

  const user = await manager.getUser();
  await authServiceWorker.setAccessToken(user);

  // Try to login silently when the cookie is present, but no user is available
  if (
    Cookies.get(settings.auth.ala.authCookieName) &&
    (!user || user.expired)
  ) {
    silentLogin();
  }

  return manager;
}

async function handleAuthCallbacks(manager: UserManager) {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("login") !== null) {
    const user = await manager.signinCallback();
    await handleLogin(user!);

    window.history.pushState(null, document.title, getCurrentUrl());
  } else if (urlParams.get("logout") !== null) {
    await handleLogout();

    window.history.pushState(null, document.title, getCurrentUrl());
  }
}

async function silentLogin() {
  const manager = await userManagerPromise;
  try {
    const user = await manager.signinSilent();
    await authServiceWorker.setAccessToken(user!);
    setAlaAuthCookie(user!);
  } catch (error) {
    console.error("Silent login failed", error);
    await handleLogout();
  }
}

async function handleLogin(user: User) {
  await authServiceWorker.setAccessToken(user);
  setAlaAuthCookie(user);
}

async function handleLogout() {
  await authServiceWorker.setAccessToken(null);
  clearAlaAuthCookies();
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
  await authServiceWorker.reset();
  clearAlaAuthCookies();
  const mgr = await userManagerPromise;
  await mgr.signinRedirect(args);
}

export async function logout(reload: boolean = true) {
  await handleLogout();
  const mgr = await userManagerPromise;
  await mgr.signoutRedirect();
}

export async function getUser(): Promise<User | null> {
  const mgr = await userManagerPromise;
  return await mgr.getUser();
}

export async function isLoggedIn() {
  return getUser() !== null;
}
