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
        cy.url().should("include", "#tab_simpleSearch"); // Ensure we start test after redirect/reload
        cy.get("#t2").click().get("#advanceSearch").should("be.visible"); // Switch to "Advanced Search" tab
    });

    it("Generic text search", () => {
        const searchInput = "vulpes";
        cy.get("#text").type(`${searchInput}{enter}`);
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

    it("Taxa search", () => {
        const searchInputs = [
            "vulpes vulpes",
            "pica pica",
            "Castor canadensis",
            "Columba livia f. domestica",
        ];
        searchInputs.forEach((searchInput, idx) => {
            cy.get(`#taxa_${idx + 1}`).type(searchInput);
        });
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
        })
            .contains("OR")
            .get("#results").children().should(
                "have.length.greaterThan",
                10,
            );
    });

    it("Raw taxon name search", () => {
        const searchInput = "Columba livia var. domestica";
        cy.get("#text").type(`${searchInput}{enter}`);
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

    it("Species group search", () => {
        const searchInput = "Dicots";
        cy.get("#species_group").select(searchInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
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

    it("Institutions search", () => {
        cy.fail(
            "requires institutions to be configured in the test environment",
        );
    });

    it("Country search", () => {
        const searchInput = "Belgium";
        cy.get("#country").select(searchInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
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

    it("States search", () => {
        cy.fail(
            "requires states endpoint to be fixed: https://github.com/orgs/inbo/projects/15?pane=issue&itemId=112534668&issue=inbo%7Cvlaams-biodiversiteitsportaal%7C548",
        );
    });

    it("Type Status search", () => {
        const searchInput = "PARATYPE";
        cy.get("#type_status").select(searchInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
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

    it("Basis of record search", () => {
        const searchInput = "Machine observation";
        cy.get("#basis_of_record").select(searchInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
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

    it("Dataset search", () => {
        const searchInput = "Chorus";
        cy.get("#datasetundefined").type(searchInput);
        cy.get("ul.typeahead > li.active > a.dropdown-item").contains(
            "Meetnetten.be - Chorus counts for Amphibia in Flanders, Belgium",
        ).click();

        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
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
});
