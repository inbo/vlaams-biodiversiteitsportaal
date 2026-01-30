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

    // Login
    cy.loginPageActions();

    // Should be redirected back to profile page
    cy.url().should("include", "/my-profile.html");
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
    cy.get("#my-roles").contains("ADMIN");
    cy.get("#my-roles").contains("USER");
    cy.get("#my-roles").contains("EDITOR");
  });

  it.skip("Should allow modifying user profile", () => {
    cy.get("#profile-overview").find("#update-profile-details").click();
    cy.url().should("include", "/profile/edit");
  });

  it("Show working species list link", () => {
    cy.get("#profile-overview").find("#my-profile-species-lists").click();
    cy.url().should("include", "/species-list/speciesList/list");
    cy.get("h1").contains("Mijn soortenlijsten").should("be.visible");
  });

  it("Show working annotations link", () => {
    cy.get("#profile-overview")
      .find("#my-profile-my-annotated-records")
      .click();
    cy.url().should("include", "https://natuurdata.inbo.be/my-profile.html");
    cy.get("h1").contains("Mijn soortenlijsten").should("be.visible");
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
