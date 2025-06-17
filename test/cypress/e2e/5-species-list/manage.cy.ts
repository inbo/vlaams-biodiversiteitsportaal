import { getFileNameTimeStamp, TEST_LIST_PREFIX } from "cypress/support/utils";
import * as path from "path";

describe("Species list - manage", () => {
    // Only run these tests if ENABLE_MUTATION_TESTS is set to true
    // This is to prevent creating and deleting lists during normal test runs,
    // resulting in a lot of test lists / uids being created.
    if (Cypress.env("ENABLE_MUTATION_TESTS") !== "true") {
        return;
    }

    beforeEach(() => {
        // Ignore errors from auto-complete widget trying to attach to elements that cannot be found (I think)
        cy.on("uncaught:exception", (err, runnable) => {
            expect(err.message).to.include(
                "Cannot read properties of undefined (reading 'jQuery",
            );
            return false; // Prevents Cypress from failing the test
        });
        cy.login("species-list");
        cy.visit("/species-list");
    });

    it("Can add a new list using a file as input", () => {
        const listName = `${TEST_LIST_PREFIX} file ${getFileNameTimeStamp()}`;
        cy.get("a").contains("Upload").click();

        // Upload a CSV file with species data
        const importDataFile =
            `"scientificName","eventDate","decimalLatitude","decimalLongitude","occurrenceID","test"
"Cryphaea heteromalla","20250310T11:54:00+01:00",50.8791,4.7025,"TEST:1","test"`;

        const filePath = path.join(
            Cypress.config("downloadsFolder"),
            `imort-species-${getFileNameTimeStamp()}.csv`,
        );
        cy.writeFile(
            filePath,
            importDataFile,
        );
        cy.get("#csvFileUpload").selectFile(filePath, { force: true });
        cy.get("#checkData2").click();
        cy.get("#initialParse").find("tbody > tr")
            .should("have.length", 1)
            .should("contain", "Cryphaea heteromalla");

        // Fill in list details and create
        cy.get("#listTitle").type(listName);
        cy.get("#listTypeId").select("Test lijst");
        cy.get("#uploadButton").click();

        cy.get("#statusMsgDiv").should("not.be", "visible");

        // Check that the list was created
        cy.get(".subject-subtitle").should("contain", listName);

        cy.get("#listView").find("tbody > tr")
            .should("have.length", 1)
            .should("contain", "Cryphaea heteromalla");
    });

    it("Can add a new list using textarea as input", () => {
        const listName =
            `${TEST_LIST_PREFIX} textarea ${getFileNameTimeStamp()}`;
        cy.get("a").contains("Upload").click();

        // Add species through the text area
        const importDataTextArea =
            `"ScientificName","eventDate","decimalLatitude","decimalLongitude","occurrenceID","test"
"Oryctolagus cuniculus","20250310T11:54:00+01:00",50.8791,4.7025,"TEST:1","test"`;
        cy.get("#copyPasteData").type(importDataTextArea);

        cy.get("#checkData").click();
        cy.get("#initialParse").find("tbody > tr")
            .should("have.length", 1)
            .should("contain", "Oryctolagus cuniculus");

        // Fill in list details and create
        cy.get("#listTitle").type(listName);
        cy.get("#listTypeId").select("Test lijst");
        cy.get("#uploadButton").click();

        cy.get("#statusMsgDiv").should("not.be", "visible");

        // Check that the list was created
        cy.get(".subject-subtitle").should("contain", listName);

        cy.get("#listView").find("tbody > tr")
            .should("have.length", 1)
            .should("contain", "Oryctolagus cuniculus");
    });

    it("Can delete lists", () => {
        // Go to My lists
        cy.get("a").contains("Mijn Lijsten").click();

        // Get all Test lists
        cy.get("#speciesList").find("tbody > tr").find(
            `a:contains('${TEST_LIST_PREFIX}')`,
        ).should(
            "have.length.above",
            0,
        ).each((row) => {
            const listName = row.text().trim();
            const listId = row.attr("href")?.match(/\/(dr\d+)$/)?.[1];
            expect(listId).to.not.be.undefined;

            cy.log(`Deleting ${listId}`);
            cy.get("#speciesList").find("tbody > tr").contains(listName)
                .parent().parent().find("a")
                .contains(
                    "Verwijderen",
                ).click();
            cy.get(".fancybox-content").should("be.visible").should(
                "contain",
                listName,
            );
            cy
                .wait(400) // Unfortunately, the fancybox takes a bit to open
                .get("input#fancyConfirm_ok").click();

            return cy
                .get(".fancybox-content").should("not.exist")
                .request({
                    url: `/species-list/ws/speciesList/${listId}`,
                    method: "GET",
                }).then((response) => {
                    // Terrible API, returns full list with listCount if specific list is not found
                    expect(response.status).to.eq(200);
                    expect(response.body.listCount).not.to.be.undefined;
                });
        });
    });
});
