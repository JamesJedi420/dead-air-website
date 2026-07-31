import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gunzipSync } from "node:zlib";
import {
  DA001_APPROVED_REVISION,
  extractDa001CanonicalBody,
  verifyApprovedDa001Export,
} from "./lib/da001-canonicalizer-v1.mjs";

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const outputPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const enabled = process.env.DA001_PRIVATE_PREVIEW === "1";

const removeGeneratedEntry = async () => rm(outputPath, { force: true });

if (!enabled) {
  await removeGeneratedEntry();
  console.log("DA-001 private preview materializer inactive; no content entry generated.");
  process.exit(0);
}

const expectedBranch = process.env.DA001_PRIVATE_PREVIEW_BRANCH ?? manifest.preview?.branch;
if (process.env.CONTEXT !== "deploy-preview") {
  throw new Error(`DA-001 private preview requires Netlify deploy-preview context, received ${process.env.CONTEXT ?? "missing"}.`);
}
if (!expectedBranch || process.env.HEAD !== expectedBranch) {
  throw new Error(`DA-001 private preview requires head branch ${expectedBranch ?? "missing"}, received ${process.env.HEAD ?? "missing"}.`);
}

const chunkCount = Number.parseInt(process.env.DA001_PRIVATE_SOURCE_CHUNK_COUNT ?? "", 10);
if (!Number.isSafeInteger(chunkCount) || chunkCount < 1 || chunkCount > 100) {
  throw new Error("DA-001 private preview source chunk count is missing or invalid.");
}
const chunks = [];
for (let index = 0; index < chunkCount; index += 1) {
  const key = `DA001_PRIVATE_SOURCE_GZIP_B64_${String(index).padStart(3, "0")}`;
  const value = process.env[key];
  if (!value) throw new Error(`DA-001 private preview source chunk ${key} is missing.`);
  chunks.push(value);
}
const unexpectedChunkKey = `DA001_PRIVATE_SOURCE_GZIP_B64_${String(chunkCount).padStart(3, "0")}`;
if (process.env[unexpectedChunkKey]) {
  throw new Error(`DA-001 private preview received an unexpected extra chunk ${unexpectedChunkKey}.`);
}

let rawBytes;
try {
  rawBytes = gunzipSync(Buffer.from(chunks.join(""), "base64"));
} catch (error) {
  throw new Error(`DA-001 private preview source could not be decoded: ${error instanceof Error ? error.message : String(error)}`);
}
const rawSha256 = createHash("sha256").update(rawBytes).digest("hex");
if (rawSha256 !== manifest.source.approvedPrivateExportSha256) {
  throw new Error(`DA-001 private export SHA-256 expected ${manifest.source.approvedPrivateExportSha256}, received ${rawSha256}.`);
}

const rawText = rawBytes.toString("utf8");
const { canonicalText, canonicalSha256, wordCount } = verifyApprovedDa001Export(rawText);
let body = extractDa001CanonicalBody(canonicalText);
for (const section of manifest.sections) {
  const sourceHeading = `## ${section.source}`;
  const publishedHeading = `## ${section.published}`;
  const occurrences = body.split(sourceHeading).length - 1;
  if (occurrences !== 1) {
    throw new Error(`DA-001 private preview expected exactly one heading ${JSON.stringify(sourceHeading)}, found ${occurrences}.`);
  }
  body = body.replace(sourceHeading, publishedHeading);
}
if (/^##\s+Scene\s+\d+/m.test(body)) {
  throw new Error("DA-001 private preview retained a private-source scene heading.");
}

const yamlScalar = (value) => JSON.stringify(value);
const yamlList = (key, values) => [
  `${key}:`,
  ...values.map((value) => `  - ${yamlScalar(value)}`),
].join("\n");
const yamlRelations = (key, relations) => {
  if (relations.length === 0) return `${key}: []`;
  return [
    `${key}:`,
    ...relations.flatMap((relation) => [
      `  - collection: ${yamlScalar(relation.collection)}`,
      `    slug: ${yamlScalar(relation.slug)}`,
    ]),
  ].join("\n");
};

const metadata = manifest.preview.metadata;
const frontmatter = [
  "---",
  `slug: ${yamlScalar(manifest.slug)}`,
  `title: ${yamlScalar(manifest.title)}`,
  `summary: ${yamlScalar(metadata.summary)}`,
  "status: active",
  `classification: ${yamlScalar(metadata.classification)}`,
  `readingTime: ${yamlScalar(metadata.readingTime)}`,
  `revision: ${yamlScalar(DA001_APPROVED_REVISION)}`,
  `timelineOrder: ${manifest.chronology.timelineOrder}`,
  `timelineLabel: ${yamlScalar(manifest.chronology.timelineLabel)}`,
  `sourceOrder: ${yamlScalar(manifest.chronology.sourceOrder)}`,
  `datePrecision: ${yamlScalar(manifest.chronology.datePrecision)}`,
  `chronologyNote: ${yamlScalar(manifest.chronology.chronologyNote)}`,
  yamlRelations("follows", manifest.chronology.follows),
  yamlRelations("precedes", manifest.chronology.precedes),
  `canonicalStatus: ${yamlScalar(metadata.canonicalStatus)}`,
  "draft: false",
  yamlList("tags", metadata.tags),
  yamlList("phenomenon", metadata.phenomenon),
  yamlList("evidenceType", metadata.evidenceType),
  yamlList("locations", metadata.locations),
  yamlList("contentWarnings", metadata.contentWarnings),
  yamlList("contentNotes", metadata.contentNotes),
  yamlList("cases", metadata.cases),
  yamlList("characters", metadata.characters),
  yamlList("objects", metadata.objects),
  yamlList("mysteries", metadata.mysteries),
  "---",
  "",
  body,
].join("\n");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, frontmatter, "utf8");
console.log(
  `Materialized password-gated DA-001 private preview from ${chunkCount} secret chunks (${rawSha256} raw; ${canonicalSha256} canonical; ${wordCount} words).`,
);
