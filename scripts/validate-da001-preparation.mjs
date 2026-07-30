import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  DA001_APPROVED_CANONICAL_SHA256,
  DA001_APPROVED_DOCUMENT_TITLE,
  DA001_APPROVED_REVISION,
  DA001_APPROVED_SOURCE_DOCUMENT_ID,
  DA001_APPROVED_TITLE,
  DA001_APPROVED_WORD_COUNT,
  DA001_CANONICALIZATION_ID,
  DA001_SOURCE_SECTION_TITLES,
  DA001_WORD_PATTERN_SOURCE,
  sha256Utf8,
} from "./lib/da001-canonicalizer-v1.mjs";

const root = process.cwd();
const manifestPath = path.join(root, "src", "data", "da-001-release-preparation.json");
const attestationPath = path.join(root, "src", "data", "da-001-canonicalization-attestation.json");
const reservationsPath = path.join(root, "src", "data", "narrative-timeline-reservations.json");
const successorPath = path.join(root, "src", "content", "stories", "da-002-the-name-in-the-room.md");
const gitignorePath = path.join(root, ".gitignore");

const [manifest, attestation, reservations, successor, gitignore] = await Promise.all([
  readFile(manifestPath, "utf8").then(JSON.parse),
  readFile(attestationPath, "utf8").then(JSON.parse),
  readFile(reservationsPath, "utf8").then(JSON.parse),
  readFile(successorPath, "utf8"),
  readFile(gitignorePath, "utf8"),
]);

const failures = [];
const fail = (message) => failures.push(message);

const normalizeScalar = (rawValue) => {
  let value = rawValue.trim();
  if (!value.startsWith('"') && !value.startsWith("'")) value = value.replace(/\s+#.*$/, "").trim();
  if (value.length >= 2 && value[0] === value.at(-1) && (value[0] === '"' || value[0] === "'")) {
    return value.slice(1, -1);
  }
  return value;
};

const extractFrontmatter = (content, label) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    fail(`${label}: missing YAML frontmatter`);
    return "";
  }
  return match[1];
};

const readScalar = (frontmatter, key) => {
  const line = frontmatter.split(/\r?\n/).find((candidate) => new RegExp(`^${key}:`).test(candidate));
  return line ? normalizeScalar(line.slice(line.indexOf(":") + 1)) : undefined;
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
    if (!match) fail(`${label}: unsupported ${key} list syntax ${JSON.stringify(line.trim())}`);
    else values.push(normalizeScalar(match[1]));
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
    if (!current.collection || !current.slug) fail(`${label}: ${key} relation must include collection and slug`);
    else relations.push(current);
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
      if (current[propertyMatch[1]]) fail(`${label}: ${key} relation repeats ${propertyMatch[1]}`);
      else current[propertyMatch[1]] = normalizeScalar(propertyMatch[2]);
      continue;
    }
    fail(`${label}: unsupported ${key} relation syntax ${JSON.stringify(line.trim())}`);
  }
  finishCurrent();
  return relations;
};

const toRepositoryPath = (absolutePath) => path.relative(root, absolutePath).split(path.sep).join("/");
const excludedDirectories = new Set([".git", ".astro", ".netlify", "dist", "node_modules"]);
const scanExemptPaths = new Set([
  "docs/editorial/da-001-release-preparation.md",
  "scripts/fixtures/da001-google-doc-text-v1/expected.md",
  "scripts/fixtures/da001-google-doc-text-v1/input.txt",
  "scripts/lib/da001-canonicalizer-v1.mjs",
  "scripts/test-da001-canonicalizer.mjs",
  "scripts/validate-da001-preparation.mjs",
  "scripts/verify-da001-private-source.mjs",
]);
const manuscriptFingerprints = [
  "At twenty minutes past three, only Bellweather High’s machinery remained active.",
  "The following afternoon, Diane found the gray chair in the main lobby beneath a paper sign that read PARANORMAL DOCUMENTARY CHECK-IN.",
  "The students altered the basement’s sound and movement as soon as they entered.",
  "For three seconds, the recorder remained silent.",
  "Ron held out his hand for the recorder.",
  "Diane led them through the west stairwell with Ron behind the students and Abby’s camera pointed at the floor.",
  "The auditorium office contained a desk, a wall of labeled keys, and a media table assembled from two rolling carts locked together beneath a sheet of plywood.",
  "Diane placed the monitor on a road case at center stage and turned its screen toward the house.",
  "Evan moved toward the booth door.",
  "The following morning, the media room smelled of warm plastic, stale coffee, and the dry paper dust released whenever the old ventilation unit started.",
];

const walkFiles = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(absolutePath)));
    else if (entry.isFile()) files.push(absolutePath);
  }
  return files;
};

const scanActiveRepository = async () => {
  const canonicalSourcePath = `src/content/stories/${manifest.slug}.md`;
  for (const absolutePath of await walkFiles(root)) {
    const relativePath = toRepositoryPath(absolutePath);
    if (relativePath.startsWith("src/manuscripts/")) {
      fail(`DA-001 private-source directory contains active file ${relativePath}.`);
      continue;
    }
    if (relativePath === canonicalSourcePath || relativePath.startsWith(`src/content/stories/${manifest.slug}.`)) {
      fail(`DA-001 content entry exists before publication approval: ${relativePath}.`);
      continue;
    }
    if (scanExemptPaths.has(relativePath)) continue;
    const metadata = await stat(absolutePath);
    if (metadata.size === 0 || metadata.size > 5_000_000) continue;
    const bytes = await readFile(absolutePath);
    if (bytes.includes(0)) continue;
    const text = bytes.toString("utf8");
    const wordCount = text.match(new RegExp(DA001_WORD_PATTERN_SOURCE, "gu"))?.length ?? 0;
    const sceneHeadingCount = DA001_SOURCE_SECTION_TITLES.filter((title, index) =>
      text.includes(`Scene ${index + 1} — ${title}`),
    ).length;
    const fingerprintCount = manuscriptFingerprints.filter((fingerprint) => text.includes(fingerprint)).length;
    const suspiciousPath = /(?:^|[/_. -])da[-_ ]?001(?:[/_. -]|$)|building[-_ ]keeps[-_ ]the[-_ ]hour/i.test(relativePath);
    if (sha256Utf8(text) === DA001_APPROVED_CANONICAL_SHA256) fail(`DA-001 canonical manuscript is present at ${relativePath}.`);
    if (sceneHeadingCount >= 3 && wordCount >= 3000) fail(`DA-001 manuscript-like structure is present at ${relativePath} (${sceneHeadingCount} headings, ${wordCount} words).`);
    if (sceneHeadingCount >= 1 && fingerprintCount >= 1 && wordCount >= 1000) fail(`DA-001 scene content is present at ${relativePath}.`);
    if (fingerprintCount >= 2) fail(`DA-001 manuscript fingerprints are present at ${relativePath}.`);
    if (suspiciousPath && wordCount >= 1000 && text.includes(DA001_APPROVED_TITLE)) fail(`DA-001 manuscript-like file is present at ${relativePath}.`);
  }
};

if (manifest.slug !== "da-001-the-building-keeps-the-hour") fail("Manifest slug is not DA-001.");
if (manifest.title !== DA001_APPROVED_TITLE) fail("Manifest title is not the approved DA-001 title.");
const source = manifest.source ?? {};
if (source.storage !== "private-controlled-source") fail("DA-001 source storage must remain private-controlled-source.");
if (source.repositoryPath !== null) fail("DA-001 manifest must not declare a repository source path.");
if (source.approvedRevision !== DA001_APPROVED_REVISION) fail("DA-001 approved revision changed.");
if (source.approvedDocumentTitle !== DA001_APPROVED_DOCUMENT_TITLE) fail("DA-001 approved document title changed.");
if (source.sourceDocumentId !== DA001_APPROVED_SOURCE_DOCUMENT_ID) fail("DA-001 approved source document ID changed.");
if (source.canonicalization !== DA001_CANONICALIZATION_ID) fail("DA-001 source canonicalization changed.");
if (source.canonicalizerModule !== "scripts/lib/da001-canonicalizer-v1.mjs") fail("DA-001 canonicalizer module changed.");
if (source.attestationPath !== "src/data/da-001-canonicalization-attestation.json") fail("DA-001 attestation path changed.");
if (source.wordPattern !== DA001_WORD_PATTERN_SOURCE) fail("DA-001 word-count pattern changed.");
if (source.approvedCanonicalSha256 !== DA001_APPROVED_CANONICAL_SHA256) fail("DA-001 approved canonical SHA-256 changed.");
if (source.approvedWordCount !== DA001_APPROVED_WORD_COUNT) fail("DA-001 approved canonical word count changed.");
if (source.approvedPrivateExportSha256 !== attestation.privateExportSha256) fail("DA-001 private export attestation changed.");
if (source.formerGitBlobSha1 !== "784b2bbc7cd634a143845b4b293de73aeb3c5720") fail("DA-001 former Git blob digest changed.");
if (source.formerGitSourceStatus !== "superseded") fail("DA-001 former Git source must remain marked superseded.");
if (source.requiresDigestVerificationOnImport !== true) fail("DA-001 private import must require digest verification.");
if (attestation.case !== "DA-001") fail("DA-001 attestation case changed.");
if (attestation.canonicalization !== DA001_CANONICALIZATION_ID) fail("DA-001 attestation canonicalization changed.");
if (attestation.approvedRevision !== DA001_APPROVED_REVISION) fail("DA-001 attestation revision changed.");
if (attestation.sourceDocumentId !== DA001_APPROVED_SOURCE_DOCUMENT_ID) fail("DA-001 attestation source document ID changed.");
if (attestation.canonicalSha256 !== DA001_APPROVED_CANONICAL_SHA256) fail("DA-001 attestation canonical SHA-256 changed.");
if (attestation.wordCount !== DA001_APPROVED_WORD_COUNT) fail("DA-001 attestation word count changed.");
if (attestation.wordPattern !== DA001_WORD_PATTERN_SOURCE) fail("DA-001 attestation word-count pattern changed.");
if (attestation.verificationStatus !== "verified-against-private-source") fail("DA-001 private-source verification status changed.");
const historicalDisclosure = manifest.historicalDisclosure ?? {};
if (historicalDisclosure.status !== "accepted-risk") fail("DA-001 historical disclosure decision must remain accepted-risk.");
if (historicalDisclosure.ownerDecisionDate !== "2026-07-30") fail("DA-001 historical disclosure decision date changed.");
if (historicalDisclosure.repositoryHistoryRewriteRequired !== false) fail("DA-001 history rewrite must remain outside the approved release scope.");
if (historicalDisclosure.scope !== "active-tree-and-publication-output") fail("DA-001 disclosure scope changed.");
if (historicalDisclosure.confidentialityClaim !== false) fail("DA-001 must not claim historical Git confidentiality.");
await scanActiveRepository();
if (!gitignore.split(/\r?\n/).includes("src/manuscripts/")) fail(".gitignore must block src/manuscripts/.");
const releaseState = manifest.releaseState ?? {};
if (releaseState.status !== "withheld") fail("DA-001 preparation must remain withheld.");
if (releaseState.draft !== true) fail("DA-001 preparation must remain draft true.");
if (releaseState.publicationDate !== null) fail("DA-001 publication date must remain unset.");
if (releaseState.requiresSeparateApproval !== true) fail("DA-001 must require separate publication approval.");
if (releaseState.editorialProof?.status !== "complete") fail("DA-001 editorial proof must remain complete.");
if (releaseState.editorialProof?.verifiedOn !== "2026-07-30") fail("DA-001 editorial proof verification date changed.");
if (releaseState.editorialProof?.result !== "no-required-manuscript-revision") fail("DA-001 editorial proof result changed.");
if (!Array.isArray(manifest.sections) || manifest.sections.length !== DA001_SOURCE_SECTION_TITLES.length) fail("DA-001 preparation must retain exactly ten section mappings.");
else manifest.sections.forEach((section, index) => {
  const number = index + 1;
  const title = DA001_SOURCE_SECTION_TITLES[index];
  if (section.source !== `Scene ${number} — ${title}`) fail(`DA-001 source heading ${number} changed.`);
  if (section.published !== `${number}. ${title}`) fail(`DA-001 published heading ${number} changed.`);
});
const chronology = manifest.chronology ?? {};
if (chronology.timelineOrder !== 1) fail("DA-001 timelineOrder must remain 1.");
if (chronology.timelineLabel !== "Initial Bellweather investigation") fail("DA-001 timeline label changed.");
if (chronology.sourceOrder !== "Original investigation") fail("DA-001 source-order label changed.");
if (chronology.datePrecision !== "relative") fail("DA-001 date precision must remain relative.");
if (!chronology.chronologyNote?.trim()) fail("DA-001 chronology note is missing.");
if (!Array.isArray(chronology.follows) || chronology.follows.length !== 0) fail("DA-001 follows must remain an explicit empty list.");
if (!Array.isArray(chronology.precedes) || chronology.precedes.length !== 1 || chronology.precedes[0]?.collection !== "stories" || chronology.precedes[0]?.slug !== "da-002-the-name-in-the-room") fail("DA-001 must explicitly precede DA-002.");
const reservation = reservations.find((entry) => entry.collection === "stories" && entry.slug === manifest.slug);
if (!reservation) fail("DA-001 chronology reservation is missing.");
else for (const key of ["title", "timelineOrder", "timelineLabel", "sourceOrder"]) {
  const expected = key === "title" ? manifest.title : chronology[key];
  if (reservation[key] !== expected) fail(`DA-001 reservation ${key} expected ${JSON.stringify(expected)}, received ${JSON.stringify(reservation[key])}`);
}
const successorFrontmatter = extractFrontmatter(successor, "DA-002 successor");
if (readScalar(successorFrontmatter, "timelineOrder") !== "2") fail("DA-002 successor is not materialized at timelineOrder 2.");
const successorFollows = readRelationList(successorFrontmatter, "follows", "DA-002 successor");
if (successorFollows.length !== 1 || successorFollows[0]?.collection !== "stories" || successorFollows[0]?.slug !== manifest.slug) fail("DA-002 successor does not explicitly follow DA-001.");
for (const [field, values] of [["characters", manifest.continuity?.sharedCharacters], ["locations", manifest.continuity?.sharedLocations], ["objects", manifest.continuity?.sharedObjects], ["mysteries", manifest.continuity?.sharedMysteries]]) {
  if (!Array.isArray(values)) {
    fail(`DA-001 continuity manifest is missing shared ${field} list.`);
    continue;
  }
  const successorValues = new Set(readBlockList(successorFrontmatter, field, "DA-002 successor"));
  for (const value of values) if (!successorValues.has(value)) fail(`DA-002 successor is missing shared ${field} value ${JSON.stringify(value)}`);
}
if (failures.length > 0) throw new Error(`DA-001 public release-preparation validation failed:\n${failures.join("\n")}`);
console.log("DA-001 preparation passed: the versioned canonicalizer and private-source attestation match Final Approved Story v17; the active repository scan found no canonical source, manuscript structure, scene fragments, or premature content entry; chronology, continuity, withheld state, and accepted historical-disclosure scope remain enforced.");
