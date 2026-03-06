import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command";

addMatchImageSnapshotCommand();

interface User {
  username: string;
  password: string;
}

// Extend Cypress namespace with custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(
        user?: User,
        validateSessionCookie?: boolean,
      ): void;
      loginPageActions(user?: User): void;
    }
  }
}

Cypress.Commands.add(
  "login",
  (
    user: User = {
      username: Cypress.env("VBP_USERNAME"),
      password: Cypress.env("VBP_PASSWORD"),
    },
    validateSessionCookie: boolean = false,
  ): void => {
    cy.log(`Logging in user: ${user.username}`);
    cy.session(
      user.username,
      () => {
        cy.visit("/");

        let originWrapper = (fn) => fn({ user });

        cy.get("#dropdown-auth-menu").click();
        cy.get("#loginButton").should("be.visible").click({ controlKey: true });

        originWrapper = (fn) =>
          cy.origin(Cypress.env("KEYCLOAK_AUTH_URL"), { args: { user } }, fn);
        // Perform login actions on the login page
        originWrapper(({ user }) => {
          if (Cypress.env("TARGET_ENV") === "local") {
            cy.get("textarea[name='claims']")
              .invoke("val")
              .then((value: string) => {
                const claims = JSON.parse(value);
                claims.preferred_username = user.username;
                cy.get("textarea[name='claims']").invoke(
                  "val",
                  JSON.stringify(claims),
                );
              });
            cy.get("button[type='submit']").click();
          } else {
            cy.get(".collapsable-header").click();
            cy.get("#username").type(user.username);
            cy.get("#password").type(user.password);
            cy.get("#kc-login").click();
          }
        });
        cy.url().should("include", Cypress.env("BASE_URL"));

        cy.get("#dropdown-auth-menu")
          .should("have.class", "signedIn")
          .click();
        cy.get(".myProfileBtn")
          .should("be.visible")
          .get("#logoutButton")
          .should("be.visible");

        cy.getCookie("VBP-AUTH").should("exist");
      },
      {
        validate: () => {
          const domain = Cypress.config("baseUrl").replace("https://", "");
          // Verify authentication cookies
          cy.getCookie("VBP-AUTH", { domain }).should("exist");
          if (validateSessionCookie) {
            cy.getCookie("JSESSIONID", { domain }).should("exist");
          }
        },
      },
    );
  },
);

Cypress.Commands.add(
  "loginPageActions",
  (
    user: User = {
      username: Cypress.env("VBP_USERNAME"),
      password: Cypress.env("VBP_PASSWORD"),
    },
  ): void => {
    if (Cypress.env("TARGET_ENV") === "local") {
      loginLocally(user);
    } else {
      loginCloud(user);
    }
  },
);

function loginLocally(_user: User) {
  cy.get("button[type='submit']").click();
}

function loginCloud(user: User) {
  cy.get(".collapsable-header").click();
  cy.get("#username").type(user.username);
  cy.get("#password").type(user.password);
  cy.get("#kc-login").click();
}
