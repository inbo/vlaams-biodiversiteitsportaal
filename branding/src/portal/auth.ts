import Cookies from "js-cookie";
import settings from "../settings";
import { Log, User, UserManager } from "oidc-client-ts";

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
  redirectUrl.searchParams.set("login", "true");

  const post_logout_redirect_uri = getCurrentUrl();
  post_logout_redirect_uri.searchParams.set("logout", "true");

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
  });
  manager.events.addSilentRenewError((user) => {
    console.error("Silent renew error", user);
  });

  loginIfAuthCookieIsSet(manager);
  return manager;
}

async function loginIfAuthCookieIsSet(manager: UserManager) {
  if (
    typeof Cookies.get(settings.auth.ala.authCookieName) !== "undefined" &&
    (await manager.getUser() === null)
  ) {
    await manager.signinSilent()
      .then(async () => {
        console.info(
          "Successfully logged in silently based on presence of cookie",
        );
        await manager.getUser();
      })
      .catch((err) => {
        console.error(
          "Failed to silently login based on presence of cookie and absence of user in browser session",
          err,
        );
      });
  }
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
  // First check if the URL has a login or logout parameter
  // The cookie can be late to update
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("login") !== null) {
    return true;
  } else if (currentUrl.searchParams.get("logout") !== null) {
    return false;
  } else {
    const authCookie = Cookies.get(settings.auth.ala.authCookieName);
    const result = typeof authCookie !== "undefined" &&
      (await getUser() !== null);
    return result;
  }
}

export async function getUser(): Promise<User | null> {
  return await userManager.then((mgr) => mgr.getUser());
}

export async function login(
  extraQueryParams: Record<string, string | number | boolean> | undefined =
    undefined,
) {
  await userManager.then((mgr) => mgr.signinRedirect({ extraQueryParams }));
}

export async function logout() {
  await userManager.then((mgr) => mgr.signoutRedirect());
}
