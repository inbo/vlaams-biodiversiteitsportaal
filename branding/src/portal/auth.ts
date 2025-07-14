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

$(async () => {
  await initUI();
});

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
  });
  manager.events.addAccessTokenExpired(function () {
    clearAlaAuthCookie();
  });

  await handleAuthCallbacks();
  await loginIfAuthCookieIsSet();

  return manager;
}

export async function initUI() {
  addAuthButtonClickHandlers();
  await setAuthMenuStatus();
}

function addAuthButtonClickHandlers() {
  const loginButtons = document.getElementsByClassName("login-button");
  for (const button of loginButtons) {
    button.addEventListener(
      "click",
      async (e) => {
        e.preventDefault();
        await login();
      },
    );
  }
  const logoutButtons = document.getElementsByClassName("logout-button");
  for (const button of logoutButtons) {
    button.addEventListener(
      "click",
      async (e) => {
        e.preventDefault();
        await logout();
      },
    );
  }
}

async function handleAuthCallbacks() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("login")) {
    const user = await userManager.then((mgr) => mgr.signinCallback());
    if (!user) {
      return;
    }
    setAlaAuthCookie(user);

    window.history.pushState(null, document.title, getCurrentUrl());
  } else if (urlParams.get("logout")) {
    await userManager.then((mgr) => mgr.signoutCallback());
    clearAlaAuthCookie();

    window.history.pushState(null, document.title, getCurrentUrl());
  }
}

async function loginIfAuthCookieIsSet() {
  userManager.then((mgr) =>
    mgr.events.addSilentRenewError(async (user) => {
      console.error("Silent renew error", user);
      // If silent login fails, we need to clear the cookie
      clearAlaAuthCookie();
    })
  );
  if (
    typeof Cookies.get(settings.auth.ala.authCookieName) !== "undefined" &&
    (await getUser() === null)
  ) {
    await userManager.then((mgr) =>
      mgr.signinSilent().catch((err) => {
        console.error("Silent login failed", err);
        // If silent login fails, we need to clear the cookie
        clearAlaAuthCookie();
      })
    );
  }
}

async function setAuthMenuStatus() {
  Array.from(document.getElementsByClassName("login-status-dependent"))
    .forEach(async (element) => {
      if (await isLoggedIn()) {
        element.classList.remove(settings.auth.ala.logoutClass);
        element.classList.add(settings.auth.ala.loginClass);

        const profile = (await getUser())!.profile;
        (document.getElementById("my-annotated-records")! as HTMLAnchorElement)
          .href =
            `/biocache-hub/occurrences/search/?q=*:*&fq=assertion_user_id:%22${profile.sub}%22`;
      } else {
        element.classList.remove(settings.auth.ala.loginClass);
        element.classList.add(settings.auth.ala.logoutClass);
      }
    });
}

function getCurrentUrl() {
  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.searchParams.delete("login");
  cleanedUrl.searchParams.delete("logout");
  cleanedUrl.searchParams.delete("code");
  cleanedUrl.searchParams.delete("state");
  return cleanedUrl;
}

function setAlaAuthCookie(user: User) {
  Cookies.set(
    settings.auth.ala.authCookieName,
    user.profile.sub,
    {
      path: "/",
      sameSite: "strict",
      secure: window.location.protocol === "https:",
    },
  );
}

function clearAlaAuthCookie() {
  Cookies.remove(
    settings.auth.ala.authCookieName,
    {
      path: "/",
      sameSite: "strict",
      secure: window.location.protocol === "https:",
    },
  );
}

export async function isLoggedIn() {
  // First check if the URL has a login or logout parameter
  // The cookie can be late to update
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("login")) {
    return true;
  } else if (currentUrl.searchParams.get("logout")) {
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
