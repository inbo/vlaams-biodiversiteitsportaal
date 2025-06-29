const breakPoint = 1025;
let dropdownTarget: HTMLElement;

function iconDropdownOnSmallScreens() {
    if (window.innerWidth <= breakPoint) {
        let left = dropdownTarget.getClientRects()[0].left;

        if (left === 0) {
            return;
        }

        if (dropdownTarget.style.left) {
            const previousOffset = parseInt(
                dropdownTarget.style.left.replace("px", ""),
                10,
            );
            left -= previousOffset;
            console.log(
                "previousOffset",
                previousOffset,
                "previousStyle",
                dropdownTarget.style.left,
                "result",
                left,
            );
        }

        dropdownTarget.style.left = -left + "px";
    } else {
        dropdownTarget.style = "";
    }
}

$(".navbar-right > li.dropdown")
    .on("shown.bs.dropdown", (elem) => {
        // For mobile devices, we need to adjust the dropdown menu width
        $(elem.currentTarget).find("ul").each((idx, item) => {
            dropdownTarget = item;
            iconDropdownOnSmallScreens();
            window.addEventListener("resize", iconDropdownOnSmallScreens);
        });
    }).on("hidden.bs.dropdown", (elem) => {
        window.removeEventListener("resize", iconDropdownOnSmallScreens);
    });
