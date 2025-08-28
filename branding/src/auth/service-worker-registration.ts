import { User } from "oidc-client-ts";

export class AuthServiceWorker {
  private registrationPromise: Promise<ServiceWorkerRegistration>;

  constructor() {
    this.registrationPromise = navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
        type: "module",
      },
    );
  }

  async reset() {
    const reg = await this.registrationPromise;
    if (reg.active) {
      reg.active.postMessage({ type: "resetAuthLoaded" });
    } else {
      console.warn("Service worker is not active");
    }
  }

  async setAccessToken(user: User) {
    const reg = await this.registrationPromise;
    if (reg.active) {
      reg.active.postMessage({
        type: "authLoaded",
        accessToken: user.access_token,
      });
    } else {
      console.warn("Service worker is not active");
    }
  }
}
