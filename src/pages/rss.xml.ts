import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

const entryPath = (id: string) => id.replace(/\.md$/, "");

export async function GET(context: { site: URL }) {
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
      link: `/stories/${entryPath(story.id)}/`,
    })),
  });
}
