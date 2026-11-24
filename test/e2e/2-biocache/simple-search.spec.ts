import { test, expect } from "../../support/fixtures";
import { expectSearchResults } from "../../support/biocache";

test.describe("Biocache - Simple search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/biocache-hub");
  });

  test("Shows a working search bar", async ({ page }) => {
    const searchInput = "vulpes vulpes";
    const taxa = page.locator("#taxa");
    await expect(taxa).toBeVisible();
    await taxa.fill(searchInput);
    await taxa.press("Enter");

    await expectSearchResults(page, [searchInput]);
  });

  test("Search bar has working auto-complete", async ({ page }) => {
    const taxa = page.locator("#taxa");
    await expect(taxa).toBeVisible();
    await taxa.pressSequentially("pica p", { delay: 50 });

    const autocomplete = page.locator(".ui-autocomplete:visible");
    // hardcoded page size of 20, seems excessive :(
    await expect(autocomplete.locator("> *")).toHaveCount(20);
    await expect(autocomplete).toContainText("pica pica", { ignoreCase: true });
  });
});
