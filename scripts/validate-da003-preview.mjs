import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const keyPresent = Boolean(process.env.DA003_PREVIEW_KEY_HEX);
const manuscriptPayloadComplete = Array.from({ length: 5 }, (_, index) =>
  Boolean(process.env[`DA003_MANUSCRIPT_PART_${String(index).padStart(2, "0")}`]),
).every(Boolean);
const coverPayloadComplete = Array.from({ length: 5 }, (_, index) =>
  Boolean(process.env[`DA003_COVER_PART_${String(index).padStart(2, "0")}`]),
).every(Boolean);
const previewPayloadComplete = keyPresent && manuscriptPayloadComplete && coverPayloadComplete;

const routePath = path.join(root, "dist", "stories", "da-003-the-recorder-kept-running", "index.html");
const storySource = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg");

const exists = async (file) => access(file).then(() => true).catch(() => false);

if (!previewPayloadComplete) {
  if (await exists(storySource)) throw new Error("DA-003 readable story source exists while the protected preview payload is incomplete.");
  if (await exists(routePath)) throw new Error("DA-003 route leaked into a build while the protected preview payload is incomplete.");
  if (await exists(coverPath)) throw new Error("DA-003 cover leaked into a build while the protected preview payload is incomplete.");
  console.log("DA-003 withheld validation passed: incomplete protected payload produced no readable source, route, or cover.");
  process.exit(0);
}

if (!(await exists(routePath))) throw new Error("DA-003 private-preview route was not generated.");
if (!(await exists(coverPath))) throw new Error("DA-003 approved preview cover was not materialized.");

const html = await readFile(routePath, "utf8");
const required = [
  "The Recorder Kept Running",
  "Final Approved Story v8",
  "1. The Unfinished House",
  "9. The Cut We Keep",
  "Fictionalization and Source Note",
  "da-003-cover-option-a-preview.jpg",
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`DA-003 preview output missing ${JSON.stringify(needle)}.`);
}
if (/Scene\s+[1-9]\s+—/.test(html)) throw new Error("Production Scene labels remained in DA-003 public-facing preview headings.");
if (html.includes("The grave is not a grave")) throw new Error("Overstated grave marketing copy leaked into DA-003 preview output.");
console.log("DA-003 private-preview output validation passed: route, revision, numbered headings, source note, cover, and claim ceiling verified.");