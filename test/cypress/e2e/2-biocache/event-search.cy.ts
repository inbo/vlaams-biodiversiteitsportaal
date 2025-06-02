describe("Biocache - Event search", () => {
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
        cy.get("#t6").click().get("#eventSearch").should("be.visible"); // Switch to "Event Search" tab
    });

    it("Event ID search, Generic", () => {
        const searchInputs = [
            "INBO:MEETNET:EVENT:368525",
            "INBO:MEETNET:EVENT:371155",
            "INBO:MEETNET:VISITID:001359",
            "INBO:MEETNET:VISITID:059294",
            "JQ921217",
            "ZSM_HET_0846",
            "meetnetten",
            "waarnemingen",
        ];
        cy.get("#event_keywords").type(searchInputs.join("\n"));

        // Submit search
        cy.get("#eventSearchForm").within(() => {
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

    it("Event ID search, Event ID", () => {
        const searchInputs = [
            "INBO:MEETNET:EVENT:368525",
            "INBO:MEETNET:EVENT:371155",
        ];
        cy.get("#event_ids").type(searchInputs.join("\n"));

        // Submit search
        cy.get("#eventIDSearchForm").within(() => {
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
            "have.length.to.be.at.least",
            2,
        );
    });

    it("Event ID search, Parent Event ID", () => {
        const searchInputs = [
            "INBO:MEETNET:VISITID:001359",
            "INBO:MEETNET:VISITID:059294",
        ];
        cy.get("#event_keywords").type(searchInputs.join("\n"));

        // Submit search
        cy.get("#eventSearchForm").within(() => {
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

    // TODO: No data with field numbers, so skipping this test for now
    it.skip("Event ID search, Field Numbers", () => {
        const searchInputs = [
            "JQ921217",
            "ZSM_HET_0846",
        ];
        cy.get("#field_numbers").type(searchInputs.join("\n"));

        // Submit search
        cy.get("#fieldNumberSearchForm").within(() => {
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
            "have.length.to.be.at.least",
            2,
        );
    });

    it("Event ID search, Generic", () => {
        const searchInputs = [
            "meetnetten",
            "waarnemingen",
        ];
        cy.get("#dataset_name").type(searchInputs.join("\n"));

        // Submit search
        cy.get("#datasetNameSearchForm").within(() => {
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
});
