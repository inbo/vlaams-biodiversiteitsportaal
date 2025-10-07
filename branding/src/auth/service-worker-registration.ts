import { User } from "oidc-client-ts";

export class AuthServiceWorker {
  private registrationPromise: Promise<ServiceWorkerRegistration | void>;

  constructor() {
    this.registrationPromise = navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
        type: "module",
      },
    ).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }

  async reset() {
    const reg = await this.registrationPromise;
    if (reg?.active) {
      reg.active.postMessage({ type: "resetAuthLoaded" });
    } else {
      console.warn("Service worker is not active");
    }
  }

  async setAccessToken(user: User | null) {
    const reg = await this.registrationPromise;
    if (reg?.active) {
      reg.active.postMessage({
        type: "authLoaded",
        accessToken: user?.access_token || null,
      });
    } else {
      console.warn("Service worker is not active");
    }
  }
}
