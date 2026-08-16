import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-003");
const coverSourcePath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg.base64");
const outputPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverOutputPath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg");
const approvedSourceSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const approvedCoverPreviewSha256 = "69405a56c51d39d41f7a82636840667440e8cbf114e591c7fd95f156ae4a4512";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 18) {
  throw new Error(`Expected 18 DA-003 manuscript fragments, found ${sourceFiles.length}.`);
}

const sourceBytes = Buffer.from(
  (
    await Promise.all(sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")))
  ).join(""),
  "utf8",
);

const actualSourceSha256 = sha256(sourceBytes);
if (actualSourceSha256 !== approvedSourceSha256) {
  throw new Error(
    `DA-003 approved-source integrity check failed. Expected ${approvedSourceSha256}, received ${actualSourceSha256}.`,
  );
}

const approvedSource = sourceBytes.toString("utf8");
const headings = [...approvedSource.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) {
  throw new Error(`Expected 9 DA-003 scene headings in approved source, found ${headings.length}.`);
}

let body = approvedSource.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");
if (/^Scene\s+\d+\s+—/m.test(body) || /^##\s+Scene\s+\d+/m.test(body)) {
  throw new Error("A production Scene label remained in the DA-003 website output.");
}

const coverBase64 = (await readFile(coverSourcePath, "utf8")).trim();
const coverBytes = Buffer.from(coverBase64, "base64");
const actualCoverSha256 = sha256(coverBytes);
if (actualCoverSha256 !== approvedCoverPreviewSha256) {
  throw new Error(
    `DA-003 approved-cover derivative integrity check failed. Expected ${approvedCoverPreviewSha256}, received ${actualCoverSha256}.`,
  );
}

const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: After a scouting trip leaves her friend injured and unable to explain what happened, Maren returns to a wooded preserve under strict rules—and discovers that the hardest evidence to control may be the story they tell about it.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: Final Approved Story v8\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: true\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\ncoverImage: /images/da-003-cover-option-a-preview.jpg\ncoverAlt: Gothic cover art showing a dark wooden house beside still water under storm clouds, with a portable recorder in the foreground.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(coverOutputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
await writeFile(coverOutputPath, coverBytes);

console.log(
  `Materialized DA-003 Final Approved Story v8 for private website proof (${sha256(Buffer.from(`${frontmatter}${body}`, "utf8"))}); approved source preserved (${actualSourceSha256}); approved Option A preview derivative preserved (${actualCoverSha256}); public divisions rendered as nine numbered headings; cross-case chronology remains unspecified; publication remains unauthorized.`,
);
