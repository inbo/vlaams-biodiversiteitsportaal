import glob from "fast-glob";
import markdownit from "markdown-it";
import markdowItFrontMatter from "markdown-it-front-matter";
import path, { basename } from "path";
import fs from "fs/promises";
import { parse } from "yaml";

export async function generateMarkdownPages(
    {
        globPattern = "./pages/**/*",
        template = "src/pages/pages-layout.html",
        templateTitleString = "{{{title}}}",
        templateDescriptionString = "{{{description}}}",
        templateContentString = "{{{content}}}",
        outputFolder = "./src/pages",
    }: {
        globPattern?: string;
        template?: string;
        templateTitleString?: string;
        templateDescriptionString?: string;
        templateContentString?: string;
        outputFolder?: string;
    },
): Promise<Map<string, string>> {
    await cleanupOutputFolder(outputFolder);

    const markdownFiles = await glob(globPattern);

    let metaData = {};
    const md = markdownit(
        {
            html: true,
        },
    ).use(markdowItFrontMatter, (frontMatter) => {
        metaData = parse(frontMatter);
    });

    const templateFile = await fs.readFile(template, "utf-8");

    const result = new Map<string, string>();
    for (const file of markdownFiles) {
        let fileContent = await fs.readFile(file, "utf-8");
        if (file.endsWith(".md")) {
            fileContent = md.render(fileContent);
        }

        const output = templateFile.replace(
            templateTitleString,
            metaData.title,
        ).replace(
            templateDescriptionString,
            metaData.description,
        ).replace(
            templateContentString,
            fileContent,
        );

        const fileBasename = basename(file)
            .replace(/\.md$/, "")
            .replace(/\.html$/, "");
        const outputFilename = `${outputFolder}/${fileBasename}.html`;
        await fs.writeFile(outputFilename, output, "utf-8");

        result[fileBasename] = outputFilename;
        console.log(`Generated ${outputFilename}`);
    }
    return result;
}

async function cleanupOutputFolder(
    outputFolder: string,
): Promise<void> {
    // Get the files as an array

    await fs.mkdir(outputFolder, { recursive: true });

    const files = await fs.readdir(outputFolder);

    // Loop them all with the new for...of
    for (const file of files) {
        if (["pages-layout.html", "pages.scss"].includes(file)) {
            // Skip non-generated files
            continue;
        }

        // Get the full paths
        const filePath = path.join(outputFolder, file);

        // Stat the file to see if we have a file or dir
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
            fs.rm(filePath);
        } else if (stat.isDirectory()) {
            cleanupOutputFolder(filePath);
        }
    }
}
