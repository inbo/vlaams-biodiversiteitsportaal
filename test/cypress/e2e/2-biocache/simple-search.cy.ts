describe("Biocache - Simple search", () => {
    beforeEach(() => {
        cy.visit("/biocache-hub");

        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined",
            );
            return false; // Prevents Cypress from failing the test
        });
    });

    it("Shows a working search bar", () => {
        const searchInput = "vulpes vulpes";
        cy.get("#taxa").should("be.visible")
            .type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").contains(
            searchInput,
            { matchCase: false },
        ).get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    it("Search bar has working auto-complete", () => {
        const searchInput = "pica p";
        cy.get("#taxa").should("be.visible")
            .type(`${searchInput}`);
        cy.get(".ui-autocomplete")
            .should("be.visible")
            .children().should("have.length", 20).contains(
                "pica pica",
                { matchCase: false },
            ); // hardcoded page size of 20, seems excessive :(
    });
});
