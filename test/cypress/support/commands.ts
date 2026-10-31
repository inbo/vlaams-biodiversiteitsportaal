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
  (user?: User, validateSessionCookie: boolean = false): void => {
    cy.env(["VBP_USERNAME", "VBP_PASSWORD"]).then(
      ({ VBP_USERNAME, VBP_PASSWORD }) => {
        const u = user ?? { username: VBP_USERNAME, password: VBP_PASSWORD };
        cy.log(`Logging in user: ${u.username}`);
        cy.session(
          u.username,
          () => {
            cy.visit("/");

            cy.get("#dropdown-auth-menu").click();
            cy.get("#loginButton").should("be.visible").click({ controlKey: true });

            cy.origin(
              Cypress.expose("KEYCLOAK_AUTH_URL"),
              { args: { user: u, targetEnv: Cypress.expose("TARGET_ENV") } },
              ({ user, targetEnv }) => {
                if (targetEnv === "local") {
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
              },
            );
            cy.url().should("include", Cypress.expose("BASE_URL"));

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
  },
);

Cypress.Commands.add(
  "loginPageActions",
  (user?: User): void => {
    cy.env(["VBP_USERNAME", "VBP_PASSWORD"]).then(
      ({ VBP_USERNAME, VBP_PASSWORD }) => {
        const u = user ?? { username: VBP_USERNAME, password: VBP_PASSWORD };
        if (Cypress.expose("TARGET_ENV") === "local") {
          cy.get("button[type='submit']").click();
        } else {
          cy.get(".collapsable-header").click();
          cy.get("#username").type(u.username);
          cy.get("#password").type(u.password);
          cy.get("#kc-login").click();
        }
      },
    );
  },
);
