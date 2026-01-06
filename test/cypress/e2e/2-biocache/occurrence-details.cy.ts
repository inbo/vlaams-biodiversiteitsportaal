describe("Biocache - Occurrence Details", () => {
  it("Can open an occurrence details page", () => {
    cy.visit("/biocache-hub/occurrences/search?q=");

    cy.get(".recordRow")
      .should("be.visible")
      .first()
      .find("a.occurrenceLink")
      .click();

    cy.url().should("include", "/biocache-hub/occurrences/");

    cy.get("h1").should("be.visible").contains("Waarneming");
    cy.get("#occurrenceDataset").should("be.visible");
    cy.get("#occurrenceEvent").should("be.visible");
    cy.get("#occurrenceTaxonomy").should("be.visible");
    cy.get("#occurrenceGeospatial").should("be.visible");
  });
});
