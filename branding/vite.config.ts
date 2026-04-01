import { resolve } from "path";
import handlebars from "vite-plugin-handlebars";
import fs from "node:fs/promises";

import { viteStaticCopy } from "vite-plugin-static-copy";
import { generateMarkdownPages, loadNewsItems, fetchRandomNewsBackground } from "./template-pages";
import { downloadSpeciesPluginTabAssets } from "./plugin-tabs-assets";
import { console } from "node:inspector";

import fg from "fast-glob";
import { basename, dirname, extname } from "node:path";
import { createClient, defaultPlugins } from "@hey-api/openapi-ts";
import type { PreRenderedChunk } from "rollup";

const replacements = {
    loginStatus: "login-status-dependent",
    loginURL: "replace-with-authui-onclick",
    logoutURL: "replace-with-authui-onclick",
};

const NEWS_BG_IMAGE_URL = await fetchRandomNewsBackground("dr1");

const newsItems = await loadNewsItems();
const newsCardsHtml = newsItems.length > 0
    ? newsItems.map((item) =>
        `<article class="news-card">
                    <div class="news-card-body">
                        <span class="news-card-date">${item.dateFormatted}</span>
                        <h3 class="news-card-title"><a href="${item.url}">${item.title}</a></h3>
                        <p class="news-card-excerpt">${item.excerpt}</p>
                    </div>
                </article>`,
    ).join("\n                ")
    : "<p>Geen nieuws beschikbaar.</p>";
await fs.writeFile(
    resolve(__dirname, "src/index/news-cards.html"),
    newsCardsHtml,
    "utf-8",
);
await fs.writeFile(
    resolve(__dirname, "src/index/news-section-bg.html"),
    `<style>.news-section { background-image: url('${NEWS_BG_IMAGE_URL}'); }</style>`,
    "utf-8",
);

export default {
    root: resolve(__dirname, "src"),
    publicDir: resolve(__dirname, "./public"),
    build: {
        outDir: resolve(__dirname, "./dist"),
        emptyOutDir: true,
        sourcemap: true, // Enable source maps for debugging
        rollupOptions: {
            input: {
                index: resolve(__dirname, "./src/index.html"),
                head: resolve(__dirname, "./src/head.html"),
                banner: resolve(__dirname, "./src/banner.html"),
                footer: resolve(__dirname, "./src/footer.html"),
                settings: resolve(__dirname, "./src/settings.ts"),
                "service-worker": resolve(
                    __dirname,
                    "./src/auth/service-worker.ts",
                ),
                "user-profile": resolve(
                    __dirname,
                    "./src/my-profile.html",
                ),
                "bootstrap": resolve(
                    __dirname,
                    "./src/portal/bootstrap.scss",
                ),
                "bootstrap-theme": resolve(
                    __dirname,
                    "./src/portal/ala/bootstrap-theme.css",
                ),
                "font-awesome": resolve(
                    __dirname,
                    "./src/portal/font-awesome.scss",
                ),
                "ala-styles": resolve(
                    __dirname,
                    "./src/portal/ala/ala-styles.css",
                ),
                "application": resolve(
                    __dirname,
                    "src/portal/ala/application.js",
                ),
                // To allow inclusion in spatial portal
                "auth": resolve(
                    __dirname,
                    "src/auth/auth.ts",
                ),
                ...(await generateMarkdownPages({
                    globPattern: "./pages/**/*",
                    template: "src/pages/pages-layout.html",
                    templateTitleString: "{{{title}}}",
                    templateDescriptionString: "{{{description}}}",
                    templateContentString: "{{{content}}}",
                    outputFolder: "./src/pages",
                })),
                ...(await downloadSpeciesPluginTabAssets({
                    outputFolder: "./src/abv",
                    assetsS3RelativePath: "ABV/abv-content.zip",
                    assetsFilepath: "./abv-assets.zip",
                })),
                ...(await downloadSpeciesPluginTabAssets({
                    outputFolder: "./src/faunabeheer",
                    assetsS3RelativePath: "faunabeheer/faunabeheer-content.zip",
                    assetsFilepath: "./faunabeheer-assets.zip",
                })),
            },
            output: {
                entryFileNames: (chunkInfo: PreRenderedChunk) => {
                    console.log("Chunk file name:", chunkInfo.name);
                    if (chunkInfo.name === "service-worker") {
                        return `[name].js`;
                    }

                    return `js/[name].js`;
                },
                chunkFileNames: `js/[name].js`,
                assetFileNames: ({ name, originalFileName }) => {
                    // Some custom naming rules to match expectations for the ala services
                    console.log("Asset file name:", name);

                    if (name.endsWith(".css")) {
                        if (name === "ala-styles.css") {
                            return `css/${name}`;
                        }

                        return `css/${name.replace(/\.css$/, ".min.css")}`;
                    } else if (
                        name.endsWith(".woff") || name.endsWith(".woff2") ||
                        name.endsWith(".ttf") || name.endsWith(".eot") ||
                        originalFileName.includes("fonts/bootstrap")
                    ) {
                        return `fonts/${name}`;
                    } else if (
                        name.endsWith(".jpg") || name.endsWith(".webp") ||
                        name.endsWith(".png") || name.endsWith(".svg")
                    ) {
                        return `images/${name}`;
                    } else if (name.endsWith(".js")) {
                        return `js/${name}`;
                    }
                    // For other file types, use the default output format with hash
                    return `assets/${name}`;
                },
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: [
                    "color-functions",
                    "global-builtin",
                    "import",
                ],
            },
        },
    },
    plugins: [
        {
            name: "generate-openapi-clients",
            apply: "build",
            async buildStart() {
                (await fg.glob("./src/common/clients/*.yml")).forEach(
                    async (schema) => {
                        const serviceName = basename(schema, ".yml");
                        await createClient({
                            input: schema,
                            output:
                                `./src/common/clients/.generated/${serviceName}`,
                            plugins: [
                                ...defaultPlugins,
                                "@hey-api/client-fetch",
                            ],
                        });
                    },
                );
            },
        },
        // Copy JS libraries, cannot be bundled by Vite because they aren't ES modules
        viteStaticCopy({
            targets: [
                {
                    src: "../node_modules/jquery/dist/jquery.min.js",
                    dest: "js",
                },
                {
                    src: "../node_modules/jquery-migrate/dist/jquery-migrate.min.js",
                    dest: "js",
                    rename: () => "jquery-migration.min.js",
                },
                {
                    src: "../node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js",
                    dest: "js",
                },
            ],
        }),
        // Workaround for vite-plugin-handlebars@1.5.0 Windows path separator bugs:
        // 1. Partial registration uses `replace(`${dir}/`, '')` with a hardcoded forward
        //    slash which never matches Windows backslash paths, so partials get registered
        //    under their full path instead of short name.
        // 2. The `resolve-from-root` helper emits absolute Windows paths (C:\...) which
        //    Rollup cannot resolve as module imports.
        // Both are fixed by pre-registering partials and overriding the helper here,
        // using the shared Handlebars instance (Node.js CJS module cache).
        {
            name: "register-handlebars-partials",
            enforce: "pre",
            async buildStart() {
                const { default: Handlebars } = await import("handlebars");
                // Override to emit root-relative URLs (/auth/auth.ts) instead of
                // absolute Windows filesystem paths that Rollup cannot resolve.
                Handlebars.registerHelper("resolve-from-root", function (filePath: string) {
                    return "/" + filePath;
                });
                const validExts = new Set([".html", ".hbs"]);
                const partialDirs = [
                    resolve(__dirname, "src/partials"),
                    resolve(__dirname, "src/index"),
                ];
                for (const dir of partialDirs) {
                    try {
                        const entries = await fs.readdir(dir, { withFileTypes: true });
                        for (const entry of entries) {
                            if (!entry.isFile()) continue;
                            const ext = extname(entry.name);
                            if (!validExts.has(ext)) continue;
                            const name = basename(entry.name, ext);
                            const content = await fs.readFile(
                                resolve(dir, entry.name),
                                "utf-8",
                            );
                            Handlebars.registerPartial(name, content);
                        }
                    } catch {
                        // Directory may not exist yet
                    }
                }
            },
        },
        // Allow using partials to construct html files similar to what the ala services do
        handlebars({
            partialDirectory: [
                resolve(__dirname, "src/partials"),
                resolve(__dirname, "src/index"),
            ],
        }),
        // Perform tag replacement on non template html files to match the ala services AlaTagLib erplacements
        {
            name: "AlaTagLibReplacement",
            enforce: "post",
            async transformIndexHtml(html, { path }) {
                let result = html;

                if (
                    !["/banner.html", "/footer.html", "head.html"].includes(
                        path,
                    )
                ) {
                    console.log("Transforming HTML for:", path);

                    console.log("Replacing TagLib entries in HTML for:", path);
                    for (const [key, value] of Object.entries(replacements)) {
                        result = result.replaceAll(`::${key}::`, value);
                    }
                }

                return result;
            },
        },
    ],
    server: {
        sourcemapIgnoreList: false, // Include all files in source maps
        proxy: {
            "^/(species-list|image-service)/": {
                target: "https://natuurdata.dev.inbo.be",
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: "happy-dom",
    },
};
