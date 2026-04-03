describe("User profile - Anonymous", () => {
  beforeEach(() => {
    cy.visit("/my-profile.html");
  });

  it("Should show message when not logged in with a working link", () => {
    cy.contains("Je bent nog niet ingelogd.").should("be.visible");
    cy.get("#profile-login")
      .find("#my-profile-login-button")
      .should("be.visible")
      .click();

    // Should navigate to Vlaanderen login
    cy.url().should(
      "match",
      new RegExp(`^${Cypress.env("VLAANDEREN_AUTH_URL")}`),
    );
  });
});

describe("User profile - Authenticated", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/my-profile.html");
  });

  it("Should show username and roles", () => {
    cy.get("#user-greeting-name")
      .should("be.visible")
      .should("not.be.empty")
      .should("not.contain", "undefined");
    cy.get("#my-roles").contains("EDITOR");
  });

  it("Should allow modifying user profile", () => {
    cy.get("#profile-overview")
      .find("#my-profile-update-profile-details")
      .click();
    cy.url().should("include", Cypress.env("KEYCLOAK_AUTH_URL"));
    cy.get("#kc-page-title").should("be.visible");
    cy.get("#email").should("be.visible");
  });

  it("Should resetting password", () => {
    cy.get("#profile-overview").find("#my-profile-update-password").click();
    cy.url().should("include", Cypress.env("KEYCLOAK_AUTH_URL"));
    cy.get("#kc-page-title").should("be.visible");
    cy.get("#password-new").should("be.visible");
  });

  it("Show working species list link", () => {
    cy.get("#profile-overview").find("#my-profile-species-lists").click();
    cy.url().should("include", "/species-list/speciesList/list");
    cy.get("h1").contains("Mijn soortenlijsten").should("be.visible");
  });

  it("Show working annotations link", () => {
    cy.getCookie("VBP-AUTH").then((cookie) => {
      const userId = JSON.parse(decodeURIComponent(cookie!.value)).userId;
      cy.get("#profile-overview")
        .find("#my-profile-my-annotated-records")
        .click();
      cy.url()
        .should("include", "/biocache-hub/occurrences/search/")
        .should("include", `assertion_user_id:%22${userId}%22`);
      cy.get("h1").contains("Waarnemingsrecords").should("be.visible");
    });
  });

  it("Show working alerts link", () => {
    cy.get("#profile-overview").find("#my-profile-my-alerts").click();
    cy.url().should("include", "/alerts/");
    cy.get("h1").contains("Mijn email abonnementen").should("be.visible");
  });

  it("Show working sptial analysis link", () => {
    cy.get("#profile-overview").find("#my-profile-spatial-portal").click();
    cy.url().should("include", "/spatial-hub/?tool=log");
    cy.get("h3").contains("Geschiedenis").should("be.visible");
  });
});
