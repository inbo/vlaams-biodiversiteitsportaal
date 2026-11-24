import { test } from "../../support/fixtures";
import {
  expectSearchResults,
  openSearchTab,
  submitActiveTab,
} from "../../support/biocache";

test.describe("Biocache - Batch Taxon search", () => {
  test.beforeEach(async ({ page }) => {
    // Switch to "Batch taxon Search" tab
    await openSearchTab(page, "#t3", "#taxaUpload");
  });

  test("Batch taxon search, with matched name", async ({ page }) => {
    const searchInputs = [
      "vulpes vulpes",
      "pica pica",
      "Castor canadensis",
      "Columba livia var. domestica",
    ];
    await page.locator("#raw_names").fill(searchInputs.join("\n"));
    await page.locator("#batchModeMatched").check();
    await submitActiveTab(page);

    await expectSearchResults(page, searchInputs);
  });

  // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/554
  test.skip("Batch taxon search, with raw given name", async ({ page }) => {
    const searchInputs = [
      "Vulpes vulpes",
      "Pica pica",
      "Castor canadensis",
      "Columba livia f. domestica",
    ];
    await page.locator("#raw_names").fill(searchInputs.join("\n"));
    await page.locator("#batchModeRaw").check();
    await submitActiveTab(page);

    await expectSearchResults(page, searchInputs);
  });
});
