import "./stats";
import "../settings";
import { PictureCarousel } from "./picture-carousel";
import settings from "../settings";
import {
    addAuthButtonClickHandlers,
    handleAuthCallbacks,
    setAuthMenuStatus,
} from "../portal/auth-ui";

$(async () => {
    renderCarousel();
    setAuthMenuStatus();
    addAuthButtonClickHandlers();
    handleAuthCallbacks();
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
