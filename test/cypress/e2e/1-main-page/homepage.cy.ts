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

    it("Shows a picture carousel that can be navigated", () => {
        cy.get("[data-carousel-active]")
            .invoke("css", "background-image").then((initialBgImage) => {
                // Check if the background image is set
                expect(initialBgImage).to.not.equal("none");
                // Check if the background image URL is not empty

                cy.get(".vbp-picture-carousel-button-prev")
                    .click()
                    .then(() => {
                        cy.get("[data-carousel-active]")
                            .invoke("css", "background-image").then(
                                (newBgImage) => {
                                    expect(newBgImage).to.not.equal("none");
                                    expect(newBgImage).to.not.equal(
                                        initialBgImage,
                                    );
                                },
                            );
                    });
            });

        cy.get("[data-carousel-active]")
            .invoke("css", "background-image").then((initialBgImage) => {
                // Check if the background image is set
                expect(initialBgImage).to.not.equal("none");
                // Check if the background image URL is not empty

                cy.get(".vbp-picture-carousel-button-next")
                    .click()
                    .then(() => {
                        cy.get("[data-carousel-active]")
                            .invoke("css", "background-image").then(
                                (newBgImage) => {
                                    expect(newBgImage).to.not.equal("none");
                                    expect(newBgImage).to.not.equal(
                                        initialBgImage,
                                    );
                                },
                            );
                    });
            });
    });
});
