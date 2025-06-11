import * as path from "path";
import { getFileNameTimeStamp } from "../../support/utils";
import { file } from "jszip";

describe("Species list - view", () => {
    beforeEach(() => {
        cy.visit("/species-list");

        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined (reading 'jQuery",
            );
            return false; // Prevents Cypress from failing the test
        });
    });

    it("Shows species lists", () => {
        cy.get("#speciesList > table > tbody > tr")
            .should("have.length.greaterThan", 4)
            .should(
                "contain",
                "Frontpage Images",
            )
            .should(
                "contain",
                "ABV Trend Soortenlijst",
            );
    });

    it("Has a working search bar", () => {
        const searchInput = "Frontpage";
        cy.get("input#appendedInputButton").should("be.visible")
            .type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/species-list/public/speciesLists?q=",
        ).get("#speciesList > table > tbody > tr")
            .should(
                "contain",
                "Frontpage Images",
            );
    });

    it("Show a single list", () => {
        cy.get("#speciesList > table > tbody > tr")
            .should("have.length.greaterThan", 4)
            .contains(
                "ABV Trend Soortenlijst",
            ).click();

        cy.get(".subject-subtitle").should("contain", "ABV Trend Soortenlijst");
        cy.get("#listView")
            .find("tr").should(
                "have.length.greaterThan",
                4,
            )
            .should("contain", "Anser anser");
    });

    it("Can search for a specific species in a list", () => {
        const searchInput = "Grauwe gans";
        cy.get("#speciesList > table > tbody > tr")
            .should("have.length.greaterThan", 4)
            .contains(
                "ABV Trend Soortenlijst",
            ).click();

        cy.get("input#searchInputButton").type(`${searchInput}{enter}`);
        cy.get("#listView")
            .find("tbody > tr").should(
                "have.length",
                1,
            )
            .should("contain", "Anser anser");
    });

    it("Download a single list", () => {
        const filename = `abv_trend_soortenlijst_${getFileNameTimeStamp()}`;
        cy.get("#speciesList > table > tbody > tr")
            .should("have.length.greaterThan", 4)
            .contains(
                "ABV Trend Soortenlijst",
            ).click();

        cy.get("span.count").first().then((count) => {
            const numberOfSpecies = parseInt(count.text().replace(/\D/g, ""));
            expect(numberOfSpecies).to.be.greaterThan(4);

            // Fill in download form
            cy.get("#downloadLink").click();
            cy.get("input#email").type("test@test.natuurdata.dev.inbo.be");
            cy.get("input#filename").clear().type(filename);
            cy.get("select#reasonTypeId").select("testing");
            cy.get("#downloadSpeciesListSubmitButton").click();

            // Check file is downloads
            cy.readFile(
                path.join(
                    Cypress.config("downloadsFolder"),
                    `${filename}.csv`,
                ),
            ).should((fileContent) => {
                expect(fileContent).to.include("Anser anser");
                expect(fileContent).to.include("Anas platyrhynchos");
                const numerOfSpeciesInDownload =
                    (fileContent.match(/\n/g) || "").length - 1;
                expect(numerOfSpeciesInDownload).to.equal(numberOfSpecies);
            });
        });
    });

    it("Adding a list requires login", () => {
        cy.get("a").contains("Upload").click();
        cy.origin(Cypress.env("AUTH_URL"), () => {
            cy.url().should(
                "match",
                new RegExp(`^${Cypress.env("AUTH_URL")}`),
            );
        });
    });
});
