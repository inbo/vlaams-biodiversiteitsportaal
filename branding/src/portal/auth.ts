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

$(() => {
  if (needToHandleAuth()) {
    const redirectUrl = getCurrentUrl();
    redirectUrl.searchParams.set("login", "true");

    const post_logout_redirect_uri = getCurrentUrl();
    post_logout_redirect_uri.searchParams.set("logout", "true");

    const userManager = new UserManager({
      authority: settings.auth.oidc.authority,
      client_id: settings.auth.oidc.clientId,
      redirect_uri: redirectUrl.href,
      post_logout_redirect_uri: post_logout_redirect_uri.href,
      includeIdTokenInSilentSignout: true,
      //       userStore: new WebStorageStateStore({
      //         store: window.session,
      //       }),
      automaticSilentRenew: true,
    });
    userManager.events.addAccessTokenExpired(function () {
      clearAlaAuthCookie();
    });
    addAuthButtonClickHandlers(userManager);
    handleAuthCallbacks(userManager);
    setAuthMenuStatus();
  }
});

// Check if the current page is served by a grails service.
// If not, we need to handle the auth stuff ourselves in the browser.
function needToHandleAuth() {
  return document.location.pathname === "/" ||
    document.location.pathname.startsWith("/pages");
}

function addAuthButtonClickHandlers(userManager: UserManager) {
  const loginButtons = document.getElementsByClassName("login-button");
  for (const button of loginButtons) {
    button.addEventListener(
      "click",
      async (e) => {
        e.preventDefault();
        await userManager.signinRedirect();
      },
    );
  }
  const logoutButtons = document.getElementsByClassName("logout-button");
  for (const button of logoutButtons) {
    button.addEventListener(
      "click",
      async (e) => {
        e.preventDefault();
        await userManager.signoutRedirect();
      },
    );
  }
}

async function handleAuthCallbacks(userManager: UserManager) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("login")) {
    const user = await userManager.signinCallback();
    if (!user) {
      console.error("User not found after login");
      return;
    }
    setAlaAuthCookie(user);

    window.history.replaceState("data", document.title, getCurrentUrl());
  } else if (urlParams.get("logout")) {
    await userManager.signoutCallback();
    clearAlaAuthCookie();

    window.history.replaceState("data", document.title, getCurrentUrl());
  }
}

function setAuthMenuStatus() {
  const authMenu = document.getElementById("dropdown-auth-menu")!;

  if (isLoggedIn()) {
    console.debug("Auth cookie present so logged in");
    authMenu.classList.remove(settings.auth.ala.logoutClass);
    authMenu.classList.add(settings.auth.ala.loginClass);
  } else {
    console.debug("No auth cookie not present so not-logged in");
    authMenu.classList.remove(settings.auth.ala.loginClass);
    authMenu.classList.add(settings.auth.ala.logoutClass);
  }
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

export function isLoggedIn() {
  // First check if the URL has a login or logout parameter
  // The cookie can be late to update
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("login")) {
    return true;
  } else if (currentUrl.searchParams.get("logout")) {
    return false;
  } else {
    const authCookie = Cookies.get(settings.auth.ala.authCookieName);
    return typeof authCookie !== "undefined";
  }
}
