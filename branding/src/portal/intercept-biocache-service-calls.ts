import { getUserManagerInstance } from "./auth";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      type: "module",
    }).then(function (registration) {
      console.log("Service worker registered with scope: ", registration.scope);
    }, function (err) {
      console.log("ServiceWorker registration failed: ", err);
    });
  });
}

getUserManagerInstance().events.addUserLoaded(async (user) => {
  navigator.serviceWorker.ready.then((registration) => {
    registration.active!.postMessage(
      user.access_token,
    );
  });
});
