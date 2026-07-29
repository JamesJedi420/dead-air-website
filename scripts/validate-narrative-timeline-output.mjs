import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const storySourcePath = path.join(
  root,
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);
const timelineHtmlPath = path.join(root, "dist", "timeline", "index.html");
const storyRoute = "/stories/da-002-the-name-in-the-room/";
const chronologyNote = "Placed after DA-001 according to the approximate order of the source investigations and transcripts; the exact interval is fictionalized or withheld.";

const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

const readScalar = (frontmatter, key) =>
  frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();

const failures = [];
const fail = (message) => failures.push(message);

const storySource = await readFile(storySourcePath, "utf8");
const frontmatterMatch = storySource.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
if (!frontmatterMatch) {
  fail("DA-002 materialized story is missing YAML frontmatter.");
} else {
  const frontmatter = frontmatterMatch[1];
  const expectedScalars = {
    timelineOrder: "2",
    timelineLabel: "Return investigation and attempted cleansing",
    sourceOrder: "Follow-up investigation",
    datePrecision: "relative",
    chronologyNote,
  };

  for (const [key, expected] of Object.entries(expectedScalars)) {
    const actual = readScalar(frontmatter, key);
    if (actual !== expected) {
      fail(`DA-002 expected ${key} ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
    }
  }

  if (!/^follows:\s*\n\s+- collection: stories\s*\n\s+slug: da-001-the-building-keeps-the-hour$/m.test(frontmatter)) {
    fail("DA-002 is missing its explicit follows relationship to DA-001.");
  }
  if (!/^precedes:\s*\[\]\s*$/m.test(frontmatter)) {
    fail("DA-002 precedes field is not explicitly recorded as an empty list.");
  }
}

if (!(await exists(timelineHtmlPath))) {
  fail("Narrative timeline route was not generated.");
} else {
  const html = await readFile(timelineHtmlPath, "utf8");
  const routeIndex = html.indexOf(`href=\"${storyRoute}\"`);
  let da002EntryHtml = "";
  if (routeIndex < 0) {
    fail("timeline does not link to DA-002");
  } else {
    const listItemStart = html.lastIndexOf("<li", routeIndex);
    const listItemEnd = html.indexOf("</li>", routeIndex);
    if (listItemStart < 0 || listItemEnd < 0) {
      fail("DA-002 timeline list item could not be isolated");
    } else {
      da002EntryHtml = html.slice(listItemStart, listItemEnd + "</li>".length);
    }
  }

  const assertions = [
    [html.includes("Narrative Chronology"), "narrative chronology heading is missing"],
    [html.includes("Publication order is separate."), "publication-order distinction is missing"],
    [da002EntryHtml.includes("Archive position 2"), "DA-002 narrative position is missing"],
    [da002EntryHtml.includes("Return investigation and attempted cleansing"), "DA-002 timeline label is missing"],
    [da002EntryHtml.includes("Follow-up investigation"), "DA-002 source-order label is missing"],
    [da002EntryHtml.includes("Relative"), "DA-002 date precision is missing"],
    [da002EntryHtml.includes(chronologyNote), "DA-002 chronology note is missing"],
    [da002EntryHtml.includes("The Name in the Room"), "timeline does not name DA-002"],
    [!da002EntryHtml.includes("July 27, 2026"), "DA-002 publication date is presented as its narrative event date"],
  ];

  for (const [passed, message] of assertions) if (!passed) fail(message);
}

if (failures.length > 0) {
  throw new Error(`Narrative timeline output validation failed:\n${failures.join("\n")}`);
}

console.log(
  "Narrative timeline output validation passed: DA-002 remains archive position 2 after DA-001, relative source chronology is visible, and its publication date is not presented as an event date.",
);
