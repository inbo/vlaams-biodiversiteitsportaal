import { getUser, userManager } from "./auth";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    type: "module",
  }).then(async (registration) => {
    function updateAccessToken(accessToken: string | null) {
      if (registration.active) {
        registration.active.postMessage(accessToken);
      }
    }

    const mgr = await userManager;
    mgr.events.addUserLoaded(async (user) => {
      updateAccessToken(user.access_token);
    });

    mgr.events.addUserUnloaded(() => {
      updateAccessToken(null);
    });

    const user = await getUser();
    if (user) {
      updateAccessToken(user.access_token);
    }
  });
}
