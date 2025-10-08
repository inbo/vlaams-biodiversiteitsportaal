/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import {
    AuthLoadedMessage,
    ResetAuthLoadedMessage,
} from "./service-worker-events";

const jwtPaths = [
    "/biocache-service/",
];

let resolveAccessToken: (value: string | null) => void;
let accessTokenPromise: Promise<string | null>;

function resetAuthLoaded() {
    console.info("Resetting service worker auth state");
    accessTokenPromise = new Promise<string | null>((resolve) => {
        resolveAccessToken = resolve;
    });
}

const customHeaderRequestFetch = async (event: any) => {
    // Cannot read cookie name from settings because firefox does not allow import
    const authCookie = await cookieStore.get("VBP-AUTH");

    if (authCookie) {
        console.debug("User is authenticated, injecting access token");

        const accessToken = await accessTokenPromise;
        if (accessToken) {
            console.debug("Fetching biocache-service with access-token");

            let headers = new Headers(event.request.headers);
            headers.append(
                "Authorization",
                `Bearer ${accessToken}`,
            );

            const newRequest = new Request(event.request, {
                headers,
                mode: "cors",
            });
            const response = await fetch(newRequest);
            console.debug("Response received from biocache-service", response);
            console.debug(event);
            event.respondWith(response);
        } else {
            console.error(
                "User should be authenticated, but access token resolved to null",
            );
        }
    }
};

self.addEventListener("install", (event) => {
    console.debug(`Service Worker: Installing...`);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", () => {
    console.debug(`Service Worker: Activating...`);
    resetAuthLoaded();

    self.addEventListener("message", (event) => {
        console.log(`Message received: ${event.data}`);
        const data = event.data as (AuthLoadedMessage | ResetAuthLoadedMessage);

        switch (data.type) {
            case "resetAuthLoaded":
                console.info("Resetting service worker auth state");
                resetAuthLoaded();
                break;
            case "authLoaded":
                console.info(
                    `Setting service worker auth state: ${data.accessToken}`,
                );
                resolveAccessToken(data.accessToken);
                break;
            default:
                console.error("Unknown message type:", data);
        }
    });

    self.addEventListener("fetch", (event: any) => {
        console.error("Fetch event:", event);
        if (jwtPaths.some((path) => event.request.url.includes(path))) {
            console.debug("Fetch from biocache-service:", event.request.url);
            console.warn(event.waitUntil);
            event.waitUntil(customHeaderRequestFetch(event));
        }
    }, { capture: true });

    console.info("Service Worker: Activated and ready to handle requests.");
});
