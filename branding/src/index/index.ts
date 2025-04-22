import "./stats";
import "../settings";
import { PictureCarousel } from "./picture-carousel";
import settings from "../settings";

if (settings.pictureCarousel) {
    new PictureCarousel(
        "picture-carousel",
        settings.pictureCarousel.speciesListId,
        settings.pictureCarousel.interval,
    );
}
