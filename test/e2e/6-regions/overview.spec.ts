import { test, expect } from "../../support/fixtures";
import { expectCountAtLeast } from "../../support/helpers";
import { expectSpeciesCountAbove } from "../../support/regions";

test.describe("Regions - overview", () => {
  test("Show the different regions", async ({ page }) => {
    await page.goto("/regions");

    const headers = page.locator("h2[role='tab']");
    await expectCountAtLeast(headers, 1);
    const regionNames = (await headers.allInnerTexts()).map((name) => name.trim());

    for (const regionName of regionNames) {
      await test.step(`Region ${regionName}`, async () => {
        expect(regionName).not.toBe("");

        // The region has entries
        await headers.filter({ hasText: regionName }).first().click();
        const links = page.locator(`[layer='${regionName}'] li.regionLink`);
        await expectCountAtLeast(links, 1);

        // We can navigate to a single region
        const link = links.first();
        const singleRegionName = (await link.innerText()).trim();
        await link.click();

        const regionLink = page.locator("#map-container .infoPopup > .region-link").first();
        await expect(regionLink).toBeVisible();
        await expect(regionLink).toContainText(singleRegionName);
        await regionLink.click();

        // Somehow the name is encoded twice in the URL, and apostrophes are
        // not encoded by encodeURIComponent
        const encodedName = encodeURIComponent(
          encodeURIComponent(singleRegionName.replace("'", "")),
        );
        await expect(page).toHaveURL((url) => url.href.includes(encodedName));

        // The region has records
        await expectSpeciesCountAbove(page, 0);

        // Go back to the overview page
        await page.goto("/regions");
      });
    }
  });
});
