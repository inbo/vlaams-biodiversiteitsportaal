import { describe, expect, test } from "vitest";
import {
    AUTH_FAILURE_EVENT,
    AuthFailureDetail,
    reportAuthFailure,
} from "./auth-events";

describe("auth-events", () => {
    test("reportAuthFailure dispatches an auth failure window event", () => {
        const failures: AuthFailureDetail[] = [];
        const listener = (event: Event) => {
            failures.push((event as CustomEvent<AuthFailureDetail>).detail);
        };
        window.addEventListener(AUTH_FAILURE_EVENT, listener);

        const detail: AuthFailureDetail = {
            source: "service-worker",
            service: "species-list",
            path: "/species-list/ws/speciesList",
            recovered: true,
            hadToken: true,
            hadCookie: true,
        };
        reportAuthFailure(detail);

        window.removeEventListener(AUTH_FAILURE_EVENT, listener);
        expect(failures).toEqual([detail]);
    });
});
