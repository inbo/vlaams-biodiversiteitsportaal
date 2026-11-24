import { type Page } from "@playwright/test";
import { expect } from "./fixtures";
import { parseCount } from "./helpers";

/** Read the "(1.234)" species count of a region page, once it is loaded */
export async function speciesCount(page: Page): Promise<number> {
  const element = page.locator("#speciesCount");
  await expect(element).toHaveText(/^\([\d.,]+\)$/, { timeout: 20_000 });
  return parseCount(await element.innerText());
}

export async function expectSpeciesCountAbove(page: Page, n: number) {
  await expect.poll(() => speciesCount(page), { timeout: 20_000 }).toBeGreaterThan(n);
}
