describe("Can login from the homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Can login with email and password and adjust banner login status", () => {
        cy.get(".navbar-toggle").click();
        cy.get("li").contains("Meer").click();
        cy.get("#loginButton").should("be.visible").click();

        cy.log("Do stuff on login screen")
            .origin("https://auth.inbo.be", () => {
                cy.url().should("match", /^https:\/\/auth.inbo.be/);
                cy.get("#username").type(Cypress.env("VBP_USERNAME"));
                cy.get("#password").type(Cypress.env("VBP_PASSWORD"));
                cy.get("#kc-login").click();
            });

        cy.log("Back to homepage").get(".navbar-toggle").click();
        cy.get("li").contains("Meer").click();
        cy.get(".myProfileBtn").should("be.visible")
            .get("#logoutButton").should("be.visible");
    });
});
