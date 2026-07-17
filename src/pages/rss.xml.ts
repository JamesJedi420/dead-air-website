import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { entryUrl } from "../lib/archive";

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("Site URL is required to generate RSS. Set `site` in astro.config.*");
  }

  const stories = (await getCollection("stories"))
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => Number(b.data.date ?? 0) - Number(a.data.date ?? 0));

  return rss({
    title: "The Dead Air Archive",
    description: "Public story updates from The Dead Air Archive.",
    site: context.site,
    items: stories.map((story) => ({
      title: story.data.title,
      description: story.data.summary,
      pubDate: story.data.date,
      link: entryUrl("stories", story),
    })),
  });
}
