import "./picture-carousel.scss";

import { client as speciesListClient } from "../common/clients/.generated/species-list/client.gen";
import { getSpeciesListSItemDetails } from "../common/clients/.generated/species-list/sdk.gen";

speciesListClient.setConfig({
    baseUrl: "/species-list",
});

function preloadImage(url: string) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });
}

interface Picture {
    url: string;
    attribution: {
        text: string;
        link?: string;
    };
}

async function fetchPictureList(listId: string): Promise<Picture[]> {
    const listItems = await getSpeciesListSItemDetails({
        client: speciesListClient,
        path: { druid: listId },
        query: { includeKVP: true },
    });

    return listItems.data?.map((item) => {
        const result: Picture = {
            url: "",
            attribution: {
                text: `${item.commonName} (${item.scientificName})` || "",
                link:
                    `https://natuurdata.dev.inbo.be/bie-hub/species/${item.lsid}`,
            },
        };
        for (const { key, value } of item.kvpValues || []) {
            if (key?.toLowerCase() === "imageurl") {
                result.url = value;
            }
            if (key?.toLowerCase() === "imageid") {
                result.url = `/image-service/image/${value}/original`;
            }
            if (key?.toLowerCase() === "attributiontext") {
                result.attribution.text += ` - ${value}`;
            }
        }
        return result;
    }).filter((item) => item.url.length > 0) || [];
}

export class PictureCarousel {
    private pictureList: Picture[] = [{
        url: "/assets/VlaamseGaai.png",
        attribution: {
            text:
                "Vlaamse gaai (Garrulus glandarius) - Photo by Giles Laurent on Wikipedia, licensed under CC BY-SA 4.0.",
            link:
                "https://commons.wikimedia.org/wiki/File:075_Wild_Eurasian_jay_in_flight_at_the_Parc_naturel_r%C3%A9gional_Jura_vaudois_Photo_by_Giles_Laurent.jpg",
        },
    }];
    private currentPictureIndex = 0;
    private element: HTMLElement;

    constructor(elementId: string, listId: string, interval: number = 10000) {
        this.element = document.getElementById(elementId) as HTMLElement;
        if (!this.element) {
            throw new Error(`Element with id ${elementId} not found`);
        }

        this.init(listId, interval);
    }

    async init(listId: string, interval: number) {
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

        setInterval(() => this.nextPicture(), interval);
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

        this.updateAttribution(inactiveElement, newPicture);

        inactiveElement.style.backgroundImage = `url(${
            this.pictureList[this.currentPictureIndex].url
        })`;
        inactiveElement.setAttribute("data-carousel-active", "");
        activeElement.removeAttribute("data-carousel-active");
    }

    private updateAttribution(element: HTMLElement, picture: Picture) {
        const attributionElement = element.querySelector(
            "a.vbp-picture-carousel-attribution",
        ) as HTMLAnchorElement;
        if (picture.attribution) {
            attributionElement.innerText = picture.attribution.text;
            attributionElement.href = picture.attribution.link || "";
            attributionElement.classList.remove("hidden");
        } else {
            attributionElement.classList.add("hidden");
        }
    }
}
