import * as fs from "node:fs/promises";
import { type Page } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";
import { expectCountAbove, parseCount } from "../../support/helpers";
import { getFileNameTimeStamp } from "../../support/utils";

const listRows = (page: Page) => page.locator("#speciesList > table > tbody > tr");

async function openList(page: Page, name: string) {
  await expectCountAbove(listRows(page), 4);
  await listRows(page).getByText(name).first().click();
  await expect(page.locator(".subject-subtitle")).toContainText(name);
}

test.describe("Species list - view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/species-list");
  });

  test("Shows species lists", async ({ page }) => {
    await expectCountAbove(listRows(page), 4);
    await expect(page.locator("#speciesList > table > tbody")).toContainText("Frontpage Images");
    await expect(page.locator("#speciesList > table > tbody")).toContainText("ABV Trend Soortenlijst");
  });

  test("Has a working search bar", async ({ page }) => {
    const searchInput = "Frontpage";
    const input = page.locator("input#appendedInputButton");
    await expect(input).toBeVisible();
    await input.fill(searchInput);
    await input.press("Enter");

    await expect(page).toHaveURL(/\/species-list\/public\/speciesLists\?q=/);
    await expect(page.locator("#speciesList > table > tbody")).toContainText("Frontpage Images");
  });

  test("Show a single list", async ({ page }) => {
    await openList(page, "ABV Trend Soortenlijst");
    await expectCountAbove(page.locator("#listView tr"), 4);
    await expect(page.locator("#listView")).toContainText("Anser anser");
  });

  test("Can search for a specific species in a list", async ({ page }) => {
    await openList(page, "ABV Trend Soortenlijst");

    const input = page.locator("input#searchInputButton");
    await input.fill("Grauwe gans");
    await input.press("Enter");

    const rows = page.locator("#listView tbody > tr");
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("Anser anser");
  });

  test("Download a single list", async ({ page }) => {
    const filename = `abv_trend_soortenlijst_${getFileNameTimeStamp()}`;
    await openList(page, "ABV Trend Soortenlijst");

    const numberOfSpecies = parseCount(await page.locator("span.count").first().innerText());
    expect(numberOfSpecies).toBeGreaterThan(4);

    // Fill in download form
    await page.locator("#downloadLink").click();
    await page.locator("input#email").fill("test@test.natuurdata.dev.inbo.be");
    await page.locator("input#filename").fill(filename);
    await page.locator("select#reasonTypeId").selectOption("testing");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("#downloadSpeciesListSubmitButton").click(),
    ]);

    expect(download.suggestedFilename()).toBe(`${filename}.csv`);
    const content = await fs.readFile(await download.path(), "utf8");
    expect(content).toContain("Anser anser");
    expect(content).toContain("Anas platyrhynchos");
    const numberOfSpeciesInDownload = (content.match(/\n/g) ?? []).length - 1;
    expect(numberOfSpeciesInDownload).toBe(numberOfSpecies);
  });

  test("Adding a list requires login", async ({ page }) => {
    await page.locator("a", { hasText: "Upload" }).first().click();
    await expect(page).toHaveURL(new RegExp(`^${env.VLAANDEREN_AUTH_URL}`));
  });
});
