import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import { expect, type Page } from "@playwright/test";
// Explicit extension: also imported by login-cli.ts, which runs in plain Node
import { AUTH_FILE, env } from "./env.ts";

export interface User {
  username: string;
  password: string;
}

export const defaultUser = (): User => ({
  username: env.VBP_USERNAME,
  password: env.VBP_PASSWORD,
});

/**
 * Fill in the login form, after being redirected to Keycloak (or the mock
 * OAuth server for the local environment).
 */
export async function loginPageActions(page: Page, user: User = defaultUser()) {
  if (env.TARGET_ENV === "local") {
    const claimsInput = page.locator("textarea[name='claims']");
    if (user.username) {
      const claims = JSON.parse(await claimsInput.inputValue());
      claims.preferred_username = user.username;
      await claimsInput.fill(JSON.stringify(claims));
    }
    await page.locator("button[type='submit']").click();
  } else {
    if (!user.username || !user.password) {
      throw new Error("E2E_VBP_USERNAME and E2E_VBP_PASSWORD must be set");
    }
    await page.locator(".collapsable-header").click();
    await page.locator("#username").fill(user.username);
    // Not fill(): reporters and traces show its value in the step title
    await page.locator("#password").evaluate((input: HTMLInputElement, value) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, user.password);
    // The sign-in button can be covered by the collapsible panel while it
    // animates, so submit the form from the password field
    await page.locator("#password").press("Enter");
  }
}

/**
 * Open the login menu on the current page and CTRL-click login, which uses
 * Keycloak's username/password form instead of the Vlaanderen login.
 */
export async function clickLogin(page: Page) {
  await page.locator("#dropdown-auth-menu").click();
  await page.locator("#loginButton").click({ modifiers: ["Control"] });
}

/** Log in from the homepage and wait until we are back, logged in */
export async function login(page: Page, user: User = defaultUser()) {
  await page.goto("/");
  await clickLogin(page);
  await loginPageActions(page, user);
  // Fails fast on invalid credentials
  await page.waitForURL((url) => url.href.startsWith(env.BASE_URL), { timeout: 30_000 });
  await expect(page.locator("#dropdown-auth-menu")).toHaveClass(/signedIn/);
  const cookies = await page.context().cookies();
  expect(cookies.map((c) => c.name)).toContain("VBP-AUTH");
}

// Keycloak's SSO session expires when idle (within 12 minutes on dev), so
// tests get a login that is at most this old
const MAX_LOGIN_AGE_MS = 5 * 60_000;

/**
 * Make sure AUTH_FILE holds a recent login of the default user. The login runs
 * in a separate Node process: Playwright traces record typed values, and
 * traces of failed tests are uploaded by CI.
 */
export function ensureFreshLogin({ force = false } = {}) {
  const age = fs.existsSync(AUTH_FILE)
    ? Date.now() - fs.statSync(AUTH_FILE).mtimeMs
    : Infinity;
  if (force || age > MAX_LOGIN_AGE_MS) {
    execFileSync(process.execPath, ["support/login-cli.ts"], { stdio: "inherit" });
  }
}
