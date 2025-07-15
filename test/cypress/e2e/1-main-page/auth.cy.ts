describe("Can login from the homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Can login with email and password and adjust banner login status", () => {
        // Verify the user icon is grey
        cy.get("#login-icon").should("be.visible").should(
            "have.css",
            "color",
            "rgb(136, 136, 136)",
        );

        cy.get("#dropdown-auth-menu").click();
        cy.get("#loginButton").should("be.visible").click();

        cy.log("Do stuff on login screen")
            .origin(Cypress.env("AUTH_URL"), () => {
                cy.url().should(
                    "match",
                    new RegExp(`^${Cypress.env("AUTH_URL")}`),
                );
                cy.get(".collapsable-header").contains("Username and password")
                    .click();
                cy.get("#username").type(Cypress.env("VBP_USERNAME"));
                cy.get("#password").type(Cypress.env("VBP_PASSWORD"));
                cy.get("#kc-login").click();
            });

        cy.log("Back to homepage").get("#dropdown-auth-menu").click();
        cy.get(".myProfileBtn").should("be.visible")
            .get("#logoutButton").should("be.visible");
        // Check that the login icon is now the inbo primary color
        cy.get("#login-icon").should("be.visible").should(
            "have.css",
            "color",
            "rgb(192, 67, 132)",
        );
    });
});
