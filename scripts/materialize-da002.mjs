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
const legacySourceNote = [
  "## Fictionalization and Source Note",
  "",
  "This literary paranormal-horror story adapts reported paranormal-investigation and mediumship material into fiction. Names, locations, identities, historical material, and institutional details are fictionalized or invented. The story preserves competing ordinary explanations and unresolved interpretations. Public release excludes raw source materials and restricted participant information.",
  "",
  "",
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

const manuscript = approvedSource
  .replace(legacySourceNote, "")
  .replace(/^status: withheld$/m, "status: active")
  .replace(
    /^revision: Final Approved Story v12$/m,
    "revision: Final Approved Story v12\npublicationDate: 2026-07-27",
  )
  .replace(/^draft: true$/m, "draft: false");

if (
  manuscript.includes("## Fictionalization and Source Note") ||
  manuscript.includes("This literary paranormal-horror story adapts reported paranormal-investigation")
) {
  throw new Error("The legacy DA-002 source note remained in the materialized publication output.");
}

const actualPublicationSha256 = sha256(manuscript);

await writeFile(outputPath, manuscript, "utf8");
console.log(
  `Materialized DA-002 Final Approved Story v12 for publication (${actualPublicationSha256}); approved source preserved (${actualSourceSha256}); standard source note supplied by the shared story template.`,
);
