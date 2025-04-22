import "./picture-carousel.scss";

import { client as speciesListClient } from "../common/clients/.generated/species-list/client.gen";
import { getSpeciesListSItemDetails } from "../common/clients/.generated/species-list/sdk.gen";

import { client as imageServiceClient } from "../common/clients/.generated/image-service/client.gen";
import { getImageInfo } from "../common/clients/.generated/image-service/sdk.gen";

speciesListClient.setConfig({
    baseUrl: "/species-list",
});

imageServiceClient.setConfig({
    baseUrl: "/image-service",
});

function preloadImage(url: string) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });
}

interface Attribution {
    text: string;
    link: string;
}

interface Picture {
    url: string;
    species: {
        id: string;
        commonName: string;
        scientificName: string;
    };
    attribution?: Attribution;
    position?: string;
}

async function fetchPictureList(listId: string): Promise<Picture[]> {
    const listItems = await getSpeciesListSItemDetails({
        client: speciesListClient,
        path: { druid: listId },
        query: { includeKVP: true },
    });

    if (!listItems.data) {
        console.error("No data found for the given list ID");
        return [];
    }

    return (await Promise.all<Picture>(
        listItems.data.map(async (item) => {
            const result: Picture = {
                url: "",
                species: {
                    id: item.lsid!,
                    commonName: item.commonName!,
                    scientificName: item.scientificName!,
                },
            };
            // Parse KVP values
            for (const { key, value } of item.kvpValues || []) {
                switch (key?.toLowerCase()) {
                    case "imageurl":
                        result.url = value;
                        break;
                    case "imageid":
                        result.url = `/image-service/image/${value}/original`;
                        result.attribution = await fetchImageAttribution(
                            value,
                        );
                        break;
                    case "attributiontext":
                        result.attribution = {
                            link: "",
                            ...result.attribution,
                            text: value,
                        };
                        break;

                    case "attributionlink":
                        result.attribution = {
                            text: "",
                            ...result.attribution,
                            link: value,
                        };
                        break;
                    case "alignment":
                        result.position = value;
                        break;
                }
            }
            return result;
        }),
    )).filter((item) => item.url.length > 0);
}

async function fetchImageAttribution(
    imageId: string,
): Promise<Attribution | undefined> {
    const imageDetails = await getImageInfo({
        client: imageServiceClient,
        path: { imageID: imageId },
    });

    if (!imageDetails.data) {
        console.error("No data found for the given image ID");
        return;
    }

    const data: any = imageDetails.data;

    return {
        text: "" + (data.rightsHolder && `Photo by ${data.rightsHolder}`) +
            (data.publisher && ` on ${data.publisher}`) +
            (data.recognisedLicence &&
                `, licensed under ${data.recognisedLicence.acronym}`),
        link: `/image-service/image/${imageId}`,
    };
}

export class PictureCarousel {
    private pictureList: Picture[] = [{
        url: "/images/VlaamseGaai.png",
        species: {
            id: "5229493",
            commonName: "Vlaamse gaai",
            scientificName: "Garrulus glandarius",
        },
        attribution: {
            text:
                "Photo by Giles Laurent on Wikipedia, licensed under CC BY-SA 4.0.",
            link:
                "https://commons.wikimedia.org/wiki/File:075_Wild_Eurasian_jay_in_flight_at_the_Parc_naturel_r%C3%A9gional_Jura_vaudois_Photo_by_Giles_Laurent.jpg",
        },
    }];
    private currentPictureIndex = 0;
    private element: HTMLElement;

    private readonly timerInterval: number | undefined;
    private timer?: number;

    constructor(
        elementId: string,
        listId: string,
        interval: number | undefined,
    ) {
        this.element = document.getElementById(elementId) as HTMLElement;
        if (!this.element) {
            throw new Error(`Element with id ${elementId} not found`);
        }

        this.timerInterval = interval;

        this.init(listId);

        this.resetTimer();
    }

    async init(listId: string) {
        this.pictureList = this.pictureList.concat(
            await fetchPictureList(listId),
        );

        if (this.pictureList.length < 2) {
            console.warn("Not enough pictures to display in carousel");
            return;
        }

        Array.from(
            document.getElementsByClassName(
                "vbp-picture-carousel-button-prev",
            ),
        )
            .forEach((element) => {
                element.classList.remove("hidden");
                element.addEventListener("click", async () => {
                    await this.previousPicture();
                });
            });
        Array.from(
            document.getElementsByClassName(
                "vbp-picture-carousel-button-next",
            ),
        )
            .forEach((element) => {
                element.classList.remove("hidden");
                element.addEventListener("click", async () => {
                    await this.nextPicture();
                });
            });
    }

    async nextPicture() {
        await this.switchPicture(false);
    }

    async previousPicture() {
        await this.switchPicture(true);
    }

    async switchPicture(next = true) {
        const activeElement = this.element?.querySelector(
            ".vbp-picture-carousel-picture[data-carousel-active]",
        ) as HTMLElement;
        const inactiveElement = this.element?.querySelector(
            ".vbp-picture-carousel-picture:not([data-carousel-active])",
        ) as HTMLElement;

        if (!activeElement || !inactiveElement) {
            console.error("Picture carousel elements not found");
            return;
        }

        this.currentPictureIndex = (this.currentPictureIndex + (next ? 1 : -1) +
            this.pictureList.length) %
            this.pictureList.length;
        const newPicture = this.pictureList[this.currentPictureIndex];

        console.debug(
            "Switching carousel picture to: ",
            newPicture,
        );

        await preloadImage(newPicture.url);

        this.updateElement(inactiveElement, newPicture);
        inactiveElement.setAttribute("data-carousel-active", "");
        activeElement.removeAttribute("data-carousel-active");

        this.resetTimer();
    }

    private resetTimer() {
        if (this.timerInterval) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.timer = setInterval(
                () => this.nextPicture(),
                this.timerInterval,
            );
        }
    }

    private updateElement(pictureElement: HTMLElement, picture: Picture) {
        // Set Background Image
        pictureElement.style.backgroundPosition = picture.position || "";
        pictureElement.style.backgroundImage = `url(${
            this.pictureList[this.currentPictureIndex].url
        })`;

        // Update Info link"
        const infoLink = pictureElement.querySelector(
            "a.vbp-picture-carousel-link",
        ) as HTMLAnchorElement;
        if (infoLink) {
            infoLink.innerText =
                `${picture.species.commonName} (${picture.species.scientificName})`;
            infoLink.href = `/species/${picture.species.id}`;
        } else {
            console.error("Info link element not found");
        }

        const attributionContainer = pictureElement.querySelector(
            ".vbp-picture-carousel-attribution-container",
        ) as HTMLElement;
        const attributionElement = pictureElement.querySelector(
            "a.vbp-picture-carousel-attribution",
        ) as HTMLAnchorElement;
        if (picture.attribution) {
            attributionElement.innerText = picture.attribution.text;
            attributionElement.href = picture.attribution.link || "";
            attributionContainer.classList.remove("hidden");
        } else {
            attributionElement.innerText = "";
            attributionElement.href = "";
            attributionContainer.classList.add("hidden");
        }
    }
}
