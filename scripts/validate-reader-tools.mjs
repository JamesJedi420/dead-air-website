import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const storiesRoot = resolve(root, "dist/stories");

if (!existsSync(storiesRoot)) {
  throw new Error("Missing dist/stories output for reader-tools validation.");
}

const storyPages = readdirSync(storiesRoot)
  .map((name) => resolve(storiesRoot, name, "index.html"))
  .filter((path) => existsSync(path) && statSync(path).isFile());

if (storyPages.length === 0) {
  throw new Error("No rendered story pages found for reader-tools validation.");
}

for (const pagePath of storyPages) {
  const html = readFileSync(pagePath, "utf8");
  const isStory = html.includes('itemtype="https://schema.org/ShortStory"') || html.includes('"@type":"ShortStory"');
  if (!isStory) continue;

  const required = [
    "data-story-reader-tools",
    "data-story-body",
    "dead-air:reading-progress:v1:",
    "data-resume-story",
    "data-start-over",
    "Your place is saved on this device as you read.",
  ];

  for (const marker of required) {
    if (!html.includes(marker)) {
      throw new Error(`Reader-tools output missing ${marker} in ${pagePath}.`);
    }
  }

  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
  const hasShareButton = /<button\b[^>]*\bdata-share-story(?:\s|=|>)[^>]*>/i.test(html);

  if (noindex && hasShareButton) {
    throw new Error(`Preview/noindex story must not expose the share control: ${pagePath}.`);
  }
  if (!noindex && !hasShareButton) {
    throw new Error(`Published story is missing the share control: ${pagePath}.`);
  }
}

console.log(`Reader tools validation PASS: ${storyPages.length} rendered story pages checked for local resume state, canonical sharing, and preview share suppression.`);
