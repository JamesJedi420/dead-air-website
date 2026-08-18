import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourceDirectory = path.join(process.cwd(), "src", "manuscripts", "da-002");
const outputPath = path.join(
  process.cwd(),
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);
const approvedSourceSha256 = "104c25b43c709d30b0aa8c20bd7cb13410073fd67a763e7e9229640973b20964";
const sourceCardSummary =
  "A final cleansing at Bellweather High becomes a struggle over names, consent, source custody, and the difference between relief and proof.";
const approvedCardSummary =
  "A documentary crew returns to Bellweather High for a final session with a medium. In the basement, equipment fails, a fire door moves, and a sound recording leaves much to interpretation.";
const correctedRevision = "Final Approved Story v13";
const correctiveReplacements = [
  ["Three different records and one blank.", "Four different records and one blank."],
  ["one possible four-word pattern: not my name.", "one possible three-word pattern: not my name."],
];
const legacySourceNote = [
  "## Fictionalization and Source Note",
  "",
  "This literary paranormal-horror story adapts reported paranormal-investigation and mediumship material into fiction. Names, locations, identities, historical material, and institutional details are fictionalized or invented. The story preserves competing ordinary explanations and unresolved interpretations. Public release excludes raw source materials and restricted participant information.",
  "",
  "",
].join("\n");
const publishedSectionHeadings = [
  ["## Scene 1 — Terms of Return", "## 1. Terms of Return"],
  ["## Scene 2 — The First Room", "## 2. The First Room"],
  ["## Scene 3 — Two Devices", "## 3. Two Devices"],
  ["## Scene 4 — The Student They Build", "## 4. The Student They Build"],
  ["## Scene 5 — The Fire Door", "## 5. The Fire Door"],
  ["## Scene 6 — The Personal Reading", "## 6. The Personal Reading"],
  ["## Scene 7 — What We Call Clean", "## 7. What We Call Clean"],
  ["## Scene 8 — The Auditorium Search", "## 8. The Auditorium Search"],
  ["## Scene 9 — The Final Source", "## 9. The Final Source"],
];
const chronologyMetadata = [
  `revision: ${correctedRevision}`,
  "publicationDate: 2026-07-27",
  "timelineOrder: 2",
  "timelineLabel: Return investigation and attempted cleansing",
  "sourceOrder: Follow-up investigation",
  "datePrecision: relative",
  "chronologyNote: Placed after DA-001 according to the approximate order of the source investigations and transcripts; the exact interval is fictionalized or withheld.",
  "follows:",
  "  - collection: stories",
  "    slug: da-001-the-building-keeps-the-hour",
  "precedes: []",
].join("\n");

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 12) {
  throw new Error(`Expected 12 DA-002 manuscript fragments, found ${sourceFiles.length}.`);
}

const approvedSource = (
  await Promise.all(
    sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")),
  )
).join("");

const actualSourceSha256 = sha256(approvedSource);
if (actualSourceSha256 !== approvedSourceSha256) {
  throw new Error(
    `DA-002 approved-source integrity check failed. Expected ${approvedSourceSha256}, received ${actualSourceSha256}.`,
  );
}

const sourceNoteOccurrences = approvedSource.split(legacySourceNote).length - 1;
if (sourceNoteOccurrences !== 1) {
  throw new Error(
    `Expected exactly one legacy DA-002 source-note block, found ${sourceNoteOccurrences}.`,
  );
}

const sourceSummaryLine = `summary: ${sourceCardSummary}`;
if (approvedSource.split(sourceSummaryLine).length - 1 !== 1) {
  throw new Error("The frozen DA-002 source no longer contains the expected legacy card-summary line.");
}

let manuscript = approvedSource
  .replace(legacySourceNote, "")
  .replace(sourceSummaryLine, `summary: ${approvedCardSummary}`)
  .replace(/^status: withheld$/m, "status: active")
  .replace(/^revision: Final Approved Story v12$/m, chronologyMetadata)
  .replace(/^draft: true$/m, "draft: false");

// Preserve the frozen v12 repository import and apply only the two mandatory
// objective corrections authorized for Final Approved Story v13.
for (const [before, after] of correctiveReplacements) {
  const occurrences = manuscript.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one DA-002 corrective target ${JSON.stringify(before)}, found ${occurrences}.`);
  }
  manuscript = manuscript.replace(before, after);
}

for (const [sourceHeading, publishedHeading] of publishedSectionHeadings) {
  const headingOccurrences = manuscript.split(sourceHeading).length - 1;
  if (headingOccurrences !== 1) {
    throw new Error(`Expected exactly one DA-002 heading ${JSON.stringify(sourceHeading)}, found ${headingOccurrences}.`);
  }
  manuscript = manuscript.replace(sourceHeading, publishedHeading);
}

if (
  manuscript.includes("## Fictionalization and Source Note") ||
  manuscript.includes("This literary paranormal-horror story adapts reported paranormal-investigation")
) {
  throw new Error("The legacy DA-002 source note remained in the materialized publication output.");
}

if (/^##\s+Scene\s+\d+/im.test(manuscript)) {
  throw new Error("A production scene label remained in the materialized DA-002 publication output.");
}

const actualPublicationSha256 = sha256(manuscript);

await writeFile(outputPath, manuscript, "utf8");
console.log(
  `Materialized DA-002 ${correctedRevision} for publication (${actualPublicationSha256}); frozen v12 repository source preserved (${actualSourceSha256}); bounded objective-error correction layer applied; approved website/card subtitle applied as publishing metadata; standard source note supplied by the shared story template; public divisions rendered as numbered section headings; narrative chronology fixed at archive position 2 after DA-001.`,
);
