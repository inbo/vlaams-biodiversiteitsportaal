import { type Locator, type Page } from "@playwright/test";
import { expect } from "./fixtures";

/** Wait until the locator matches more than `n` elements */
export async function expectCountAbove(locator: Locator, n: number, timeout?: number) {
  await expect
    .poll(() => locator.count(), { timeout })
    .toBeGreaterThan(n);
}

/** Wait until the locator matches at least `n` elements */
export async function expectCountAtLeast(locator: Locator, n: number, timeout?: number) {
  await expect
    .poll(() => locator.count(), { timeout })
    .toBeGreaterThanOrEqual(n);
}

/** Wait until none of the elements matching `selector` is visible */
export async function expectNoneVisible(page: Page, selector: string, timeout?: number) {
  await expect(page.locator(`${selector}:visible`)).toHaveCount(0, { timeout });
}

/** Parse a number formatted with thousands separators, e.g. "1.234" or "1,234" */
export function parseCount(text: string): number {
  return parseInt(text.replace(/[^\d]/g, ""));
}

/**
 * Track responses whose URL matches `pattern`. Replaces Cypress'
 * `cy.intercept(...).as()` + `cy.wait(Array(n).fill("@alias"))`, without
 * depending on the exact number of requests.
 */
export function trackResponses(page: Page, pattern: RegExp) {
  let count = 0;
  let last = 0;
  page.on("response", (response) => {
    if (pattern.test(response.url())) {
      count++;
      last = Date.now();
    }
  });
  return {
    get count() {
      return count;
    },
    /** Wait until responses arrived after `since` (a previous count) and then stopped for `idleMs` */
    async waitForSettled(since: number, { idleMs = 1_000, timeout = 30_000 } = {}) {
      await expect
        .poll(() => count > since && Date.now() - last >= idleMs, {
          timeout,
          message: `responses matching ${pattern} to settle`,
        })
        .toBe(true);
    },
  };
}

/** Drag the mouse between two points, in viewport coordinates */
export async function drag(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(...from);
  await page.mouse.down();
  await page.mouse.move(...to, { steps: 5 });
  await page.mouse.up();
}

/** Drag the mouse between two points, relative to the element's top left corner */
export async function dragOn(locator: Locator, from: [number, number], to: [number, number]) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element to drag on is not visible");
  await drag(
    locator.page(),
    [box.x + from[0], box.y + from[1]],
    [box.x + to[0], box.y + to[1]],
  );
}
