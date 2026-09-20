import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const timelineHtmlPath = path.join(root, "dist", "timeline", "index.html");

const entries = [
  {
    path: "da-001-after-the-main-fan-stops.md",
    route: "/stories/da-001-after-the-main-fan-stops/",
    title: "After the Main Fan Stops",
    order: "1",
    label: "January 2015 — Initial Cedar Plain investigation",
    sourceOrder: "Original investigation",
    precision: "approximate",
    note: "Approximately January 2015; the sealed-corridor coda follows about three weeks later. This creative placement does not import the real source school's construction date or source publication date.",
    follows: [],
    precedes: ["da-002-the-name-in-the-room"],
    publicationDate: "August 1, 2026",
  },
  {
    path: "da-002-the-name-in-the-room.md",
    route: "/stories/da-002-the-name-in-the-room/",
    title: "The Name in the Room",
    order: "2",
    label: "Late February 2015 — Return investigation and attempted cleansing",
    sourceOrder: "Follow-up investigation",
    precision: "approximate",
    note: "Approved fictional placement after DA-001. Source research reports the cleansing footage was filmed in early January 2015, so this deliberately diverges from source filming order; publication dates are not event dates.",
    follows: ["da-001-after-the-main-fan-stops"],
    precedes: ["da-003-the-recorder-kept-running"],
    publicationDate: "July 27, 2026",
  },
  {
    path: "da-003-the-recorder-kept-running.md",
    route: "/stories/da-003-the-recorder-kept-running/",
    title: "The Recorder Kept Running",
    order: "3",
    label: "Summer 2017 — Harrow River investigation",
    sourceOrder: "Independent source investigation",
    precision: "seasonal",
    note: "Warm-season placement is supported by the source environment; exact filming date is unknown. Position after DA-002 and before DA-004 is calendar ordering only and establishes no causal or paranormal connection.",
    follows: ["da-002-the-name-in-the-room"],
    precedes: ["da-004-close-enough-to-recognize"],
    publicationDate: "August 18, 2026",
  },
  {
    path: "da-004-close-enough-to-recognize.md",
    route: "/stories/da-004-close-enough-to-recognize/",
    title: "Close Enough to Recognize",
    order: "4",
    label: "September 2017 — Kestrel Hotel overnight investigation",
    sourceOrder: "Independent source investigation",
    precision: "approximate",
    note: "Approximate September 2017 placement, bounded more cautiously as late summer / early autumn. Conflicting source publication dates are provenance only; position after DA-003 establishes no causal or paranormal connection.",
    follows: ["da-003-the-recorder-kept-running"],
    precedes: [],
    publicationDate: "September 14, 2026",
  },
];

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

const readScalar = (frontmatter, key) => {
  const raw = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  if (raw === undefined) return undefined;
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

const relationBlock = (key, slugs) => {
  if (slugs.length === 0) return `${key}: []`;
  return [
    `${key}:`,
    ...slugs.flatMap((slug) => ["  - collection: stories", `    slug: ${slug}`]),
  ].join("\n");
};

const failures = [];
const fail = (message) => failures.push(message);

for (const entry of entries) {
  const storySourcePath = path.join(root, "src", "content", "stories", entry.path);
  if (!(await exists(storySourcePath))) {
    fail(`${entry.title}: materialized story source is missing.`);
    continue;
  }
  const storySource = await readFile(storySourcePath, "utf8");
  const frontmatterMatch = storySource.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatterMatch) {
    fail(`${entry.title}: materialized story is missing YAML frontmatter.`);
    continue;
  }
  const frontmatter = frontmatterMatch[1];
  const expectedScalars = {
    timelineOrder: entry.order,
    timelineLabel: entry.label,
    sourceOrder: entry.sourceOrder,
    datePrecision: entry.precision,
    chronologyNote: entry.note,
  };
  for (const [key, expected] of Object.entries(expectedScalars)) {
    const actual = readScalar(frontmatter, key);
    if (actual !== expected) fail(`${entry.title}: expected ${key} ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
  }
  for (const [key, slugs] of [["follows", entry.follows], ["precedes", entry.precedes]]) {
    const expectedBlock = relationBlock(key, slugs);
    const normalizedFrontmatter = frontmatter.replace(
      /^(\s*(?:collection|slug):\s*)"([^"]+)"\s*$/gm,
      "$1$2",
    );
    if (!normalizedFrontmatter.includes(expectedBlock)) fail(`${entry.title}: chronology relationship block differs from approved calendar.\nExpected:\n${expectedBlock}`);
  }
}

if (!(await exists(timelineHtmlPath))) {
  fail("Narrative timeline route was not generated.");
} else {
  const html = await readFile(timelineHtmlPath, "utf8");
  if (!html.includes("Narrative Chronology")) fail("narrative chronology heading is missing");
  if (!html.includes("Recording dates, source publication dates, and Dead Air publication dates are tracked separately")) {
    fail("timeline does not distinguish story dating from recording/publication dates");
  }

  for (const entry of entries) {
    const routeIndex = html.indexOf(`href="${entry.route}"`);
    if (routeIndex < 0) {
      fail(`timeline does not link to ${entry.title}`);
      continue;
    }
    const listItemStart = html.lastIndexOf("<li", routeIndex);
    const listItemEnd = html.indexOf("</li>", routeIndex);
    if (listItemStart < 0 || listItemEnd < 0) {
      fail(`${entry.title}: timeline list item could not be isolated`);
      continue;
    }
    const item = html.slice(listItemStart, listItemEnd + "</li>".length);
    for (const expected of [
      entry.label,
      entry.note,
      entry.title,
    ]) {
      if (!item.includes(expected)) fail(`${entry.title}: timeline item missing ${JSON.stringify(expected)}`);
    }
    if (item.includes(entry.publicationDate)) fail(`${entry.title}: Dead Air publication date is presented as a narrative event date`);
    for (const internalLabel of ["Continuity position", "Archive position", "Source sequence", "Date precision"]) {
      if (item.includes(internalLabel)) fail(`${entry.title}: public timeline exposes internal label ${JSON.stringify(internalLabel)}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Narrative timeline output validation failed:\n${failures.join("\n")}`);
}

console.log(
  "Narrative timeline output validation passed: DA-001–DA-004 show approved approximate/seasonal case dates, source/publication dates remain separate, and calendar-only ordering does not promote causal or paranormal connections.",
);
