let accessToken: string | undefined;
addEventListener("message", (event) => {
    console.log(`Message received: ${event.data}`);
    accessToken = event.data;
});

self.addEventListener("fetch", async function (event: any) {
    if (accessToken && event.request.url.includes("/biocache-service/")) {
        console.log("Service Worker: Fetch event for", event.request.url);
        event.respondWith(customHeaderRequestFetch(event));
    }
});

function customHeaderRequestFetch(event: any) {
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
}

console.log("Service Worker: Registered and ready to handle requests.");
