import "./stats";
import "../settings";
import { PictureCarousel } from "./picture-carousel";
import settings from "../settings";

$(async () => {
    renderCarousel();
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
