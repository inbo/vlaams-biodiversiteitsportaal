const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://natuurdata.inbo.be",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
