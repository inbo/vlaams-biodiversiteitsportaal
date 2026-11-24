import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";

test.describe("User profile - Anonymous", () => {
  test("Should show message when not logged in with a working link", async ({ page }) => {
    await page.goto("/my-profile.html");
    await expect(page.getByText("Je bent nog niet ingelogd.")).toBeVisible();

    const loginButton = page.locator("#profile-login #my-profile-login-button");
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Should navigate to Vlaanderen login
    await expect(page).toHaveURL(new RegExp(`^${env.VLAANDEREN_AUTH_URL}`));
  });
});

test.describe("User profile - Authenticated", () => {
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await page.goto("/my-profile.html");
  });

  const profileLink = (id: string) => `#profile-overview #${id}`;

  test("Should show username and roles", async ({ page }) => {
    const greeting = page.locator("#user-greeting-name");
    await expect(greeting).toBeVisible();
    await expect(greeting).not.toBeEmpty();
    await expect(greeting).not.toContainText("undefined");
    await expect(page.locator("#my-roles")).toContainText("EDITOR");
  });

  test("Should allow modifying user profile", async ({ page }) => {
    await page.locator(profileLink("my-profile-update-profile-details")).click();
    await expect(page).toHaveURL((url) => url.href.includes(env.KEYCLOAK_AUTH_URL));
    await expect(page.locator("#kc-page-title")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
  });

  test("Should allow resetting password", async ({ page }) => {
    await page.locator(profileLink("my-profile-update-password")).click();
    await expect(page).toHaveURL((url) => url.href.includes(env.KEYCLOAK_AUTH_URL));
    await expect(page.locator("#kc-page-title")).toBeVisible();
    await expect(page.locator("#password-new")).toBeVisible();
  });

  test("Show working species list link", async ({ page }) => {
    await page.locator(profileLink("my-profile-species-lists")).click();
    await expect(page).toHaveURL(/\/lists\/my-lists/);
    await expect(page.locator("h3", { hasText: "Mijn Lijsten" })).toBeVisible();
  });

  test("Show working annotations link", async ({ page, context }) => {
    const cookie = (await context.cookies()).find((c) => c.name === "VBP-AUTH");
    expect(cookie, "VBP-AUTH cookie").toBeDefined();
    const userId = JSON.parse(decodeURIComponent(cookie!.value)).userId;

    await page.locator(profileLink("my-profile-my-annotated-records")).click();
    await expect(page).toHaveURL(/\/biocache-hub\/occurrences\/search\//);
    await expect(page).toHaveURL((url) => url.href.includes(`assertion_user_id:%22${userId}%22`));
    await expect(page.locator("h1", { hasText: "Waarnemingsrecords" })).toBeVisible();
  });

  test("Show working alerts link", async ({ page }) => {
    await page.locator(profileLink("my-profile-my-alerts")).click();
    await expect(page).toHaveURL(/\/alerts\//);
    await expect(page.getByRole("heading", { name: "Mijn email abonnementen" })).toBeVisible();
  });

  test("Show working spatial analysis link", async ({ page }) => {
    await page.locator(profileLink("my-profile-spatial-portal")).click();
    await expect(page).toHaveURL(/\/spatial-hub\/\?tool=log/);
    await expect(page.locator("h3", { hasText: "Geschiedenis" })).toBeVisible();
  });
});
