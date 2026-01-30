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
    cy.get("#user-greeting-name").contains("Test").should("be.visible");
    cy.get("#my-roles").contains("ADMIN");
    cy.get("#my-roles").contains("USER");
    cy.get("#my-roles").contains("EDITOR");
  });

  it.skip("Should allow modifying user profile", () => {
    cy.get("#update-profile-details").click();
    cy.url().should("include", "/profile/edit");
  });
});
