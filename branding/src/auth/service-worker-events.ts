export interface BiocacheServiceInterceptorMessage {
    type: string;
}

export interface ResetAuthLoadedMessage
    extends BiocacheServiceInterceptorMessage {
    type: "resetAuthLoaded";
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
