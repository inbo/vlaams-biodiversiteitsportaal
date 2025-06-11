describe("Spatial - Layers", () => {
    beforeEach(() => {
        cy.loginWithoutNavigatingToLoginPage("spatial-hub");
        cy.visit("/spatial-hub");
        cy.get(".progress-bar").should("not.be.visible");
    });

    it("Can add a polygon", () => {
        // Add a layer
        cy.get("#menu-0").click();
        cy.get('ul.dropdown-menu[aria-labelledby="menu-0"').contains("Gebied")
            .click();
        cy.get('input[value="drawBoundingBox"]').check();
        cy.get('button[name="next"]').click();

        // Draw a polygon on the map
        cy.get("#map")
            .trigger("mousedown", { which: 1, clientX: 500, clientY: 300 })
            .trigger("mousemove", { clientX: 600, clientY: 400 })
            .trigger("mouseup", { force: true });

        cy.get("#wktTextArea").invoke("val").should(
            "equal",
            "MULTIPOLYGON (((3.03497314453125 50.97745313889934, 3.30963134765625 50.97745313889934, 3.30963134765625 51.15006324988587, 3.03497314453125 51.15006324988587, 3.03497314453125 50.97745313889934)))",
        );

        cy.get("[testtag='nextInNewAreaLegend']").click();
        cy.get(".progress-bar", { timeout: 10_000 }).should("not.be.visible");
    });
});
