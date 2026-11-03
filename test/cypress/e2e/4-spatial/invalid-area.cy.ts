// Regression for https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234
// Added by vbp-bugfix skill
// Mapping an invalid (self-intersecting) area must show an error, not hang
// the portal forever (postAreaWkt yields no id -> object/undefined 404).
describe("Spatial - invalid area", () => {
  it("[vbp-bugfix] [#1234] self-intersecting polygon shows an error instead of hanging", () => {
    cy.login();
    cy.visit("/spatial-hub");
    cy.get(".progress-bar", { timeout: 120_000 }).should("not.be.visible");

    // Minimal self-intersecting polygon (bowtie)
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Gebied")
      .click();
    cy.get('input[value="drawPolygon"]').check();
    cy.get('button[name="next"]').click();
    cy.get("#map").click(400, 250);
    cy.get("#map").click(800, 450);
    cy.get("#map").click(800, 250);
    cy.get("#map").click(400, 450);
    cy.get("#map").dblclick(400, 250);
    cy.get("#wktTextArea").invoke("val").should("match", /POLYGON/);
    cy.get("[testtag='nextInNewAreaLegend']").click();

    // Graceful error, portal stays usable
    cy.get(".bootbox", { timeout: 90_000 })
      .should("be.visible")
      .and("contain.text", "error");
    cy.get(".bootbox .modal-footer button").click();
    cy.get("#map").should("be.visible");
  });
});
