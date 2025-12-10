import { User, UserManager } from "oidc-client-ts";

export class AuthServiceWorker {
  private userManager: UserManager;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
    navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
        type: "module",
      },
    ).then((registration) => {
      if (registration.active) {
        // Listen for user load/unload events to update the service worker
        this.userManager.events.addUserLoaded(async (user) => {
          await this.setAccessToken(registration.active!, user);
        });
        this.userManager.events.addUserUnloaded(async () => {
          await this.setAccessToken(registration.active!, null);
        });

        // Listen for token expired messages from the service worker
        registration.active.addEventListener("message", async (event) => {
          console.debug(
            "AuthServiceWorker: Received message from service worker",
            event,
          );
          if (event.data.type === "accessTokenExpired") {
            const user = await this.userManager.getUser();
            await this.setAccessToken(registration.active!, user);
          }
        });

        // Set the initial access token
        this.userManager.getUser().then(async (user) => {
          this.setAccessToken(registration.active!, user);
        });
      }
    }).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }

  private async setAccessToken(
    serviceWorker: ServiceWorker,
    user: User | null,
  ) {
    serviceWorker.postMessage({
      type: "authLoaded",
      accessToken: user?.access_token
        ? {
          token: user.access_token,
          expiresAtMs: user.expires_at ? user.expires_at * 1000 : 0,
        }
        : null,
    });
  }
}
