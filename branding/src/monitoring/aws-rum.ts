import { AwsRum } from "aws-rum-web";
import settings from "../settings";
import { userManagerPromise } from "../auth/auth";

let rumClient: AwsRum | undefined = undefined;
if (process.env.NODE_ENV !== "development") {
    try {
        console.info("Initializing CloudWatch RUM web client");
        rumClient = new AwsRum(
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
            if (user && rumClient) {
                rumClient.addSessionAttributes({
                    userId: user.profile.sub,
                });
                rumClient.allowCookies(true);
            }
        });
    } catch (error) {
        // Ignore errors thrown during CloudWatch RUM web client initialization
    }
}

export { rumClient };
