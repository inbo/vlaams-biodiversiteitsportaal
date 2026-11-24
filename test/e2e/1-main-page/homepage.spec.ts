import { test, expect } from "../../support/fixtures";
import { expectCountAbove } from "../../support/helpers";

test.describe("Visit the homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Shows a working search bar", async ({ page }) => {
    const searchInput = "test";
    const search = page.locator("#index-search");
    await expect(search).toBeVisible();
    await search.fill(searchInput);
    await search.press("Enter");

    await expect(page).toHaveURL(/\/bie-hub\/search/);
    await expect(page.locator("h1")).toContainText(searchInput);
    await expectCountAbove(page.locator(".search-results-list > *"), 2);
  });

  test("Search bar has working auto-complete", async ({ page }) => {
    const search = page.locator("#index-search");
    await expect(search).toBeVisible();
    await search.pressSequentially("pica p", { delay: 50 });

    const autocomplete = page.locator(".ui-autocomplete:visible");
    await expect(autocomplete).toBeVisible();
    await expect(autocomplete.locator("> *")).toHaveCount(10);
    // TODO: Fix order of the results, closest match "pica pica" is in the middle
  });

  for (const value of ["prev", "next"]) {
    test(`Shows a picture carousel that can be navigated using ${value} button`, async ({ page }) => {
      const active = page.locator("[data-carousel-active]");
      const backgroundImage = () =>
        active.evaluate((el) => getComputedStyle(el).backgroundImage);

      await expect.poll(backgroundImage).not.toBe("none");
      const initialBgImage = await backgroundImage();

      await page.locator(`.vbp-picture-carousel-button-${value}`).click();

      await expect.poll(backgroundImage).not.toBe("none");
      await expect.poll(backgroundImage).not.toBe(initialBgImage);
    });
  }
});
