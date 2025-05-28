const { defineConfig } = require("cypress");

const envs = {
  "local": {
    baseUrl: "http://localhost",
    authUrl: "http://localhost/mock-oauth2",
  },
  "dev": {
    baseUrl: "https://natuurdata.dev.inbo.be",
    authUrl: "https://auth-dev.inbo.be",
  },
  "uat": {
    baseUrl: "https://natuurdata.uat.inbo.be",
    authUrl: "https://auth-uat.inbo.be",
  },
  "prod": {
    baseUrl: "https://natuurdata.inbo.be",
    authUrl: "https://auth.inbo.be",
  },
};

const targetEnv = process.env.CYPRESS_TARGET_ENV || "prod";

module.exports = defineConfig({
  e2e: {
    baseUrl: envs[targetEnv].baseUrl,
    env: {
      AUTH_URL: envs[targetEnv].authUrl,
      VBP_USERNAME: process.env.CYPRESS_VBP_USERNAME,
      VBP_PASSWORD: process.env.CYPRESS_VBP_PASSWORD,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  chromeWebSecurity: false, // Needed for cypress bridge when using auth.inbo.be
});
