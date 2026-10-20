import { AwsRum } from "aws-rum-web";
import settings from "../settings";
import { userManagerPromise } from "../auth/auth";
import { AUTH_FAILURE_EVENT } from "../auth/auth-events";

let rumClient: Promise<AwsRum | undefined> | undefined;

// Track authentication failures (401s seen by the service worker, failed
// silent renewals) as custom RUM events
window.addEventListener(AUTH_FAILURE_EVENT, (event) => {
    rumClient?.then((client) => {
        client?.recordEvent(
            "auth401",
            (event as CustomEvent).detail,
        );
    });
});

async function initRum() {
    console.info("Initializing CloudWatch RUM web client");
    const client = new AwsRum(
        settings.monitoring.awsRumAppId,
        settings.appVersion,
        settings.monitoring.awsRegion,
        {
            enableRumClient: true,
            sessionSampleRate: 0.01,
            endpoint: settings.monitoring.awsRumEndpoint,
            telemetries: [
                "performance",
                "errors",
                [
                    "http",
                    {
                        addXRayTraceIdHeader: [
                            new RegExp(
                                `^${settings.domain.replace(
                                    /[-[\]{}()*+?.,\\^$|#\s]/g,
                                    "\\$&",
                                )}.*`,
                            ),
                        ],
                    },
                ],
            ],
            allowCookies: false,
            enableXRay: true,
            signing: true,
            identityPoolId: settings.monitoring.awsCognitoIdentityPoolId,
        },
    );

    return client;
}

if (process.env.NODE_ENV !== "development") {
    rumClient = initRum();
}

export { rumClient };
