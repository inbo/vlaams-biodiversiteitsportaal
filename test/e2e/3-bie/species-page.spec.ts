import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { expectCountAbove, expectCountAtLeast } from "../../support/helpers";
import { isProd } from "../../support/env";

async function openTab(page: Page, tab: string) {
  await page.locator(`.taxon-tabs > ul a[href='#${tab}']`).click();
}

test.describe("Bie - Species page", () => {
  test("Working species page", async ({ page }) => {
    const speciesId = 2436940; // Bunny

    await page.goto(`/bie-hub/species/${speciesId}`);

    // Check Wikipedia content is loaded
    const description = page.locator("#descriptiveContent");
    await expect(description).toBeVisible();
    await expect(description).toContainText("Konijn");
    await expectCountAbove(description.locator("> *"), 1);

    // Check map data available
    if (isProd) {
      await expect(page.locator("#leafletMap")).toHaveScreenshot("species-page-map.png");
    }

    // Check names tab
    await openTab(page, "names");
    await expect(
      page.locator("section#names > table .rank-species > .name").first(),
    ).toHaveText("Oryctolagus cuniculus");

    // Check classification tab
    await openTab(page, "classification");
    for (const [rank, name] of [
      ["kingdom", "Animalia"],
      ["phylum", "Chordata"],
      ["class", "Mammalia"],
      ["order", "Lagomorpha"],
      ["family", "Leporidae"],
      ["genus", "Oryctolagus"],
      ["species", "Oryctolagus cuniculus"],
    ]) {
      const element = page.locator(`#classification .rank-${rank} > .name`).first();
      await expect(element).toBeVisible();
      await expect(element).toHaveText(name);
    }

    // Check charts tab
    await openTab(page, "records");
    const charts = page.locator("#charts > *");
    await expectCountAtLeast(charts, 1);
    for (const chart of await charts.all()) {
      // Wait for the chart to be loaded properly
      await expect(chart).toBeVisible();
      await expect
        .poll(async () => (await chart.boundingBox())?.height ?? 0)
        .toBeGreaterThan(300);
      if (isProd) {
        const chartId = await chart.getAttribute("id");
        await expect(chart).toHaveScreenshot(`species-page-${chartId}.png`);
      }
    }

    // Check BHL content is loaded
    await openTab(page, "literature");
    await expectCountAbove(page.locator(".results-summary > .result"), 5);

    // Check Genbank content is loaded
    await openTab(page, "sequences");
    await expectCountAbove(page.locator(".genbank-results > .result"), 5);

    // Check Datapartners content is loaded
    await openTab(page, "data-partners");
    await expectCountAtLeast(page.locator("#data-providers-list > tbody > tr"), 1);
  });

  test("Working ABV tab", async ({ page }) => {
    const speciesId = 2498036; // Greylag goose

    await page.goto(`/bie-hub/species/${speciesId}`);

    // Check ABV trends tab is loaded
    await page.locator("a[href='#abv']").click();
    const content = page.locator("#abv > .content");
    await expect(content).toBeVisible();
    await expectCountAbove(content.locator("> *"), 2);
  });
});
