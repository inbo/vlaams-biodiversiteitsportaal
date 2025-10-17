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
            sessionSampleRate: 0.1,
            endpoint: settings.monitoring.awsRumEndpoint,
            telemetries: ["performance", "errors", ["http", {
                addXRayTraceIdHeader: true,
            }]],
            allowCookies: false,
            enableXRay: true,
            signing: true,
            identityPoolId: settings.monitoring.awsCognitoIdentityPoolId,
        },
    );

    const userManager = await userManagerPromise;
    userManager.events.addUserLoaded((user) => {
        if (user && client) {
            client.addSessionAttributes({
                userId: user.profile.sub,
            });
            client.allowCookies(true);
        }
    });

    return client;
}

if (process.env.NODE_ENV !== "development") {
    rumClient = initRum();
}

export { rumClient };
