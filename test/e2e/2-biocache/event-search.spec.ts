import { type Page } from "@playwright/test";
import { test } from "../../support/fixtures";
import { expectSearchResults, openSearchTab } from "../../support/biocache";

async function search(page: Page, input: string, form: string, searchInputs: string[]) {
  await page.locator(input).fill(searchInputs.join("\n"));
  await page.locator(`${form} input.btn-primary[type='submit']`).click();
}

test.describe("Biocache - Event search", () => {
  test.beforeEach(async ({ page }) => {
    // Switch to "Event Search" tab
    await openSearchTab(page, "#t6", "#eventSearch");
  });

  test("Event ID search, Generic", async ({ page }) => {
    const searchInputs = [
      "INBO:MEETNET:EVENT:368525",
      "INBO:MEETNET:EVENT:371155",
      "INBO:MEETNET:VISITID:001359",
      "INBO:MEETNET:VISITID:059294",
      "JQ921217",
      "ZSM_HET_0846",
      "meetnetten",
      "waarnemingen",
    ];
    await search(page, "#event_keywords", "#eventSearchForm", searchInputs);
    await expectSearchResults(page, searchInputs);
  });

  test("Event ID search, Event ID", async ({ page }) => {
    const searchInputs = ["INBO:MEETNET:EVENT:368525", "INBO:MEETNET:EVENT:371155"];
    await search(page, "#event_ids", "#eventIDSearchForm", searchInputs);
    await expectSearchResults(page, searchInputs, { atLeast: 2 });
  });

  test("Event ID search, Parent Event ID", async ({ page }) => {
    const searchInputs = ["INBO:MEETNET:VISITID:001359", "INBO:MEETNET:VISITID:059294"];
    await search(page, "#event_keywords", "#eventSearchForm", searchInputs);
    await expectSearchResults(page, searchInputs);
  });

  // TODO: No data with field numbers, so skipping this test for now
  test.skip("Event ID search, Field Numbers", async ({ page }) => {
    const searchInputs = ["JQ921217", "ZSM_HET_0846"];
    await search(page, "#field_numbers", "#fieldNumberSearchForm", searchInputs);
    await expectSearchResults(page, searchInputs, { atLeast: 2 });
  });

  test("Event ID search, Dataset name", async ({ page }) => {
    const searchInputs = ["meetnetten", "waarnemingen"];
    await search(page, "#dataset_name", "#datasetNameSearchForm", searchInputs);
    await expectSearchResults(page, searchInputs);
  });
});
