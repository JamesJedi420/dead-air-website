import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const manifestPath = path.join(root, "src", "data", "da-001-release-preparation.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourcePath = path.join(root, ...manifest.source.path.split("/"));
const publicContentPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const source = await readFile(sourcePath, "utf8");

const failures = [];
const fail = (message) => failures.push(message);
const textExtensions = new Set([".html", ".xml", ".json", ".txt", ".js", ".css", ".map"]);
const route = `/stories/${manifest.slug}/`;

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

if (!manifest.source.path.startsWith("src/manuscripts/da-001/")) {
  fail(`DA-001 controlled source must remain outside the content collection, received ${manifest.source.path}.`);
}
if (await exists(publicContentPath)) {
  fail(`DA-001 content entry exists before publication approval: ${path.relative(root, publicContentPath)}.`);
}

const readScalar = (frontmatter, key) =>
  frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();

const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
if (!frontmatterMatch) {
  fail("DA-001 controlled source is missing YAML frontmatter.");
} else {
  const frontmatter = frontmatterMatch[1];
  const status = readScalar(frontmatter, "status");
  const draft = readScalar(frontmatter, "draft");
  if (status !== "withheld") fail(`DA-001 output gate expected status withheld, received ${status ?? "missing"}.`);
  if (draft !== "true") fail(`DA-001 output gate expected draft true, received ${draft ?? "missing"}.`);
}

if (!(await stat(outputDirectory)).isDirectory()) {
  throw new Error("Astro output directory dist was not created.");
}

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath);
    else if (entry.isFile()) files.push(entryPath);
  }
};
await walk(outputDirectory);

const forbiddenValues = [
  manifest.title,
  manifest.slug,
  route,
  "At twenty minutes past three, Bellweather High still belonged to its machinery.",
  "The long key struck last.",
];

for (const filePath of files) {
  const relativePath = path.relative(outputDirectory, filePath).replaceAll(path.sep, "/");
  const normalizedPath = relativePath.toLowerCase();
  if (
    normalizedPath.includes(manifest.slug) ||
    normalizedPath.includes("the-building-keeps-the-hour")
  ) {
    fail(`${relativePath}: withheld DA-001 route or asset path generated`);
  }
  if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;
  const content = await readFile(filePath, "utf8");
  for (const forbiddenValue of forbiddenValues) {
    if (content.includes(forbiddenValue)) {
      fail(`${relativePath}: contains withheld DA-001 value ${JSON.stringify(forbiddenValue)}`);
    }
  }
}

const outputPath = (relativePath) => path.join(outputDirectory, ...relativePath.split("/"));
const storyHtmlPath = outputPath(`stories/${manifest.slug}/index.html`);
if (await exists(storyHtmlPath)) fail(`Withheld DA-001 route was generated at ${route}.`);

const rssPath = outputPath("rss.xml");
if (!(await exists(rssPath))) {
  fail("RSS output missing.");
} else {
  const rss = await readFile(rssPath, "utf8");
  if (rss.includes(manifest.title) || rss.includes(route)) fail("RSS includes withheld DA-001.");
}

const sitemapCandidates = [
  outputPath("sitemap-0.xml"),
  outputPath("sitemap-index.xml"),
  outputPath("sitemap.xml"),
];
const availableSitemaps = [];
for (const candidate of sitemapCandidates) if (await exists(candidate)) availableSitemaps.push(candidate);
if (availableSitemaps.length === 0) {
  fail("Sitemap output missing.");
} else {
  const sitemapText = (await Promise.all(availableSitemaps.map((file) => readFile(file, "utf8")))).join("\n");
  if (sitemapText.includes(route)) fail("Sitemap includes withheld DA-001.");
}

const timelinePath = outputPath("timeline/index.html");
if (!(await exists(timelinePath))) {
  fail("Narrative timeline route missing.");
} else {
  const timeline = await readFile(timelinePath, "utf8");
  if (timeline.includes(manifest.title) || timeline.includes(route)) fail("Timeline exposes withheld DA-001.");
  if (!timeline.includes("Archive position 2") || !timeline.includes("The Name in the Room")) {
    fail("Timeline no longer presents published DA-002 at archive position 2 while DA-001 remains withheld.");
  }
}

if (failures.length > 0) {
  throw new Error(`DA-001 withheld-output validation failed:\n${failures.join("\n")}`);
}

console.log(
  `DA-001 withheld-output validation passed across ${files.length} deployed files: controlled source remains outside Astro's content collection, and no route, title, slug, excerpt, RSS, sitemap, index, or timeline leakage was detected; DA-002 remains publicly visible at archive position 2 until separate DA-001 publication approval.`,
);
