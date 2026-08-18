import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-003");
const outputPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const approvedRawExportSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const approvedCanonicalSourceSha256 = "be4851565b63d561e7ee3f1c92a3d0b8087eb74c651ab518330bfa08a77fdb3f";
const approvedCoverPreviewSha256 = "d5ebd224f85842f4d5e7a362e71eb6031c95e898dcf2801288c7cfcccc049019";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalizeSource = (value) => value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 18) throw new Error(`Expected 18 DA-003 manuscript fragments, found ${sourceFiles.length}.`);

const importedSource = (await Promise.all(sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")))).join("");
const approvedSource = canonicalizeSource(importedSource);
const actualCanonicalSourceSha256 = sha256(Buffer.from(approvedSource, "utf8"));
if (actualCanonicalSourceSha256 !== approvedCanonicalSourceSha256) {
  throw new Error(`DA-003 canonical approved-source integrity check failed. Expected ${approvedCanonicalSourceSha256}, received ${actualCanonicalSourceSha256}. Raw authoritative Google export remains separately frozen as ${approvedRawExportSha256}.`);
}

const coverBytes = await readFile(coverPath);
const actualCoverSha256 = sha256(coverBytes);
if (actualCoverSha256 !== approvedCoverPreviewSha256) {
  throw new Error(`DA-003 approved-cover derivative integrity check failed. Expected ${approvedCoverPreviewSha256}, received ${actualCoverSha256}.`);
}

const headings = [...approvedSource.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) throw new Error(`Expected 9 DA-003 scene headings in approved source, found ${headings.length}.`);

const body = approvedSource.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");
if (/^Scene\s+\d+\s+—/m.test(body) || /^##\s+Scene\s+\d+/m.test(body)) throw new Error("A production Scene label remained in the DA-003 website output.");

const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: Maren finds Jonah bleeding in an unfinished house with three pages he does not remember writing. Hours later, he asks her to take him back to Harrow River.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: Final Approved Story v8\npublicationDate: 2026-08-18\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: false\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\ncoverImage: /images/da-003-cover-option-a-evidence-crop-preview.jpg\ncoverAlt: Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, grave marker, or apparition is visible.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");

console.log(`Materialized DA-003 Final Approved Story v8 for publication (${sha256(Buffer.from(`${frontmatter}${body}`, "utf8"))}); canonical approved source preserved (${actualCanonicalSourceSha256}; raw approved export ${approvedRawExportSha256}); approved Option A evidence-focused derivative preserved (${actualCoverSha256}); public divisions rendered as nine numbered headings; cross-case chronology remains unspecified; publication authorized 2026-08-18.`);
