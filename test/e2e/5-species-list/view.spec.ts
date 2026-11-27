import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { expectCountAbove } from "../../support/helpers";

const LIST_NAME = "ABV Trend Soortenlijst";

// The species-lists v2 UI renders lists and list items in Mantine tables
const tableRows = (page: Page) => page.locator("table tbody tr");
const listSearch = (page: Page) => page.locator('input[placeholder="Zoek lijsten op naam of soort"]');

// Skeleton rows (with placeholder text) show while the lists load, and the
// search box stays disabled until then. A cold dev backend takes a while.
async function waitForLists(page: Page) {
  await expect(listSearch(page)).toBeEnabled({ timeout: 30_000 });
}

async function openList(page: Page, name: string) {
  await waitForLists(page);
  await tableRows(page).getByText(name).first().click();
  await expect(page).toHaveURL(/\/lists\/list\//);
  await expect(page.locator("h4")).toContainText(name);
}

test.describe("Species list - view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lists");
  });

  test("Shows species lists", async ({ page }) => {
    await waitForLists(page);
    await expectCountAbove(tableRows(page), 4);
    await expect(page.locator("table tbody")).toContainText(LIST_NAME);
  });

  test("Has a working search bar", async ({ page }) => {
    await waitForLists(page);
    const input = listSearch(page);
    await input.fill("ABV Trend");
    await input.press("Enter");

    // The search is kept in the URL
    await expect(page).toHaveURL(/[?&]search=/);
    await expect(page.locator("table tbody")).toContainText(LIST_NAME);
  });

  test("Show a single list", async ({ page }) => {
    await openList(page, LIST_NAME);
    await expectCountAbove(tableRows(page), 4);
    await expect(page.locator("table tbody")).toContainText("Anser anser");
  });

  test("Can search for a specific species in a list", async ({ page }) => {
    await openList(page, LIST_NAME);
    await expectCountAbove(tableRows(page), 4);

    // Matches vernacular and scientific names
    const input = page.locator('input[aria-label="Zoekopdracht"]');
    await input.fill("Grauwe gans");
    await input.press("Enter");

    await expect(tableRows(page)).toHaveCount(1);
    await expect(tableRows(page)).toContainText("Anser anser");
  });

  test("Download a single list", async ({ page }) => {
    await openList(page, LIST_NAME);

    // The v2 UI downloads straight away, without the old email/reason form
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/lists/v2/download/") && r.request().method() === "GET",
        { timeout: 60_000 },
      ),
      page.getByRole("button", { name: "Lijst downloaden" }).click(),
    ]);
    expect(response.status()).toBe(200);
    const content = await response.text();
    expect(content).toContain("Anser anser");
    expect(content).toContain("Anas platyrhynchos");
  });

  test("Adding a list requires login", async ({ page }) => {
    // /lists/upload is a protected route: anonymous users are sent back
    await page.locator('a[aria-label="Upload een lijst vanuit een CSV-bestand"]').click();
    await expect(page).not.toHaveURL(/\/upload/);
    await expect(page.locator(".mantine-Notification-root")).toContainText("Aanmelden vereist");
  });
});
