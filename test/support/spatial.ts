import { type Page } from "@playwright/test";
import { expect } from "./fixtures";
import { isProd } from "./env";
import { expectNoneVisible } from "./helpers";

export async function openSpatialHub(page: Page) {
  await page.goto("/spatial-hub");
  await waitForProgress(page, 30_000);
}

/** Wait until no progress bar is visible */
export async function waitForProgress(page: Page, timeout?: number) {
  await expectNoneVisible(page, ".progress-bar", timeout);
}

/** Open the "add" menu and choose an item, e.g. "Soorten", "Laag" or "Gebied" */
export async function addMenu(page: Page, item: string) {
  await page.locator("#menu-0").click();
  await page
    .locator('ul.dropdown-menu[aria-labelledby="menu-0"]')
    .getByText(item)
    .first()
    .click();
}

export const mappedLayer = (page: Page, name: string) =>
  page.locator('[name="divMappedLayers"]').getByText(name).first();

/** Compare the map with its baseline, only on prod where the data is stable */
export async function expectMapSnapshot(page: Page, name: string) {
  if (isProd) {
    await expect(page.locator("#map")).toHaveScreenshot(`${name}.png`);
  }
}
