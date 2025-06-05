describe("Spatial - Layers", () => {
    beforeEach(() => {
        cy.loginWithoutNavigatingToLoginPage("spatial-hub");
        cy.visit("/spatial-hub");
        cy.get(".progress-bar").should("not.be.visible");
    });

    it("Can add contextual layer", () => {
        const layerName = "Gemeenten";

        // Add a layer
        cy.get("#menu-0").click();
        cy.get('ul.dropdown-menu[aria-labelledby="menu-0"').contains("Laag")
            .click();
        cy.get('[testtag="availableLayers"]').contains(layerName).parent()
            .find('input[type="checkbox"]').check();
        cy.get('button[name="next"]').click();

        // Verify that the modal is not shown and the layer is added to the list
        cy.get(".progress-bar").should("not.be.visible");
        cy.get('[name="divMappedLayers"]').contains(layerName)
            .should("be.visible");

        // Verify that the legend is visible
        cy.get('[ng-show="wmsLegendVisible()"').should("be.visible");

        // Verify that the layer is visible on the map
        cy.get("#map").matchImageSnapshot({
            failureThreshold: 0.4,
            failureThresholdType: "percent",
        });

        // Verify clicking an occurences shows a popup window
        cy.get("#map").click(200, 200);
        cy.get(".leaflet-popup-content")
            .should(
                "contain",
                layerName,
            ).should("contain", "Damme");
    });

    it("Can create a new layer from a filter on a contextual layer", () => {
        const layerName = "Gemeenten";
        const gemeente = "Aalst";

        // Add a layer
        cy.get("#menu-0").click();
        cy.get('ul.dropdown-menu[aria-labelledby="menu-0"').contains("Laag")
            .click();
        cy.get('[testtag="availableLayers"]').contains(layerName).parent()
            .find('input[type="checkbox"]').check();
        cy.get('button[name="next"]').click();

        // Verify that the modal is not shown and the layer is added to the list
        cy.get(".progress-bar").should("not.be.visible");
        cy.get('[name="divMappedLayers"]').contains(layerName)
            .should("be.visible");

        // Verify that the legend is visible and filter on Aalst
        cy.get('[ng-show="wmsLegendVisible()"').should("be.visible").find(
            "input[type='text'][placeholder='Filter']",
        ).type(gemeente, { force: true });
        cy.get('[ng-show="wmsLegendVisible()"').contains("Filter toepassen")
            .click({ force: true });

        // Create a new area based on the filter
        cy.get('[ng-show="wmsLegendVisible()"').find("table").contains(
            gemeente,
        ).parent().find(
            "input[type='checkbox']",
        ).check({ force: true });

        cy.get('[ng-show="wmsLegendVisible()"').contains("Gebied aanmaken")
            .click({ force: true });

        // Verify the new area is added as a layer
        cy.get('[name="divMappedLayers"]').contains("1 gebieden van Gemeenten")
            .should("be.visible");

        cy.get("#map").matchImageSnapshot({
            failureThreshold: 0.4,
            failureThresholdType: "percent",
        });
    });

    it("Can add an environmental layer", () => {
        const layerName =
            "WorldClim jaarlijkse mediaan temperatuur 1970 - 2000";

        // Add a layer
        cy.get("#menu-0").click();
        cy.get('ul.dropdown-menu[aria-labelledby="menu-0"').contains("Laag")
            .click();
        cy.get('[testtag="availableLayers"]').contains(layerName).parent()
            .find('input[type="checkbox"]').check();
        cy.get('button[name="next"]').click();

        // Verify that the modal is not shown and the layer is added to the list
        cy.get(".progress-bar").should("not.be.visible");
        cy.get('[name="divMappedLayers"]').contains(layerName)
            .should("be.visible");

        // Verify that the legend is visible
        cy.get('[ng-show="wmsLegendVisible()"').should("be.visible");

        // Verify that the layer is visible on the map
        cy.get("#map").matchImageSnapshot({
            failureThreshold: 0.4,
            failureThresholdType: "percent",
        });

        // Verify clicking the map shows a popup window
        cy.get("#map").click(200, 200);
        cy.get(".leaflet-popup-content")
            .should(
                "contain",
                layerName,
            )
            .should(
                "contain",
                "10.",
            );
    });
});
