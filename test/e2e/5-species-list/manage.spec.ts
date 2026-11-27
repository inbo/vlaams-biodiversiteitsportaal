import { type Page, type Response } from "@playwright/test";
import { test, expect } from "../../support/fixtures";
import { env } from "../../support/env";
import { expectCountAbove } from "../../support/helpers";
import {
  getFileNameTimeStamp,
  getTestOccurrenceCsv,
  TEST_LIST_PREFIX,
} from "../../support/utils";

const DESCRIPTION = "E2E automated test list description";

const isApiCall = (method: string, path: RegExp) => (r: Response) =>
  r.request().method() === method && path.test(new URL(r.url()).pathname);

/**
 * Create a test list through the upload flow and wait until it is fully
 * ingested. Leaves the browser on the new list's page.
 */
async function createList(page: Page, listName: string, scientificName: string) {
  await page.locator('a[aria-label="Upload een lijst vanuit een CSV-bestand"]').click();
  await expect(page).toHaveURL(/\/lists\/upload/);

  // There is no separate parse preview anymore: the upload response is the parse check
  const [upload] = await Promise.all([
    page.waitForResponse(isApiCall("POST", /\/api\/lists\/v2\/upload$/), { timeout: 60_000 }),
    page.locator('input[type="file"]').setInputFiles({
      name: `import-species-${getFileNameTimeStamp()}.csv`,
      mimeType: "text/csv",
      buffer: Buffer.from(getTestOccurrenceCsv(scientificName)),
    }),
  ]);
  expect(upload.status(), "upload response").toBe(200);
  expect((await upload.json()).rowCount).toBe(1);

  // Title, description and list type are all required: an empty field makes
  // HTML5 validation silently block the submit
  await page.locator('input[name="title"]').fill(listName);
  await page.locator('textarea[name="description"]').fill(DESCRIPTION);
  await page.locator('input[placeholder="Lijsttype"]').click();
  await page.getByRole("option", { name: "Testing List" }).click();

  // While ingesting, the UI polls the progress endpoint
  let progress: Record<string, unknown> | undefined;
  const onResponse = async (r: Response) => {
    if (isApiCall("GET", /\/api\/lists\/v2\/ingest\/[^/]+\/progress$/)(r) && r.status() === 200) {
      const body = (await r.json()) as Record<string, unknown>;
      if (body.completed) progress = body;
    }
  };
  page.on("response", onResponse);
  try {
    const [ingest] = await Promise.all([
      page.waitForResponse(isApiCall("POST", /\/api\/lists\/v2\/ingest$/), { timeout: 60_000 }),
      page.getByRole("button", { name: "Aanmaken" }).click(),
    ]);
    expect(ingest.status(), "ingest response").toBe(200);
    expect(typeof (await ingest.json()).id).toBe("string");

    await expect.poll(() => progress, { timeout: 90_000, message: "ingestion completed" }).toBeDefined();
  } finally {
    page.off("response", onResponse);
  }
  expect(progress!.errorMessage, "ingest error").toBeFalsy();
  expect(progress!.mongoTotal, "all rows ingested").toBe(progress!.rowCount);
  expect(progress!.elasticTotal, "all rows indexed").toBe(progress!.rowCount);

  // The UI opens the list once ingested. Elasticsearch can lag a few seconds
  // behind, and the page does not refetch by itself, so reload until the
  // species shows up.
  await expect(page).toHaveURL(/\/lists\/list\//, { timeout: 30_000 });
  await expect(page.locator("h4")).toContainText(listName, { timeout: 20_000 });
  const rows = page.locator("table tbody tr");
  await expect(async () => {
    if ((await rows.count()) !== 1) {
      await page.reload();
    }
    await expect(page.locator("h4")).toContainText(listName, { timeout: 20_000 });
    await expect(rows).toHaveCount(1, { timeout: 5_000 });
    await expect(rows).toContainText(scientificName);
  }).toPass({ timeout: 60_000, intervals: [4_000] });
}

// Creating and deleting lists is opt-in, to avoid piling up test lists / uids
test.describe("Species list - manage", () => {
  test.skip(!env.ENABLE_MUTATION_TESTS, "E2E_ENABLE_MUTATION_TESTS is not set to true");
  test.use({ authenticated: true });

  test.beforeEach(async ({ page }) => {
    await page.goto("/lists");
  });

  test("Can add a new list using a file as input", async ({ page }) => {
    await createList(page, `${TEST_LIST_PREFIX} file ${getFileNameTimeStamp()}`, "Cryphaea heteromalla");
  });

  test("Can edit an existing list's metadata", async ({ page }) => {
    const listName = `${TEST_LIST_PREFIX} edit ${getFileNameTimeStamp()}`;
    const editedTitle = `${listName} (edited)`;
    const editedDescription = "Description updated by E2E test";
    await createList(page, listName, "Cryphaea heteromalla");

    await page.locator('button[aria-label="Metadata bewerken"]').click();
    const modal = page.locator(".mantine-Modal-root").filter({ hasText: "Lijstmetadata bewerken" });
    await expect(modal).toBeVisible();

    // Wait for the pre-filled values, so we edit the real inputs and not a
    // transient one rendered while the modal animates in
    const title = modal.locator('input[name="title"]');
    const description = modal.locator('textarea[name="description"]');
    await expect(title).toHaveValue(listName);
    await expect(description).toHaveValue(DESCRIPTION);
    await title.fill(editedTitle);
    await description.fill(editedDescription);
    await modal.getByRole("button", { name: "Bijwerken" }).click();

    // The closed modal's root can linger hidden in the DOM, so check the
    // notification instead of the modal disappearing
    await expect(page.locator(".mantine-Notification-root")).toContainText("succesvol bijgewerkt");
    await expect(page.locator("h4")).toContainText(editedTitle);

    // The change was saved server-side
    await page.reload();
    await expect(page.locator("h4")).toContainText(editedTitle, { timeout: 20_000 });
    await expect(page.getByText(editedDescription)).toBeVisible({ timeout: 20_000 });
  });

  test("Can delete lists", async ({ page }) => {
    await page.locator('a[aria-label="Mijn lijsten"]').or(page.locator("a", { hasText: "Mijn lijsten" })).first().click();
    await expect(page).toHaveURL(/\/lists\/my-lists/);

    // The my-lists query can take ~10s, skeleton rows render until then
    const testListLinks = page.locator("table tbody tr a").filter({ hasText: TEST_LIST_PREFIX });
    await expectCountAbove(testListLinks, 0, 30_000);

    const lists = await Promise.all(
      (await testListLinks.all()).map(async (link) => ({
        name: (await link.innerText()).trim(),
        id: (await link.getAttribute("href"))?.match(/\/list\/([^/?#]+)$/)?.[1],
      })),
    );

    // There is no per-row delete button, lists are deleted from their own page
    for (const { name, id } of lists) {
      expect(id, `list id of ${name}`).toBeDefined();
      await test.step(`Delete ${name}`, async () => {
        await page.goto(`/lists/list/${id}`);
        await page
          .locator('button[aria-label="Lijst verwijderen"]')
          .or(page.getByRole("button", { name: "Verwijderen" }))
          .first()
          .click();

        const modal = page.locator(".mantine-Modal-root").filter({ hasText: name });
        await expect(modal).toBeVisible();
        const [deleted] = await Promise.all([
          page.waitForResponse(isApiCall("DELETE", new RegExp(`/api/lists/v2/delete/${id}$`)), {
            timeout: 60_000,
          }),
          modal.getByRole("button", { name: "Confirm" }).click(),
        ]);
        expect(deleted.status(), `delete ${id} response`).toBe(200);
        await expect(page).not.toHaveURL(new RegExp(`/lists/list/${id}`), { timeout: 15_000 });
      });
    }

    // Wait for the real data (the user's lists include the ABV Trend list),
    // so a slow load can't hide a leftover test list
    await page.goto("/lists/my-lists");
    await expect(page.locator("table tbody")).toContainText("ABV Trend Soortenlijst", { timeout: 30_000 });
    await expect(page.locator("table tbody")).not.toContainText(TEST_LIST_PREFIX);
  });
});
