import { resolve } from "path";
import handlebars from "vite-plugin-handlebars";

import { viteStaticCopy } from "vite-plugin-static-copy";
import { generateMarkdownPages } from "./template-pages";
import { downloadAbvAssets } from "./abv-assets";
import { console } from "node:inspector";
import { exec } from "child_process";

import fg from "fast-glob";
import { rename } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { createClient, defaultPlugins } from "@hey-api/openapi-ts";

const replacements = {
    loginStatus: "signedIn",
    loginURL: "",
    logoutURL: "",
};

export default {
    root: resolve(__dirname, "src"),
    publicDir: resolve(__dirname, "./public"),
    build: {
        outDir: resolve(__dirname, "./dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "./src/index.html"),
                head: resolve(__dirname, "./src/head.html"),
                banner: resolve(__dirname, "./src/banner.html"),
                footer: resolve(__dirname, "./src/footer.html"),
                settings: resolve(__dirname, "./src/settings.ts"),
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
                "autocomplete-extra": resolve(
                    __dirname,
                    "./src/portal/ala/autocomplete-extra.css",
                ),
                "application": resolve(
                    __dirname,
                    "src/portal/ala/application.js",
                ),
                ...(await generateMarkdownPages({
                    globPattern: "./pages/**/*",
                    template: "src/pages/pages-layout.html",
                    templateString: "{{{content}}}",
                    outputFolder: "./src/pages",
                })),
            },
            output: {
                entryFileNames: `js/[name].js`,
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
        abvAssets: downloadAbvAssets({ outputFolder: "./dist" }),
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
            enforce: "pre",
            async buildStart(options) {
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
        // Allow using partials to construct html files similar to what the ala services do
        handlebars({
            partialDirectory: [
                resolve(__dirname, "src/partials"),
                resolve(__dirname, "src/index"),
            ],
        }),
        // Perform tag replacement on the index file to match the ala services
        {
            name: "AlaTagLibReplacement",
            enforce: "post",
            async transformIndexHtml(html, { path }) {
                console.log("Transforming HTML for:", path);
                let result = html;

                if (path === "/index.html" || path.includes("/pages/")) {
                    console.log("Replacing TagLib entries in HTML for:", path);
                    for (const [key, value] of Object.entries(replacements)) {
                        result = result.replaceAll(`::${key}::`, value);
                    }
                }

                return result;
            },
        },
        {
            name: "rename-html-for-s3",
            apply: "build",
            enforce: "post",
            async closeBundle(error) {
                if (error) {
                    console.error("Error during build:", error);
                    return;
                }

                const globs = [
                    resolve(__dirname, "./dist/pages/**/*.html"),
                    resolve(__dirname, "./dist/my-profile.html"),
                ];
                globs.forEach(async (globPattern) =>
                    (await fg.glob(globPattern))
                        .forEach(async (file) => {
                            await rename(
                                file,
                                `${dirname(file)}/${basename(file, ".html")}`,
                            );
                        })
                );
            },
        },
    ],
    server: {
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
