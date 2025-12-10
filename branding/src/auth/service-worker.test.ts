import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Service Worker Auth Tests", () => {
    let mockSelf: any;
    let localStorageMock = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
    };

    beforeEach(async () => {
        ({ mockSelf } = createServiceWorkerEnvironment());

        // Import your service worker after setting up mocks
        vi.resetModules();
        await import("./service-worker");

        vi.useFakeTimers({ shouldAdvanceTime: true });
        global.localStorage = localStorageMock as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        delete (global as any).localStorage;
    });

    test("should add listeners", async () => {
        await mockSelf.trigger("install");
        await mockSelf.trigger("activate");

        expect(mockSelf.listeners.get("install"))
            .toBeDefined();
        expect(mockSelf.listeners.get("activate"))
            .toBeDefined();
        expect(mockSelf.listeners.get("fetch"))
            .toBeDefined();
        expect(mockSelf.listeners.get("message"))
            .toBeDefined();
    });

    test("Given auth cookie is set block untill access-token provided and inject user credentials in request header", async () => {
        // GIVEN
        const request = new Request("http://test.com/biocache-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };
        const response = new Response("MOCKED", { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(response);

        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");

        // Auth Cookie is set
        vi.mocked(cookieStore.get).mockResolvedValue({
            value: "test-auth-cookie",
        });

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);

        // THEN
        let resolved = false;
        fetchEvent.respondWith.mock.calls[0][0].then(() => {
            resolved = true;
        });

        await new Promise((r) => setTimeout(r, 100));
        expect(resolved).toBe(false);
        expect(global.fetch).not.toHaveBeenCalledWith();

        await mockSelf.trigger("message", {
            data: {
                type: "authLoaded",
                accessToken: {
                    token: "test-access-token",
                    expiresAt: Date.now() + 60_000,
                },
            },
        });
        await new Promise((r) => setTimeout(r, 100));
        expect(resolved).toBe(true);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: new Headers({
                    Authorization: "Bearer test-access-token",
                }),
            }),
        );
        expect(fetchEvent.respondWith).toHaveBeenCalledWith(
            new Promise((resolve) => resolve(response)),
        );
    });

    test("Given auth cookie is set, access token is set, but expired block untill access-token is reset and inject user credentials in request header", async () => {
        // GIVEN
        const request = new Request("http://test.com/biocache-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };
        const response = new Response("MOCKED", { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(response);

        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");

        // Auth Cookie is set
        vi.mocked(cookieStore.get).mockResolvedValue({
            value: "test-auth-cookie",
        });

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);

        // THEN
        let resolved = false;
        fetchEvent.respondWith.mock.calls[0][0].then(() => {
            resolved = true;
        });

        await new Promise((r) => setTimeout(r, 100));
        expect(resolved).toBe(false);
        expect(global.fetch).not.toHaveBeenCalledWith();

        await mockSelf.trigger("message", {
            data: {
                type: "authLoaded",
                accessToken: {
                    token: "expired-access-token",
                    expiresAtMs: Date.now() - 60_000,
                },
            },
        });
        await new Promise((r) => setTimeout(r, 100));
        expect(resolved).toBe(false);

        await mockSelf.trigger("message", {
            data: {
                type: "authLoaded",
                accessToken: {
                    token: "test-access-token",
                    expiresAtMs: Date.now() + 60_000,
                },
            },
        });

        await new Promise((r) => setTimeout(r, 100));
        expect(resolved).toBe(true);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: new Headers({
                    Authorization: "Bearer test-access-token",
                }),
            }),
        );
        expect(fetchEvent.respondWith).toHaveBeenCalledWith(
            new Promise((resolve) => resolve(response)),
        );
    });

    test("Given auth cookie is set block untill access-token is explicitely set to null do not perform custom request", async () => {
        // GIVEN
        const request = new Request("http://test.com/biocache-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };
        const response = new Response("MOCKED", { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(response);

        // Auth Cookie is set
        vi.mocked(cookieStore.get).mockResolvedValue({
            value: "test-auth-cookie",
        });

        // Trigger service worker events and set access token
        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");
        await mockSelf.trigger("message", {
            data: { type: "authLoaded", accessToken: null },
        });

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);
        await new Promise((r) => setTimeout(r, 100));

        // THEN
        expect(global.fetch).toBeCalled();
        expect(fetchEvent.respondWith).toHaveBeenCalledWith(
            new Promise((resolve) => resolve(response)),
        );
    });

    test("Given auth cookie is set block untill timeout", async () => {
        // GIVEN
        const request = new Request("http://test.com/biocache-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };

        // Auth Cookie is set
        vi.mocked(cookieStore.get).mockResolvedValue({
            value: "test-auth-cookie",
        });

        // Trigger service worker events and set access token
        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);
        await vi.runAllTimersAsync();

        // THEN
        expect(global.fetch).not.toBeCalled();
        expect(fetchEvent.respondWith).toHaveBeenCalledWith(
            new Promise((resolve) =>
                resolve(
                    new Response("Timed out waiting for access token", {
                        status: 401,
                    }),
                )
            ),
        );
    });

    test("Given no auth cookie block, but perform custom request", async () => {
        // GIVEN
        const request = new Request("http://test.com/biocache-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };
        const response = new Response("MOCKED", { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(response);

        // Trigger service worker events and set access token
        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);
        await new Promise((r) => setTimeout(r, 100));

        // THEN
        expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
        expect(fetchEvent.respondWith).toHaveBeenCalledWith(
            new Promise((resolve) => resolve(response)),
        );
    });

    test("Given url does not match biocache-service, do not block or perform custom request", async () => {
        // GIVEN
        const request = new Request("http://test.com/some-other-service/test");
        const fetchEvent = {
            request,
            respondWith: vi.fn(),
        };

        // Trigger service worker events and set access token
        await mockSelf.trigger("install", { waitUntil: vi.fn() });
        await mockSelf.trigger("activate");

        // WHEN
        await mockSelf.trigger("fetch", fetchEvent);

        // THEN
        expect(global.fetch).not.toBeCalled();
        expect(fetchEvent.respondWith).not.toBeCalled();
    });
});

function createServiceWorkerEnvironment() {
    const mockSelf = {
        listeners: new Map<string, Function[]>(),

        addEventListener: vi.fn(
            (
                event: keyof ServiceWorkerGlobalScopeEventMap,
                handler: Function,
            ) => {
                if (!mockSelf.listeners.has(event)) {
                    mockSelf.listeners.set(event, []);
                }
                mockSelf.listeners.get(event)!.push(handler);
            },
        ),
        skipWaiting: vi.fn(),
        clients: {
            claim: vi.fn(),
        },
        trigger: async (event: string, eventObject = {
            waitUntil: vi.fn(),
        }) => {
            const handlers = mockSelf.listeners.get(event) || [];
            for (const handler of handlers) {
                await handler(eventObject);
            }
        },
    };

    // Set up global mocks
    vi.stubGlobal("self", mockSelf);
    vi.stubGlobal("cookieStore", {
        get: vi.fn(),
        set: vi.fn(),
    });

    return { mockSelf };
}
