export default {
  "enabledLangs": ["nl", "en"],
  "auth": {
    // Replaced by terraform when deploying to the specific environment
    "oidc": {
      "authority": process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_URL::",
      "clientId": process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_CLIENT_ID::",
    },
    "ala": {
      "authCookieName": "VBP-AUTH",
      "loginClass": "signedIn",
      "logoutClass": "signedOut",
    },
  },
};
