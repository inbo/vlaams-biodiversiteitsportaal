import { type Page } from "@playwright/test";
import { expect } from "./fixtures";
import { expectCountAbove, expectCountAtLeast } from "./helpers";

/**
 * Open the biocache-hub search page on the given tab, e.g. "#t2" for the
 * advanced search
 */
export async function openSearchTab(page: Page, tab: string, pane: string) {
  await page.goto("/biocache-hub");
  // Ensure we start the test after the redirect/reload
  await expect(page).toHaveURL(/#tab_simpleSearch/);
  await page.locator(tab).click();
  await expect(page.locator(pane)).toBeVisible();
}

/** Submit the form of the active search tab */
export async function submitActiveTab(page: Page) {
  await page.locator(".tab-pane.active input.btn-primary[type='submit']").click();
}

/**
 * Assert we landed on the occurrence search results, the query mentions all
 * `terms` and there are more than `minResults` results (or at least
 * `atLeast`)
 */
export async function expectSearchResults(
  page: Page,
  terms: string[],
  { moreThan, atLeast }: { moreThan?: number; atLeast?: number } = { moreThan: 10 },
) {
  await expect(page).toHaveURL(/\/biocache-hub\/occurrences\/search/);
  for (const term of terms) {
    await expect(page.locator(".queryDisplay")).toContainText(term, { ignoreCase: true });
  }
  const results = page.locator("#results > *");
  if (moreThan !== undefined) {
    await expectCountAbove(results, moreThan);
  }
  if (atLeast !== undefined) {
    await expectCountAtLeast(results, atLeast);
  }
}
