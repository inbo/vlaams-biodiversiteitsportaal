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
        subPath?: string,
        user?: User,
        navigateToLoginPage?: boolean,
        validateSessionCookie?: false,
      ): void;
      loginPageActions(user?: User): void;
    }
  }
}

Cypress.Commands.add(
  "login",
  (
    subPath: string = "",
    user: User = {
      username: Cypress.env("VBP_USERNAME"),
      password: Cypress.env("VBP_PASSWORD"),
    },
    navigateToLoginPage: boolean = true,
    validateSessionCookie: boolean = false,
  ): void => {
    cy.log(`Logging in user: ${user.username}`);
    cy.session(
      user.username,
      () => {
        cy.visit(`/${subPath}`);

        if (navigateToLoginPage) {
          cy.get("#dropdown-auth-menu").click();
          cy.get("#loginButton").should("be.visible").click();
        }

        // Perform login actions on the login page
        cy.origin(Cypress.env("AUTH_URL"), { args: { user } }, ({ user }) => {
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
        cy.url().should("not.include", Cypress.env("AUTH_URL"));

        cy.get("#dropdown-auth-menu").should("have.class", "signedIn").click();
        cy.get(".myProfileBtn")
          .should("be.visible")
          .get("#logoutButton")
          .should("be.visible");
      },
      {
        validate: () => {
          // Verify authentication cookies
          cy.getCookie("VBP-AUTH").should("exist");
          if (validateSessionCookie) {
            cy.getCookie("JSESSIONID", {
              domain: Cypress.config("baseUrl").replace("https://", ""),
            }).should("exist");
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
