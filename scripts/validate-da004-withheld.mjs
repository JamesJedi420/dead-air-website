import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const materializedSource = path.join(root, "src", "content", "stories", "da-004-close-enough-to-recognize.md");
const textExtensions = new Set([".html", ".xml", ".json", ".txt", ".js", ".css", ".map"]);
const forbiddenValues = [
  "DA-004",
  "Close Enough to Recognize",
  "da-004-close-enough-to-recognize",
  "A paranormal videographer brings his skeptical father to a mountain hotel. Then the building repeats a knock pattern no one else should know.",
  "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.",
  "Neither of them named what had made the rhythm.",
];

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath);
    else if (entry.isFile()) files.push(entryPath);
  }
};

if (!(await stat(outputDirectory)).isDirectory()) throw new Error("Astro output directory dist was not created.");
if (!(await stat(materializedSource)).isFile()) throw new Error("DA-004 withheld website source was not materialized before build.");

const source = await readFile(materializedSource, "utf8");
for (const expected of [
  "slug: da-004-close-enough-to-recognize",
  "title: Close Enough to Recognize",
  "status: withheld",
  "draft: true",
  "previewOnly: true",
  "## 1. Arrival",
  "## 10. Raw Audio",
]) {
  if (!source.includes(expected)) throw new Error(`DA-004 withheld source is missing ${JSON.stringify(expected)}.`);
}
if (/publicationDate:/i.test(source)) throw new Error("DA-004 withheld source must not contain a publication date.");
if (/coverImage:|coverAlt:/i.test(source)) throw new Error("DA-004 withheld source must not wire a release image before the withheld-output gate closes.");

await walk(outputDirectory);
const failures = [];
for (const filePath of files) {
  const relativePath = path.relative(outputDirectory, filePath).replaceAll(path.sep, "/");
  const normalizedPath = relativePath.toLowerCase();
  if (normalizedPath.includes("da-004") || normalizedPath.includes("close-enough-to-recognize")) {
    failures.push(`${relativePath}: withheld route or asset path generated`);
  }
  if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;
  const content = await readFile(filePath, "utf8");
  for (const forbiddenValue of forbiddenValues) {
    if (content.includes(forbiddenValue)) failures.push(`${relativePath}: contains ${JSON.stringify(forbiddenValue)}`);
  }
}

if (failures.length > 0) throw new Error(`DA-004 withheld-output validation failed:\n${failures.join("\n")}`);

console.log(`DA-004 withheld-output validation PASS across ${files.length} deployed files: no story route, title, slug, excerpt/body fingerprint, cover/release asset path, index/search reference, RSS item, sitemap entry, taxonomy/related-entry artifact, or other reader-facing leakage detected.`);
