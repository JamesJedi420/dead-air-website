import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { entrySlug } from "../lib/archive";
import { getPublishedCollection } from "../lib/loadArchive";

export async function GET(context: APIContext) {
  const stories = (await getPublishedCollection("stories"))
    .filter((entry) => !entry.data.previewOnly && Boolean(entry.data.publicationDate ?? entry.data.date))
    .sort((a, b) => {
      const aDate = Number(a.data.publicationDate ?? a.data.date ?? 0);
      const bDate = Number(b.data.publicationDate ?? b.data.date ?? 0);
      return bDate - aDate;
    });

  return rss({
    title: "Dead Air",
    description: "Literary paranormal horror told through case files, recorded evidence, haunted places, and unresolved investigations.",
    site: context.site ?? "https://dead-air-website.netlify.app",
    items: stories.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.publicationDate ?? entry.data.date,
      link: `/stories/${entrySlug(entry)}/`,
      categories: entry.data.tags,
    })),
    customData: "<language>en-us</language>",
  });
}
