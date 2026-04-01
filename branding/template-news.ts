import { resolve } from "path";
import fs from "node:fs/promises";

import { basename } from "node:path";
import glob from "fast-glob";
import markdownit from "markdown-it";
import markdowItFrontMatter from "markdown-it-front-matter";
import { parse } from "yaml";
import { formatDate } from "./template-pages";

export interface NewsItem {
    title: string;
    date: string;
    dateFormatted: string;
    excerpt: string;
    url: string;
    imageUrl: string;
}
export async function loadNewsItems(
    globPattern = "./pages/news/*.md",
): Promise<NewsItem[]> {
    const files = await glob(globPattern);
    const items: NewsItem[] = [];

    for (const file of files) {
        let frontMatter: Record<string, string> = {};
        const md = markdownit({ html: true }).use(
            markdowItFrontMatter,
            (fm: any) => {
                frontMatter = parse(fm);
            },
        );
        const content = await fs.readFile(file, "utf-8");
        md.render(content);

        const slug = basename(file).replace(/\.md$/, "");

        items.push({
            title: frontMatter.title ?? "",
            date: frontMatter.date,
            dateFormatted: formatDate(frontMatter.date),
            excerpt: frontMatter.excerpt ?? "",
            url: frontMatter.url ?? `/pages/${slug}.html`,
            imageUrl: frontMatter.imageId
                ? `https://natuurdata.inbo.be/image-service/image/${frontMatter.imageId}/large`
                : "",
        });
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
}

export const generateNewsPartial = async () => {
    const newsItems = await loadNewsItems();
    const newsCardsHtml =
        newsItems.length > 0
            ? newsItems
                  .map(
                      (item) =>
                          `<article class="news-card">
                    <div class="news-card-body">
                        <span class="news-card-date">${item.dateFormatted}</span>
                        <h3 class="news-card-title"><a href="${item.url}">${item.title}</a></h3>
                        <p class="news-card-excerpt">${item.excerpt}</p>
                    </div>
                </article>`,
                  )
                  .join("\n                ")
            : "<p>Geen nieuws beschikbaar.</p>";
    await fs.writeFile(
        resolve(__dirname, "src/index/news-cards.html"),
        newsCardsHtml,
        "utf-8",
    );
};
