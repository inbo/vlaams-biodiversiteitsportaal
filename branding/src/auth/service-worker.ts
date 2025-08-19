import {
    AuthLoadedMessage,
    ResetAuthLoadedMessage,
} from "./service-worker-events";

const jwtPaths = [
    "/biocache-service/mapping/wms",
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
});

addEventListener("fetch", async (event: any) => {
    console.info("Fetch event:", event.request.url);
    if (jwtPaths.some((path) => event.request.url.includes(path))) {
        const accessToken = await accessTokenPromise;
        if (accessToken) {
            console.log("Service Worker: Fetch event for", event.request.url);
            event.respondWith(customHeaderRequestFetch(event, accessToken));
        }
    }
});

const customHeaderRequestFetch = (event: any, accessToken: string) => {
    // decide for yourself which values you provide to mode and credentials
    console.log(
        "Service Worker: User is authenticated, using credentials.",
    );

    const newRequest = new Request(event.request, {
        headers: {
            ...event.request.headers,
            "Authorization": `Bearer ${accessToken}`,
        },
        mode: "cors",
    });
    return fetch(newRequest);
};

console.log("Service Worker: Registered and ready to handle requests.");
