import { test, expect } from "../../support/fixtures";
import { drag } from "../../support/helpers";
import {
  addMenu,
  expectMapSnapshot,
  openSpatialHub,
  waitForProgress,
} from "../../support/spatial";

test.describe("Spatial - Area", () => {
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await openSpatialHub(page);
  });

  test("Can add a polygon", async ({ page }) => {
    await addMenu(page, "Gebied");
    await page.locator('input[value="drawBoundingBox"]').check();
    await page.locator('button[name="next"]').click();

    // Draw a rectangle on the map
    await drag(page, [500, 300], [600, 400]);

    await expect(page.locator("#wktTextArea")).toHaveValue(
      "MULTIPOLYGON (((3.03497314453125 50.97745313889934, 3.30963134765625 50.97745313889934, 3.30963134765625 51.15006324988587, 3.03497314453125 51.15006324988587, 3.03497314453125 50.97745313889934)))",
    );

    await page.locator("[testtag='nextInNewAreaLegend']").click();
    await waitForProgress(page);
  });

  test("Can add an environmental range", async ({ page }) => {
    await addMenu(page, "Gebied");
    await page.locator('input[value="environmentalEnvelope"]').check();
    await page.locator('button[name="next"]').click();

    // Select an environmental range
    await page.locator('input[testtag="searchLayer"]').pressSequentially("neerslag", { delay: 50 });
    await page.locator(".autocomplete-item").first().click();

    await page.locator('input[ng-model="selection.min"]').fill("800");
    await page.locator('button[testtag="next"]').click();

    await waitForProgress(page);
    await page.locator('button[name="closeNewWindow"]').click();

    await expectMapSnapshot(page, "environmental-range");
  });
});
