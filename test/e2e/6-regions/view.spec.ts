import { type Locator, type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import {
  trackResponses,
  expectCountAtLeast,
  expectNoneVisible,
} from "../../support/helpers";
import { expectSpeciesCountAbove, speciesCount } from "../../support/regions";
import { isProd } from "../../support/env";

const gemeente = "Gent";

/** Compare the region map with its baseline, only on prod where the data is stable */
async function expectRegionMapSnapshot(page: Page, name: string) {
  if (!isProd) return;
  await expect(page.locator("#region-map")).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.1,
  });
}

/** Drag a jQuery UI slider handle horizontally to page x coordinate `x` */
async function dragHandleTo(page: Page, handle: Locator, x: number) {
  const box = await handle.boundingBox();
  if (!box) throw new Error("Slider handle is not visible");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 5 });
  await page.mouse.up();
}

test.describe("Regions - view", () => {
  let wmsTiles: ReturnType<typeof trackResponses>;

  test.beforeEach(async ({ page }) => {
    wmsTiles = trackResponses(page, /\/biocache-service\/mapping\/wms\//);

    await page.goto("/regions/Gemeenten/Gent?pid=217");
    await expectNoneVisible(page, ".spinner");
  });

  test("Should have records", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(gemeente);
    await expectSpeciesCountAbove(page, 0);

    await wmsTiles.waitForSettled(0);
    await expectRegionMapSnapshot(page, "records");
  });

  test("Species tab", async ({ page }) => {
    // Should have stats per species
    const rows = page.locator("#speciesZone tr.link");
    await expectCountAtLeast(rows, 5);
    for (const row of await rows.all()) {
      await expect
        .poll(async () => parseInt((await row.locator(".text-right").innerText()).replace(/[.,]/g, "")))
        .toBeGreaterThan(0);
    }

    // Can select a single species
    const tilesBefore = wmsTiles.count;
    await rows.first().click();

    // The map is updated to filter on the species
    await wmsTiles.waitForSettled(tilesBefore);
    await expectRegionMapSnapshot(page, "species-tab");
  });

  test("Taxonomy tab", async ({ page }) => {
    await page.locator("a#taxonomyTab").click();
    await expectNoneVisible(page, ".spinner");

    // Should have a pie chart, click once to filter on largest group
    const chart = page.locator("#taxonomyTabContent svg").first();
    await expect(chart).toBeVisible();
    const tilesBefore = wmsTiles.count;
    await chart.click({ position: { x: 200, y: 200 } });
    await expect(page.locator("#recordsLink")).toContainText("Animalia");

    // The map is updated to filter on Animalia
    await wmsTiles.waitForSettled(tilesBefore);
    await expectRegionMapSnapshot(page, "taxonomy-tab");
  });

  test("Species list tab", async ({ page }) => {
    await page.locator("a#speciesListsTab").click();
    await expectNoneVisible(page, ".spinner");

    // Should have some lists, and can select a single list
    const lists = page.locator("#speciesListsZone .species-list-row");
    await expectCountAtLeast(lists, 2);
    const tilesBefore = wmsTiles.count;
    await lists.first().click();
    await expectNoneVisible(page, ".spinner");

    await expectSpeciesCountAbove(page, 0);
    await expectCountAtLeast(page.locator("#speciesListSpeciesZone tr"), 5);

    // The map is updated to filter on the list
    await wmsTiles.waitForSettled(tilesBefore);
    await expectRegionMapSnapshot(page, "species-list-tab");
  });

  test("Can filter on time range", async ({ page }) => {
    const initialSpeciesCount = await speciesCount(page);
    expect(initialSpeciesCount).toBeGreaterThan(0);

    const handles = page.locator("#timeSlider > .ui-slider-handle");
    const tilesBefore = wmsTiles.count;
    await dragHandleTo(page, handles.first(), 800);
    await dragHandleTo(page, handles.last(), 1000);

    // Should have fewer species than initially
    await expect
      .poll(() => speciesCount(page), { timeout: 20_000 })
      .toBeLessThan(initialSpeciesCount);
    await expectSpeciesCountAbove(page, 0);

    // The map is updated to filter on the time range
    await wmsTiles.waitForSettled(tilesBefore);
    await expectRegionMapSnapshot(page, "time-range");
  });
});
