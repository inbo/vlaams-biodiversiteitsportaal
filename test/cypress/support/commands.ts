import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command";

addMatchImageSnapshotCommand();

interface User {
    username: string;
    password: string;
}

Cypress.Commands.add(
    "login",
    (
        subPath: string = "",
        user: User = {
            username: Cypress.env("VBP_USERNAME"),
            password: Cypress.env("VBP_PASSWORD"),
        },
    ): void => {
        cy.session(
            user.username,
            () => {
                cy.visit(`/${subPath}`);
                cy.get("#dropdown-auth-menu").click();
                cy.get("#loginButton").should("be.visible").click();

                cy.log("Do stuff on login screen")
                    .origin(
                        Cypress.env("AUTH_URL"),
                        { args: { user } },
                        ({ user }) => {
                            cy.url().should(
                                "match",
                                new RegExp(`^${Cypress.env("AUTH_URL")}`),
                            );
                            cy.get(".collapsable-header").click();
                            cy.get("#username").type(user.username);
                            cy.get("#password").type(user.password);
                            cy.get("#kc-login").click();
                        },
                    );

                cy.get("#dropdown-auth-menu").click();
                cy.get(".myProfileBtn").should("be.visible")
                    .get("#logoutButton").should("be.visible");
            },
            {
                validate: () => {
                    cy.getCookie("VBP-AUTH").should("exist");
                },
            },
        );
    },
);

Cypress.Commands.add(
    "loginWithoutNavigatingToLoginPage",
    (
        subPath: string = "",
        user: User = {
            username: Cypress.env("VBP_USERNAME"),
            password: Cypress.env("VBP_PASSWORD"),
        },
    ): void => {
        cy.session(
            user.username,
            () => {
                cy.visit(`/${subPath}`);

                cy.url().should(
                    "match",
                    new RegExp(`^${Cypress.env("AUTH_URL")}`),
                );
                cy.get(".collapsable-header").click();
                cy.get("#username").type(user.username);
                cy.get("#password").type(user.password);
                cy.get("#kc-login").click();

                cy.url().should(
                    "match",
                    new RegExp(`^${Cypress.config("baseUrl")}.*`),
                );
            },
            {
                validate: () => {
                    cy.getCookie("VBP-AUTH", {
                        domain: Cypress.config("baseUrl").replace(
                            "https://",
                            "",
                        ),
                    }).should("exist");
                    cy.getCookie("JSESSIONID", {
                        domain: Cypress.config("baseUrl").replace(
                            "https://",
                            "",
                        ),
                    }).should("exist");
                },
            },
        );
    },
);
