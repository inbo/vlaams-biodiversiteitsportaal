describe("Bie - Species page", () => {
    beforeEach(() => {
        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined (reading 'jQuery",
            );
            return false; // Prevents Cypress from failing the test
        });
    });

    it.only("Working species page", () => {
        const speciesId = 2436940; // Bunny

        // Visit species page
        cy.visit("/bie-hub/species/" + speciesId);

        // Check Wikipedia content is loaded
        cy.get("#descriptiveContent")
            .should("be.visible")
            .should("contain", "Konijn")
            .children().should("have.length.above", 1);

        // Check map data available
        cy.get("#leafletMap").matchImageSnapshot("species-page-map", {
            failureThreshold: 0.4,
            failureThresholdType: "percent",
        });

        // Check names tab
        cy.get(".taxon-tabs > ul").find("a[href='#names']").click();
        cy.get("section#names > table").find(".rank-species > .name").first()
            .should(
                "have.text",
                "Oryctolagus cuniculus",
            );

        // Check classification tab
        cy.get(".taxon-tabs > ul").find("a[href='#classification']").click();
        cy.get("#classification")
            .find(".rank-kingdom > .name").should("be.visible").should(
                "have.text",
                "Animalia",
            );
        cy.get("#classification")
            .find(".rank-phylum > .name").should("be.visible").should(
                "have.text",
                "Chordata",
            );
        cy.get("#classification")
            .find(".rank-class > .name").should("be.visible").should(
                "have.text",
                "Mammalia",
            );
        cy.get("#classification")
            .find(".rank-order > .name").should("be.visible").should(
                "have.text",
                "Lagomorpha",
            );
        cy.get("#classification")
            .find(".rank-family > .name").should("be.visible").should(
                "have.text",
                "Leporidae",
            );
        cy.get("#classification")
            .find(".rank-genus > .name").should("be.visible").should(
                "have.text",
                "Oryctolagus",
            );
        cy.get("#classification")
            .find(".rank-species > .name").first().should("be.visible").should(
                "have.text",
                "Oryctolagus cuniculus",
            );

        // Check charts tab
        cy.get(".taxon-tabs > ul").find("a[href='#records']").click();
        cy.get("#charts").children().each((chart) => {
            const chartId = chart.attr("id");
            cy.get(`#${chartId}`).should(() => {
                // Wait for the chart to be loaded properly
                expect(chart).to.be.visible;
                expect(chart.outerHeight()).to.be.greaterThan(300);
            })
                .matchImageSnapshot(`species-page-${chartId}`, {
                    failureThreshold: 0.4,
                    failureThresholdType: "percent",
                });
        });

        // Check BHL content is loaded
        cy.get(".taxon-tabs > ul").find("a[href='#literature']").click();
        cy.get(".results-summary > .result")
            .should("have.length.above", 5);

        // Check Genbank content is loaded
        cy.get(".taxon-tabs > ul").find("a[href='#sequences']").click();
        cy.get(".genbank-results > .result")
            .should("have.length.above", 5);

        // Check Datapartners content is loaded
        cy.get(".taxon-tabs > ul").find("a[href='#data-partners']").click();
        cy.get("#data-providers-list > tbody > tr")
            .should("have.length.above", 2);
    });

    it("Working ABV tab", () => {
        const speciesId = 2498036; // Greylag goose

        // Visit species page
        cy.visit("/bie-hub/species/" + speciesId);

        // Check ABV trends tab is loaded
        cy.get("a[href='#abv']").click();
        cy.get("#abv > .content")
            .should("be.visible")
            .children()
            .should("have.length.above", 2);
    });
});
