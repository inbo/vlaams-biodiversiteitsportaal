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
let accessTokenPromise: Promise<string | null> = new Promise<string | null>(
    (resolve) => {
        resolveAccessToken = resolve;
    },
);

function resetAuthLoaded() {
    console.info("Service Worker: Resetting service worker auth state");
    accessTokenPromise = new Promise<string | null>((resolve) => {
        resolveAccessToken = resolve;
    });
}

const customHeaderRequestFetch = async (event: any) => {
    // Cannot read cookie name from settings because firefox does not allow import
    const authCookie = await cookieStore.get("VBP-AUTH");

    if (authCookie) {
        console.debug(
            "Service Worker: User is authenticated, injecting access token",
            event.request.url,
        );

        const accessToken = await accessTokenPromise;
        if (accessToken) {
            console.debug(
                "Service Worker: Fetching with access-token | ",
                event.request.url,
            );

            let headers = new Headers(event.request.headers);
            headers.append(
                "Authorization",
                `Bearer ${accessToken}`,
            );

            const newRequest = new Request(event.request, {
                headers,
                mode: "cors",
            });
            return await fetch(newRequest);
        } else {
            console.error(
                "Service Worker: User should be authenticated, but access token resolved to null",
                event.request.url,
            );
        }
    }
    return await fetch(event.request);
};

self.addEventListener("install", (event) => {
    console.debug(`Service Worker: Installing...`);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", () => {
    console.debug(`Service Worker: Activating...`);
    resetAuthLoaded();
    console.info("Service Worker: Activated and ready to handle requests.");
});

self.addEventListener("message", (event) => {
    const data = event.data as (AuthLoadedMessage | ResetAuthLoadedMessage);
    switch (data.type) {
        case "resetAuthLoaded":
            console.info(
                "Service Worker: Resetting service worker auth state",
            );
            resetAuthLoaded();
            break;
        case "authLoaded":
            console.info(
                `Service Worker: Setting service worker auth state: ${data.accessToken}`,
            );
            resolveAccessToken(data.accessToken);
            break;
        default:
            console.error("Service Worker: Unknown message type:", data);
    }
});

self.addEventListener("fetch", (event: any) => {
    if (jwtPaths.some((path) => event.request.url.includes(path))) {
        console.debug(
            "Service Worker: Fetch from biocache-service:",
            event.request.url,
        );
        event.respondWith(customHeaderRequestFetch(event));
    }
});
