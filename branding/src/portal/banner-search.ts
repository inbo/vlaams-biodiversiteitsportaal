// Extend the Window interface to include BC_CONF
declare global {
    interface Window {
        BC_CONF: any;
    }
}

function toggleSearchInput() {
    const searchInput = document.getElementById(
        "banner-search-input",
    )! as HTMLInputElement;

    const isActive = searchInput.classList.toggle("active");
    if (isActive) {
        searchInput.focus();
        searchInput.onblur = (e) => {
            // If the blur event is triggered by clicking on the search input itself,
            // we do not want to close the search input.
            if (e.relatedTarget === document.getElementById("banner-search")) {
                return;
            }
            toggleSearchInput();
        };
        searchInput.onkeydown = (e) => {
            if (e.key === "Escape") {
                toggleSearchInput();
            }
            if (e.key === "Enter") {
                performSearch();
            }
        };
    } else {
        searchInput.onblur = null;
        searchInput.onkeydown = null;
    }
}

function performSearch() {
    const searchInput = document.getElementById(
        "banner-search-input",
    )! as HTMLInputElement;

    const query = searchInput.value.trim();

    if (query === "") {
        return;
    }

    window.location.href = `/bie-hub/search?q=${
        encodeURIComponent(`*${query}*`)
    }`;
}

window.BC_CONF = {
    autocompleteURL: "/bie-index/search/auto",
    autoCompleteSelector: "#banner-search-input,#search",
    appendToSelector: null, // Will look for the closest parent with class 'ui-front'
    templateId: "autoCompleteTemplate",
};

$(() => {
    $("#banner-search").on("click", (e) => {
        e.preventDefault();

        const searchInput = document.getElementById(
            "banner-search-input",
        )! as HTMLInputElement;

        if (
            searchInput.classList.contains("active") &&
            searchInput.value.trim() !== ""
        ) {
            performSearch();
        } else {
            toggleSearchInput();
        }
    });
});
