import { AwsRum } from "aws-rum-web";
import settings from "../settings";

let rumClient: AwsRum | undefined = undefined;
if (process.env.NODE_ENV !== "development") {
    try {
        rumClient = new AwsRum(
            settings.monitoring.awsRumAppId,
            settings.appVersion,
            settings.monitoring.awsRegion,
            {
                enableRumClient: true,
                sessionSampleRate: 0.1,
                endpoint: settings.monitoring.awsRumEndpoint,
                telemetries: ["performance", "errors", "http"],
                allowCookies: false,
                enableXRay: true,
                signing: true,
                alias: "VBP-RUM",
                identityPoolId: settings.monitoring.awsCognitoIdentityPoolId,
            },
        );
    } catch (error) {
        // Ignore errors thrown during CloudWatch RUM web client initialization
    }
}

export { rumClient };
