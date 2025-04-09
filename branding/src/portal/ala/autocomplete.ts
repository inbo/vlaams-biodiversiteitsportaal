import "../../settings";

declare global {
    interface Window {
        BC_CONF: any;
    }
}
window.BC_CONF = {
    autoCompleteSelector: "#autocompleteHeader",
    appendToSelector: "#autocompleteSearchALA",
    autocompleteURL: "/bie-index/ws/search/auto.json",
    templateId: "autoCompleteTemplate",
};

import "jquery-ui";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/autocomplete.css";
