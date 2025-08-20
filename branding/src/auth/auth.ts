import settings from "../settings";
import { Log, User, UserManager } from "oidc-client-ts";

import Cookies from "js-cookie";

Log.setLogger(console);

/**
 * Module that handles OIDC authentication for the portal when it is not served by a Grails application.
 * When logged in, a additional cookie is set.
 * This cookie is used by all the services to determine if they should log the user in immediately when he does not have a running session.
 * Thus avoiding the need to log in multiple times.
 * This logic is part of the ala-security project.
 */

export const userManager = createUserManager();

async function createUserManager() {
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
    automaticSilentRenew: true,
    monitorSession: true,
  });

  manager.events.addAccessTokenExpired(function () {
    console.warn("Access token expired");
    manager.signinSilent();
  });
  manager.events.addSilentRenewError((user) => {
    console.error("Silent renew error", user);
  });

  return manager;
}

export function getCurrentUrl() {
  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.searchParams.delete("login");
  cleanedUrl.searchParams.delete("logout");
  cleanedUrl.searchParams.delete("code");
  cleanedUrl.searchParams.delete("state");
  return cleanedUrl;
}

export async function isLoggedIn() {
  const mgr = await userManager;
  const user = await mgr.getUser();
  return user !== null;
}

export async function getUser(): Promise<User | null> {
  return await userManager.then((mgr) => mgr.getUser());
}

export async function login(
  extraQueryParams: Record<string, string | number | boolean> | undefined =
    undefined,
) {
  const mgr = await userManager;
  clearAlaAuthCookies();
  setAlaAuthCookie();
  await mgr.signinRedirect({ extraQueryParams });
}

export async function logout() {
  await userManager.then((mgr) => {
    clearAlaAuthCookies();
    mgr.signoutRedirect();
  });
}

export function setAlaAuthCookie(user?: User) {
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
    "bie-hub",
    "bie-index",
    "biocache-hub",
    "biocache-service",
    "spatial-hub",
    "spatial-service",
  ].forEach((path) => {
    Cookies.remove("JSESSIONID", {
      path: `/${path}`,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
  });
}
