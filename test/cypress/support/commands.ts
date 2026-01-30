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
        validateSessionCookie?: boolean,
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
    navigateToLoginPage: boolean = true, // Allows relying on automatic redirects and not use the header menu
    validateSessionCookie: boolean = false,
  ): void => {
    cy.log(`Logging in user: ${user.username}`);
    cy.session(
      user.username,
      () => {
        cy.visit(`/${subPath}`);

        let originWrapper = (fn) => fn({ user });

        if (navigateToLoginPage) {
          cy.get("#dropdown-auth-menu").click();
          cy.get("#loginButton").should("be.visible").click();

          originWrapper = (fn) =>
            cy.origin(Cypress.env("AUTH_URL"), { args: { user } }, fn);
        } else {
          // When not manually navigating, wait for the redirect to complete
          // This ensures Cypress detects the origin change before cy.origin() is called
          cy.url().should("include", Cypress.env("AUTH_URL"));
        }

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
        cy.url().should("not.include", Cypress.env("AUTH_URL"));

        if (navigateToLoginPage) {
          cy.get("#dropdown-auth-menu")
            .should("have.class", "signedIn")
            .click();
          cy.get(".myProfileBtn")
            .should("be.visible")
            .get("#logoutButton")
            .should("be.visible");
        }

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
