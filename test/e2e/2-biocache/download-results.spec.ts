import * as fs from "node:fs/promises";
import { type Page } from "@playwright/test";
import JSZip from "jszip";
import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";
import { expectCountAbove, parseCount } from "../../support/helpers";
import { getFileNameTimeStamp } from "../../support/utils";

const searchUrl = "/biocache-hub/occurrences/search?q=taxa%3A%22vulpes%20vulpes";

test.describe("Biocache - Download Auth", () => {
  test("Download requires login", async ({ page }) => {
    await page.goto(searchUrl);
    await page.locator("#downloads > a").click();
    await expect(page).toHaveURL(new RegExp(`^${env.VLAANDEREN_AUTH_URL}`));
  });
});

test.describe("Biocache - Download", () => {
  test.use({ authenticated: true });

  let numberOfOccurrences = 0;

  test.beforeEach(async ({ page }) => {
    await page.goto(searchUrl);

    await expectCountAbove(page.locator("#results > *"), 10);
    const count = page.locator("#returnedText > strong:first-of-type");
    await expect.poll(async () => parseCount(await count.innerText())).toBeGreaterThan(10);
    numberOfOccurrences = parseCount(await count.innerText());
  });

  async function startDownload(page: Page, filename: string) {
    await page.locator("#downloads").click();
    await page.locator("#select-records").click();
    await page.locator("#file").fill(filename);
  }

  test("Download as DWCA has all records", async ({ page }) => {
    const filename = `dwca_download_${getFileNameTimeStamp()}`;
    await startDownload(page, filename);
    await page.locator("#downloadReason").selectOption("testen");
    await page.locator("#nextBtn").click();

    await checkDownloadForOccurrenceCount(page, filename, numberOfOccurrences);
  });

  test("Download as legacy TSV has all records", async ({ page }) => {
    const filename = `legacy_download_${getFileNameTimeStamp()}`;
    await startDownload(page, filename);
    await page.locator("#downloadFormat[value=legacy]").check();
    await page.locator("#fileType_tsv").check();
    await page.locator("#downloadReason").selectOption("testen");
    await page.locator("#nextBtn").click();

    await checkDownloadForOccurrenceCount(page, filename, numberOfOccurrences, "tsv");
  });

  test("Download as custom archive has all records", async ({ page }) => {
    const filename = `custom_download_${getFileNameTimeStamp()}`;
    await startDownload(page, filename);
    await page.locator("#downloadFormat[value=custom]").check();
    await page.locator("#downloadReason").selectOption("testen");
    await page.locator("#nextBtn").click();

    // Select all fields
    await page.locator(".select-all-btn").first().click();
    await page.locator("a.list-group-item", { hasText: "Diversen velden" }).click();
    await page.locator(".next-btn").first().click();

    await checkDownloadForOccurrenceCount(page, filename, numberOfOccurrences);
  });

  // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/563
  test.skip("Save Custom download preferences", async ({ page }) => {
    const filename = `custom_download_${getFileNameTimeStamp()}`;
    await startDownload(page, filename);
    await page.locator("#downloadFormat[value=custom]").check();
    await page.locator("#downloadReason").selectOption("testen");
    await page.locator("#nextBtn").click();

    // Select some fields
    await page.locator("a.list-group-item", { hasText: "Andere kenmerken" }).click();
    await page.locator("a.list-group-item", { hasText: "Diversen velden" }).click();
    const otherTraits = page.locator('input[type="checkbox"][value="otherTraits"]');
    const miscFields = page.locator('input[type="checkbox"][value="miscellaneousFields"]');
    await expect(otherTraits).toBeChecked();
    await expect(miscFields).toBeChecked();

    // Save preferences
    await page.locator(".save-btn").first().click();
    await page.locator('button[data-bb-handler="ok"]').click();

    await page.reload();

    // The previously selected fields are still selected
    await expect(otherTraits).toBeChecked();
    await expect(miscFields).toBeChecked();
  });
});

async function checkDownloadForOccurrenceCount(
  page: Page,
  filename: string,
  numberOfOccurrences: number,
  format = "csv",
) {
  // The download link appears once the download is ready
  const downloadLink = page.locator("#queueStatus > a.btn");
  await expect(downloadLink).toBeVisible({ timeout: 60_000 });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadLink.click(),
  ]);
  expect(download.suggestedFilename()).toBe(`${filename}.zip`);

  const zip = await JSZip.loadAsync(await fs.readFile(await download.path()));
  const entry = zip.file(`${filename}.${format}`);
  expect(entry, `${filename}.${format} in ${Object.keys(zip.files).join(", ")}`).not.toBeNull();
  const content = await entry!.async("string");
  const numberOfLines = content.match(/\n/g)?.length ?? 0;
  expect(numberOfLines).toBe(numberOfOccurrences + 1);
}
