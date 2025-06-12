describe("Regions - overview", () => {
    beforeEach(() => {
        cy.intercept("/geoserver/ALA/wms*").as("loadWMSTiles");
        cy.visit("/regions");
    });

    it("Show the different regions", () => {
        cy.get("h2[role='tab']").each((header, idx) => {
            const regionName = header.text().trim();
            // Check if the region name is not empty
            expect(regionName).to.not.be.empty;

            // Check if the region has entries
            cy.log(`Checking region: ${regionName}`)
                .get("h2[role='tab']")
                .contains(regionName).click();
            cy.get(`[layer='${regionName}']`).find("li.regionLink").should(
                "have.length.at.least",
                1,
            );

            // // Compare map snapshots for each region
            // if (idx !== 0) {
            //     // Wait for the WMS tiles to load before taking a snapshot
            //     cy.wait("@loadWMSTiles").wait(2_000);
            // }
            cy.get("#map_canvas").matchImageSnapshot(`regions-${regionName}`, {
                failureThreshold: 0.4,
                failureThresholdType: "percent",
            });

            // Check if we can navigate to a single region
            cy.get(`[layer='${regionName}']`).find("li.regionLink").first()
                .then(
                    (link) => {
                        // Click link to single regions
                        const singleRegionName = link.text().trim();
                        expect(singleRegionName).to.not.be.undefined;
                        cy.wrap(link).click();

                        cy.get("#map-container").find(
                            ".infoPopup > .region-link",
                        ).first()
                            .should("be.visible")
                            .should("contain", singleRegionName)
                            .click();

                        // Check if the region has records
                        cy.url().should(
                            "include",
                            singleRegionName,
                        );
                        return cy.get("#speciesCount", { timeout: 20_000 })
                            .should((elem) => {
                                const match = elem.text().match(
                                    /^\(([\d.,]+)\)$/,
                                );
                                expect(match).not.to.be.null;
                                const speciesCount = parseFloat(
                                    match[1].replace(",", "").replace(".", ""),
                                );
                                expect(speciesCount).to.be.greaterThan(0);
                            });
                    },
                );
            // Go back to the overview page, no idea why we need to go back twice
            cy.go("back");
            cy.go("back");
        });
    });
});
