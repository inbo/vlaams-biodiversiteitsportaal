/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import {
    AccessToken,
    AuthLoadedMessage,
    ResetAuthLoadedMessage,
} from "./service-worker-events";

const jwtPaths = [
    "/biocache-service/",
];

const DB_NAME = "VBP_AUTH_DB";
const DB_VERSION = 1;
const STORE_NAME = "auth_tokens";
const TOKEN_KEY = "biocache_access_token";

// IndexedDB helper functions
async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function storeAccessToken(token: AccessToken | null): Promise<void> {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        if (token) {
            store.put(token, TOKEN_KEY);
        } else {
            store.delete(TOKEN_KEY);
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error("Service Worker: Failed to store access token:", error);
    }
}

async function getStoredAccessToken(): Promise<AccessToken | null> {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(TOKEN_KEY);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const token = request.result;
                // Check if token is expired
                if (
                    token && token.expiresAtMs && token.expiresAtMs < Date.now()
                ) {
                    console.warn(
                        "Service Worker: Stored token is expired, removing",
                    );
                    storeAccessToken(null); // Remove expired token
                    resolve(null);
                } else {
                    resolve(token || null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(
            "Service Worker: Failed to retrieve access token:",
            error,
        );
        return null;
    }
}

let resolveAccessToken: (value: AccessToken | null) => void;
let accessTokenPromise: Promise<AccessToken | null> =
    initializeAccessTokenPromise();

async function initializeAccessTokenPromise(): Promise<AccessToken | null> {
    // Try to load from IndexedDB first
    const storedToken = await getStoredAccessToken();

    if (storedToken) {
        console.info("Service Worker: Initialized with stored access token");
        return storedToken;
    }

    // If no stored token, wait for it to be provided via message
    return new Promise<AccessToken | null>((resolve) => {
        resolveAccessToken = resolve;
    });
}

async function resetAuthLoaded() {
    console.info("Service Worker: Resetting service worker auth state");
    await storeAccessToken(null);
    accessTokenPromise = new Promise<AccessToken | null>((resolve) => {
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
                    accessToken.token,
                    accessToken.expiresAtMs,
                );
                await resetAuthLoaded();
                return customHeaderRequestFetch(event);
            }
            console.debug(
                "Service Worker: Fetching with access-token | ",
                event.request.url,
            );

            let headers = new Headers(event.request.headers);
            headers.append(
                "Authorization",
                `Bearer ${accessToken.token}`,
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

self.addEventListener("activate", (event) => {
    console.debug(`Service Worker: Activating...`);
    event.waitUntil(self.clients.claim());
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
                "Service Worker: Setting service worker auth state",
                data.accessToken,
            );
            resolveAccessToken(data.accessToken);
            storeAccessToken(data.accessToken);
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
