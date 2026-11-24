import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";
import { expectCountAbove } from "../../support/helpers";
import {
  getFileNameTimeStamp,
  getTestOccurrenceCsv,
  TEST_LIST_PREFIX,
} from "../../support/utils";

async function createList(page: Page, listName: string, scientificName: string) {
  await expect(page.locator("#initialParse tbody > tr")).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("#initialParse tbody > tr")).toContainText(scientificName);

  // Fill in list details and create
  await page.locator("#listTitle").fill(listName);
  await page.locator("#listTypeId").selectOption("Test lijst");
  await page.locator("#uploadButton").click();

  // Check that the list was created, uploading can take a minute
  await expect(page.locator(".subject-subtitle")).toContainText(listName, { timeout: 90_000 });
  await expect(page.locator("#listView tbody > tr")).toHaveCount(1);
  await expect(page.locator("#listView tbody > tr")).toContainText(scientificName);
}

// Creating and deleting lists is opt-in, to avoid piling up test lists / uids
test.describe("Species list - manage", () => {
  test.skip(!env.ENABLE_MUTATION_TESTS, "E2E_ENABLE_MUTATION_TESTS is not set to true");
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await page.goto("/species-list");
  });

  test("Can add a new list using a file as input", async ({ page }) => {
    const listName = `${TEST_LIST_PREFIX} file ${getFileNameTimeStamp()}`;
    const scientificName = "Cryphaea heteromalla";
    await page.locator("a", { hasText: "Upload" }).first().click();

    await page.locator("#csvFileUpload").setInputFiles({
      name: `import-species-${getFileNameTimeStamp()}.csv`,
      mimeType: "text/csv",
      buffer: Buffer.from(getTestOccurrenceCsv(scientificName)),
    });
    await page.locator("#checkData2").click();

    await createList(page, listName, scientificName);
  });

  test("Can add a new list using textarea as input", async ({ page }) => {
    const listName = `${TEST_LIST_PREFIX} textarea ${getFileNameTimeStamp()}`;
    const scientificName = "Oryctolagus cuniculus";
    await page.locator("a", { hasText: "Upload" }).first().click();

    await page.locator("#copyPasteData").fill(getTestOccurrenceCsv(scientificName));
    await page.locator("#checkData").click();

    await createList(page, listName, scientificName);
  });

  test("Can delete lists", async ({ page }) => {
    await page.locator("a", { hasText: "Mijn Lijsten" }).first().click();

    const testListLinks = page
      .locator("#speciesList tbody > tr a")
      .filter({ hasText: TEST_LIST_PREFIX });
    await expectCountAbove(testListLinks, 0);

    const lists = await Promise.all(
      (await testListLinks.all()).map(async (link) => ({
        name: (await link.innerText()).trim(),
        id: (await link.getAttribute("href"))?.match(/\/(dr\d+)$/)?.[1],
      })),
    );

    for (const { name, id } of lists) {
      expect(id, `list id of ${name}`).toBeDefined();
      await test.step(`Delete ${id}`, async () => {
        await page
          .locator("#speciesList tbody > tr")
          .filter({ hasText: name })
          .locator("a", { hasText: "Verwijderen" })
          .click();
        const dialog = page.locator(".fancybox-content");
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText(name);
        // The "Yes" handler is only bound once fancybox finished opening
        // (afterShow), clicking before that does nothing
        await page.waitForFunction(() => {
          const ok = document.getElementById("fancyConfirm_ok");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return !!ok && !!(window as any).jQuery._data(ok, "events")?.click;
        });
        const [deleted] = await Promise.all([
          page.waitForResponse(
            (r) => r.url().includes("/speciesList/delete/") && r.request().method() === "POST",
            { timeout: 60_000 },
          ),
          page.locator("input#fancyConfirm_ok").click(),
        ]);
        // On an error the page only shows an alert, which Playwright dismisses
        expect(deleted.status(), `delete ${id} response`).toBe(200);
        await expect(dialog).toHaveCount(0);

        // Terrible API, returns the full list with listCount when the list is not found
        const response = await page.request.get(`/species-list/ws/speciesList/${id}`);
        expect(response.status()).toBe(200);
        expect((await response.json()).listCount).toBeDefined();
      });
    }
  });
});
