// Banner search functionality
document.addEventListener("DOMContentLoaded", function () {
    const searchIcon = document.getElementById("banner-search");
    const searchInput = document.getElementById(
        "banner-search-input",
    ) as HTMLInputElement;

    if (!searchIcon || !searchInput) {
        return;
    }

    let isExpanded = false;

    // Toggle search input visibility when clicking the magnifying glass
    searchIcon.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isExpanded) {
            // Expand the search input
            searchInput.style.display = "block";
            // Small delay to ensure display is applied before adding the class
            setTimeout(() => {
                searchInput.classList.add("expanded");
                searchIcon.classList.add("active");
                searchInput.focus();
            }, 10);
            isExpanded = true;
        } else {
            // If expanded and has content, perform search
            if (searchInput.value.trim()) {
                performSearch(searchInput.value.trim());
            } else {
                // If no content, collapse the search
                collapseSearch();
            }
        }
    });

    // Handle search input events
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (searchInput.value.trim()) {
                performSearch(searchInput.value.trim());
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            collapseSearch();
        }
    });

    // Collapse search when clicking outside
    document.addEventListener("click", function (e) {
        const target = e.target as Node;
        if (
            isExpanded && !searchIcon.contains(target) &&
            !searchInput.contains(target)
        ) {
            if (!searchInput.value.trim()) {
                collapseSearch();
            }
        }
    });

    // Collapse search when input loses focus (but only if empty)
    searchInput.addEventListener("blur", function () {
        if (!searchInput.value.trim()) {
            setTimeout(() => {
                collapseSearch();
            }, 150); // Small delay to allow for potential click events
        }
    });

    function collapseSearch() {
        if (searchInput && searchIcon) {
            // Start the collapse transition
            searchInput.classList.remove("expanded");
            searchIcon.classList.remove("active");

            // Wait for the CSS transition to complete before hiding completely
            setTimeout(() => {
                searchInput.style.display = "none";
                searchInput.value = "";
            }, 300); // Match the CSS transition duration
            isExpanded = false;
        }
    }

    function performSearch(query: string) {
        // Navigate to the search page with the query
        // This mirrors the behavior of the main search form
        const searchUrl = `/bie-hub/search?q=${
            encodeURIComponent("*" + query + "*")
        }`;
        window.location.href = searchUrl;
    }
});
