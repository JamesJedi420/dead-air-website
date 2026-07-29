import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const collectionDirectories = [
  ["stories", path.join(root, "src", "content", "stories")],
  ["cases", path.join(root, "src", "content", "cases")],
];
const reservationsPath = path.join(root, "src", "data", "narrative-timeline-reservations.json");
const allowedPrecisions = new Set(["exact", "approximate", "seasonal", "relative"]);
const relationProperties = new Set(["collection", "slug"]);
const chronologyScalarFields = [
  "timelineLabel",
  "sourceOrder",
  "datePrecision",
  "chronologyNote",
];
const chronologyFields = [
  "timelineOrder",
  ...chronologyScalarFields,
  "follows",
  "precedes",
];

const collectMarkdownFiles = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMarkdownFiles(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(entryPath);
  }
  return files.sort((left, right) => left.localeCompare(right));
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

const readFrontmatterScalar = (frontmatter, key) => {
  const line = frontmatter
    .split(/\r?\n/)
    .find((candidate) => new RegExp(`^${key}:`).test(candidate));
  if (!line) return undefined;
  return normalizeScalar(line.slice(line.indexOf(":") + 1));
};

const hasFrontmatterKey = (frontmatter, key) =>
  new RegExp(`^${key}:`, "m").test(frontmatter);

const assignRelationProperty = (current, mappingText, key, fileName, failures) => {
  const mappingMatch = mappingText.match(/^([^:]+):\s*(.*)$/);
  if (!mappingMatch) {
    failures.push(`${fileName}: unsupported ${key} relation syntax ${JSON.stringify(mappingText)}`);
    return;
  }

  const property = mappingMatch[1].trim();
  if (!relationProperties.has(property)) {
    failures.push(`${fileName}: unsupported ${key} relation property ${JSON.stringify(property)}`);
    return;
  }
  if (Object.hasOwn(current, property)) {
    failures.push(`${fileName}: ${key} relation contains more than one ${property}`);
    return;
  }

  const value = normalizeScalar(mappingMatch[2]);
  if (!value) {
    failures.push(`${fileName}: ${key} relation ${property} must not be empty`);
    return;
  }
  current[property] = value;
};

const readRelationList = (frontmatter, key, fileName, failures) => {
  const lines = frontmatter.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => new RegExp(`^${key}:`).test(line));
  if (startIndex < 0) return { present: false, relations: [] };

  const headerValue = normalizeScalar(lines[startIndex].slice(lines[startIndex].indexOf(":") + 1));
  if (/^\[\s*\]$/.test(headerValue)) return { present: true, relations: [] };
  if (headerValue) {
    failures.push(`${fileName}: ${key} must be a block list or an explicit empty list`);
    return { present: true, relations: [] };
  }

  const relations = [];
  let current;
  const finishCurrent = () => {
    if (!current) return;
    if (!current.collection || !current.slug) {
      failures.push(`${fileName}: ${key} relation must include collection and slug`);
    } else {
      relations.push(current);
    }
    current = undefined;
  };

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s][^:]*:/.test(line)) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const listItemMatch = line.match(/^\s*-\s*(.*)$/);
    if (listItemMatch) {
      finishCurrent();
      current = {};
      const mappingText = listItemMatch[1].trim();
      if (mappingText) assignRelationProperty(current, mappingText, key, fileName, failures);
      continue;
    }

    const continuationMatch = line.match(/^\s+([^\s].*)$/);
    if (continuationMatch && current) {
      assignRelationProperty(current, continuationMatch[1].trim(), key, fileName, failures);
      continue;
    }

    failures.push(`${fileName}: unsupported ${key} relation syntax ${JSON.stringify(line.trim())}`);
  }

  finishCurrent();
  if (relations.length === 0) {
    failures.push(`${fileName}: empty ${key} relationships must use []`);
  }
  return { present: true, relations };
};

const failures = [];
const entries = [];
let publishedEntriesChecked = 0;
let timelineEntriesChecked = 0;

for (const [collection, directory] of collectionDirectories) {
  for (const filePath of await collectMarkdownFiles(directory)) {
    const relativePath = path.relative(directory, filePath).replaceAll(path.sep, "/");
    const fileName = `${collection}/${relativePath}`;
    const content = await readFile(filePath, "utf8");
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

    if (!frontmatterMatch) {
      failures.push(`${fileName}: missing YAML frontmatter`);
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const status = readFrontmatterScalar(frontmatter, "status") ?? "fragmentary";
    const rawDraft = readFrontmatterScalar(frontmatter, "draft");
    let draft = false;
    if (rawDraft === "true") draft = true;
    else if (rawDraft !== undefined && rawDraft !== "false") {
      failures.push(`${fileName}: draft must be true or false, received ${JSON.stringify(rawDraft)}`);
      draft = true;
    }

    const slug = readFrontmatterScalar(frontmatter, "slug") ?? relativePath.replace(/\.md$/, "");
    const timelineOrderRaw = readFrontmatterScalar(frontmatter, "timelineOrder");
    const timelineOrder = timelineOrderRaw === undefined ? undefined : Number(timelineOrderRaw);

    entries.push({
      collection,
      slug,
      key: `${collection}:${slug}`,
      fileName,
      frontmatter,
      published: !draft && status !== "withheld",
      timelineOrder,
      timelineOrderRaw,
    });
  }
}

let reservations = [];
try {
  const parsed = JSON.parse(await readFile(reservationsPath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("root value must be an array");
  reservations = parsed;
} catch (error) {
  failures.push(`narrative timeline reservations could not be read: ${error.message}`);
}

const reservationMap = new Map();
const targetMap = new Map();
for (const [index, reservation] of reservations.entries()) {
  const label = `reservation[${index}]`;
  if (!reservation || typeof reservation !== "object" || Array.isArray(reservation)) {
    failures.push(`${label}: reservation must be an object`);
    continue;
  }
  const { collection, slug, timelineOrder } = reservation;
  if (!collectionDirectories.some(([knownCollection]) => knownCollection === collection)) {
    failures.push(`${label}: unsupported collection ${JSON.stringify(collection)}`);
    continue;
  }
  if (typeof slug !== "string" || !slug.trim()) {
    failures.push(`${label}: slug must be a nonempty string`);
    continue;
  }
  if (!Number.isFinite(timelineOrder) || timelineOrder <= 0) {
    failures.push(`${label}: timelineOrder must be a positive number`);
    continue;
  }
  const key = `${collection}:${slug}`;
  if (reservationMap.has(key)) {
    failures.push(`${label}: duplicate reserved target ${key}`);
    continue;
  }
  const target = { key, timelineOrder, source: label, reserved: true };
  reservationMap.set(key, target);
  targetMap.set(key, target);
}

for (const entry of entries) {
  const existing = targetMap.get(entry.key);
  const hasValidOrder = Number.isFinite(entry.timelineOrder) && entry.timelineOrder > 0;
  if (existing && !existing.reserved) {
    failures.push(`${entry.fileName}: duplicate chronology target ${entry.key}`);
    continue;
  }
  if (existing?.reserved && hasValidOrder && existing.timelineOrder !== entry.timelineOrder) {
    failures.push(
      `${entry.fileName}: timelineOrder ${entry.timelineOrder} conflicts with reserved order ${existing.timelineOrder} for ${entry.key}`,
    );
  }
  targetMap.set(entry.key, {
    key: entry.key,
    timelineOrder: hasValidOrder ? entry.timelineOrder : existing?.timelineOrder,
    source: entry.fileName,
    reserved: false,
  });
}

for (const entry of entries) {
  if (!entry.published) continue;
  publishedEntriesChecked += 1;

  const reservation = reservationMap.get(entry.key);
  const hasAnyChronologyMetadata = chronologyFields.some((key) => hasFrontmatterKey(entry.frontmatter, key));
  if (entry.timelineOrderRaw === undefined) {
    if (reservation) {
      failures.push(
        `${entry.fileName}: published reserved entry ${entry.key} must declare timelineOrder ${reservation.timelineOrder} and complete chronology metadata`,
      );
    } else if (hasAnyChronologyMetadata) {
      failures.push(`${entry.fileName}: chronology metadata is present without timelineOrder`);
    }
    continue;
  }

  if (!Number.isFinite(entry.timelineOrder) || entry.timelineOrder <= 0) {
    failures.push(
      `${entry.fileName}: timelineOrder must be a positive number, received ${JSON.stringify(entry.timelineOrderRaw)}`,
    );
    continue;
  }

  if (reservation && entry.timelineOrder !== reservation.timelineOrder) {
    failures.push(
      `${entry.fileName}: published reserved entry ${entry.key} must retain timelineOrder ${reservation.timelineOrder}, received ${entry.timelineOrder}`,
    );
  }

  for (const field of chronologyScalarFields) {
    const value = readFrontmatterScalar(entry.frontmatter, field);
    if (!value) failures.push(`${entry.fileName}: published timeline entry is missing ${field}`);
  }

  const datePrecision = readFrontmatterScalar(entry.frontmatter, "datePrecision");
  if (datePrecision && !allowedPrecisions.has(datePrecision)) {
    failures.push(`${entry.fileName}: unsupported datePrecision ${JSON.stringify(datePrecision)}`);
  }

  for (const relationField of ["follows", "precedes"]) {
    const { present, relations } = readRelationList(entry.frontmatter, relationField, entry.fileName, failures);
    if (!present) {
      failures.push(`${entry.fileName}: published timeline entry is missing ${relationField}`);
      continue;
    }

    const seenRelations = new Set();
    for (const relation of relations) {
      const relationKey = `${relation.collection}:${relation.slug}`;
      if (seenRelations.has(relationKey)) {
        failures.push(`${entry.fileName}: duplicate ${relationField} relationship ${relationKey}`);
        continue;
      }
      seenRelations.add(relationKey);

      const target = targetMap.get(relationKey);
      if (!target) {
        failures.push(`${entry.fileName}: ${relationField} target ${relationKey} does not exist or have an explicit reservation`);
        continue;
      }
      if (!Number.isFinite(target.timelineOrder) || target.timelineOrder <= 0) {
        failures.push(`${entry.fileName}: ${relationField} target ${relationKey} has no valid timelineOrder`);
        continue;
      }

      const isCorrectlyOrdered = relationField === "follows"
        ? target.timelineOrder < entry.timelineOrder
        : target.timelineOrder > entry.timelineOrder;
      if (!isCorrectlyOrdered) {
        const expected = relationField === "follows" ? "earlier than" : "later than";
        failures.push(
          `${entry.fileName}: ${relationField} target ${relationKey} is order ${target.timelineOrder}, which is not ${expected} order ${entry.timelineOrder}`,
        );
      }
    }
  }

  timelineEntriesChecked += 1;
}

if (failures.length > 0) {
  throw new Error(`Narrative timeline validation failed:\n${failures.join("\n")}`);
}

console.log(
  `Narrative timeline validation passed across ${publishedEntriesChecked} published stories and cases, including ${timelineEntriesChecked} entries assigned to the public chronology and ${reservations.length} explicitly reserved chronology targets. Publication dates remain independent of narrative order.`,
);
