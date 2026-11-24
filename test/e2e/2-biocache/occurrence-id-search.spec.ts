import { test, expect } from "../../support/fixtures";
import { expectSearchResults, openSearchTab } from "../../support/biocache";

test.describe("Biocache - Occurrence ID search", () => {
  test.beforeEach(async ({ page }) => {
    // Switch to "Occurrence ID Search" tab
    await openSearchTab(page, "#t7", "#occurrenceIDSearch");
  });

  test("Occurrence ID search", async ({ page }) => {
    const searchInput = "q-10577711334";
    const input = page.locator("#occurrenceID");
    await expect(input).toBeVisible();
    await input.fill(searchInput);
    await input.press("Enter");

    await expectSearchResults(page, [searchInput], { moreThan: undefined });
    await expect(page.locator("#results > *")).toHaveCount(1);
  });
});
