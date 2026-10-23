/**
 * Small event bus for auth failures.
 *
 * The service worker, the OIDC client and the RUM monitoring cannot import
 * each other directly (the service worker cannot use window/RUM, and
 * monitoring must not import auth to avoid a dependency cycle), so auth
 * failures are dispatched as window events:
 *
 * - auth.ts / service-worker-registration.ts report failures via reportAuthFailure
 * - aws-rum.ts listens for AUTH_FAILURE_EVENT and records them in CloudWatch RUM
 */

export const AUTH_FAILURE_EVENT = "vbp-auth-failure";
export const AUTH_RENEW_REQUEST_EVENT = "vbp-auth-renew-request";

export interface AuthFailureDetail {
    /** Where the failure was detected */
    source: "service-worker" | "renewal";
    /** Service path prefix, e.g. "species-list" (empty for renewal failures) */
    service: string;
    /** Request path without query string (empty for renewal failures) */
    path: string;
    /** Whether a renewed access token was obtained and the request retried */
    recovered: boolean;
    /** Whether an access token was available when the failure happened */
    hadToken: boolean;
    /** Whether the ala auth cookie was present */
    hadCookie: boolean;
}

export function reportAuthFailure(detail: AuthFailureDetail) {
    window.dispatchEvent(
        new CustomEvent<AuthFailureDetail>(AUTH_FAILURE_EVENT, { detail }),
    );
}
