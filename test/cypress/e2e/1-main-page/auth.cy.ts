describe("Can login from the homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Can login with email and password and adjust banner login status", () => {
        cy.get(".navbar-toggle").click()
            .get("li").contains("Meer").click()
            .get("#loginButton").should("be.visible").click()
            .origin("https://auth.inbo.be", () => {
                return cy.url().should("match", /^https:\/\/auth.inbo.be/)
                    .get("#username").type(Cypress.env("VBP_USERNAME"))
                    .get("#password").type(Cypress.env("VBP_PASSWORD"))
                    .get("#kc-login").click();
            })
            .get(".navbar-toggle").click()
            .get("li").contains("Meer").click()
            .get(".myProfileBtn").should("be.visible")
            .get("#logoutButton").should("be.visible");
    });
});
