describe("Regions - overview", () => {
    beforeEach(() => {
        cy.visit("/regions");

        cy.intercept("/geoserver/ALA/wms*").as("loadWMSTiles");
    });

    it("Show the different regions", () => {
        cy.get("h2[role='tab']").each((header, idx) => {
            const regionName = header.text().trim();
            // Check if the region name is not empty
            expect(regionName).to.not.be.empty;

            cy.log(`Checking region: ${regionName}`).wrap(header).click();
            cy.get(`[layer='${regionName}']`).find("li.regionLink").should(
                "have.length.at.least",
                1,
            );

            if (idx !== 0) {
                // Wait for the WMS tiles to load before taking a snapshot
                cy.wait("@loadWMSTiles").wait(2_000);
            }
            cy.get("#map_canvas").matchImageSnapshot(`regions-${regionName}`, {
                failureThreshold: 0.4,
                failureThresholdType: "percent",
            });
        });
    });
});
