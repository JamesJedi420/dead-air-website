import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "src", "data", "da-001-release-preparation.json");
const reservationsPath = path.join(root, "src", "data", "narrative-timeline-reservations.json");
const successorPath = path.join(root, "src", "content", "stories", "da-002-the-name-in-the-room.md");
const privateSourcePath = path.join(root, "src", "manuscripts", "da-001", "source.md");
const gitignorePath = path.join(root, ".gitignore");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const reservations = JSON.parse(await readFile(reservationsPath, "utf8"));
const successor = await readFile(successorPath, "utf8");
const gitignore = await readFile(gitignorePath, "utf8");
const publicContentPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);

const failures = [];
const fail = (message) => failures.push(message);

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

const extractFrontmatter = (content, label) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    fail(`${label}: missing YAML frontmatter`);
    return "";
  }
  return match[1];
};

const normalizeScalar = (rawValue) => {
  let value = rawValue.trim();
  if (!value.startsWith('"') && !value.startsWith("'")) {
    value = value.replace(/\s+#.*$/, "").trim();
  }
  if (value.length >= 2 && value[0] === value.at(-1) && (value[0] === '"' || value[0] === "'")) {
    return value.slice(1, -1);
  }
  return value;
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

const expectedSections = [
  "Three-Thirty",
  "Permission Slips",
  "The Quiet Test",
  "Four Seconds",
  "The Markers",
  "The West Route",
  "The Cut",
  "The Glassless Window",
  "The Key That Is Not Hers",
  "Source Track",
];

if (manifest.slug !== "da-001-the-building-keeps-the-hour") fail("Manifest slug is not DA-001.");
if (manifest.title !== "The Building Keeps the Hour") fail("Manifest title is not the approved DA-001 title.");

const source = manifest.source ?? {};
if (source.storage !== "private-controlled-source") fail("DA-001 source storage must remain private-controlled-source.");
if (source.repositoryPath !== null) fail("DA-001 manifest must not declare a repository source path.");
if (source.approvedRevision !== "Final Approved Story v17") fail("DA-001 approved revision must remain Final Approved Story v17.");
if (source.approvedDocumentTitle !== "DA-001 — Final Approved Story v17 — The Building Keeps the Hour") {
  fail("DA-001 approved document title changed.");
}
if (source.canonicalization !== "google-doc-text-v1") fail("DA-001 source canonicalization changed.");
if (source.approvedCanonicalSha256 !== "e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415") {
  fail("DA-001 approved canonical SHA-256 changed.");
}
if (source.approvedWordCount !== 23621) fail("DA-001 approved canonical word count changed.");
if (source.formerGitBlobSha1 !== "784b2bbc7cd634a143845b4b293de73aeb3c5720") {
  fail("DA-001 former Git blob digest changed.");
}
if (source.formerGitSourceStatus !== "superseded") fail("DA-001 former Git source must remain marked superseded.");
if (source.requiresDigestVerificationOnImport !== true) fail("DA-001 private import must require digest verification.");

if (await exists(privateSourcePath)) fail("DA-001 controlled manuscript is present under src/manuscripts/.");
if (await exists(publicContentPath)) fail("DA-001 content entry exists before publication approval.");
if (!gitignore.split(/\r?\n/).includes("src/manuscripts/")) {
  fail(".gitignore must block src/manuscripts/ from this public repository.");
}

const releaseState = manifest.releaseState ?? {};
if (releaseState.status !== "withheld") fail("DA-001 preparation must remain withheld.");
if (releaseState.draft !== true) fail("DA-001 preparation must remain draft true.");
if (releaseState.publicationDate !== null) fail("DA-001 publication date must remain unset.");
if (releaseState.requiresSeparateApproval !== true) fail("DA-001 must require separate publication approval.");
if (releaseState.editorialProof?.status !== "complete") fail("DA-001 editorial proof must remain complete.");
if (releaseState.editorialProof?.verifiedOn !== "2026-07-30") fail("DA-001 editorial proof verification date changed.");
if (releaseState.editorialProof?.result !== "no-required-manuscript-revision") {
  fail("DA-001 editorial proof result changed.");
}

if (!Array.isArray(manifest.sections) || manifest.sections.length !== expectedSections.length) {
  fail("DA-001 preparation must retain exactly ten section mappings.");
} else {
  manifest.sections.forEach((section, index) => {
    const number = index + 1;
    const title = expectedSections[index];
    if (section.source !== `Scene ${number} — ${title}`) fail(`DA-001 source heading ${number} changed.`);
    if (section.published !== `${number}. ${title}`) fail(`DA-001 published heading ${number} changed.`);
  });
}

const chronology = manifest.chronology ?? {};
if (chronology.timelineOrder !== 1) fail("DA-001 timelineOrder must remain 1.");
if (chronology.timelineLabel !== "Initial Bellweather investigation") fail("DA-001 timeline label changed.");
if (chronology.sourceOrder !== "Original investigation") fail("DA-001 source-order label changed.");
if (chronology.datePrecision !== "relative") fail("DA-001 date precision must remain relative.");
if (!chronology.chronologyNote?.trim()) fail("DA-001 chronology note is missing.");
if (!Array.isArray(chronology.follows) || chronology.follows.length !== 0) {
  fail("DA-001 follows must remain an explicit empty list.");
}
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

const successorFrontmatter = extractFrontmatter(successor, "DA-002 successor");
if (readScalar(successorFrontmatter, "timelineOrder") !== "2") {
  fail("DA-002 successor is not materialized at timelineOrder 2.");
}
const successorFollows = readRelationList(successorFrontmatter, "follows", "DA-002 successor");
if (
  successorFollows.length !== 1 ||
  successorFollows[0]?.collection !== "stories" ||
  successorFollows[0]?.slug !== manifest.slug
) {
  fail("DA-002 successor does not explicitly follow DA-001.");
}

for (const [field, values] of [
  ["characters", manifest.continuity?.sharedCharacters],
  ["locations", manifest.continuity?.sharedLocations],
  ["objects", manifest.continuity?.sharedObjects],
  ["mysteries", manifest.continuity?.sharedMysteries],
]) {
  if (!Array.isArray(values)) {
    fail(`DA-001 continuity manifest is missing shared ${field} list.`);
    continue;
  }
  const successorValues = new Set(readBlockList(successorFrontmatter, field, "DA-002 successor"));
  for (const value of values) {
    if (!successorValues.has(value)) {
      fail(`DA-002 successor is missing shared ${field} value ${JSON.stringify(value)}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`DA-001 public release-preparation validation failed:\n${failures.join("\n")}`);
}

console.log(
  "DA-001 public preparation passed: Final Approved Story v17 remains the authoritative private source; its canonical SHA-256, word count, approved ten-section map, completed editorial proof, chronology reservation, DA-002 continuity, and separate publication boundary are enforced while no manuscript exists in the repository.",
);
