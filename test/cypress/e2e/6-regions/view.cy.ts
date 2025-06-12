describe("Regions - view", () => {
    const gemeente = "Balen";

    beforeEach(() => {
        cy.intercept("/geoserver/ALA/wms*").as("loadWMSTiles");

        cy.visit("https://natuurdata.inbo.be/regions/Gemeenten/Balen");
        cy.get(".spinner", { timeout: 10_000 }).should("not.be.visible");
    });

    it("Should have records", () => {
        cy.get("h1").contains(gemeente);

        // Should have records
        cy.get("#speciesCount", { timeout: 20_000 })
            .should((elem) => {
                const match = elem.text().match(
                    /^\(([\d.,]+)\)$/,
                );
                expect(match).not.to.be.null;
                const speciesCount = parseInt(
                    match[1].replace(",", "").replace(".", ""),
                );
                expect(speciesCount).to.be.greaterThan(0);
            });

        // Check map snapshot
        cy.wait(1_000); // Unfortunately, the map takes a bit to load, no better way to wait
        cy.get("#region-map").matchImageSnapshot({
            failureThreshold: 0.1,
            failureThresholdType: "percent",
        });
    });

    it("Species tab", () => {
        // Should have stats per species
        cy.get("#speciesZone").find("tr.link").should(
            "have.length.at.least",
            5,
        ).each((row) => {
            cy.wrap(row).find(".text-right").should((count) => {
                const countText = count.text().trim();
                const countValue = parseInt(
                    countText.replace(",", "").replace(".", ""),
                );
                expect(countValue).to.be.greaterThan(0);
            });
        });

        // Can select a single species
        cy.get("#speciesZone").find("tr.link").first().click();

        // Check map was updated to filter on species
        cy.wait(1_000); // Unfortunately, the map takes a bit to load, no better way to wait
        cy.get("#region-map").matchImageSnapshot({
            failureThreshold: 0.1,
            failureThresholdType: "percent",
        });
    });

    it("Taxonomy tab", () => {
        cy.get("a#taxonomyTab").click();
        cy.get(".spinner").should("not.be.visible");

        // Should have a pie chart, click once to filter on largest group
        cy.get("#taxonomyTabContent").find("svg").should("be.visible").click(
            200,
            200,
        );
        cy.get("#recordsLink").should("contain", "Animalia");

        // Check map was updated to filter on Animalia
        cy.wait(1_000); // Unfortunately, the map takes a bit to load, no better way to wait
        cy.get("#region-map").matchImageSnapshot({
            failureThreshold: 0.1,
            failureThresholdType: "percent",
        });
    });

    it("Species list tab", () => {
        cy.get("a#speciesListsTab").click();
        cy.get(".spinner").should("not.be.visible");

        // Should have some lists
        cy.get("#speciesListsZone").find(".species-list-row").should(
            "have.length.at.least",
            2,
        )
            // Can select a single list
            .first().click();

        cy.get(".spinner").should("not.be.visible");

        // Should have records
        cy.get("#speciesCount", { timeout: 20_000 })
            .should((elem) => {
                const match = elem.text().match(
                    /^\(([\d.,]+)\)$/,
                );
                expect(match).not.to.be.null;
                const speciesCount = parseInt(
                    match[1].replace(",", "").replace(".", ""),
                );
                expect(speciesCount).to.be.greaterThan(0);
            });

        cy.get("#speciesListSpeciesZone").find("tr").should(
            "have.length.at.least",
            5,
        );

        // Check map was updated to filter on List
        cy.wait(1_000); // Unfortunately, the map takes a bit to load, no better way to wait
        cy.get("#region-map").matchImageSnapshot({
            failureThreshold: 0.1,
            failureThresholdType: "percent",
        });
    });

    it("Can filter on time range", () => {
        // Get initial species count
        cy.get("#speciesCount", { timeout: 20_000 })
            .then((elem) => {
                const match = elem.text().match(
                    /^\(([\d.,]+)\)$/,
                );
                expect(match).not.to.be.null;
                const initialSpeciesCount = parseInt(
                    match[1].replace(",", "").replace(".", ""),
                );
                expect(initialSpeciesCount).to.be.greaterThan(0);

                cy.get("#timeSlider > .ui-slider-handle").first()
                    .trigger("mousedown", { which: 1 })
                    .trigger("mousemove", { pageX: 800 })
                    .trigger("mouseup");

                cy.get("#timeSlider > .ui-slider-handle").last()
                    .trigger("mousedown", { which: 1 })
                    .trigger("mousemove", { pageX: 1000 })
                    .trigger("mouseup");

                // Should have less records than initial count
                cy.get("#speciesCount", { timeout: 20_000 })
                    .should((elem) => {
                        const match = elem.text().match(
                            /^\(([\d.,]+)\)$/,
                        );
                        expect(match).not.to.be.null;
                        const speciesCount = parseInt(
                            match[1].replace(",", "").replace(".", ""),
                        );
                        expect(speciesCount).to.be.greaterThan(0);
                        expect(speciesCount).to.be.lessThan(
                            initialSpeciesCount,
                        );
                    });

                // Check map was updated to filter on List
                cy.wait(1_000); // Unfortunately, the map takes a bit to load, no better way to wait
                cy.get("#region-map").matchImageSnapshot({
                    failureThreshold: 0.1,
                    failureThresholdType: "percent",
                });
            });
    });
});
