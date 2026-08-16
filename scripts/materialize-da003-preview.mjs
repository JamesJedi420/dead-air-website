import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const storyPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const expectedSourceSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const expectedCoverSha256 = "4747217629b0ddaa2da7d3e8d7b236d5dbd1d2f8cedbd990b1d46db60986ec04";
const manuscriptBase64 = process.env.DA003_MANUSCRIPT_GZ_B64;
const coverBase64 = process.env.DA003_COVER_JPG_B64;
const context = process.env.CONTEXT ?? process.env.NETLIFY_CONTEXT ?? "local";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const secretMaterialPresent = Boolean(manuscriptBase64 || coverBase64);

if (context === "production" && secretMaterialPresent) {
  throw new Error("DA-003 private-preview materialization is forbidden in production context.");
}

if (context !== "deploy-preview") {
  await rm(storyPath, { force: true });
  await rm(coverPath, { force: true });
  console.log(`DA-003 remains withheld in ${context} context; private materialization is deploy-preview only.`);
  process.exit(0);
}

if (!manuscriptBase64) {
  await rm(storyPath, { force: true });
  await rm(coverPath, { force: true });
  console.log("DA-003 manuscript secret is unavailable; readable manuscript remains withheld from this preview build.");
  process.exit(0);
}

const sourceBytes = gunzipSync(Buffer.from(manuscriptBase64, "base64"));
const actualHash = sha256(sourceBytes);
if (actualHash !== expectedSourceSha256) {
  throw new Error(`DA-003 source integrity failure: expected ${expectedSourceSha256}, got ${actualHash}.`);
}

const source = sourceBytes.toString("utf8");
const headings = [...source.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) throw new Error(`Expected 9 DA-003 scene headings, found ${headings.length}.`);

const body = source.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");
let coverFrontmatter = "";
if (coverBase64) {
  const coverBytes = Buffer.from(coverBase64, "base64");
  const coverHash = sha256(coverBytes);
  if (coverHash !== expectedCoverSha256) {
    throw new Error(`DA-003 cover integrity failure: expected ${expectedCoverSha256}, got ${coverHash}.`);
  }
  await mkdir(path.dirname(coverPath), { recursive: true });
  await writeFile(coverPath, coverBytes);
  coverFrontmatter = "coverImage: /images/da-003-cover-option-a-evidence-crop-preview.jpg\ncoverAlt: Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, structure, grave marker, or apparition is visible.\n";
} else {
  await rm(coverPath, { force: true });
  console.warn("DA-003 approved cover crop secret is unavailable; preview continues for manuscript QA only.");
}

const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: After a scouting trip leaves her friend injured and unable to explain what happened, Maren returns to a wooded preserve under strict rules—and discovers that the hardest evidence to control may be the story they tell about it.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: Final Approved Story v8\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: true\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\n${coverFrontmatter}---\n\n`;

await mkdir(path.dirname(storyPath), { recursive: true });
await writeFile(storyPath, frontmatter + body, "utf8");

console.log(`Materialized SSO-protected DA-003 preview from approved v8 (${actualHash}); chronology remains unspecified and no production publication state changed.`);
