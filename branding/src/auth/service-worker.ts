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
    console.warn("Resetting service worker auth state");
    accessTokenPromise = new Promise<string | null>((resolve) => {
        resolveAccessToken = resolve;
    });
}

resetAuthLoaded();

addEventListener("install", () => {
    console.log(`Service Worker: Installing...`);
    // Could be dangerous, but we want the latest version immediately
    skipWaiting();
});

addEventListener("active", () => {
    console.log(`Service Worker: active...`);
});

addEventListener("message", (event) => {
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
}, { capture: true });

addEventListener("fetch", (event: any) => {
    console.info("Fetch event:", event.request.url);

    if (jwtPaths.some((path) => event.request.url.includes(path))) {
        customHeaderRequestFetch(event);
    }
});

const customHeaderRequestFetch = async (event: any) => {
    let headers = new Headers(event.request.headers);

    // Cannot read from settings because firefox does not allow import
    const authCookie = await cookieStore.get("VBP-AUTH");
    if (authCookie) {
        console.log(
            "Service Worker: User is authenticated, using credentials.",
        );
        const accessToken = await accessTokenPromise;
        if (accessToken) {
            headers.append(
                "Authorization",
                `Bearer ${accessToken}`,
            );

            const newRequest = new Request(event.request, {
                headers,
                mode: "cors",
            });
            event.respondWith(await fetch(newRequest));
        }
    }
};

console.log("Service Worker: Registered and ready to handle requests.");
