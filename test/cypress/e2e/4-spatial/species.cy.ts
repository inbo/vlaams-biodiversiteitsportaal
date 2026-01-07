import { time } from "console";
import { getFileNameTimeStamp, TEST_LIST_PREFIX } from "cypress/support/utils";
import * as path from "path";

describe("Spatial - Species", () => {
  beforeEach(() => {
    cy.loginWithoutNavigatingToLoginPage("spatial-hub");
    cy.visit("/spatial-hub");
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
  });

  it("Can add a species group", () => {
    const speciesGroup = "Molluscs";

    // Add a species group
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="lifeform"]').check();
    cy.get("lifeform-select > select").select(speciesGroup);
    cy.get('button[name="next"]').click();

    // Verify that the modal is not shown and the layer is added to the list
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
    cy.get('[name="divMappedLayers"]')
      .contains(speciesGroup)
      .should("be.visible");

    // Verify that the legend is visible
    cy.get("#legend").should("be.visible");

    // Verify that the layer is visible on the map
    if (Cypress.env("TARGET_ENV") === "prod") {
      cy.get("#map").matchImageSnapshot({
        failureThreshold: 0.4,
        failureThresholdType: "percent",
      });
    }

    // Verify clicking an occurences, shows a popup window
    cy.get("#map").click(200, 200);
    cy.get(".leaflet-popup-content").should("contain", speciesGroup);
  });

  it("Can add one specific species by name", () => {
    const speciesName = "vos";
    const speciesScientificName = "Vulpes vulpes";

    // Add a species by selecting it from the autocomplete
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="searchSpecies"]').check();
    cy.get("#speciesAutoComplete").type(speciesName);
    cy.get(".autocomplete-item", { timeout: 30_000 })
      .contains(speciesScientificName)
      .click();
    cy.get('button[name="next"]').click();

    // Verify that the modal is not shown and the layer is added to the list
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
    cy.get('[name="divMappedLayers"]')
      .contains(speciesScientificName)
      .should("be.visible");

    // Verify that the legend is visible
    cy.get("#legend").should("be.visible");

    // Verify that the layer is visible on the map
    if (Cypress.env("TARGET_ENV") === "prod") {
      cy.get("#map").matchImageSnapshot({
        failureThreshold: 0.4,
        failureThresholdType: "percent",
      });
    }

    // Verify clicking an occurences, shows a popup window
    cy.get("#map").click(300, 300);
    cy.get(".leaflet-popup-content").should("contain", speciesScientificName);
  });

  it("Can add species from species-list", () => {
    const speciesListName = "ABV Trend Soortenlijst";

    // Add a number of species by selecting a species-list
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="speciesList"]').check();
    cy.get("[name='speciesList']")
      .contains(speciesListName)
      .parent()
      .parent()
      .find("input[type='checkbox']")
      .check();
    cy.get('button[name="next"]').click();

    // Verify that the modal is not shown and the layer is added to the list
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
    cy.get('[name="divMappedLayers"]')
      .contains(speciesListName)
      .should("be.visible");

    // Verify that the legend is visible
    cy.get("#legend").should("be.visible");

    // Verify that the layer is visible on the map
    if (Cypress.env("TARGET_ENV") === "prod") {
      cy.get("#map").matchImageSnapshot({
        failureThreshold: 0.4,
        failureThresholdType: "percent",
      });
    }

    // Verify clicking an occurences, shows a popup window
    cy.get("#map").click(160, 260);
    cy.get(".leaflet-popup-content").should("contain", speciesListName);
  });

  it("Can add species by creating a new species-list", () => {
    const textareaSpecies = ["Vulpes vulpes", "Castor fiber"];
    const fileSpecies = ["Scutigera coleoptrata", "Oryctolagus cuniculus"];
    const autoCompleteSpeciesCommonName = "otter";
    const autoCompleteSpeciesScientificName = "Lutra lutra";

    // Add a number of species by creating a new species-list
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="importList"]').check();

    // Enter species in the textarea
    cy.get("textarea[name='speciesInput']", { timeout: 10_000 }).type(
      textareaSpecies.join("{enter}"),
    );
    cy.get("button[name='parseSpeciesList']").click();
    textareaSpecies.forEach((species) =>
      cy.get("table[name='speciesList']").should("contain", species),
    );

    // Upload a file with species names
    const filePath = path.join(
      Cypress.config("downloadsFolder"),
      "species.txt",
    );
    cy.writeFile(filePath, fileSpecies.join("\n"));
    cy.get("#file").selectFile(filePath);
    cy.get("textarea[name='speciesInput']")
      .invoke("val")
      .should("contain", "Scutigera coleoptrata")
      .should("contain", "Oryctolagus cuniculus");
    cy.get("button[name='parseSpeciesList']").click();
    fileSpecies.forEach((species) =>
      cy.get("table[name='speciesList']").should("contain", species),
    );

    // Enter a single species name and select from autocomplete
    cy.get("#speciesAutoComplete").type(autoCompleteSpeciesCommonName);
    cy.get(".autocomplete-item", { timeout: 30_000 })
      .contains(autoCompleteSpeciesScientificName)
      .click();
    // TODO: Is also broken
    cy.get("table[name='speciesList']").should(
      "contain",
      autoCompleteSpeciesScientificName,
    );

    cy.get('button[name="next"]').click();

    // Only run the remainder of the tests if ENABLE_MUTATION_TESTS is set to true
    if (Cypress.env("ENABLE_MUTATION_TESTS") === "true") {
      const speciesListName = `${TEST_LIST_PREFIX} textarea ${getFileNameTimeStamp()}`;
      // Create the species-list
      cy.get('input[name="newListName"]')
        .clear()
        .type("Test species list from Spatial Hub");
      cy.get('input[ng-model="newListDescription"]').type("Some description");
      cy.get('select[ng-model="newListType"]').select("Test list");

      cy.get('button[name="next"]').click();

      // Verify that the modal is not shown and the layer is added to the list
      cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
      cy.get('[name="divMappedLayers"]')
        .contains(speciesListName)
        .should("be.visible");

      // Verify that the legend is visible
      cy.get("#legend").should("be.visible");

      // Verify that the layer is visible on the map

      if (Cypress.env("TARGET_ENV") === "prod") {
        cy.get("#map").matchImageSnapshot({
          failureThreshold: 0.4,
          failureThresholdType: "percent",
        });
      }

      // // Verify clicking an occurences, shows a popup window
      // cy.get("#map").click(160, 260);
      // cy.get(".leaflet-popup-content")
      //     .should(
      //         "contain",
      //         speciesListName,
      //     );
    }
  });

  it("Can add species from new imported points", () => {
    const datasetName = `Test species import points ${new Date().toISOString()}`;
    const importData = `"scientificName","eventDate","decimalLatitude","decimalLongitude","occurrenceID","test"
"Cryphaea heteromalla","20250310T11:54:00+01:00",50.8791,4.7025,"TEST:1","test"`;

    // Select importing new points
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="importPoints"]').check();

    // Upload data
    const filePath = path.join(
      Cypress.config("downloadsFolder"),
      "imort-data.csv",
    );
    cy.writeFile(filePath, importData);
    cy.get("#file").selectFile(filePath);
    cy.get('input[testtag="datasetName"]').clear().type(datasetName).wait(100); // Really bad practice, but the input is not updated immediately, and the CI is too slow

    cy.get("[testtag='addPointsModal']")
      .parent()
      .find('button[name="next"]')
      .click();

    // Wait for success and click Completed button
    cy.get("[testtag='addPointsModal']", { timeout: 120_000 })
      .should("not.contain", "error")
      .and("not.contain", "failed")
      .and("contain", "Import complete: 1 records");
    cy.get("[testtag='addPointsModal']")
      .parent()
      .find("button.btn-primary")
      .contains("Voltooid")
      .click();

    // Varify new dataset is selected and click next
    cy.get('input[value="importPoints"]')
      .parent()
      .parent()
      .contains(datasetName);
    cy.get('button[name="next"]').click();

    // Verify that the modal is not shown and the layer is added to the list
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
    cy.get('[name="divMappedLayers"]')
      .contains(datasetName)
      .should("be.visible");

    // Verify that the legend is visible
    cy.get("#legend").should("be.visible");

    // Verify that the layer is visible on the map
    if (Cypress.env("TARGET_ENV") === "prod") {
      cy.get("#map").matchImageSnapshot({
        failureThreshold: 0.4,
        failureThresholdType: "percent",
      });
    }

    // Store dataset name for dependent test
    Cypress.env("datasetName", datasetName);
  });

  it("Can add species from existing dataset", () => {
    // Requires the precious test to have run first
    const datasetName = Cypress.env("datasetName");
    expect(datasetName).to.exist;
    expect(datasetName).to.not.be.empty;

    // Select previously imported points
    cy.get("#menu-0").click();
    cy.get('ul.dropdown-menu[aria-labelledby="menu-0"')
      .contains("Soorten")
      .click();
    cy.get('input[value="sandboxPoints"]').check();

    // Varify new dataset is selected and click next
    cy.get('input[value="sandboxPoints"]')
      .parent()
      .parent()
      .contains(datasetName)
      .parent()
      .find('input[type="checkbox"]')
      .check();
    cy.get('button[name="next"]').click();

    // Verify that the modal is not shown and the layer is added to the list
    cy.get(".progress-bar", { timeout: 30_000 }).should("not.be.visible");
    cy.get('[name="divMappedLayers"]')
      .contains(datasetName)
      .should("be.visible");

    // Verify that the legend is visible
    cy.get("#legend").should("be.visible");

    // Verify that the layer is visible on the map
    if (Cypress.env("TARGET_ENV") === "prod") {
      cy.get("#map").matchImageSnapshot({
        failureThreshold: 0.4,
        failureThresholdType: "percent",
      });
    }

    // Store dataset name for dependent test
    Cypress.env("datasetName", datasetName);
  });
});
