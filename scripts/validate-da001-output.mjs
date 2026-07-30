import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const manifestPath = path.join(root, "src", "data", "da-001-release-preparation.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const privateSourcePath = path.join(root, "src", "manuscripts", "da-001", "source.md");
const publicContentPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const route = `/stories/${manifest.slug}/`;
const failures = [];
const fail = (message) => failures.push(message);
const textExtensions = new Set([".html", ".xml", ".json", ".txt", ".js", ".css", ".map"]);

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

if (manifest.source?.storage !== "private-controlled-source") {
  fail("DA-001 output gate requires private-controlled-source storage.");
}
if (manifest.source?.repositoryPath !== null) {
  fail("DA-001 output gate found a repository source path.");
}
if (manifest.releaseState?.status !== "withheld") {
  fail(`DA-001 output gate expected status withheld, received ${manifest.releaseState?.status ?? "missing"}.`);
}
if (manifest.releaseState?.draft !== true) {
  fail(`DA-001 output gate expected draft true, received ${String(manifest.releaseState?.draft)}.`);
}
if (manifest.releaseState?.publicationDate !== null) {
  fail("DA-001 output gate requires an unset publication date.");
}
if (await exists(privateSourcePath)) {
  fail("DA-001 manuscript exists under src/manuscripts/.");
}
if (await exists(publicContentPath)) {
  fail("DA-001 public content entry exists before publication approval.");
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

const forbiddenValues = [manifest.title, manifest.slug, route];
for (const filePath of files) {
  const relativePath = path.relative(outputDirectory, filePath).replaceAll(path.sep, "/");
  const normalizedPath = relativePath.toLowerCase();
  if (normalizedPath.includes(manifest.slug) || normalizedPath.includes("the-building-keeps-the-hour")) {
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
  `DA-001 withheld-output validation passed across ${files.length} deployed files: no manuscript exists in the public repository, and no route, title, slug, RSS item, sitemap entry, search/index reference, or timeline entry was deployed.`,
);
