describe("Biocache - Occurrence ID search", () => {
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
        cy.get("#t7").click().get("#occurrenceIDSearch").should("be.visible"); // Switch to "Occurrence ID Search" tab
    });

    it("Occurrence ID search", () => {
        const searchInput = "q-10577711334";
        cy.get("#occurrenceID").should("be.visible")
            .type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").contains(
            searchInput,
            { matchCase: false },
        ).get("#results").children().should(
            "have.length.of",
            1,
        );
    });
});
