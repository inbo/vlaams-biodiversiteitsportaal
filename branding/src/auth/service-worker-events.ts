import type { AuthFailureDetail } from "./auth-events";

export interface BiocacheServiceInterceptorMessage {
    type: string;
}

export interface ResetAuthLoadedMessage
    extends BiocacheServiceInterceptorMessage {
    type: "resetAuthLoaded";
}

/** Service worker to client: the access token expired or was rejected, renew it */
export interface RequestRenewalMessage
    extends BiocacheServiceInterceptorMessage {
    type: "requestRenewal";
}

/** Service worker to client: report an authentication failure for RUM */
export interface AuthFailureMessage
    extends BiocacheServiceInterceptorMessage {
    type: "authFailure";
    detail: AuthFailureDetail;
}

export interface AuthLoadedMessage extends BiocacheServiceInterceptorMessage {
    type: "authLoaded";
    accessToken: AccessToken;
}

export interface AccessToken {
    token: string;
    expiresAtMs: number;
}

export interface accessTokenExpiredMessage
    extends BiocacheServiceInterceptorMessage {
    type: "accessTokenExpired";
}
