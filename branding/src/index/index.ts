import "./stats";
import "../settings";
import { PictureCarousel } from "./picture-carousel";
import settings from "../settings";
import { getUser, isLoggedIn, login, logout } from "../portal/auth";

$(() => {
    renderCarousel();
    setAuthMenuStatus();
    addAuthButtonClickHandlers();
});

async function renderCarousel() {
    if (settings.pictureCarousel) {
        const carousel = new PictureCarousel(
            "picture-carousel",
            settings.pictureCarousel.speciesListId,
            settings.pictureCarousel.interval,
        );
        carousel.render();
    }
}

async function setAuthMenuStatus() {
    Array.from(document.getElementsByClassName("login-status-dependent"))
        .forEach(async (element) => {
            if (await isLoggedIn()) {
                element.classList.remove(settings.auth.ala.logoutClass);
                element.classList.add(settings.auth.ala.loginClass);

                const profile = (await getUser())!.profile;
                (document.getElementById(
                    "my-annotated-records",
                )! as HTMLAnchorElement)
                    .href =
                        `/biocache-hub/occurrences/search/?q=*:*&fq=assertion_user_id:%22${profile.sub}%22`;
            } else {
                element.classList.remove(settings.auth.ala.loginClass);
                element.classList.add(settings.auth.ala.logoutClass);
            }
        });
}

async function addAuthButtonClickHandlers() {
    const loginButtons = document.getElementsByClassName("login-button");
    for (const button of loginButtons) {
        button.addEventListener(
            "click",
            async (e) => {
                e.preventDefault();
                await login();
            },
        );
    }
    const logoutButtons = document.getElementsByClassName("logout-button");
    for (const button of logoutButtons) {
        button.addEventListener(
            "click",
            async (e) => {
                e.preventDefault();
                await logout();
            },
        );
    }
}
