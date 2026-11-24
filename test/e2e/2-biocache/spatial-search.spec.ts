import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { openSearchTab } from "../../support/biocache";
import { dragOn, expectCountAbove, parseCount } from "../../support/helpers";

async function expectStatistics(page: Page) {
  for (const counter of ["#speciesCountDiv", "#occurrenceCountDiv"]) {
    await expect(page.locator(counter)).toBeVisible();
    await expect
      .poll(async () => parseCount(await page.locator(counter).innerText()))
      .toBeGreaterThan(10);
  }
}

async function showRecords(page: Page, queryPattern: RegExp) {
  await page.locator("#showOnlyTheseRecords").click();

  await expect(page).toHaveURL(/\/biocache-hub\/occurrences\/search/);
  await expect(page.locator(".queryDisplay")).toHaveText(queryPattern);
  await expectCountAbove(page.locator("#results > *"), 10);
}

test.describe("Biocache - Spatial search", () => {
  test.beforeEach(async ({ page }) => {
    // Switch to "Location Search" tab
    await openSearchTab(page, "#t5", "#spatialSearch");
  });

  test("Map search, Polygon", async ({ page }) => {
    await page.locator(".leaflet-draw-draw-polygon").click({ force: true });

    const map = page.locator("#leafletMap");
    for (const [x, y] of [[200, 200], [300, 200], [250, 400], [230, 400], [200, 200]]) {
      await map.click({ position: { x, y } });
    }

    await showRecords(page, /\[all records\] - within user defined polygon/);
  });

  test("Map search, Rectangle", async ({ page }) => {
    await page.locator(".leaflet-draw-draw-rectangle").click();
    await dragOn(page.locator("#leafletMap"), [200, 200], [500, 300]);

    await expectStatistics(page);
    await showRecords(page, /\[all records\] - within user defined polygon/);
  });

  test("Map search, Circle", async ({ page }) => {
    await page.locator(".leaflet-draw-draw-circle").click();
    await dragOn(page.locator("#leafletMap"), [200, 200], [300, 300]);

    await expectStatistics(page);
    await showRecords(page, /\[all records\] - within .*km of point\(.*\)/);
  });

  test("Map search, WKT", async ({ page }) => {
    await page.locator('a[data-parent="#importAreaPanel"]').click();
    await page
      .locator("#wktInput")
      .fill(
        "MULTIPOLYGON(((4.0374755859375+50.80176887200628,4.1583251953125 50.914463232329595,3.77105712890625 50.895411021852205,4.0374755859375 50.80176887200628)))",
      );
    await page.locator("#addWkt").click();

    await expectStatistics(page);
    await showRecords(page, /\[all records\] - within user defined polygon/);
  });
});
