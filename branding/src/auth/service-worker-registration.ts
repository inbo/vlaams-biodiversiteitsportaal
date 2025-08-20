import { getUser, userManager } from "./auth";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js", {
    scope: "/",
    type: "module",
  }).then(async (registration) => {
    function resetAuthLoaded() {
      if (registration.active) {
        registration.active.postMessage({ type: "resetAuthLoaded" });
      }
    }

    resetAuthLoaded();

    function authLoadedMessage(accessToken: string | null) {
      if (registration.active) {
        registration.active.postMessage({ type: "authLoaded", accessToken });
      }
    }

    const mgr = await userManager;
    mgr.events.addUserLoaded(async (user) => {
      authLoadedMessage(user.access_token);
    });

    mgr.events.addUserUnloaded(() => {
      authLoadedMessage(null);
    });

    mgr.events.addAccessTokenExpired(() => {
      resetAuthLoaded();
    });

    const user = await getUser();
    if (user) {
      authLoadedMessage(user.access_token);
    } else {
      authLoadedMessage(null);
    }
  });
}
