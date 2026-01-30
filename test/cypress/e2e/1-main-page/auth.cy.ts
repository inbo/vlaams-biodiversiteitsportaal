describe("Can login from the homepage", () => {
  it("Can login/logout with email and password and adjust banner login status", () => {
    cy.visit("/");

    assertIsNotLoggedIn();

    login();

    assertIsLoggedIn();

    logout();

    assertIsNotLoggedIn();
  });

  ["bie-hub", "biocache-hub", "collectory", "species-list"].forEach(
    (service) => {
      it(`[${service}] Login/logout on mainpage means logged in in ${service}`, () => {
        cy.visit("/");

        assertIsNotLoggedIn();
        login();
        assertIsLoggedIn();

        cy.visit(`/${service}/`);

        assertIsLoggedIn();

        cy.visit("/");

        assertIsLoggedIn();
        logout();
        assertIsNotLoggedIn();

        cy.visit(`/${service}/`);

        assertIsNotLoggedIn();
      });

      it(`[${service}] Login on service page means logged in on main page`, () => {
        cy.visit(`/${service}/`);

        assertIsNotLoggedIn();
        login();

        cy.wait(1000); // wait for the login to propagate

        assertIsLoggedIn();

        cy.visit("/");

        assertIsLoggedIn();
      });
    },
  );
});

function login() {
  cy.get("#dropdown-auth-menu").click();
  cy.get("#dropdown-auth-menu > .dropdown-menu").should("be.visible");
  cy.get("#loginButton").should("be.visible").click();
  cy.wait(1000); // wait for the login to propagate

  cy.loginPageActions();
  cy.wait(1000); // wait for the login to propagate
}

function logout() {
  cy.get("#dropdown-auth-menu")
    .click()
    .get("#dropdown-auth-menu > .dropdown-menu")
    .should("be.visible");
  cy.get("#logoutButton").click();
  cy.wait(1000); // wait for the logout to propagate
}

function assertIsLoggedIn() {
  cy.get("#dropdown-auth-menu")
    .click()
    .get("#dropdown-auth-menu > .dropdown-menu")
    .should("be.visible");
  cy.get("#loginButton").should("not.be.visible");
  cy.get("#logoutButton").should("be.visible");
  cy.get(".myProfileBtn").should("be.visible");
  // Check that the login icon is now the inbo primary color
  cy.get("#login-icon")
    .should("be.visible")
    .should("have.css", "color", "rgb(192, 67, 132)");
  cy.get("#dropdown-auth-menu").click();
}

function assertIsNotLoggedIn() {
  cy.get("#dropdown-auth-menu")
    .click()
    .get("#dropdown-auth-menu > .dropdown-menu")
    .should("be.visible");
  cy.get("#loginButton").should("be.visible");
  cy.get("#logoutButton").should("not.be.visible");
  cy.get(".myProfileBtn").should("not.be.visible");
  // Check that the login icon is now the inbo primary color
  cy.get("#login-icon")
    .should("be.visible")
    .should("have.css", "color", "rgb(136, 136, 136)");
  cy.get("#dropdown-auth-menu").click();
}
