import { defineConfig } from "cypress";
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin";
import * as fs from "fs";
import { dirname } from "path";

const envs = {
  local: {
    baseUrl: "http://localhost",
    authUrl: "http://localhost:9999/mock-oauth2",
  },
  dev: {
    baseUrl: "https://natuurdata.dev.inbo.be",
    authUrl: "https://auth-dev.inbo.be",
  },
  uat: {
    baseUrl: "https://natuurdata.uat.inbo.be",
    authUrl: "https://auth-uat.inbo.be",
  },
  prod: {
    baseUrl: "https://natuurdata.inbo.be",
    authUrl: "https://auth.inbo.be",
  },
};

const targetEnv = process.env.CYPRESS_TARGET_ENV || "prod";

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  retries: {
    runMode: 2, // Retry failed tests in run mode
    openMode: 0, // Do not retry in open mode
  },
  e2e: {
    baseUrl: envs[targetEnv].baseUrl,
    env: {
      TARGET_ENV: targetEnv,
      AUTH_URL: envs[targetEnv].authUrl,
      VBP_USERNAME: process.env.CYPRESS_VBP_USERNAME,
      VBP_PASSWORD: process.env.CYPRESS_VBP_PASSWORD,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      addMatchImageSnapshotPlugin(on);
      // Cleanup previous google-chat-reporter files
      on("before:run", () => {
        if (fs.existsSync("./test-results.json")) {
          fs.unlinkSync("./test-results.json");
        }
      });
      // Delete videos of passing tests to save space
      on("after:spec", (spec, results) => {
        if (results && results.video) {
          // Do we have any test failures?
          const failures = results.tests.some(
            (test) => test.state === "failed",
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
            fs.unlinkSync(results.video.replace("ts.mp4", "ts-compressed.mp4"));

            if (fs.readdirSync(dirname(results.video)).length === 0) {
              // If the directory is empty after deleting the video, remove it
              fs.rmdirSync(dirname(results.video));
            }
          }
        }
      });
    },
  },
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  chromeWebSecurity: false, // Needed for cypress bridge when using auth.inbo.be
  trashAssetsBeforeRuns: true,
  video: true, // Record videos of test runs
  videoCompression: true,
});
