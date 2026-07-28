import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const collectionDirectories = [
  ["stories", path.join(process.cwd(), "src", "content", "stories")],
  ["cases", path.join(process.cwd(), "src", "content", "cases")],
];
const allowedPrecisions = new Set(["exact", "approximate", "seasonal", "relative"]);
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

const readFrontmatterScalar = (frontmatter, key) => {
  const line = frontmatter
    .split(/\r?\n/)
    .find((candidate) => new RegExp(`^${key}:`).test(candidate));
  if (!line) return undefined;

  let value = line.slice(line.indexOf(":") + 1).trim();
  if (!value.startsWith('"') && !value.startsWith("'")) {
    value = value.replace(/\s+#.*$/, "").trim();
  }
  return stripMatchingQuotes(value);
};

const hasFrontmatterKey = (frontmatter, key) =>
  new RegExp(`^${key}:`, "m").test(frontmatter);

const failures = [];
let publishedEntriesChecked = 0;
let timelineEntriesChecked = 0;

for (const [collection, directory] of collectionDirectories) {
  for (const filePath of await collectMarkdownFiles(directory)) {
    const fileName = `${collection}/${path.relative(directory, filePath).replaceAll(path.sep, "/")}`;
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

    if (draft || status === "withheld") continue;
    publishedEntriesChecked += 1;

    const timelineOrderRaw = readFrontmatterScalar(frontmatter, "timelineOrder");
    const hasAnyChronologyMetadata = chronologyFields.some((key) => hasFrontmatterKey(frontmatter, key));

    if (timelineOrderRaw === undefined) {
      if (hasAnyChronologyMetadata) {
        failures.push(`${fileName}: chronology metadata is present without timelineOrder`);
      }
      continue;
    }

    const timelineOrder = Number(timelineOrderRaw);
    if (!Number.isFinite(timelineOrder) || timelineOrder <= 0) {
      failures.push(`${fileName}: timelineOrder must be a positive number, received ${JSON.stringify(timelineOrderRaw)}`);
    }

    for (const field of chronologyScalarFields) {
      const value = readFrontmatterScalar(frontmatter, field);
      if (!value) failures.push(`${fileName}: published timeline entry is missing ${field}`);
    }

    const datePrecision = readFrontmatterScalar(frontmatter, "datePrecision");
    if (datePrecision && !allowedPrecisions.has(datePrecision)) {
      failures.push(`${fileName}: unsupported datePrecision ${JSON.stringify(datePrecision)}`);
    }

    for (const relationField of ["follows", "precedes"]) {
      if (!hasFrontmatterKey(frontmatter, relationField)) {
        failures.push(`${fileName}: published timeline entry is missing ${relationField}`);
      }
    }

    timelineEntriesChecked += 1;
  }
}

if (failures.length > 0) {
  throw new Error(`Narrative timeline validation failed:\n${failures.join("\n")}`);
}

console.log(
  `Narrative timeline validation passed across ${publishedEntriesChecked} published stories and cases, including ${timelineEntriesChecked} entries assigned to the public chronology. Publication dates remain independent of narrative order.`,
);