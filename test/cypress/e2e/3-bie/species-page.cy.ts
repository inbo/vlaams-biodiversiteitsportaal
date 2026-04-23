describe("Bie - Species page", () => {
    beforeEach(() => {
        // Ignore known third-party failures that do not block the species page itself.
        cy.on("uncaught:exception", (err) => {
            if (
                err.message.includes(
                    "Cannot read properties of undefined (reading 'jQuery",
                ) ||
                err.message.includes(
                    "Syntax error, unrecognized expression: {\"error\":\"Failed calling web service.",
                )
            ) {
                return false;
            }
        });
    });

    it("Working species page", () => {
        const speciesId = 2436940; // Bunny

        // Visit species page
        cy.visit("/bie-hub/species/" + speciesId);

        // The overview should render even when third-party descriptive content is unavailable.
        cy.get("#descriptiveContent")
            .should("be.visible");

        // Check map data available
        if (Cypress.env("TARGET_ENV") === "prod") {
            cy.get("#leafletMap").matchImageSnapshot("species-page-map", {
                failureThreshold: 0.4,
                failureThresholdType: "percent",
            });
        }

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

        if (Cypress.env("TARGET_ENV") === "prod") {
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
        } else {
            cy.get("#charts").children().each((chart) => {
                const chartId = chart.attr("id");
                cy.get(`#${chartId}`).should(() => {
                    // Wait for the chart to be loaded properly
                    expect(chart).to.be.visible;
                    expect(chart.outerHeight()).to.be.greaterThan(300);
                });
            });
        }

        // Third-party tabs should render even when upstream services are degraded.
        cy.get(".taxon-tabs > ul").find("a[href='#literature']").click();
        cy.get("#literature").should("be.visible");

        // Third-party tabs should render even when upstream services are degraded.
        cy.get(".taxon-tabs > ul").find("a[href='#sequences']").click();
        cy.get("#sequences").should("be.visible");

        // Check Datapartners content is loaded
        cy.get(".taxon-tabs > ul").find("a[href='#data-partners']").click();
        cy.get("#data-providers-list > tbody > tr")
            .should("have.length.at.least", 1);
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
