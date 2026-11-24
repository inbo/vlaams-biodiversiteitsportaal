import { test, expect } from "../../support/fixtures";

test.describe("Biocache - Occurrence Details", () => {
  test("Can open an occurrence details page", async ({ page }) => {
    await page.goto("/biocache-hub/occurrences/search?q=");

    const firstRow = page.locator(".recordRow").first();
    await expect(firstRow).toBeVisible();
    await firstRow.locator("a.occurrenceLink").click();

    await expect(page).toHaveURL(/\/biocache-hub\/occurrences\//);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).not.toBeEmpty();
    for (const section of [
      "#occurrenceDataset",
      "#occurrenceEvent",
      "#occurrenceTaxonomy",
      "#occurrenceGeospatial",
    ]) {
      await expect(page.locator(section)).toBeVisible();
    }
  });
});
