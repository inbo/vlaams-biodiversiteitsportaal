import { merge } from "lodash";

enum Environment {
  local = "local",
  dev = "dev",
  uat = "uat",
  prod = "prod",
}
const environment: string = process.env.NODE_ENV === "development"
  ? Environment.local
  : "::ENVIRONMENT::";

const defaultConfig = {
  domain: "http://localhost",
  enabledLangs: ["nl", "en"],
  auth: {
    // Replaced by terraform when deploying to the specific environment
    oidc: {
      authority: process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_URL::",
      clientId: process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_CLIENT_ID::",
      prompt: process.env.NODE_ENV === "development" ? "login" : undefined,
    },
    ala: {
      authCookieName: "VBP-AUTH",
      authCookieDomain: "localhost",
      loginClass: "signedIn",
      logoutClass: "signedOut",
    },
  },
  pictureCarousel: {
    interval: 10_000,
    speciesListId: "dr1",
  },
  monitoring: {
    awsRegion: "::AWS_REGION::",
    awsRumAppId: "::AWS_RUM_APP_ID::",
    awsRumEndpoint: "https://dataplane.rum.::AWS_REGION::.amazonaws.com",
    awsCognitoIdentityPoolId: "::AWS_COGNITO_IDENTITY_POOL_ID::",
  },
  appVersion: import.meta.env.VITE_APP_VERSION || "dev",
};

const environmentConfig: Record<Environment, object> = {
  local: {
    domain: "http://localhost",
    pictureCarousel: {
      speciesListId: "dr383",
    },
    auth: {
      ala: {
        authCookieDomain: "localhost",
      },
    },
  },
  dev: {
    domain: "https://natuurdata.dev.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.dev.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr383",
    },
  },
  uat: {
    domain: "https://natuurdata.uat.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.uat.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr1",
    },
  },
  prod: {
    domain: "https://natuurdata.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr1",
    },
  },
};

const settings = merge(
  defaultConfig,
  environmentConfig[environment as Environment],
);

console.debug(
  `Loaded settings for environment: ${environment}`,
  settings,
);

export default settings;
