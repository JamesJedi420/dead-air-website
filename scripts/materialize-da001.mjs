import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-001");
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const outputPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const approvedSourceSha256 = "175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba";

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 12) {
  throw new Error(`Expected 12 DA-001 manuscript fragments, found ${sourceFiles.length}.`);
}

const sourceFragments = await Promise.all(
  sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")),
);
// The first GitHub Contents API write normalized two terminal newlines to one.
// Restore the approved split boundary before hashing and materialization.
sourceFragments[0] += "\n";
const approvedSource = sourceFragments.join("");

const actualSourceSha256 = sha256(approvedSource);
if (actualSourceSha256 !== approvedSourceSha256) {
  throw new Error(
    `DA-001 approved-source integrity check failed. Expected ${approvedSourceSha256}, received ${actualSourceSha256}.`,
  );
}

let body = approvedSource
  .replace(/^# \*\*﻿?The Building Keeps the Hour\*\*\r?\n+/u, "")
  .replace(/^## \*DA-001 — Final Approved Story v17\*\r?\n+/u, "");

for (const section of manifest.sections) {
  const sourceHeading = `# **${section.source}**`;
  const publishedHeading = `## ${section.published}`;
  const occurrences = body.split(sourceHeading).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one DA-001 heading ${JSON.stringify(sourceHeading)}, found ${occurrences}.`);
  }
  body = body.replace(sourceHeading, publishedHeading);
}

if (/^#\s+\*\*Scene\s+\d+/im.test(body) || /^##\s+Scene\s+\d+/im.test(body)) {
  throw new Error("A production scene label remained in the materialized DA-001 publication output.");
}

const scalar = (value) => JSON.stringify(value);
const list = (key, values) => [`${key}:`, ...values.map((value) => `  - ${scalar(value)}`)].join("\n");
const relations = (key, values) =>
  values.length === 0
    ? `${key}: []`
    : [
        `${key}:`,
        ...values.flatMap((value) => [
          `  - collection: ${scalar(value.collection)}`,
          `    slug: ${scalar(value.slug)}`,
        ]),
      ].join("\n");

const metadata = manifest.preview.metadata;
const frontmatter = [
  "---",
  `slug: ${scalar(manifest.slug)}`,
  `title: ${scalar(manifest.title)}`,
  `summary: ${scalar(metadata.summary)}`,
  "status: active",
  `classification: ${scalar(metadata.classification)}`,
  `readingTime: ${scalar(metadata.readingTime)}`,
  `revision: ${scalar(manifest.source.approvedRevision)}`,
  `publicationDate: ${manifest.releaseState.publicationDate}`,
  `timelineOrder: ${manifest.chronology.timelineOrder}`,
  `timelineLabel: ${scalar(manifest.chronology.timelineLabel)}`,
  `sourceOrder: ${scalar(manifest.chronology.sourceOrder)}`,
  `datePrecision: ${scalar(manifest.chronology.datePrecision)}`,
  `chronologyNote: ${scalar(manifest.chronology.chronologyNote)}`,
  relations("follows", manifest.chronology.follows),
  relations("precedes", manifest.chronology.precedes),
  `canonicalStatus: ${scalar(metadata.canonicalStatus)}`,
  "draft: false",
  list("tags", metadata.tags),
  list("phenomenon", metadata.phenomenon),
  list("evidenceType", metadata.evidenceType),
  list("locations", metadata.locations),
  list("contentWarnings", metadata.contentWarnings),
  list("contentNotes", metadata.contentNotes),
  list("cases", metadata.cases),
  list("characters", metadata.characters),
  list("objects", metadata.objects),
  list("mysteries", metadata.mysteries),
  "---",
  "",
].join("\n");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
console.log(
  `Materialized DA-001 Final Approved Story v17 for publication (${sha256(`${frontmatter}${body}`)}); approved source preserved (${actualSourceSha256}); standard source note supplied by the shared story template; public divisions rendered as numbered section headings; narrative chronology fixed at archive position 1 before DA-002.`,
);
