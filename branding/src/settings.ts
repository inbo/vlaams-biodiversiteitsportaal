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
    },
    ala: {
      authCookieName: "VBP-AUTH",
      loginClass: "signedIn",
      logoutClass: "signedOut",
    },
  },
  pictureCarousel: {
    interval: 10_000,
    speciesListId: "dr1",
  },
};

const environmentConfig: Record<Environment, object> = {
  local: {
    pictureCarousel: {
      speciesListId: "dr383",
    },
  },
  dev: {
    pictureCarousel: {
      speciesListId: "dr383",
    },
  },
  uat: {
    pictureCarousel: {
      speciesListId: "dr1",
    },
  },
  prod: {
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
