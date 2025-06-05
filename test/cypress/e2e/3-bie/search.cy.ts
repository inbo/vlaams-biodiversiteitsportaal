describe("Bie - Simple search", () => {
    beforeEach(() => {
        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined (reading 'jQuery",
            );
            return false; // Prevents Cypress from failing the test
        });

        cy.visit("/bie-hub");
    });

    it("Shows a working search bar", () => {
        const searchInput = "konijn";
        cy.get("#search").should("be.visible")
            .type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/bie-hub/search",
        ).get("h1").contains(
            searchInput,
            { matchCase: false },
        ).get("#search-results-list").children().should(
            "have.length.greaterThan",
            2,
        );
    });

    it("Search bar has working auto-complete", () => {
        const searchInput = "pica p";
        cy.get("#search").should("be.visible")
            .type(`${searchInput}`);
        cy.get(".ui-autocomplete")
            .should("be.visible")
            .children().should("have.length", 20).contains(
                "pica pica",
                { matchCase: false },
            ); // hardcoded page size of 20, seems excessive :(
    });

    // Make sure the first result for bunny is the right one
    it("Search results are ordered sanely (by occurrence count)", () => {
        const searchInput = "konijn";
        cy.get("#search").should("be.visible")
            .type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/bie-hub/search",
        ).get("h1").contains(
            searchInput,
            { matchCase: false },
        ).get("#search-results-list").children().first().should(
            "contain",
            "Oryctolagus cuniculus (Linnaeus, 1758)",
        );
    });
});
