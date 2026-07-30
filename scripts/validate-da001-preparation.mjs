import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "src", "data", "da-001-release-preparation.json");
const reservationsPath = path.join(root, "src", "data", "narrative-timeline-reservations.json");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourcePath = path.join(root, ...manifest.source.path.split("/"));
const successorPath = path.join(root, ...manifest.continuity.successorPath.split("/"));
const source = await readFile(sourcePath, "utf8");
const successor = await readFile(successorPath, "utf8");
const reservations = JSON.parse(await readFile(reservationsPath, "utf8"));

const failures = [];
const fail = (message) => failures.push(message);

const extractFrontmatter = (content, label) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    fail(`${label}: missing YAML frontmatter`);
    return { frontmatter: "", body: content, match: "" };
  }
  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
    match: match[0],
  };
};

const stripMatchingQuotes = (value) => {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value.at(-1);
  return first === last && (first === '"' || first === "'") ? value.slice(1, -1) : value;
};

const normalizeScalar = (rawValue) => {
  let value = rawValue.trim();
  if (!value.startsWith('"') && !value.startsWith("'")) {
    value = value.replace(/\s+#.*$/, "").trim();
  }
  return stripMatchingQuotes(value);
};

const readScalar = (frontmatter, key) => {
  const line = frontmatter
    .split(/\r?\n/)
    .find((candidate) => new RegExp(`^${key}:`).test(candidate));
  if (!line) return undefined;
  return normalizeScalar(line.slice(line.indexOf(":") + 1));
};

const readBlockList = (frontmatter, key, label) => {
  const lines = frontmatter.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => new RegExp(`^${key}:`).test(line));
  if (startIndex < 0) {
    fail(`${label}: missing ${key}`);
    return [];
  }

  const headerValue = normalizeScalar(lines[startIndex].slice(lines[startIndex].indexOf(":") + 1));
  if (/^\[\s*\]$/.test(headerValue)) return [];
  if (headerValue) {
    fail(`${label}: ${key} must be a block list or []`);
    return [];
  }

  const values = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s][^:]*:/.test(line)) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const match = line.match(/^\s*-\s+(.+)$/);
    if (!match) {
      fail(`${label}: unsupported ${key} list syntax ${JSON.stringify(line.trim())}`);
      continue;
    }
    values.push(normalizeScalar(match[1]));
  }
  return values;
};

const readRelationList = (frontmatter, key, label) => {
  const lines = frontmatter.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => new RegExp(`^${key}:`).test(line));
  if (startIndex < 0) {
    fail(`${label}: missing ${key}`);
    return [];
  }

  const headerValue = normalizeScalar(lines[startIndex].slice(lines[startIndex].indexOf(":") + 1));
  if (/^\[\s*\]$/.test(headerValue)) return [];
  if (headerValue) {
    fail(`${label}: ${key} must be a block list or []`);
    return [];
  }

  const relations = [];
  let current;
  const finishCurrent = () => {
    if (!current) return;
    if (!current.collection || !current.slug) {
      fail(`${label}: ${key} relation must include collection and slug`);
    } else {
      relations.push(current);
    }
    current = undefined;
  };

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s][^:]*:/.test(line)) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const itemMatch = line.match(/^\s*-\s+(collection|slug):\s*(.+)$/);
    if (itemMatch) {
      finishCurrent();
      current = { [itemMatch[1]]: normalizeScalar(itemMatch[2]) };
      continue;
    }

    const propertyMatch = line.match(/^\s+(collection|slug):\s*(.+)$/);
    if (propertyMatch && current) {
      if (current[propertyMatch[1]]) {
        fail(`${label}: ${key} relation repeats ${propertyMatch[1]}`);
      } else {
        current[propertyMatch[1]] = normalizeScalar(propertyMatch[2]);
      }
      continue;
    }

    fail(`${label}: unsupported ${key} relation syntax ${JSON.stringify(line.trim())}`);
  }

  finishCurrent();
  return relations;
};

const gitBlobSha1 = (content) => createHash("sha1")
  .update(Buffer.from(`blob ${Buffer.byteLength(content, "utf8")}\0`, "utf8"))
  .update(content, "utf8")
  .digest("hex");

const sourceRecord = extractFrontmatter(source, "DA-001 source");
const successorRecord = extractFrontmatter(successor, "DA-002 successor");

if (manifest.slug !== "da-001-the-building-keeps-the-hour") fail("Manifest slug is not DA-001.");
if (manifest.title !== "The Building Keeps the Hour") fail("Manifest title is not the approved DA-001 title.");
if (manifest.releaseState.status !== "withheld") fail("DA-001 preparation must remain withheld.");
if (manifest.releaseState.draft !== true) fail("DA-001 preparation must remain draft true.");
if (manifest.releaseState.publicationDate !== null) fail("DA-001 publication date must remain unset before release approval.");
if (manifest.releaseState.requiresSeparateApproval !== true) fail("DA-001 must require separate publication approval.");

const actualSourceSha = gitBlobSha1(source);
if (actualSourceSha !== manifest.source.gitBlobSha1) {
  fail(`DA-001 source integrity failed: expected Git blob ${manifest.source.gitBlobSha1}, received ${actualSourceSha}`);
}

const sourceSlug = readScalar(sourceRecord.frontmatter, "slug");
const sourceTitle = readScalar(sourceRecord.frontmatter, "title");
const sourceStatus = readScalar(sourceRecord.frontmatter, "status");
const sourceDraft = readScalar(sourceRecord.frontmatter, "draft");
if (sourceSlug !== manifest.slug) fail(`DA-001 source slug mismatch: ${sourceSlug ?? "missing"}`);
if (sourceTitle !== manifest.title) fail(`DA-001 source title mismatch: ${sourceTitle ?? "missing"}`);
if (sourceStatus !== manifest.releaseState.status) fail(`DA-001 must remain withheld, received ${sourceStatus ?? "missing"}`);
if (sourceDraft !== String(manifest.releaseState.draft)) fail(`DA-001 must remain draft true, received ${sourceDraft ?? "missing"}`);

for (const forbiddenKey of [
  "publicationDate",
  "timelineOrder",
  "timelineLabel",
  "sourceOrder",
  "datePrecision",
  "chronologyNote",
  "follows",
  "precedes",
]) {
  if (new RegExp(`^${forbiddenKey}:`, "m").test(sourceRecord.frontmatter)) {
    fail(`DA-001 controlled source contains premature release metadata: ${forbiddenKey}`);
  }
}

const sourceHeadings = [...sourceRecord.body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
const expectedSourceHeadings = manifest.sections.map((section) => section.source);
if (sourceHeadings.length !== expectedSourceHeadings.length) {
  fail(`DA-001 expected ${expectedSourceHeadings.length} source sections, found ${sourceHeadings.length}`);
}
for (let index = 0; index < expectedSourceHeadings.length; index += 1) {
  if (sourceHeadings[index] !== expectedSourceHeadings[index]) {
    fail(`DA-001 source heading ${index + 1} expected ${JSON.stringify(expectedSourceHeadings[index])}, received ${JSON.stringify(sourceHeadings[index])}`);
  }
}

for (const anchor of manifest.continuity.requiredBodyAnchors) {
  const occurrences = sourceRecord.body.split(anchor).length - 1;
  if (occurrences !== 1) fail(`DA-001 body anchor expected once, found ${occurrences}: ${JSON.stringify(anchor)}`);
}
if (sourceRecord.body.length < 120000) {
  fail(`DA-001 manuscript body is unexpectedly short (${sourceRecord.body.length} characters)`);
}
if (/^##\s+Fictionalization and Source Note\s*$/m.test(sourceRecord.body)) {
  fail("DA-001 contains a manuscript-level source-note heading; the shared story note must remain authoritative.");
}

for (const [field, values] of [
  ["characters", manifest.continuity.sharedCharacters],
  ["locations", manifest.continuity.sharedLocations],
  ["objects", manifest.continuity.sharedObjects],
  ["mysteries", manifest.continuity.sharedMysteries],
]) {
  const sourceValues = new Set(readBlockList(sourceRecord.frontmatter, field, "DA-001 source"));
  const successorValues = new Set(readBlockList(successorRecord.frontmatter, field, "DA-002 successor"));
  for (const value of values) {
    if (!sourceValues.has(value)) fail(`DA-001 source is missing shared ${field} value ${JSON.stringify(value)}`);
    if (!successorValues.has(value)) fail(`DA-002 successor is missing shared ${field} value ${JSON.stringify(value)}`);
  }
}

const chronology = manifest.chronology;
if (chronology.timelineOrder !== 1) fail("DA-001 timelineOrder must remain 1.");
if (chronology.timelineLabel !== "Initial Bellweather investigation") fail("DA-001 timeline label changed.");
if (chronology.sourceOrder !== "Original investigation") fail("DA-001 source-order label changed.");
if (chronology.datePrecision !== "relative") fail("DA-001 date precision must remain relative.");
if (!Array.isArray(chronology.follows) || chronology.follows.length !== 0) fail("DA-001 follows must remain an explicit empty list.");
if (
  !Array.isArray(chronology.precedes) ||
  chronology.precedes.length !== 1 ||
  chronology.precedes[0]?.collection !== "stories" ||
  chronology.precedes[0]?.slug !== "da-002-the-name-in-the-room"
) {
  fail("DA-001 must explicitly precede DA-002.");
}

const reservation = reservations.find(
  (entry) => entry.collection === "stories" && entry.slug === manifest.slug,
);
if (!reservation) {
  fail("DA-001 chronology reservation is missing.");
} else {
  for (const key of ["title", "timelineOrder", "timelineLabel", "sourceOrder"]) {
    const expected = key === "title" ? manifest.title : chronology[key];
    if (reservation[key] !== expected) {
      fail(`DA-001 reservation ${key} expected ${JSON.stringify(expected)}, received ${JSON.stringify(reservation[key])}`);
    }
  }
}

if (readScalar(successorRecord.frontmatter, "timelineOrder") !== "2") {
  fail("DA-002 successor is not materialized at timelineOrder 2 before DA-001 preparation validation.");
}
const successorFollows = readRelationList(successorRecord.frontmatter, "follows", "DA-002 successor");
if (
  successorFollows.length !== 1 ||
  successorFollows[0]?.collection !== "stories" ||
  successorFollows[0]?.slug !== manifest.slug
) {
  fail("DA-002 successor does not explicitly follow DA-001.");
}

const chronologyYaml = [
  `timelineOrder: ${chronology.timelineOrder}`,
  `timelineLabel: ${chronology.timelineLabel}`,
  `sourceOrder: ${chronology.sourceOrder}`,
  `datePrecision: ${chronology.datePrecision}`,
  `chronologyNote: ${chronology.chronologyNote}`,
  "follows: []",
  "precedes:",
  ...chronology.precedes.flatMap((relation) => [
    `  - collection: ${relation.collection}`,
    `    slug: ${relation.slug}`,
  ]),
].join("\n");

let candidate = source
  .replace(/^status: withheld$/m, "status: active")
  .replace(/^draft: true$/m, "draft: false");
const candidateFrontmatterEnd = candidate.indexOf("\n---\n");
if (candidateFrontmatterEnd < 0) {
  fail("DA-001 candidate frontmatter boundary could not be located.");
} else {
  candidate = `${candidate.slice(0, candidateFrontmatterEnd)}\n${chronologyYaml}${candidate.slice(candidateFrontmatterEnd)}`;
}

for (const [index, section] of manifest.sections.entries()) {
  const sourceHeading = `## ${section.source}`;
  const publishedHeading = `## ${section.published}`;
  const occurrences = candidate.split(sourceHeading).length - 1;
  if (occurrences !== 1) {
    fail(`DA-001 candidate expected one source heading ${JSON.stringify(sourceHeading)}, found ${occurrences}`);
  } else {
    candidate = candidate.replace(sourceHeading, publishedHeading);
  }
  if (section.published !== `${index + 1}. ${section.source.replace(/^Scene\s+\d+\s+—\s+/, "")}`) {
    fail(`DA-001 manifest published heading ${index + 1} is not the approved numeric transform.`);
  }
}

if (/^##\s+Scene\s+\d+/m.test(candidate)) fail("DA-001 publication candidate retains a Scene heading.");
const candidateRecord = extractFrontmatter(candidate, "DA-001 publication candidate");
const publishedHeadings = [...candidateRecord.body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
const expectedPublishedHeadings = manifest.sections.map((section) => section.published);
if (JSON.stringify(publishedHeadings) !== JSON.stringify(expectedPublishedHeadings)) {
  fail("DA-001 publication candidate headings are missing, reordered, or changed.");
}
if (readScalar(candidateRecord.frontmatter, "status") !== "active") fail("DA-001 candidate status is not active.");
if (readScalar(candidateRecord.frontmatter, "draft") !== "false") fail("DA-001 candidate draft is not false.");
if (readScalar(candidateRecord.frontmatter, "timelineOrder") !== "1") fail("DA-001 candidate timelineOrder is not 1.");
if (/^publicationDate:/m.test(candidateRecord.frontmatter)) fail("DA-001 candidate must not invent a publication date during preparation.");

let reverted = candidate;
for (const section of [...manifest.sections].reverse()) {
  reverted = reverted.replace(`## ${section.published}`, `## ${section.source}`);
}
reverted = reverted
  .replace(`\n${chronologyYaml}`, "")
  .replace(/^status: active$/m, "status: withheld")
  .replace(/^draft: false$/m, "draft: true");
if (reverted !== source) {
  fail("DA-001 publication candidate changes content outside the approved metadata and heading transforms.");
}

if (failures.length > 0) {
  throw new Error(`DA-001 release-preparation validation failed:\n${failures.join("\n")}`);
}

console.log(
  `DA-001 release preparation passed: controlled manuscript locked at Git blob ${actualSourceSha}; ${manifest.sections.length} source scenes map deterministically to numbered public sections; chronology remains reserved at position 1 before DA-002; shared character, location, object, and mystery continuity is intact; publication date and separate release approval remain required.`,
);
