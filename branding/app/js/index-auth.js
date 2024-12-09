var Cookies = require("js-cookie");
const settings = require("js/settings");
const authCookieName = "VBP-AUTH";
const loginClass = "signedIn";
const logoutClass = "signedOut";
var in15Minutes = 1 / 24 / 4;

var loginStatusInIndex = () => {
  if (
    (document.location.origin === settings.mainLAUrl ||
      document.location.host === "localhost:3333") &&
    (document.location.pathname === "/" || document.location.pathname.startsWith("/pages"))
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const authCookieAction = urlParams.get('auth-cookie-action');
    if(authCookieAction === 'set') {
      console.log("Set auth cookie");
      Cookies.set(authCookieName, "/", { expires: in15Minutes, sameSite: 'strict', secure: settings.mainLAUrl.startsWith('https') });
    } else if(authCookieAction === 'remove') {
      console.log("Remove auth cookie");
      Cookies.remove(authCookieName);
      // Clear Grails sessions
      Cookies.remove("JSESSIONID");
    }

    let authCookie = Cookies.get(authCookieName, {
      domain: settings.mainDomain,
      path: "/",
    });

    if (typeof authCookie !== "undefined") {
      console.debug("Auth cookie present so logged in");
      $("#dropdown-auth-menu")
        .removeClass("::loginStatus::")
        .addClass(loginClass);
    } else {
      console.debug("No auth cookie not present so not-logged in");
      $("#dropdown-auth-menu")
        .removeClass("::loginStatus::")
        .addClass(logoutClass);
    }
  } else {
    if (settings.isDevel) console.log("We aren't in the main url");
  }
};

$(function () {
  // wait til drawer elements are visible
  var checkExist = setInterval(function () {
    if (window.jQuery && $("#dropdown-auth-menu").length) {
      clearInterval(checkExist);
      loginStatusInIndex();
    } else {
      if (settings.isDevel) console.log("drawer not loaded");
    }
  }, 1000);
});
