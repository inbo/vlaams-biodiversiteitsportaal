import * as path from "path";
import * as JSZip from "jszip";
import { getFileNameTimeStamp } from "../../support/utils";

describe("Biocache - Download Auth", () => {
  it("Download requires login", () => {
    cy.session("unauthenticated", () => {
      cy.visit("/biocache-hub/occurrences/search?q=taxa%3A%22vulpes%20vulpes");
      // Expand the Attribution facet
      cy.get("#downloads > a").click();

      cy.origin(Cypress.env("AUTH_URL"), () => {
        cy.url().should("match", new RegExp(`^${Cypress.env("AUTH_URL")}`));
      });
    });
  });
});

describe("Biocache - Download", () => {
  let numberOfOccurrences = 0;
  beforeEach(() => {
    cy.login("biocache-hub");
    cy.visit("/biocache-hub/occurrences/search?q=taxa%3A%22vulpes%20vulpes");
    // Ignore errors from auto-complete widget and missing google-analytics
    cy.on("uncaught:exception", (err, runnable) => {
      if (
        err.message.includes("Cannot read properties of undefined") ||
        err.message.includes("ga is not defined")
      ) {
        return false; // Prevents Cypress from failing the test
      } else {
        return true; // Allows other errors to fail the test
      }
    });

    cy.get("#results").children().should("have.length.greaterThan", 10);
    cy.get("#returnedText > strong:first-of-type").should((elem) => {
      numberOfOccurrences = parseInt(elem.text().replace(/[.,]/g, ""));
      expect(numberOfOccurrences).to.be.greaterThan(10);
    });
  });

  it("Download as DWCA has all records", () => {
    // Click downloads button
    cy.get("#downloads").click();

    // Select the DWCA download option
    cy.get("#select-records").click();

    // Set filename
    const filename = `dwca_download_${getFileNameTimeStamp()}`;
    cy.get("#file").clear().type(filename);

    // Select download reason
    cy.get("#downloadReason").select("testen");

    // Click the next button
    cy.get("#nextBtn").click();

    // Click the download button
    cy.get("#queueStatus > a.btn", { timeout: 60_000 }).click();

    // Check download contents
    checkDownloadForOccurenceCount(filename, numberOfOccurrences);
  });

  it("Download as legacy TSV has all records", () => {
    // Click downloads button
    cy.get("#downloads").click();

    // Select the DWCA download option
    cy.get("#select-records").click();

    // Set filename
    const filename = `legacy_download_${getFileNameTimeStamp()}`;
    cy.get("#file").clear().type(filename);

    // Select legacy download format
    cy.get("#downloadFormat[value=legacy]").check();

    // Dowload as tsv
    cy.get("#fileType_tsv").check();

    // Select download reason
    cy.get("#downloadReason").select("testen");

    // Click the next button
    cy.get("#nextBtn").click();

    // Click the download button
    cy.get("#queueStatus > a.btn", { timeout: 60_000 }).click();

    // Check download contents
    checkDownloadForOccurenceCount(filename, numberOfOccurrences, "tsv");
  });

  it("Download as custom archive has all records", () => {
    // Click downloads button
    cy.get("#downloads").click();

    // Select the DWCA download option
    cy.get("#select-records").click();

    // Set filename
    const filename = `custom_download_${getFileNameTimeStamp()}`;
    cy.get("#file").clear().type(filename);

    // Select custom download format
    cy.get("#downloadFormat[value=custom]").check();

    // Select download reason
    cy.get("#downloadReason").select("testen");

    // Click the next button
    cy.get("#nextBtn").click();

    // Select all fields
    cy.get(".select-all-btn").first().click();

    cy.get("a.list-group-item").contains("Diversen velden").click();

    // Click the next button
    cy.get(".next-btn").first().click();

    // Click the download button
    cy.get("#queueStatus > a.btn", { timeout: 60_000 }).click();

    // Check download contents
    checkDownloadForOccurenceCount(filename, numberOfOccurrences);
  });

  // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/563
  it.skip("Save Custom download preferences", () => {
    // Click downloads button
    cy.get("#downloads").click();

    // Select the DWCA download option
    cy.get("#select-records").click();

    // Set filename
    const filename = `custom_download_${getFileNameTimeStamp()}`;
    cy.get("#file").clear().type(filename);

    // Select custom download format
    cy.get("#downloadFormat[value=custom]").check();

    // Select download reason
    cy.get("#downloadReason").select("testen");

    // Click the next button
    cy.get("#nextBtn").click();

    // Select some fields
    cy.get("a.list-group-item").contains("Andere kenmerken").click();
    cy.get("a.list-group-item").contains("Diversen velden").click();
    // Ensure the fields are selected
    cy.get('input[type="checkbox"][value="otherTraits"]').should("be.checked");
    cy.get('input[type="checkbox"][value="miscellaneousFields"]').should(
      "be.checked",
    );

    // Save preferences
    cy.get(".save-btn").first().click();
    cy.get('button[data-bb-handler="ok"]').click();

    // Referesh the page
    cy.reload();

    // Check if the previously selected fields are still selected
    cy.get('input[type="checkbox"][value="otherTraits"]').should("be.checked");
    cy.get('input[type="checkbox"][value="miscellaneousFields"]').should(
      "be.checked",
    );
  });
});

function checkDownloadForOccurenceCount(
  filename: string,
  numberOfOccurrences: number,
  format: string = "csv",
) {
  cy.readFile(
    path.join(Cypress.config("downloadsFolder"), `${filename}.zip`),
    null,
  ).then((zipBuffer) => {
    return JSZip.loadAsync(zipBuffer).then((zip) => {
      return cy.log(Object.keys(zip.files).join(", ")).then(() => {
        // Check the CSV content
        return zip
          .file(`${filename}.${format}`)
          .async("string")
          .then((csvContent) => {
            const numberOfLines = csvContent.match(/\n/g)?.length || 0;
            expect(numberOfLines).to.equal(numberOfOccurrences + 1);
          });
      });
    });
  });
}
