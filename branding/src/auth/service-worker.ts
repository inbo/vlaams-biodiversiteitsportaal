/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import {
    AccessToken,
    AuthLoadedMessage,
    ResetAuthLoadedMessage,
} from "./service-worker-events";

const jwtPaths = ["/biocache-service/", "/spatial-hub/portal/"];

let resolved = false;
let resolveAccessToken: (value: AccessToken | null) => void;
let accessTokenPromise: Promise<AccessToken | null> =
    new Promise<AccessToken | null>((resolve) => {
        resolveAccessToken = resolve;
    });

function resetAuthLoaded() {
    if (resolved) {
        resolved = false;
        console.info("Service Worker: Resetting service worker auth state");
        accessTokenPromise = new Promise<AccessToken | null>((resolve) => {
            resolveAccessToken = resolve;
        });
    }
}

function setAuthAccessToken(accessToken: AccessToken) {
    if (accessToken && accessToken.expiresAtMs < Date.now()) {
        console.warn(
            "Tried to set expired access token, ignoring",
            accessToken,
        );
        return;
    }
    const oldResolveAccessToken = resolveAccessToken;
    accessTokenPromise = new Promise<AccessToken | null>((resolve) => {
        resolveAccessToken = resolve;
        if (!resolved) {
            resolved = true;
            oldResolveAccessToken(accessToken);
        }
        resolve(accessToken);
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

        const accessToken = await new Promise<AccessToken | null>(
            async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject("Service Worker: Timeout waiting for access token");
                }, 5000);
                const token = await accessTokenPromise;
                clearTimeout(timeout);
                resolve(token);
            },
        );
        if (accessToken) {
            if (
                accessToken.expiresAtMs &&
                accessToken.expiresAtMs < Date.now()
            ) {
                console.warn(
                    "Service Worker: Access token is expired, resetting",
                    accessToken,
                );
                resetAuthLoaded();
                return customHeaderRequestFetch(event);
            }
            console.debug(
                "Service Worker: Fetching with access-token",
                event.request.url,
                accessToken,
            );

            let headers = new Headers(event.request.headers);
            headers.append("Authorization", `Bearer ${accessToken.token}`);

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
    console.info("Service Worker: Activated and ready to handle requests.");
});

self.addEventListener("message", (event) => {
    const data = event.data as AuthLoadedMessage | ResetAuthLoadedMessage;
    switch (data.type) {
        case "resetAuthLoaded":
            console.info("Service Worker: Resetting service worker auth state");
            resetAuthLoaded();
            break;
        case "authLoaded":
            console.info(
                "Service Worker: Setting service worker auth state",
                data.accessToken,
            );
            setAuthAccessToken(data.accessToken);
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
        event.respondWith(
            customHeaderRequestFetch(event).catch((error) => {
                console.error(
                    "Service Worker: Error in customHeaderRequestFetch:",
                    error,
                );
                if (typeof error === "string" && error.includes("Timeout")) {
                    return new Response("Timed out waiting for access token", {
                        status: 401,
                    });
                } else {
                    throw error;
                }
            }),
        );
    }
});
