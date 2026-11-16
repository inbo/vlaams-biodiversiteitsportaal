// @vitest-environment node
/// <reference types="node" />
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Mustache from "mustache";
import { describe, expect, test } from "vitest";

// Checks the generated Bootstrap 5 header/footer bundle (dist/bs5, see
// bs5-bundle.ts) against what the ala-bootstrap5 grails plugin expects.

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../dist");
const bs5Dir = resolve(distDir, "bs5");

const read = (file: string) => readFileSync(resolve(distDir, file), "utf-8");

const HEADER_FOOTER_SERVER = "https://natuurdata.inbo.be/bs5";

// What TagLinkService.populateTemplateVariables of the plugin supplies. The
// urls are html encoded by the plugin before they reach the template.
const taglibVariables = (loggedIn: boolean, fluid: boolean) => ({
    headerFooterServer: HEADER_FOOTER_SERVER,
    centralServer: "https://natuurdata.inbo.be",
    searchServer: "https://natuurdata.inbo.be/bie-hub",
    searchPath: "/search",
    containerClass: fluid ? "container-fluid" : "container",
    loginURL:
        "/image-service/login?path=https%3A%2F%2Fnatuurdata.inbo.be%2Fimage-service%2F&amp;x=1",
    logoutURL:
        "/image-service/logout?url=https%3A%2F%2Fnatuurdata.inbo.be%2Fimage-service%2F&amp;x=1",
    myProfileURL: "https://natuurdata.inbo.be/userdetails/my-profile",
    editAccountLink:
        "https://natuurdata.inbo.be/userdetails/registration/editAccount",
    loginStatus: loggedIn ? "signedIn" : "signedOut",
    loggedIn,
    loggedOut: !loggedIn,
    fathomID: null,
});

const variants = [
    { name: "logged out, fluid", loggedIn: false, fluid: true },
    { name: "logged in, fluid", loggedIn: true, fluid: true },
    { name: "logged out, fixed", loggedIn: false, fluid: false },
    { name: "logged in, fixed", loggedIn: true, fluid: false },
];

// Fetched by the plugin in mustache mode (headerAndFooter.useMustache: true)
const mustacheTemplates = ["assets", "head", "banner", "footer"];
// Fetched by the plugin in html mode (headerAndFooter.useMustache: false)
const htmlTemplates = ["head", "banner", "footer"];

// TagLinkService.transformV2, used by the plugin in html mode
const transformV2 = (content: string, variables: Record<string, unknown>) =>
    Object.entries(variables).reduce(
        (result, [key, value]) =>
            result.split(`::${key}::`).join(value ? String(value) : ""),
        content,
    );

const expectNoTokens = (content: string) => {
    expect(content.match(/{{[^}]*}}+/g)).toBeNull();
    expect(content.match(/==[A-Za-z]+==/g)).toBeNull();
    expect(content.match(/::[A-Za-z]+::/g)).toBeNull();
};

const localAssetUrls = (html: string): string[] => {
    const urls: string[] = [];
    for (const tag of html.match(/<(?:link|script|img)\b[^>]*>/g) ?? []) {
        const url = tag.match(/\s(?:href|src)="([^"]*)"/)?.[1];
        if (url !== undefined) {
            urls.push(url);
        }
    }
    return urls;
};

const resolveLocalUrl = (url: string): string | null => {
    const path = url.split(/[?#]/)[0];
    if (path.startsWith(`${HEADER_FOOTER_SERVER}/`)) {
        return resolve(bs5Dir, path.slice(HEADER_FOOTER_SERVER.length + 1));
    }
    if (/^([a-z]+:)?\/\//.test(path) || path.startsWith("data:")) {
        return null;
    }
    expect(path, "local urls should be root relative").toMatch(/^\//);
    return resolve(distDir, path.slice(1));
};

const expectLocalAssetsToExist = (html: string) => {
    const urls = localAssetUrls(html);
    for (const url of urls) {
        const file = resolveLocalUrl(url);
        if (file !== null) {
            expect(existsSync(file), `${url} should exist in dist`).toBe(true);
        }
    }
    return urls;
};

describe("bootstrap 5 header and footer bundle", () => {
    describe.each(variants)("mustache templates, $name", (variant) => {
        const variables = taglibVariables(variant.loggedIn, variant.fluid);

        test.each(mustacheTemplates)("%s.mustache renders", (name) => {
            const rendered = Mustache.render(
                read(`bs5/${name}.mustache`),
                variables,
            );

            expectNoTokens(rendered);
            expectLocalAssetsToExist(rendered);
        });

        test("banner.mustache gets the login and logout urls of the service", () => {
            const rendered = Mustache.render(
                read("bs5/banner.mustache"),
                variables,
            );

            // The plugin html encodes the urls, they should not be encoded again
            expect(rendered).toContain(`href="${variables.loginURL}"`);
            expect(rendered).toContain(`href="${variables.logoutURL}"`);
            expect(rendered).not.toContain("&amp;amp;");
        });
    });

    describe.each(variants)("html templates, $name", (variant) => {
        const variables = taglibVariables(variant.loggedIn, variant.fluid);

        test.each(htmlTemplates)("%s.html renders", (name) => {
            const rendered = transformV2(read(`bs5/${name}.html`), variables);

            expectNoTokens(rendered);
            expectLocalAssetsToExist(rendered);
        });
    });

    test.each(mustacheTemplates)(
        "%s.mustache only uses variables supplied by the plugin",
        (name) => {
            const template = read(`bs5/${name}.mustache`);
            const supplied = Object.keys(taglibVariables(true, true));

            // No sections, partials or comments, only plain variables
            const tags = template.match(/{{+[^}]*}}+/g) ?? [];
            for (const tag of tags) {
                expect(tag).toMatch(/^({{[A-Za-z]+}}|{{{[A-Za-z]+}}})$/);
                expect(supplied).toContain(tag.replace(/[{}]/g, ""));
            }
            expect(template.match(/::[A-Za-z]+::/g)).toBeNull();
        },
    );

    test("assets.mustache provides everything the plugin layout expects", () => {
        const rendered = Mustache.render(
            read("bs5/assets.mustache"),
            taglibVariables(false, true),
        );

        expect(localAssetUrls(rendered)).toEqual(
            [
                "css/bootstrap.min.css",
                "css/ala-styles.min.css",
                "css/autocomplete.min.css",
                "css/autocomplete-extra.min.css",
                "css/font-awesome.min.css",
                "js/jquery.min.js",
                "js/bootstrap.min.js",
                "js/autocomplete.min.js",
                "js/application.js",
            ].map((path) => `${HEADER_FOOTER_SERVER}/${path}`),
        );
    });

    // Referenced by layouts/_main.gsp of the plugin, depending on
    // headerAndFooter.useMustache and headerAndFooter.exclude*
    test.each([
        "css/bootstrap.min.css",
        "css/ala-styles.css",
        "css/ala-styles.min.css",
        "css/autocomplete.min.css",
        "css/autocomplete-extra.min.css",
        "css/font-awesome.min.css",
        "js/jquery.min.js",
        "js/autocomplete.min.js",
        "js/application.js",
        "js/bootstrap.min.js",
    ])("%s exists under the bs5 prefix", (path) => {
        expect(existsSync(resolve(bs5Dir, path))).toBe(true);
    });

    test("head loads the same modules as the bootstrap 3 head", () => {
        const modules = (html: string) =>
            html.match(/<script type="module"[^>]*><\/script>/g);

        const rootModules = modules(read("head.html"));
        expect(rootModules).not.toBeNull();
        expect(modules(read("bs5/head.mustache"))).toEqual(rootModules);
        expect(modules(read("bs5/head.html"))).toEqual(rootModules);
    });

    test.each(["banner", "footer"])(
        "%s uses bootstrap 5 data attributes",
        (name) => {
            const template = read(`bs5/${name}.mustache`);

            expect(template).not.toMatch(
                /\sdata-(toggle|target|dismiss|parent)=/,
            );
            expect(template).toMatch(/\sdata-bs-toggle=/);
        },
    );

    test("banner has the elements the head scripts depend on", () => {
        const banner = read("bs5/banner.mustache");

        for (const id of [
            "banner-search",
            "banner-search-input",
            "banner-search-container",
            "dropdown-auth-menu",
            "dropdown-lang",
            "my-annotated-records",
            "autoCompleteTemplate",
        ]) {
            expect(banner).toContain(`id="${id}"`);
        }
        for (const className of [
            "login-status-dependent",
            "login-button",
            "logout-button",
            "locale-link",
        ]) {
            expect(banner).toMatch(
                new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`),
            );
        }
    });

    test("test page has no unreplaced tokens and only refers to existing assets", () => {
        const testPage = read("bs5/test.html");

        expectNoTokens(testPage);
        const urls = expectLocalAssetsToExist(testPage);
        expect(urls).toContain("/bs5/css/bootstrap.min.css");
        expect(urls).toContain("/bs5/css/vbp.min.css");
        expect(urls).toContain("/bs5/js/bootstrap.min.js");
    });

    test("stylesheets only refer to existing local files", () => {
        const cssDir = resolve(bs5Dir, "css");
        // autocomplete.min.css is the jQuery UI stylesheet of the bootstrap 3
        // bundle, neither bundle ships the theme icon sprites it refers to
        const stylesheets = readdirSync(cssDir).filter(
            (file) => !file.startsWith("autocomplete"),
        );
        expect(stylesheets).toContain("vbp.min.css");
        for (const file of stylesheets) {
            const css = readFileSync(resolve(cssDir, file), "utf-8");
            for (const [, url] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
                if (/^(data:|https?:|\/\/)/.test(url)) {
                    continue;
                }
                const path = url.split(/[?#]/)[0];
                const target = path.startsWith("/")
                    ? resolve(distDir, path.slice(1))
                    : resolve(cssDir, path);
                expect(
                    existsSync(target),
                    `${url} in bs5/css/${file} should exist in dist`,
                ).toBe(true);
            }
        }
    });

    test("bs5 bundle is bootstrap 5", () => {
        const css = read("bs5/css/bootstrap.min.css");
        expect(css).toMatch(/Bootstrap\s+v5\.3\.\d+/);
        expect(css).toContain("--bs-primary");
        expect(css).not.toContain(".glyphicon");

        const js = read("bs5/js/bootstrap.min.js");
        expect(js).toMatch(/Bootstrap v5\.3\.\d+/);
        // The bundle with Popper, needed by the dropdowns
        expect(js).toContain("createPopper");
    });

    test("root bundle is still bootstrap 3", () => {
        const css = read("css/bootstrap.min.css");
        expect(css).toContain(".glyphicon");
        expect(css).toContain(".col-xs-12");
        expect(css).toContain(".navbar-default");
        expect(css).not.toContain("--bs-");

        expect(read("js/bootstrap.min.js")).toMatch(/Bootstrap v3\.4\.\d+/);

        const banner = read("banner.html");
        expect(banner).toMatch(/\sdata-toggle="dropdown"/);
        expect(banner).not.toMatch(/\sdata-bs-/);
        expect(read("footer.html")).toContain(
            'data-toggle="modal" data-target="#bug-modal"',
        );
    });
});
