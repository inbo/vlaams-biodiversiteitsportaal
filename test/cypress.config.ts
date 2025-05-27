const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://natuurdata.dev.inbo.be",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json",
  },
});
