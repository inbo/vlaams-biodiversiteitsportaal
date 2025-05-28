describe("Biocache - Batch Taxon search", () => {
    beforeEach(() => {
        cy.visit("/biocache-hub");

        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined",
            );
            return false; // Prevents Cypress from failing the test
        });
        cy.url().should("include", "#tab_simpleSearch"); // Ensure we start test after redirect/reload
        cy.get("#t3").click().get("#taxaUpload").should("be.visible"); // Switch to "Batch taxon Search" tab
    });

    it("Batch taxon search, with matched name", () => {
        const searchInputs = [
            "vulpes vulpes",
            "pica pica",
            "Castor canadensis",
            "Columba livia var. domestica",
        ];
        cy.get("#raw_names").type(searchInputs.join("\n"));

        cy.get("#batchModeMatched").check();

        // Submit search
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").within(() => {
            searchInputs.forEach((searchInput) => {
                cy.contains(searchInput, { matchCase: false });
            });
        }).get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/554
    it.skip("Batch taxon search, with raw given name", () => {
        const searchInputs = [
            "Vulpes vulpes",
            "Pica pica",
            "Castor canadensis",
            "Columba livia f. domestica",
        ];
        cy.get("#raw_names").type(searchInputs.join("\n"));

        cy.get("#batchModeRaw").check();

        // Submit search
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").within(() => {
            searchInputs.forEach((searchInput) => {
                cy.contains(searchInput);
            });
        }).get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });
});
