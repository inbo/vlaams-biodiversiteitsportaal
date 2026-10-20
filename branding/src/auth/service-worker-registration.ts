import { User } from "oidc-client-ts";
import {
  AUTH_RENEW_REQUEST_EVENT,
  reportAuthFailure,
} from "./auth-events";
import type {
  AuthFailureMessage,
  RequestRenewalMessage,
} from "./service-worker-events";

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

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data as AuthFailureMessage | RequestRenewalMessage;
      switch (data?.type) {
        case "authFailure":
          reportAuthFailure(data.detail);
          break;
        case "requestRenewal":
          window.dispatchEvent(new CustomEvent(AUTH_RENEW_REQUEST_EVENT));
          break;
      }
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
    } else {
      console.warn("Service worker is not active");
    }
  }
}
