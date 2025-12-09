import { User } from "oidc-client-ts";
import { AccessTokenExpiredMessage } from "./service-worker-events";

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

  async setAccessToken(
    user: User | null,
    refreshToken: (() => Promise<void>) | null,
  ) {
    const reg = await this.registrationPromise;
    if (reg?.active) {
      reg.active.postMessage({
        type: "authLoaded",
        accessToken: user?.access_token
          ? {
            token: user.access_token,
            expiresAt: user.expires_at ? user.expires_at * 1000 : 0,
          }
          : null,
      });
      reg.active.addEventListener("message", (event: any) => {
        const data = event.data as AccessTokenExpiredMessage;
        console.debug("Service Worker Message:", event.data);
        switch (data.type) {
          case "accessTokenExpired":
            console.info("Service Worker: Access token has expired");
            refreshToken?.();
            break;
          default:
            console.error("Unknown message type from service worker:", data);
            break;
        }
      });
    } else {
      console.warn("Service worker is not active");
    }
  }
}
