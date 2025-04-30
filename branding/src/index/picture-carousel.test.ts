import { PictureCarousel } from "./picture-carousel";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    client as speciesListClient,
} from "../common/clients/.generated/species-list/client.gen";
import { getSpeciesListSItemDetails } from "../common/clients/.generated/species-list/sdk.gen";

import { client as imageServiceClient } from "../common/clients/.generated/image-service/client.gen";
import { getImageInfo } from "../common/clients/.generated/image-service/sdk.gen";

import { afterEach } from "node:test";
import { readFileSync } from "fs";

declare global {
    interface Window {
        happyDOM: {
            settings: {
                disableJavaScriptFileLoading: boolean;
            };
        };
    }
}

describe("PictureCarousel", () => {
    const getImageInfoMock = vi.mocked(getImageInfo, { partial: true });
    const getSpeciesListSItemDetailsMock = vi.mocked(
        getSpeciesListSItemDetails,
        { partial: true },
    );

    beforeEach(() => {
        window.happyDOM.settings.disableJavaScriptFileLoading = true;

        document.body.innerHTML = readFileSync(
            `${__dirname}/picture-carousel.html`,
            "utf8",
        );

        vi.useFakeTimers();

        vi.mock(
            "../common/clients/.generated/species-list/sdk.gen",
            () => ({
                getSpeciesListSItemDetails: vi.fn(),
            }),
        );

        vi.mock(
            "../common/clients/.generated/image-service/sdk.gen",
            () => ({
                getImageInfo: vi.fn(),
            }),
        );
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if the element is not found", () => {
        expect(() => new PictureCarousel("nonexistent", "listId", 5000))
            .toThrowError(
                "Element with id nonexistent not found",
            );
    });

    it("should throw an error if call to species-list failed", () => {
        const carousel = new PictureCarousel(
            "picture-carousel",
            "listId",
            5000,
        );
        getSpeciesListSItemDetailsMock.mockRejectedValue("Some reason");

        expect(() => carousel.render())
            .rejects.toBe("Some reason");
    });

    it.each([
        {},
        {
            data: [],
        },
        {
            data: [{
                some: "random-data",
            }],
        },
        {
            data: [
                {
                    commonName: "Test Species",
                    scientificName: "Testus species",
                    kvpValues: [
                        {
                            key: "imageUrl",
                            value: "some-external-url",
                        },
                    ],
                },
            ],
        },
        {
            data: [
                {
                    lsid: "123",
                    scientificName: "Testus species",
                    kvpValues: [
                        {
                            key: "imageUrl",
                            value: "some-external-url",
                        },
                    ],
                },
            ],
        },
        {
            data: [
                {
                    lsid: "123",
                    commonName: "Test Species",
                    kvpValues: [
                        {
                            key: "imageUrl",
                            value: "some-external-url",
                        },
                    ],
                },
            ],
        },
        {
            data: [
                {
                    lsid: "123",
                    commonName: "Test Species",
                },
            ],
        },
        {
            data: [
                {
                    lsid: "123",
                    commonName: "Test Species",
                    scientificName: "Testus species",
                    kvpValues: [
                        {
                            key: "imageUrl",
                            value: "some-external-url",
                        },
                        {
                            key: "disabled",
                            value: "true",
                        },
                    ],
                },
            ],
        },
    ])(
        "should not render the carousel if species-list returns no data",
        async (response) => {
            const carousel = new PictureCarousel(
                "picture-carousel",
                "listId",
                5000,
            );
            getSpeciesListSItemDetailsMock.mockResolvedValue(response as any);

            await carousel.render();

            const prevButton = document.querySelector(
                ".vbp-picture-carousel-button-prev",
            );
            const nextButton = document.querySelector(
                ".vbp-picture-carousel-button-next",
            );

            expect(prevButton?.classList).toContain("hidden");
            expect(nextButton?.classList).toContain("hidden");
        },
    );

    it("should initialize and render the carousel given some data", async () => {
        const carousel = new PictureCarousel(
            "picture-carousel",
            "listId",
            5000,
        );
        getSpeciesListSItemDetailsMock.mockResolvedValue({
            data: [{
                lsid: "123",
                commonName: "Test Species",
                scientificName: "Testus species",
                kvpValues: [
                    {
                        key: "imageUrl",
                        value: "some-external-image-url",
                    },
                ],
            }],
        });

        await carousel.render();

        const prevButton = document.querySelector(
            ".vbp-picture-carousel-button-prev",
        );
        const nextButton = document.querySelector(
            ".vbp-picture-carousel-button-next",
        );

        expect(prevButton?.classList).not.toContain("hidden");
        expect(nextButton?.classList).not.toContain("hidden");

        expect(getSpeciesListSItemDetails).toHaveBeenCalledWith({
            client: speciesListClient,
            path: {
                druid: "listId",
            },
            query: {
                includeKVP: true,
            },
        });
    });

    it("should switch to new image after timeout given external image url", async () => {
        const carousel = new PictureCarousel(
            "picture-carousel",
            "listId",
            5000,
        );
        getSpeciesListSItemDetailsMock.mockResolvedValue({
            data: [{
                lsid: "123",
                commonName: "Test Species",
                scientificName: "Testus species",
                kvpValues: [
                    {
                        key: "imageUrl",
                        value: "some-external-image-url",
                    },
                    {
                        key: "attributionText",
                        value: "Photo by someone, licensed under something",
                    },
                    {
                        key: "attributionLink",
                        value: "http://link.to/source/image",
                    },
                ],
            }],
        });

        const spyOnPreloadImage = vi.spyOn(carousel as any, "preloadImage")
            .mockResolvedValue(undefined);

        await carousel.render();

        expect(getSpeciesListSItemDetails).toHaveBeenCalledWith({
            client: speciesListClient,
            path: {
                druid: "listId",
            },
            query: {
                includeKVP: true,
            },
        });

        await vi.advanceTimersByTimeAsync(5_000);

        expect(spyOnPreloadImage).toHaveBeenCalledWith(
            "some-external-image-url",
        );
        const attributionElement = document.querySelector(
            ".vbp-picture-carousel-picture[data-carousel-active] .vbp-picture-carousel-attribution",
        )! as HTMLAnchorElement;
        expect(attributionElement.innerHTML).toBe(
            "Photo by someone, licensed under something",
        );
        expect(attributionElement.href).toBe(
            "http://link.to/source/image",
        );

        expect(
            (
                document.querySelector(
                    ".vbp-picture-carousel-picture[data-carousel-active]",
                )! as HTMLElement
            ).style,
        ).to.contain({
            backgroundImage: 'url("some-external-image-url")',
        });
    });

    it("should display correct attribution and image after interval when using imageId", async () => {
        const carousel = new PictureCarousel(
            "picture-carousel",
            "listId",
            5000,
        );
        getSpeciesListSItemDetailsMock.mockResolvedValue({
            data: [{
                lsid: "123",
                commonName: "Test Species",
                scientificName: "Testus species",
                kvpValues: [
                    {
                        key: "imageId",
                        value: "some-image-id",
                    },
                ],
            }],
        });

        getImageInfoMock.mockResolvedValue({
            data: {
                rightsHolder: "Some Right Holder",
                publisher: "some-publisher",
                recognisedLicence: {
                    acronym: "some-license",
                },
            } as unknown as string,
        });
        const spyOnPreloadImage = vi.spyOn(carousel as any, "preloadImage")
            .mockResolvedValue(undefined);

        await carousel.render();

        expect(getSpeciesListSItemDetails).toHaveBeenCalledWith({
            client: speciesListClient,
            path: {
                druid: "listId",
            },
            query: {
                includeKVP: true,
            },
        });

        expect(getImageInfo).toHaveBeenCalledWith({
            client: imageServiceClient,
            path: {
                imageID: "some-image-id",
            },
        });

        await vi.advanceTimersByTimeAsync(5_000);

        expect(spyOnPreloadImage).toHaveBeenCalledWith(
            "/image-service/image/some-image-id/original",
        );
        const attributionElement = document.querySelector(
            ".vbp-picture-carousel-picture[data-carousel-active] .vbp-picture-carousel-attribution",
        )! as HTMLAnchorElement;
        expect(attributionElement.innerHTML).toBe(
            "Photo by Some Right Holder on some-publisher, licensed under some-license",
        );
        expect(attributionElement.href).toBe(
            "http://localhost:3000/image-service/image/some-image-id",
        );

        expect(
            (
                document.querySelector(
                    ".vbp-picture-carousel-picture[data-carousel-active]",
                )! as HTMLElement
            ).style,
        ).to.contain({
            backgroundImage:
                'url("/image-service/image/some-image-id/original")',
        });
    });

    it("should display empty attribution when image-service return empty info", async () => {
        const carousel = new PictureCarousel(
            "picture-carousel",
            "listId",
            5000,
        );
        getSpeciesListSItemDetailsMock.mockResolvedValue({
            data: [{
                lsid: "123",
                commonName: "Test Species",
                scientificName: "Testus species",
                kvpValues: [
                    {
                        key: "imageId",
                        value: "some-image-id",
                    },
                ],
            }],
        });

        getImageInfoMock.mockResolvedValue({});
        const spyOnPreloadImage = vi.spyOn(carousel as any, "preloadImage")
            .mockResolvedValue(undefined);

        await carousel.render();

        expect(getSpeciesListSItemDetails).toHaveBeenCalledWith({
            client: speciesListClient,
            path: {
                druid: "listId",
            },
            query: {
                includeKVP: true,
            },
        });

        expect(getImageInfo).toHaveBeenCalledWith({
            client: imageServiceClient,
            path: {
                imageID: "some-image-id",
            },
        });

        await vi.advanceTimersByTimeAsync(5_000);

        expect(spyOnPreloadImage).toHaveBeenCalledWith(
            "/image-service/image/some-image-id/original",
        );
        const attributionElement = document.querySelector(
            ".vbp-picture-carousel-picture[data-carousel-active] .vbp-picture-carousel-attribution",
        )! as HTMLAnchorElement;
        expect(attributionElement.innerHTML).toBe("");
        expect(attributionElement.href).toBe("");

        expect(
            (
                document.querySelector(
                    ".vbp-picture-carousel-picture[data-carousel-active]",
                )! as HTMLElement
            ).style,
        ).to.contain({
            backgroundImage:
                'url("/image-service/image/some-image-id/original")',
        });
    });
});
