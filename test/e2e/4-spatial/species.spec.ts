import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";
import {
  getFileNameTimeStamp,
  getTestOccurrenceCsv,
  TEST_LIST_PREFIX,
} from "../../support/utils";
import {
  addMenu,
  expectMapSnapshot,
  mappedLayer,
  openSpatialHub,
  waitForProgress,
} from "../../support/spatial";

/** The modal is closed, the layer is listed and the legend is shown */
async function expectLayerAdded(page: Page, name: string, timeout = 30_000) {
  await waitForProgress(page, timeout);
  await expect(mappedLayer(page, name)).toBeVisible();
  await expect(page.locator("#legend")).toBeVisible();
}

async function expectPopup(page: Page, x: number, y: number, text: string) {
  await page.locator("#map").click({ position: { x, y } });
  await expect(page.locator(".leaflet-popup-content")).toContainText(text);
}

test.describe("Spatial - Species", () => {
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await openSpatialHub(page);
    await addMenu(page, "Soorten");
  });

  test("Can add a species group", async ({ page }) => {
    await page.locator('input[value="lifeform"]').check();
    await page.locator("lifeform-select > select").selectOption("Weekdieren");
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, "Molluscs");
    await expectMapSnapshot(page, "species-group");
    await expectPopup(page, 200, 200, "Molluscs");
  });

  test("Can add one specific species by name", async ({ page }) => {
    // The autocomplete has become unreliable for localized common names in
    // prod, so search using the scientific name
    const speciesScientificName = "Vulpes vulpes";

    await page.locator('input[value="searchSpecies"]').check();
    await page
      .locator("#speciesAutoComplete")
      .pressSequentially(speciesScientificName, { delay: 50 });
    // The species itself, not a subspecies like "Vulpes vulpes alpherakyi"
    await page
      .locator(".autocomplete-item")
      .filter({ hasText: new RegExp(`${speciesScientificName}(?! [a-z])`) })
      .first()
      .click({ timeout: 30_000 });
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, speciesScientificName);
    await expectMapSnapshot(page, "species-by-name");
    await expectPopup(page, 300, 300, speciesScientificName);
  });

  test("Can add species from species-list", async ({ page }) => {
    const speciesListName = "ABV Trend Soortenlijst";

    await page.locator('input[value="speciesList"]').check();
    await page
      .locator("[name='speciesList']")
      .getByText(speciesListName)
      .first()
      .locator("xpath=../..")
      .locator("input[type='checkbox']")
      .check();
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, speciesListName);
    await expectMapSnapshot(page, "species-list");
    await expectPopup(page, 160, 260, speciesListName);
  });

  test("Can add species by creating a new species-list", async ({ page }) => {
    const textareaSpecies = ["Vulpes vulpes", "Castor fiber"];
    const fileSpecies = ["Scutigera coleoptrata", "Oryctolagus cuniculus"];
    const autoCompleteSpeciesCommonName = "otter";
    const autoCompleteSpeciesScientificName = "Lutra lutra";

    // Not check(): the radio opens a new dialog, so it never shows as checked
    await page.locator('input[value="importList"]').click();

    const speciesInput = page.locator("textarea[name='speciesInput']");
    const speciesTable = page.locator("table[name='speciesList']");

    // Enter species in the textarea
    await speciesInput.fill(textareaSpecies.join("\n"));
    await page.locator("button[name='parseSpeciesList']").click();
    for (const species of textareaSpecies) {
      await expect(speciesTable).toContainText(species);
    }

    // Upload a file with species names
    await page.locator("#file").setInputFiles({
      name: "species.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(fileSpecies.join("\n")),
    });
    for (const species of fileSpecies) {
      await expect(speciesInput).toHaveValue(new RegExp(species));
    }
    await page.locator("button[name='parseSpeciesList']").click();
    for (const species of fileSpecies) {
      await expect(speciesTable).toContainText(species);
    }

    // Enter a single species name and select from autocomplete
    await page
      .locator("#speciesAutoComplete")
      .pressSequentially(autoCompleteSpeciesCommonName, { delay: 50 });
    await page
      .locator(".autocomplete-item")
      .filter({ hasText: autoCompleteSpeciesScientificName })
      .first()
      .click({ timeout: 30_000 });
    await expect(speciesTable).toContainText(autoCompleteSpeciesScientificName);

    await page.locator('button[name="next"]').click();

    // Only create the species-list when mutation tests are enabled
    if (!env.ENABLE_MUTATION_TESTS) {
      return;
    }

    // The prefix lets "Species list - manage" clean up the list afterwards
    const speciesListName = `${TEST_LIST_PREFIX} spatial ${getFileNameTimeStamp()}`;
    await page.locator('input[name="newListName"]').fill(speciesListName);
    await page.locator('input[ng-model="newListDescription"]').fill("Some description");
    await page.locator('select[ng-model="newListType"]').selectOption("Test list");
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, speciesListName);
    await expectMapSnapshot(page, "species-new-list");
  });

  test("Can add species from new imported points", async ({ page }) => {
    const datasetName = `Test species import points ${new Date().toISOString()}`;

    await page.locator('input[value="importPoints"]').check();

    await page.locator("#file").setInputFiles({
      name: "import-data.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(getTestOccurrenceCsv("Cryphaea heteromalla")),
    });
    await page.locator('input[testtag="datasetName"]').fill(datasetName);

    const modal = page.locator("[testtag='addPointsModal']");
    await modal.locator("xpath=..").locator('button[name="next"]').click();

    // Wait for success and click Completed button
    await expect(modal).toContainText("Import complete: 1 records", { timeout: 120_000 });
    await expect(modal).not.toContainText("error");
    await expect(modal).not.toContainText("failed");
    await modal
      .locator("xpath=..")
      .locator("button.btn-primary", { hasText: "Voltooid" })
      .click();

    // The new dataset is selected
    await expect(
      page.locator('input[value="importPoints"]').locator("xpath=../.."),
    ).toContainText(datasetName);
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, datasetName);
    await expectMapSnapshot(page, "species-imported-points");
  });

  test("Can add species from existing dataset", async ({ page }) => {
    await page.locator('input[value="sandboxPoints"]').check();

    // This flow only needs an existing imported dataset, not one created
    // earlier in the same run, so select the first available dataset
    const datasetRow = page
      .locator('input[value="sandboxPoints"]')
      .locator("xpath=../..")
      .locator("table tbody tr")
      .filter({ has: page.locator("td") })
      .filter({ has: page.locator("input[type='checkbox']") })
      .first();
    const nameCell = datasetRow.locator("td").nth(1);
    await expect(nameCell).not.toBeEmpty({ timeout: 30_000 });
    const datasetName = (await nameCell.innerText()).trim();

    await datasetRow.locator('input[type="checkbox"]').check();
    await page.locator('button[name="next"]').click();

    await expectLayerAdded(page, datasetName, 60_000);
    await expectMapSnapshot(page, "species-existing-dataset");
  });
});
