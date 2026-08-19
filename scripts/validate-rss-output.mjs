import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const storyDirectory = path.join(root, "src", "content", "stories");
const feedPath = path.join(root, "dist", "feed.xml");

let feed;
try {
  feed = await readFile(feedPath, "utf8");
} catch (error) {
  throw new Error(
    `RSS validation failed: dist/feed.xml is unavailable. Ensure the Astro build generated the feed before postbuild validation. (${error.message})`,
  );
}

if (!/<rss\b/i.test(feed) || !/<channel>/i.test(feed)) {
  throw new Error("RSS validation failed: dist/feed.xml is not a valid RSS channel document.");
}

if (!feed.includes("<title>Dead Air</title>")) {
  throw new Error("RSS validation failed: channel title is not Dead Air.");
}

const storyFiles = (await readdir(storyDirectory)).filter((name) => name.endsWith(".md"));
const eligible = [];
const ineligible = [];

const scalar = (frontmatter, key) => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  if (!match) return undefined;
  const value = match[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
};

for (const fileName of storyFiles) {
  const source = await readFile(path.join(storyDirectory, fileName), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) continue;

  const frontmatter = match[1];
  const slug = scalar(frontmatter, "slug") ?? fileName.replace(/\.md$/, "");
  const draft = scalar(frontmatter, "draft") === "true";
  const previewOnly = scalar(frontmatter, "previewOnly") === "true";
  const status = scalar(frontmatter, "status");
  const publicationDate = scalar(frontmatter, "publicationDate") ?? scalar(frontmatter, "date");
  const record = { slug, fileName };

  if (!draft && !previewOnly && status !== "withheld" && publicationDate) eligible.push(record);
  else ineligible.push(record);
}

const itemCount = (feed.match(/<item>/g) ?? []).length;
if (itemCount !== eligible.length) {
  throw new Error(`RSS validation failed: expected ${eligible.length} public story items, found ${itemCount}.`);
}

for (const { slug } of eligible) {
  const route = `/stories/${slug}/`;
  if (!feed.includes(route)) {
    throw new Error(`RSS validation failed: missing published story ${route}.`);
  }
}

for (const { slug } of ineligible) {
  const route = `/stories/${slug}/`;
  if (feed.includes(route)) {
    throw new Error(`RSS validation failed: non-public story leaked into feed: ${route}.`);
  }
}

console.log(`RSS output PASS — ${eligible.length} public story item(s); draft, withheld, preview-only, and undated entries excluded.`);
