/// <reference types="vite/client" />

import { resolve } from "path";
import inject from "@rollup/plugin-inject";
import markdownify from "vite-plugin-markdownify";
import handlebars from "vite-plugin-handlebars";

import glob from "glob";

const pages = import.meta.glob("./pages/**/*.html");

export default {
    root: resolve(__dirname, "src"),
    publicDir: resolve(__dirname, "./public"),
    build: {
        outDir: resolve(__dirname, "./dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "./src/index.html"),
                head: resolve(__dirname, "./src/partials/head.html"),
                banner: resolve(__dirname, "./src/partials/banner.html"),
                footer: resolve(__dirname, "./src/partials/footer.html"),
                settings: resolve(__dirname, "./src/settings.ts"),
                ...glob.sync("./pages/**/*.html"),
            },
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: "assets/[name].css",
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
        inject({ // => that should be first under plugins array
            $: "jquery",
            jQuery: "jquery",
        }),
        // {
        //     name: "common-ui-templating",
        //     enforce: "pre",
        //     async transformIndexHtml(html) {
        //         let result = html;
        //         const replacementsData = await replacements();

        //         for (const [key, value] of Object.entries(replacementsData)) {
        //             result = result.replace(key, value);
        //         }

        //         return result;
        //     },
        // },
        handlebars({
            partialDirectory: resolve(__dirname, "src/partials"),
        }),
        markdownify({
            htmlTemplate: resolve(__dirname, "./src/pages.html"),
            input: resolve(__dirname, "./pages/**/*.md"),
            output: resolve(__dirname, "./dist/pages"),
            defaults: { // Default meta tags and fields for default `feed.xml`
                title: `Default Title`,
                author: `Author's Name`,
                description: "Site description",
                baseUrl: `https://yoursiteexample.com`,
                "og:type": `article`,
            },
        }),
    ],
};
