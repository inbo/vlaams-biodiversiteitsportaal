import { AwsRum } from "aws-rum-web";
import settings from "../settings";
import { userManagerPromise } from "../auth/auth";

let rumClient: Promise<AwsRum | undefined>;

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
