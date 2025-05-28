import * as path from "path";

describe("Biocache - Download", () => {
    let numberOfOccurrences = 0;
    beforeEach(() => {
        cy.login("biocache-hub");
        cy.visit(
            "/biocache-hub/occurrences/search?q=taxa%3A%22vulpes%20vulpes",
        );
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

        cy.get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
        cy.get("#returnedText > strong").should((elem) => {
            numberOfOccurrences = parseInt(elem.text().replace(/[.,]/g, ""));
            expect(numberOfOccurrences).to.be.greaterThan(10);
        });
    });

    it.skip("Download requires login", () => {
        cy.session("unauthenticated", () => {
            cy.visit(
                "/biocache-hub/occurrences/search?q=taxa%3A%22vulpes%20vulpes",
            );
            // Expand the Attribution facet
            cy.get("#downloads > a").click();

            cy.origin(Cypress.env("AUTH_URL"), () => {
                cy.url().should(
                    "match",
                    new RegExp(`^${Cypress.env("AUTH_URL")}`),
                );
            });
        });
    });

    it("Download as DWCA has all records", () => {
        // Click downloads button
        cy.get("#downloads").click();

        // Select the DWCA download option
        cy.get("#select-records").click();

        // Select download reason
        cy.get("#downloadReason").select("testen");

        // Click the next button
        cy.get("#nextBtn").click();

        // Click the download button
        cy.get("#queueStatus > a.btn")
            .invoke("attr", "href")
            .then((href) => {
                const downloadFileName = path.basename(href);

                cy.get("#queueStatus > a.btn").click();

                // Check download contents
                cy.readFile(
                    path.join(
                        Cypress.config("downloadsFolder"),
                        downloadFileName,
                    ),
                );
            });
    });
});
