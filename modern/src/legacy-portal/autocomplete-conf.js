import settings from "../settings";

import "jquery";
import "jquery-ui";
import "jquery-ui/ui/widgets/autocomplete";

var bieService = settings.services.bieService.url;

// Look for BC_CONF in ALA's public/js/application.js for more details
// and options

window.BC_CONF = window.BC_CONF || {};
BC_CONF.autoCompleteSelector = `#search`
BC_CONF.autocompleteURL = `${bieService}/search/auto.json`
