describe("Visit the homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Shows a working search bar", () => {
        const searchInput = "test";
        cy.get("#search").should("be.visible").type(`${searchInput}{enter}`)
            .url().should(
                "include",
                "/bie-hub/search",
            ).get("h1").should(
                "contain.text",
                `*${searchInput}*`,
            ).get(".search-results-list").children().should(
                "have.length.greaterThan",
                2,
            );
    });

    it("Search bar has working auto-complete", () => {
        const searchInput = "pica p";
        cy.get("#search").should("be.visible").type(`${searchInput}`)
            .get(".ui-autocomplete")
            .should("be.visible")
            .children().should("have.length", 10);
        // TODO: Fix order of the results
        // .first().should("contain.text", "pica pica"); // Closest match is in the middle??
    });

    ["prev", "next"].forEach((value) =>
        it(`Shows a picture carousel that can be navigated using ${value} button`, () => {
            cy.get("[data-carousel-active]")
                .invoke("css", "background-image")
                .should("not.equal", "none")
                .then((initialBgImage) => {
                    cy.get(`.vbp-picture-carousel-button-${value}`)
                        .click()
                        .then(() => {
                            cy.get("[data-carousel-active]")
                                .invoke("css", "background-image")
                                .should("not.equal", "none")
                                .should("not.equal", initialBgImage);
                        });
                });
        })
    );

    it("Fail", () => {
        cy.get("[data-carousel-active]").should("be.visible")
            .invoke("css", "background-image").should("not.equal", "none");
        cy.fail("This test is not implemented yet");
    });
});
