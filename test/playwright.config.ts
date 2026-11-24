import { defineConfig, devices } from "@playwright/test";
import { env } from "./support/env";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  snapshotPathTemplate: "{testDir}/../snapshots/{testFilePath}/{arg}{ext}",
  // The suite shares one account and the login/logout tests end Keycloak
  // sessions, so run one test at a time, in file order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI a missing baseline must fail every attempt, instead of being
  // written on the first attempt and passing on the retry
  updateSnapshots: process.env.CI ? "none" : "missing",
  // Downloads and spatial imports wait for the backend for minutes
  timeout: 180_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // Maps and charts change with the data, so only catch gross breakage
      maxDiffPixelRatio: 0.4,
      animations: "disabled",
    },
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["./google-chat-reporter.ts", { outputFile: "test-results.json" }],
  ],
  use: {
    baseURL: env.BASE_URL,
    viewport: { width: 1280, height: 720 },
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: true,
    // Without these, a missing element hangs until the test timeout
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      // Logging out ends the user's Keycloak sessions, including the stored
      // one, so the login/logout tests run after all other tests
      teardown: "login-logout",
    },
    {
      name: "chromium",
      testIgnore: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
      dependencies: ["setup"],
    },
    {
      name: "login-logout",
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        // These tests type the password, which traces would record
        trace: "off",
      },
    },
  ],
});
