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
const publicContentPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const reservations = JSON.parse(await readFile(reservationsPath, "utf8"));
const successor = await readFile(successorPath, "utf8");
const gitignore = await readFile(gitignorePath, "utf8");

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

if (manifest.slug !== "da-001-the-building-keeps-the-hour") fail("Manifest slug is not DA-001.");
if (manifest.title !== "The Building Keeps the Hour") fail("Manifest title is not the approved DA-001 title.");

if (manifest.source?.storage !== "private-controlled-source") {
  fail("DA-001 source storage must remain private-controlled-source.");
}
if (manifest.source?.repositoryPath !== null) {
  fail("DA-001 manifest must not declare a repository source path.");
}
if (manifest.source?.formerGitBlobSha1 !== "784b2bbc7cd634a143845b4b293de73aeb3c5720") {
  fail("DA-001 former Git blob digest changed.");
}
if (manifest.source?.requiresDigestVerificationOnImport !== true) {
  fail("DA-001 private import must require digest verification.");
}
if (await exists(privateSourcePath)) {
  fail("DA-001 controlled manuscript is present under src/manuscripts/.");
}
if (await exists(publicContentPath)) {
  fail("DA-001 content entry exists before publication approval.");
}
if (!gitignore.split(/\r?\n/).includes("src/manuscripts/")) {
  fail(".gitignore must block src/manuscripts/ from this public repository.");
}

if (manifest.releaseState?.status !== "withheld") fail("DA-001 preparation must remain withheld.");
if (manifest.releaseState?.draft !== true) fail("DA-001 preparation must remain draft true.");
if (manifest.releaseState?.publicationDate !== null) fail("DA-001 publication date must remain unset.");
if (manifest.releaseState?.requiresSeparateApproval !== true) fail("DA-001 must require separate publication approval.");

if (!Array.isArray(manifest.sections) || manifest.sections.length !== 10) {
  fail("DA-001 preparation must retain exactly ten section mappings.");
} else {
  const seenSource = new Set();
  const seenPublished = new Set();
  manifest.sections.forEach((section, index) => {
    const number = index + 1;
    const sourceMatch = section.source?.match(new RegExp(`^Scene ${number} — (.+)$`));
    if (!sourceMatch) {
      fail(`DA-001 source heading ${number} is not the approved Scene mapping.`);
      return;
    }
    const expectedPublished = `${number}. ${sourceMatch[1]}`;
    if (section.published !== expectedPublished) {
      fail(`DA-001 published heading ${number} expected ${JSON.stringify(expectedPublished)}.`);
    }
    if (seenSource.has(section.source)) fail(`DA-001 repeats source heading ${JSON.stringify(section.source)}.`);
    if (seenPublished.has(section.published)) fail(`DA-001 repeats published heading ${JSON.stringify(section.published)}.`);
    seenSource.add(section.source);
    seenPublished.add(section.published);
  });
}

const chronology = manifest.chronology ?? {};
if (chronology.timelineOrder !== 1) fail("DA-001 timelineOrder must remain 1.");
if (chronology.timelineLabel !== "Initial Bellweather investigation") fail("DA-001 timeline label changed.");
if (chronology.sourceOrder !== "Original investigation") fail("DA-001 source-order label changed.");
if (chronology.datePrecision !== "relative") fail("DA-001 date precision must remain relative.");
if (!chronology.chronologyNote?.trim()) fail("DA-001 chronology note is missing.");
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
    if (!successorValues.has(value)) fail(`DA-002 successor is missing shared ${field} value ${JSON.stringify(value)}`);
  }
}

if (failures.length > 0) {
  throw new Error(`DA-001 public release-preparation validation failed:\n${failures.join("\n")}`);
}

console.log(
  "DA-001 public preparation passed: no manuscript exists in the repository; the former source digest, ten-section transform map, chronology reservation, DA-002 successor relationship, and separate publication approval boundary remain enforced. Byte-level manuscript verification is required during the authorized private-source import workflow.",
);
