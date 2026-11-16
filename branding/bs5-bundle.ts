import fs from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import * as sass from "sass-embedded";

/**
 * Builds the Bootstrap 5 header/footer bundle used by services running the
 * ala-bootstrap5 grails plugin. Those services point `headerAndFooter.baseURL`
 * to `<portal root>/bs5`, all other services keep using the Bootstrap 3 bundle
 * at the portal root.
 *
 * The bundle is generated after the main vite build instead of being part of
 * its rollup inputs, so the Bootstrap 3 bundle is not affected by it (extra
 * inputs would change how rollup splits the shared head modules into chunks).
 *
 * What the plugin fetches from the base url (TagLinkService in ala-bootstrap5):
 * - `headerAndFooter.useMustache: true` (plugin default): assets.mustache,
 *   head.mustache, banner.mustache and footer.mustache, rendered with mustache
 * - `headerAndFooter.useMustache: false`: head.html, banner.html and
 *   footer.html, in which `::variable::` is replaced
 *
 * The sources in src/bs5 use the `::variable::` form, the mustache templates
 * are derived from them.
 */

// The variables supplied by TagLinkService.populateTemplateVariables.
// The url variables are html encoded by the plugin, so they are emitted as
// unescaped mustache tags to avoid encoding them twice.
const TEMPLATE_VARIABLES: Record<string, { htmlEncoded: boolean }> = {
    headerFooterServer: { htmlEncoded: true },
    centralServer: { htmlEncoded: true },
    searchServer: { htmlEncoded: true },
    searchPath: { htmlEncoded: true },
    containerClass: { htmlEncoded: false },
    loginURL: { htmlEncoded: true },
    logoutURL: { htmlEncoded: true },
    myProfileURL: { htmlEncoded: true },
    editAccountLink: { htmlEncoded: true },
    loginStatus: { htmlEncoded: false },
    loggedIn: { htmlEncoded: false },
    loggedOut: { htmlEncoded: false },
    fathomID: { htmlEncoded: false },
};

const TEMPLATES = ["assets", "head", "banner", "footer"];

// Values used to render the static test page, login and logout are handled
// client side by auth-ui.ts like on the other static pages
const TEST_PAGE_VARIABLES: Record<string, string> = {
    headerFooterServer: "/bs5",
    centralServer: "",
    searchServer: "",
    searchPath: "/bie-hub/search",
    containerClass: "container-fluid",
    loginURL: "replace-with-authui-onclick",
    logoutURL: "replace-with-authui-onclick",
    myProfileURL: "/my-profile.html",
    editAccountLink: "/my-profile.html",
    loginStatus: "signedOut",
    loggedIn: "false",
    loggedOut: "true",
    fathomID: "",
};

const TOKEN_REGEX = /::([A-Za-z]+)::/g;

export async function buildBootstrap5Bundle({
    projectDir,
    distDir,
}: {
    projectDir: string;
    distDir: string;
}): Promise<void> {
    const srcDir = path.resolve(projectDir, "src");
    const bs5SrcDir = path.resolve(srcDir, "bs5");
    const nodeModulesDir = path.resolve(projectDir, "node_modules");
    const outDir = path.resolve(distDir, "bs5");

    await fs.rm(outDir, { recursive: true, force: true });
    await fs.mkdir(path.resolve(outDir, "css"), { recursive: true });
    await fs.mkdir(path.resolve(outDir, "js"), { recursive: true });

    await buildStyles({ srcDir, bs5SrcDir, nodeModulesDir, distDir, outDir });
    await copyScripts({ projectDir, nodeModulesDir, distDir, outDir });
    await buildTemplates({ srcDir, bs5SrcDir, distDir, outDir });

    console.log("Bootstrap 5 bundle written to", outDir);
}

async function buildStyles({
    srcDir,
    bs5SrcDir,
    nodeModulesDir,
    distDir,
    outDir,
}: {
    srcDir: string;
    bs5SrcDir: string;
    nodeModulesDir: string;
    distDir: string;
    outDir: string;
}) {
    // Bootstrap 3 uses a root font size of 10px, Bootstrap 5 one of 16px.
    // Stylesheets written against the Bootstrap 3 root are imported as
    // `vbp-bs3-rem:<path relative to src, without .css>` to get their rem
    // sizes converted to px, so they render the same in both bundles.
    const bs3RemImporter: sass.Importer<"async"> = {
        canonicalize(url) {
            return url.startsWith("vbp-bs3-rem:") ? new URL(url) : null;
        },
        async load(canonicalUrl) {
            const css = await fs.readFile(
                path.resolve(srcDir, `${canonicalUrl.pathname}.css`),
                "utf-8",
            );
            return {
                contents: css.replace(
                    /(\d*\.?\d+)rem\b/g,
                    (_, value) =>
                        `${parseFloat((parseFloat(value) * 10).toFixed(4))}px`,
                ),
                syntax: "css",
            };
        },
    };

    const compile = async (file: string) =>
        (
            await sass.compileAsync(file, {
                style: "compressed",
                loadPaths: [nodeModulesDir],
                importers: [bs3RemImporter],
                quietDeps: true,
                silenceDeprecations: [
                    "color-functions",
                    "global-builtin",
                    "import",
                ],
            })
        ).css;

    const alaStyles = path.resolve(srcDir, "portal/ala/ala-styles.css");
    const stylesheets: Record<string, string> = {
        "bootstrap.min.css": await compile(
            path.resolve(bs5SrcDir, "scss/bootstrap.scss"),
        ),
        "font-awesome.min.css": await compile(
            path.resolve(bs5SrcDir, "scss/font-awesome.scss"),
        ),
        "vbp.min.css": await rewriteAssetUrls(
            await compile(path.resolve(bs5SrcDir, "scss/vbp.scss")),
            distDir,
        ),
        // Framework neutral, same sources as the Bootstrap 3 bundle
        "ala-styles.css": await fs.readFile(alaStyles, "utf-8"),
        "ala-styles.min.css": await compile(alaStyles),
    };

    for (const [name, css] of Object.entries(stylesheets)) {
        await fs.writeFile(path.resolve(outDir, "css", name), css);
    }
}

// The shared stylesheets reference images relative to their own location
// (src/assets), vite emits those to /images in the main bundle.
async function rewriteAssetUrls(css: string, distDir: string): Promise<string> {
    const images = new Set<string>();
    const result = css.replace(
        /url\((["']?)(?:\.\.\/)+assets\/([^"')]+)\1\)/g,
        (_, quote, name) => {
            images.add(name);
            return `url(${quote}/images/${name}${quote})`;
        },
    );
    for (const name of images) {
        await assertExists(path.resolve(distDir, "images", name));
    }
    return result;
}

async function copyScripts({
    projectDir,
    nodeModulesDir,
    distDir,
    outDir,
}: {
    projectDir: string;
    nodeModulesDir: string;
    distDir: string;
    outDir: string;
}) {
    const publicDir = path.resolve(projectDir, "public");
    const bootstrapJsDir = path.resolve(nodeModulesDir, "bootstrap/dist/js");

    const files: [string, string][] = [
        [
            path.resolve(nodeModulesDir, "jquery/dist/jquery.min.js"),
            "js/jquery.min.js",
        ],
        // The bundle includes Popper, which the dropdowns depend on
        [
            path.resolve(bootstrapJsDir, "bootstrap.bundle.min.js"),
            "js/bootstrap.min.js",
        ],
        [
            path.resolve(bootstrapJsDir, "bootstrap.bundle.min.js.map"),
            "js/bootstrap.bundle.min.js.map",
        ],
        // Framework neutral, same files as the Bootstrap 3 bundle
        [
            path.resolve(publicDir, "js/autocomplete.min.js"),
            "js/autocomplete.min.js",
        ],
        [
            path.resolve(publicDir, "css/autocomplete.min.css"),
            "css/autocomplete.min.css",
        ],
        [
            path.resolve(publicDir, "css/autocomplete-extra.min.css"),
            "css/autocomplete-extra.min.css",
        ],
        [path.resolve(distDir, "js/application.js"), "js/application.js"],
        [
            path.resolve(distDir, "js/application.js.map"),
            "js/application.js.map",
        ],
    ];

    for (const [src, dest] of files) {
        await fs.copyFile(src, path.resolve(outDir, dest));
    }
}

async function buildTemplates({
    srcDir,
    bs5SrcDir,
    distDir,
    outDir,
}: {
    srcDir: string;
    bs5SrcDir: string;
    distDir: string;
    outDir: string;
}) {
    // Separate instance, to not interfere with the one of vite-plugin-handlebars
    const handlebars = Handlebars.create();
    const partialsDir = path.resolve(srcDir, "partials");
    for (const file of await fs.readdir(partialsDir)) {
        const ext = path.extname(file);
        if ([".html", ".hbs"].includes(ext)) {
            handlebars.registerPartial(
                path.basename(file, ext),
                await fs.readFile(path.resolve(partialsDir, file), "utf-8"),
            );
        }
    }

    const context = {
        // Bootstrap 5 data attributes are prefixed: data-bs-toggle
        bsDataPrefix: "bs-",
        rootHeadModules: await getRootHeadModules(distDir),
    };

    const rendered: Record<string, string> = {};
    for (const name of TEMPLATES) {
        const source = await fs.readFile(
            path.resolve(bs5SrcDir, `${name}.html`),
            "utf-8",
        );
        const html = handlebars.compile(source, { strict: true })(context);

        for (const [token, variable] of html.matchAll(TOKEN_REGEX)) {
            if (!(variable in TEMPLATE_VARIABLES)) {
                throw new Error(
                    `${name}.html uses ${token}, which is not supplied by the ala-bootstrap5 plugin`,
                );
            }
        }
        if (/{{|}}/.test(html)) {
            throw new Error(
                `${name}.html contains mustache delimiters, which would be interpreted by the ala-bootstrap5 plugin`,
            );
        }

        rendered[name] = html;
        await fs.writeFile(path.resolve(outDir, `${name}.html`), html);
        await fs.writeFile(
            path.resolve(outDir, `${name}.mustache`),
            html.replace(TOKEN_REGEX, (_, variable) =>
                TEMPLATE_VARIABLES[variable].htmlEncoded
                    ? `{{{${variable}}}}`
                    : `{{${variable}}}`,
            ),
        );
    }

    // Static page to check the bundle without an ala-bootstrap5 based service
    const testPage = handlebars.compile(
        await fs.readFile(path.resolve(bs5SrcDir, "test.html"), "utf-8"),
        { strict: true },
    );
    const testContext = Object.fromEntries(
        Object.entries(rendered).map(([name, html]) => [
            name,
            html.replace(
                TOKEN_REGEX,
                (_, variable) => TEST_PAGE_VARIABLES[variable],
            ),
        ]),
    );
    await fs.writeFile(
        path.resolve(outDir, "test.html"),
        testPage(testContext),
    );
}

// The head modules (auth, i18n, banner search, monitoring) are framework
// neutral and shared with the Bootstrap 3 bundle: settings.js is configured
// per environment at deploy time and the auth service worker lives at the
// root, so the Bootstrap 5 head loads the very same files. Their names are
// decided by rollup, so take them from the generated Bootstrap 3 head.
async function getRootHeadModules(distDir: string): Promise<string> {
    const rootHead = await fs.readFile(
        path.resolve(distDir, "head.html"),
        "utf-8",
    );
    const modules = rootHead.match(
        /<script type="module"[^>]*><\/script>|<link rel="modulepreload"[^>]*>/g,
    );
    if (!modules) {
        throw new Error(
            "No module scripts found in dist/head.html to reuse in the Bootstrap 5 head",
        );
    }
    return modules.join("\n");
}

async function assertExists(file: string) {
    try {
        await fs.access(file);
    } catch {
        throw new Error(`Bootstrap 5 bundle refers to missing file ${file}`);
    }
}
