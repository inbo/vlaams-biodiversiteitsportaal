import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { expectCountAbove } from "../../support/helpers";

async function search(page: Page, searchInput: string) {
  const input = page.locator("#search");
  await expect(input).toBeVisible();
  await input.fill(searchInput);
  await input.press("Enter");

  await expect(page).toHaveURL(/\/bie-hub\/search/);
  await expect(page.locator("h1")).toContainText(searchInput, { ignoreCase: true });
}

test.describe("Bie - Simple search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bie-hub");
  });

  test("Shows a working search bar", async ({ page }) => {
    await search(page, "konijn");
    await expectCountAbove(page.locator("#search-results-list > *"), 2);
  });

  test("Search bar has working auto-complete", async ({ page }) => {
    const input = page.locator("#search");
    await expect(input).toBeVisible();
    await input.pressSequentially("pica p", { delay: 50 });

    const autocomplete = page.locator(".ui-autocomplete:visible");
    // hardcoded page size of 20, seems excessive :(
    await expect(autocomplete.locator("> *")).toHaveCount(20);
    await expect(autocomplete).toContainText("pica pica", { ignoreCase: true });
  });

  // Make sure the first result for bunny is the right one
  test("Search results are ordered sanely (by occurrence count)", async ({ page }) => {
    await search(page, "konijn");
    await expect(page.locator("#search-results-list > *").first()).toContainText(
      "Oryctolagus cuniculus (Linnaeus, 1758)",
    );
  });
});
