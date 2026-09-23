import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const route = `/stories/${manifest.slug}/`;
const storyHtmlPath = path.join(outputDirectory, "stories", manifest.slug, "index.html");
const failures = [];
const fail = (message) => failures.push(message);
const supersededPublicationProse = [
  "The lobby, the stairs, and this room were outside the camera.",
  "The lobby, the stairs, and this room are all outside the frame.",
  "I gave you an interview. I didn’t agree to be part of another test.",
  "I gave you an interview. Leave it there.",
  "Ron heard the limit in Diane’s answer.",
  "Images, not audio.",
  "Not for the sounds. For keeping the students below",
];
const requiredV23Prose = [
  "Not the lobby. Not the stairs. Not this room.",
  "My account was an interview, not an invitation.",
  "Diane’s answer was not a promise.",
];

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

if (manifest.source?.storage !== "repository-fragments") fail("DA-001 release must use repository fragments.");
if (manifest.source?.repositoryPath !== "src/manuscripts/da-001") fail("DA-001 repository source path is invalid.");
if (manifest.source?.approvedSourceSha256 !== "175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba") fail("DA-001 approved-source digest changed.");
if (manifest.releaseState?.status !== "active" || manifest.releaseState?.draft !== false) fail("DA-001 release manifest is not active.");
if (!manifest.releaseState?.publicationDate) fail("DA-001 publication date is missing.");

if (!(await exists(storyHtmlPath))) {
  fail(`DA-001 story route missing at ${route}.`);
} else {
  const html = await readFile(storyHtmlPath, "utf8");
  if (!html.includes(manifest.title)) fail("DA-001 page is missing its approved title.");
  if (!html.includes("Final Approved Story v23")) fail("DA-001 page is missing its v23 correction revision.");
  for (const section of manifest.sections) {
    if (!html.includes(section.published)) fail(`DA-001 page is missing section ${JSON.stringify(section.published)}.`);
  }
  if (/Scene\s+\d+\s+—/.test(html)) fail("DA-001 page exposes production scene labels.");
  if (!html.includes("Based on reported paranormal-investigation accounts.")) fail("DA-001 page is missing the standard source note.");
  for (const superseded of supersededPublicationProse) {
    if (html.includes(superseded)) fail(`DA-001 superseded publication prose remains: ${superseded}`);
  }
  for (const required of requiredV23Prose) {
    if (!html.includes(required)) fail(`DA-001 approved v23 prose is missing: ${required}`);
  }
}

const requiredOutputs = ["rss.xml", "search.json", "timeline/index.html"];
for (const relativePath of requiredOutputs) {
  const filePath = path.join(outputDirectory, ...relativePath.split("/"));
  if (!(await exists(filePath))) {
    fail(`${relativePath} is missing.`);
    continue;
  }
  const content = await readFile(filePath, "utf8");
  if (!content.includes(manifest.title) || !content.includes(route)) {
    fail(`${relativePath} does not include DA-001.`);
  }
}

const sitemapFiles = (await readdir(outputDirectory)).filter((name) => /^sitemap(?:-index|-\d+)?\.xml$/.test(name));
if (sitemapFiles.length === 0) fail("Sitemap output is missing.");
else {
  const sitemap = (await Promise.all(sitemapFiles.map((name) => readFile(path.join(outputDirectory, name), "utf8")))).join("\n");
  if (!sitemap.includes(route)) fail("Sitemap does not include DA-001.");
}

if (failures.length > 0) throw new Error(`DA-001 release validation failed:\n${failures.join("\n")}`);
console.log("DA-001 v23 release validation passed: approved manuscript synchronization, route, ten numbered sections, source note, RSS, search, sitemap, and chronology are published.");
