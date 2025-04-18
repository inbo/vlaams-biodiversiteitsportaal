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
    pictureCarouselSpeciesListId: "dr382",
  },
};

const environmentConfig: Record<Environment, object> = {
  local: {
    "pictureCarouselSpeciesListId": "dr382",
  },
  dev: {
    "pictureCarouselSpeciesListId": "dr382",
  },
  uat: {
    "pictureCarouselSpeciesListId": "dr1",
  },
  prod: {
    "pictureCarouselSpeciesListId": "dr1",
  },
};

export default {
  ...defaultConfig,
  ...environmentConfig[environment as Environment],
};
