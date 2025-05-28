describe("Biocache - Spatial search", () => {
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
        cy.get("#t5").click().get("#spatialSearch").should("be.visible"); // Switch to "Location Search" tab
    });

    it("Map search, Polygon", () => {
        // Draw a polygon on the map
        cy.get(".leaflet-draw-draw-polygon").click({ force: true });

        cy.get("#leafletMap").click(200, 200); // Click to start drawing
        cy.get("#leafletMap").click(300, 200);
        cy.get("#leafletMap").click(250, 400);
        cy.get("#leafletMap").click(230, 400);
        cy.get("#leafletMap").click(200, 200); // Click to close the polygon

        // Search for records within polygon
        cy.get("#showOnlyTheseRecords").should("be.visible").click();

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        );
        cy.get(".queryDisplay")
            .invoke("text")
            .should(
                "match",
                /.*\[all records\] - within user defined polygon/,
            );
        cy.get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    it("Map search, Rectangle", () => {
        // Draw a polygon on the map
        cy.get(".leaflet-draw-draw-rectangle").click();

        cy.get("#leafletMap")
            .trigger("mousedown", { which: 1, clientX: 200, clientY: 200 })
            .trigger("mousemove", { clientX: 500, clientY: 300 })
            .trigger("mouseup", { force: true });

        // Check statistics
        cy.get("#speciesCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });
        cy.get("#occurrenceCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });

        // Search for records within polygon
        cy.get("#showOnlyTheseRecords").should("be.visible").click();

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        );
        cy.get(".queryDisplay")
            .invoke("text")
            .should(
                "match",
                /.*\[all records\] - within user defined polygon*/,
            );
        cy.get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    it("Map search, Circle", () => {
        // Draw a polygon on the map
        cy.get(".leaflet-draw-draw-circle").click();

        cy.get("#leafletMap")
            .trigger("mousedown", { which: 1, clientX: 200, clientY: 200 })
            .trigger("mousemove", { clientX: 300, clientY: 300 })
            .trigger("mouseup", { force: true });

        // Check statistics
        cy.get("#speciesCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });
        cy.get("#occurrenceCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });

        // Search for records within polygon
        cy.get("#showOnlyTheseRecords").should("be.visible").click();

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        );
        cy.get(".queryDisplay")
            .invoke("text")
            .should(
                "match",
                /.*\[all records\] - within .*km of point\(.*\).*/,
            );
        cy.get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });

    it("Map search, WKT", () => {
        // Draw a polygon on the map
        cy.get('a[data-parent="#importAreaPanel"]').click();

        cy.get("#wktInput").type(
            "MULTIPOLYGON(((4.0374755859375+50.80176887200628,4.1583251953125 50.914463232329595,3.77105712890625 50.895411021852205,4.0374755859375 50.80176887200628)))",
        );

        // Add area to map
        cy.get("#addWkt").click();

        // Check statistics
        cy.get("#speciesCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });
        cy.get("#occurrenceCountDiv").should("be.visible").should((elem) => {
            expect(parseInt(elem.text())).to.be.greaterThan(10);
        });

        // Search for records within polygon
        cy.get("#showOnlyTheseRecords").should("be.visible").click();

        cy.url().should(
            "include",
            "/biocache-hub/occurrences/search",
        );
        cy.get(".queryDisplay")
            .invoke("text")
            .should(
                "match",
                /.*\[all records\] - within user defined polygon.*/,
            );
        cy.get("#results").children().should(
            "have.length.greaterThan",
            10,
        );
    });
});
