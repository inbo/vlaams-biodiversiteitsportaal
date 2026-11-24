// Regression for https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234
// Added by vbp-bugfix skill
// Mapping an invalid (self-intersecting) area must show an error, not hang
// the portal forever (postAreaWkt yields no id -> object/undefined 404).
import { test, expect } from "../../support/fixtures";
import { addMenu, waitForProgress } from "../../support/spatial";

test.describe("Spatial - invalid area", () => {
  test.use({ authenticated: true });

  test("[vbp-bugfix] [#1234] self-intersecting polygon shows an error instead of hanging", async ({ page }) => {
    await page.goto("/spatial-hub");
    await waitForProgress(page, 120_000);

    // Minimal self-intersecting polygon (bowtie)
    await addMenu(page, "Gebied");
    await page.locator('input[value="drawPolygon"]').check();
    await page.locator('button[name="next"]').click();

    const map = page.locator("#map");
    for (const [x, y] of [[400, 250], [800, 450], [800, 250], [400, 450]]) {
      await map.click({ position: { x, y } });
    }
    await map.dblclick({ position: { x: 400, y: 250 } });
    await expect(page.locator("#wktTextArea")).toHaveValue(/POLYGON/);
    await page.locator("[testtag='nextInNewAreaLegend']").click();

    // Graceful error, portal stays usable
    const alert = page.locator(".bootbox");
    await expect(alert).toBeVisible({ timeout: 90_000 });
    await expect(alert).toContainText("error");
    await alert.locator(".modal-footer button").click();
    await expect(map).toBeVisible();
  });
});
