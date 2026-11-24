import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { clickLogin, loginPageActions } from "../../support/auth";
import { env } from "../../support/env";
import { expectNoneVisible } from "../../support/helpers";

// These tests log in and out themselves, without the shared storage state.
// They run in the "login-logout" project, after all other tests (and without
// traces, which would record the password), see playwright.config.ts.
test.describe("Can login from the homepage", () => {
  test("Can login/logout with email and password and adjust banner login status", async ({ page }) => {
    await page.goto("/");

    await assertIsNotLoggedIn(page);
    await login(page);
    await assertIsLoggedIn(page);
    await logout(page);
    await assertIsNotLoggedIn(page);
  });

  for (const service of ["bie-hub", "biocache-hub", "collectory", "species-list"]) {
    test(`[${service}] Login/logout on mainpage means logged in in ${service}`, async ({ page }) => {
      await page.goto("/");

      await assertIsNotLoggedIn(page);
      await login(page);
      await assertIsLoggedIn(page);

      await page.goto(`/${service}/`);
      await assertIsLoggedIn(page);

      await page.goto("/");
      await assertIsLoggedIn(page);
      await logout(page);
      await assertIsNotLoggedIn(page);

      await page.goto(`/${service}/`);
      await assertIsNotLoggedIn(page);
    });
  }
});

// Retry the toggle: right after navigation the click can land before the
// dropdown handlers are attached
async function setAuthMenu(page: Page, open: boolean) {
  const menu = page.locator("#dropdown-auth-menu > .dropdown-menu");
  await expect(async () => {
    if ((await menu.isVisible()) !== open) {
      await page.locator("#dropdown-auth-menu").click();
    }
    await expect(menu).toBeVisible({ visible: open, timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

const openAuthMenu = (page: Page) => setAuthMenu(page, true);
const closeAuthMenu = (page: Page) => setAuthMenu(page, false);

async function login(page: Page) {
  await clickLogin(page);
  await loginPageActions(page);
  await page.waitForURL((url) => url.href.startsWith(env.BASE_URL));
  await expect(page.locator("#dropdown-auth-menu")).toHaveClass(/signedIn/);
}

async function logout(page: Page) {
  await openAuthMenu(page);
  await page.locator("#logoutButton").click();
  await expect(page.locator("#dropdown-auth-menu")).not.toHaveClass(/signedIn/);
}

async function assertIsLoggedIn(page: Page) {
  await openAuthMenu(page);
  await expect(page.locator("#loginButton")).toBeHidden();
  await expect(page.locator("#logoutButton")).toBeVisible();
  await expect(page.locator(".myProfileBtn").first()).toBeVisible();
  // The login icon has the INBO primary color
  await expect(page.locator("#login-icon")).toBeVisible();
  await expect(page.locator("#login-icon")).toHaveCSS("color", "rgb(192, 67, 132)");
  await closeAuthMenu(page);
}

async function assertIsNotLoggedIn(page: Page) {
  await openAuthMenu(page);
  await expect(page.locator("#loginButton")).toBeVisible();
  await expect(page.locator("#logoutButton")).toBeHidden();
  await expectNoneVisible(page, ".myProfileBtn");
  await expect(page.locator("#login-icon")).toBeVisible();
  await expect(page.locator("#login-icon")).toHaveCSS("color", "rgb(136, 136, 136)");
  await closeAuthMenu(page);
}
