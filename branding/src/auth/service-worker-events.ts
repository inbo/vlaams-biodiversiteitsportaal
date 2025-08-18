export interface BiocacheServiceInterceptorMessage {
    type: string;
}

export interface ResetAuthLoadedMessage
    extends BiocacheServiceInterceptorMessage {
    type: "resetAuthLoaded";
}

export interface AuthLoadedMessage extends BiocacheServiceInterceptorMessage {
    type: "authLoaded";
    accessToken: string | null;
}

// interface SetAccessTokenMessage {
//     type: "setAccessToken";
//     accessToken: string;
// }

// interface ClearAccessTokenMessage {
//     type: "clearAccessToken";
// }
