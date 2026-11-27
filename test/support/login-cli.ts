/**
 * Logs in the default user and saves the session to AUTH_FILE. Runs in plain
 * Node, outside the test runner, so the password never ends up in a trace.
 * Usage: node support/login-cli.ts
 */
import { chromium, devices } from "@playwright/test";
import { login } from "./auth.ts";
import { AUTH_FILE, env } from "./env.ts";

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    // natuurdata.inbo.be is behind a CloudFront WAF that blocks the default
    // "HeadlessChrome" user agent, the test projects use this one too
    ...devices["Desktop Chrome"],
    baseURL: env.BASE_URL,
    viewport: { width: 1280, height: 720 },
  });
  await login(await context.newPage());
  await context.storageState({ path: AUTH_FILE });
} finally {
  await browser.close();
}
