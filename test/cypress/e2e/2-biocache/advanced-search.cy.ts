describe("Biocache - Advanced search", () => {
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

    // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/554
    it.skip("Raw taxon name search", () => {
        const searchInput = "Columba livia var. domestica";
        cy.get("#raw_taxon_name").type(`${searchInput}{enter}`);
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

    // TODO: https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/552
    it.skip("Institutions search", () => {
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
        const searchCountryInput = "Belgium";
        const searchStatesInput = "Flanders";
        cy.get("#country").select(searchCountryInput);
        cy.get("#state").should((selectElem) => {
            expect(selectElem.children()).to.have.length(4);
        }).select(searchStatesInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").contains(
            searchCountryInput,
            { matchCase: false },
        ).contains(
            searchStatesInput,
            { matchCase: false },
        ).get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    it("Type Status search", () => {
        const searchInput = 0;
        cy.get("#type_status").select(searchInput);
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get("#results").children().should(
            "have.length.greaterThan",
            0,
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

    it("CatalogNumber search", () => {
        const searchInput = "102244166";
        cy.get("#catalogue_number").type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").contains(
            searchInput,
            { matchCase: false },
        ).get("#results").children().should(
            "have.length.of.at.least",
            1,
        );
    });

    // TODO: No data with record number available
    it.skip("Record Number search", () => {
        const searchInput = "1818";
        cy.get("#record_number").type(`${searchInput}{enter}`);
        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        ).get(".queryDisplay").contains(
            searchInput,
            { matchCase: false },
        ).get("#results").children().should(
            "have.length.of.at.least",
            1,
        );
    });

    it("Start Date search", () => {
        const searchInput = "1998-01-01";
        cy.get("#startDate").type(`${searchInput}{enter}`);
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

    it("End Date search", () => {
        const searchInput = "2023-01-01";
        cy.get("#endDate").type(`${searchInput}{enter}`);
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

    it("Everything search", () => {
        // Generic text search
        cy.get("#text").type("vulpes");

        // Taxa search
        cy.get("#taxa_1").type("vulpes vulpes");
        cy.get("#taxa_2").type("pica pica");
        cy.get("#taxa_3").type("Castor canadensis");
        cy.get("#taxa_4").type("Columba livia f. domestica");

        // Species group
        cy.get("#species_group").select("Dicots");

        // Country
        cy.get("#country").select("Belgium");

        // Type status
        cy.get("#type_status").select("Not supplied");

        // Basis of record
        cy.get("#basis_of_record").select("Machine observation");

        // Dataset search
        cy.get("#datasetundefined").type("Chorus");
        cy.get("ul.typeahead > li.active > a.dropdown-item").contains(
            "Meetnetten.be - Chorus counts for Amphibia in Flanders, Belgium",
        ).click();

        // Catalog number
        cy.get("#catalogue_number").type("102244166");

        // Record Number
        // TODO: issue when using colon in record number (e.g "Natuurpunt:Waarnemingen:143198978")
        // https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/551
        cy.get("#record_number").type("1818");

        // Date range
        cy.get("#startDate").type("1998-01-01");
        cy.get("#endDate").type("2023-01-01");

        // Submit search
        cy.get(".tab-pane.active").within(() => {
            cy.get("input.btn-primary[type='submit']").click();
        });

        // Verify search was executed
        cy.url().should("include", "/biocache-hub/occurrences/search");

        // Verify query parameters are displayed
        cy.get(".queryDisplay").within(() => {
            const searchTerms = [
                "vulpes",
                "vulpes vulpes",
                "pica pica",
                "Castor canadensis",
                "Columba livia f. domestica",
                "Dicots",
                "Belgium",
                // "Not supplied", Missing from query display?
                "Machine observation",
                "Chorus",
                "102244166",
                "1818",
                "1998-01-01",
                "2023-01-01",
            ];

            // Check for presence of each search term
            searchTerms.forEach((term) => {
                cy.contains(term, { matchCase: false });
            });
        });

        // No records found
        cy.get(".searchInfo").contains("Geen records gevonden voor");
    });
});
