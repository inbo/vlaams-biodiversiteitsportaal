import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import {
  expectSearchResults,
  openSearchTab,
  submitActiveTab,
} from "../../support/biocache";
import { expectCountAbove } from "../../support/helpers";

async function selectDataset(page: Page, search: string, name: string) {
  await page.locator("#datasetundefined").pressSequentially(search, { delay: 50 });
  await page
    .locator("ul.typeahead > li.active > a.dropdown-item")
    .filter({ hasText: name })
    .click();
}

async function typeAndEnter(page: Page, selector: string, value: string) {
  await page.locator(selector).fill(value);
  await page.locator(selector).press("Enter");
}

test.describe("Biocache - Advanced search", () => {
  test.beforeEach(async ({ page }) => {
    // Switch to "Advanced Search" tab
    await openSearchTab(page, "#t2", "#advanceSearch");
  });

  test("Generic text search", async ({ page }) => {
    const searchInput = "vulpes";
    await typeAndEnter(page, "#text", searchInput);
    await expectSearchResults(page, [searchInput]);
  });

  test("Taxa search", async ({ page }) => {
    const searchInputs = [
      "vulpes vulpes",
      "pica pica",
      "Castor canadensis",
      "Columba livia f. domestica",
    ];
    for (const [idx, searchInput] of searchInputs.entries()) {
      await page.locator(`input#taxa_${idx + 1}[type=text]`).fill(searchInput);
    }
    await submitActiveTab(page);
    await expectSearchResults(page, searchInputs);
    await expect(page.locator(".queryDisplay")).toContainText(" OR ");
  });

  // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/554
  test.skip("Raw taxon name search", async ({ page }) => {
    const searchInput = "Columba livia var. domestica";
    await typeAndEnter(page, "#raw_taxon_name", searchInput);
    await expectSearchResults(page, [searchInput]);
  });

  for (const [title, select, option] of [
    ["Species group search", "#species_group", "Dicots"],
    ["Institutions search", "#institution_collection", "VMM"],
    ["Country search", "#country", "Belgium"],
    ["Basis of record search", "#basis_of_record", "Machine observation"],
  ]) {
    test(title, async ({ page }) => {
      await page.locator(select).selectOption(option);
      await submitActiveTab(page);
      await expectSearchResults(page, [option]);
    });
  }

  test("States search", async ({ page }) => {
    const searchCountryInput = "Belgium";
    const searchStatesInput = "Flanders";
    await page.locator("#country").selectOption(searchCountryInput);
    await expect(page.locator("#state > *")).toHaveCount(4);
    await page.locator("#state").selectOption(searchStatesInput);
    await submitActiveTab(page);
    await expectSearchResults(page, [searchCountryInput, searchStatesInput]);
  });

  // The type_status search option has dissapeared??
  test.skip("Type Status search", async ({ page }) => {
    await page.locator("#type_status").selectOption({ index: 0 });
    await submitActiveTab(page);
    await expect(page).toHaveURL(/\/biocache-hub\/occurrences\/search/);
    await expectCountAbove(page.locator("#results > *"), 0);
  });

  test("Dataset search", async ({ page }) => {
    const searchInput = "ABV";
    await selectDataset(page, searchInput, "ABV - Common breeding birds in Flanders, Belgium");
    await submitActiveTab(page);
    await expectSearchResults(page, [searchInput]);
  });

  test("CatalogNumber search", async ({ page }) => {
    const searchInput = "4838399";
    await typeAndEnter(page, "#catalogue_number", searchInput);
    await expectSearchResults(page, [searchInput], { atLeast: 1 });
  });

  test("Record Number search", async ({ page }) => {
    const searchInput = "1818";
    await typeAndEnter(page, "#record_number", searchInput);
    await expectSearchResults(page, [searchInput], { atLeast: 1 });
  });

  test("Start Date search", async ({ page }) => {
    const searchInput = "1998-01-01";
    await page.locator("#startDate").fill(searchInput);
    await submitActiveTab(page);
    await expectSearchResults(page, [searchInput]);
  });

  test("End Date search", async ({ page }) => {
    const searchInput = "2023-01-01";
    await page.locator("#endDate").fill(searchInput);
    await submitActiveTab(page);
    await expectSearchResults(page, [searchInput]);
  });

  test("Everything search", async ({ page }) => {
    // Generic text search
    await page.locator("#text").fill("vulpes");

    // Taxa search
    await page.locator("input#taxa_1[type=text]").fill("vulpes vulpes");
    await page.locator("input#taxa_2[type=text]").fill("pica pica");
    await page.locator("input#taxa_3[type=text]").fill("Castor canadensis");
    await page.locator("input#taxa_4[type=text]").fill("Columba livia f. domestica");

    await page.locator("#species_group").selectOption("Dicots");
    await page.locator("#institution_collection").selectOption("INBO");
    await page.locator("#country").selectOption("Belgium");
    // Type status option has disappeared
    await page.locator("#basis_of_record").selectOption("Machine observation");

    await selectDataset(
      page,
      "Chorus",
      "Meetnetten.be - Chorus counts for Amphibia in Flanders, Belgium",
    );

    await page.locator("#catalogue_number").fill("102244166");
    await page.locator("#record_number").fill("Natuurpunt:Waarnemingen:143198978");
    await page.locator("#startDate").fill("1998-01-01");
    await page.locator("#endDate").fill("2023-01-01");

    await submitActiveTab(page);

    await expectSearchResults(
      page,
      [
        "vulpes",
        "vulpes vulpes",
        "pica pica",
        "Castor canadensis",
        "Columba livia f. domestica",
        "Dicots",
        "Belgium",
        "INBO",
        // "Not supplied", Missing from query display?
        "Machine observation",
        "Chorus",
        "102244166",
        "Natuurpunt:Waarnemingen:143198978",
        "1998-01-01",
        "2023-01-01",
      ],
      {},
    );

    // No records found
    await expect(page.locator(".searchInfo")).toContainText("Geen records gevonden voor");
  });
});
