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
                sessionSampleRate: 0.1,
                endpoint: "https://dataplane.rum.eu-west-1.amazonaws.com",
                telemetries: ["performance", "errors", "http"],
                allowCookies: false,
                enableXRay: true,
                signing: true, // If you have a public resource policy and wish to send unsigned requests please set this to false
            },
        );
    } catch (error) {
        // Ignore errors thrown during CloudWatch RUM web client initialization
    }
}

export { rumClient };
