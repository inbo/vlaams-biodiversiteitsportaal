import "./stats";
import "../settings";
import { PictureCarousel } from "./picture-carousel";
import settings from "../settings";

new PictureCarousel(
    "picture-carousel",
    settings.pictureCarouselSpeciesListId,
    10000,
);
