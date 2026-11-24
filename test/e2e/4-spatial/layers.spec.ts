import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import {
  addMenu,
  expectMapSnapshot,
  mappedLayer,
  openSpatialHub,
  waitForProgress,
} from "../../support/spatial";

async function addLayer(page: Page, layerName: string) {
  await addMenu(page, "Laag");
  await page
    .locator('[testtag="availableLayers"]')
    .getByText(layerName)
    .first()
    .locator("xpath=..")
    .locator('input[type="checkbox"]')
    .check();
  await page.locator('button[name="next"]').click();

  // The modal is closed and the layer is added to the list
  await waitForProgress(page);
  await expect(mappedLayer(page, layerName)).toBeVisible();
}

const legend = (page: Page) => page.locator('[ng-show="wmsLegendVisible()"]');

test.describe("Spatial - Layers", () => {
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await openSpatialHub(page);
  });

  test("Can add contextual layer", async ({ page }) => {
    const layerName = "Gemeenten";
    await addLayer(page, layerName);
    await expect(legend(page)).toBeVisible();

    await expectMapSnapshot(page, "contextual-layer");

    // Clicking the map shows a popup window
    await page.locator("#map").click({ position: { x: 200, y: 200 } });
    const popup = page.locator(".leaflet-popup-content");
    await expect(popup).toContainText(layerName);
    await expect(popup).toContainText("Damme");
  });

  test("Can create a new layer from a filter on a contextual layer", async ({ page }) => {
    const layerName = "Gemeenten";
    const gemeente = "Aalst";
    await addLayer(page, layerName);

    // Filter the legend on Aalst
    await expect(legend(page)).toBeVisible();
    await legend(page)
      .locator("input[type='text'][placeholder='Filter']")
      .fill(gemeente, { force: true });
    await legend(page).getByText("Filter toepassen").click({ force: true });

    // Create a new area based on the filter
    await legend(page)
      .locator("table")
      .getByText(gemeente)
      .first()
      .locator("xpath=..")
      .locator("input[type='checkbox']")
      .check({ force: true });
    await legend(page).getByText("Gebied aanmaken").click({ force: true });

    // The new area is added as a layer
    await expect(mappedLayer(page, "1 gebieden van Gemeenten")).toBeVisible();

    await expectMapSnapshot(page, "contextual-layer-filter");
  });

  test("Can add an environmental layer", async ({ page }) => {
    const layerName = "Veenwaarschijnlijkheid bodemprofiel";
    await addLayer(page, layerName);
    await expect(legend(page)).toBeVisible();

    await expectMapSnapshot(page, "environmental-layer");

    // Clicking the map shows a popup window
    await page.locator("#map").click({ position: { x: 200, y: 200 } });
    const popup = page.locator(".leaflet-popup-content");
    await expect(popup).toContainText(layerName);
    await expect(popup).toContainText("0.0");
  });
});
