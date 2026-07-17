import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { entryUrl, isPublished } from "../lib/archive";

export async function GET(context: APIContext) {
  const site = context.site;
  if (!site) {
    throw new Error("Site URL is required to generate RSS. Set `site` in astro.config.*");
  }

  const stories = (await getCollection("stories"))
    .filter(isPublished)
    .sort((a, b) =>
      Number(b.data.publicationDate ?? b.data.date ?? 0) -
      Number(a.data.publicationDate ?? a.data.date ?? 0)
    );

  return rss({
    title: "The Dead Air Archive",
    description: "Public story updates from The Dead Air Archive.",
    site,
    items: stories.map((story) => ({
      title: story.data.title,
      description: story.data.summary,
      pubDate: story.data.publicationDate ?? story.data.date,
      link: entryUrl("stories", story),
    })),
  });
}
