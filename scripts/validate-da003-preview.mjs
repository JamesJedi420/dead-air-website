import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const routePath = path.join(root, "dist", "stories", "da-003-the-recorder-kept-running", "index.html");
const storySource = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const manuscriptDirectory = path.join(root, "src", "manuscripts", "da-003");
const expectedCanonicalSourceSha256 = "be4851565b63d561e7ee3f1c92a3d0b8087eb74c651ab518330bfa08a77fdb3f";
const expectedRawExportSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const expectedCoverSha256 = "d5ebd224f85842f4d5e7a362e71eb6031c95e898dcf2801288c7cfcccc049019";
const expectedCoverAlt = "Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, grave marker, or apparition is visible.";
const exists = async (file) => access(file).then(() => true).catch(() => false);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalizeSource = (value) => value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

const sourceFiles = (await readdir(manuscriptDirectory))
  .filter((name) => /^part-\d{2}\.mdfrag$/.test(name))
  .sort((a, b) => a.localeCompare(b));
if (sourceFiles.length !== 18) throw new Error(`Expected 18 DA-003 source fragments, found ${sourceFiles.length}.`);
const importedSource = (
  await Promise.all(sourceFiles.map((name) => readFile(path.join(manuscriptDirectory, name), "utf8")))
).join("");
const canonicalSource = canonicalizeSource(importedSource);
const sourceHash = sha256(Buffer.from(canonicalSource, "utf8"));
if (sourceHash !== expectedCanonicalSourceSha256) {
  throw new Error(`DA-003 canonical source-fragment integrity failure: expected ${expectedCanonicalSourceSha256}, got ${sourceHash}.`);
}

if (!(await exists(routePath))) throw new Error("DA-003 private-preview route was not generated.");
if (!(await exists(storySource))) throw new Error("DA-003 materialized website source is missing.");
if (!(await exists(coverPath))) throw new Error("DA-003 approved Option A evidence-focused derivative is missing.");
const coverHash = sha256(await readFile(coverPath));
if (coverHash !== expectedCoverSha256) {
  throw new Error(`DA-003 cover integrity failure: expected ${expectedCoverSha256}, got ${coverHash}.`);
}

const html = await readFile(routePath, "utf8");
const source = await readFile(storySource, "utf8");
const required = [
  "The Recorder Kept Running",
  "Final Approved Story v8",
  "1. The Unfinished House",
  "9. The Cut We Keep",
  "The passenger door stood open when Maren looked up from the camera.",
  "This is not identified on the public map",
  "That does not make it a grave",
  "The phone case rattled once against the stone.",
  "The file ended.",
  "Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.",
  'name="robots" content="noindex,nofollow,noarchive"',
  'property="og:type" content="article"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:image"',
  'name="twitter:image"',
  'name="twitter:card" content="summary_large_image"',
  'type="application/ld+json"',
  '"@type":"ShortStory"',
  "da-003-cover-option-a-evidence-crop-preview.jpg",
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`DA-003 preview output missing ${JSON.stringify(needle)}.`);
}

const headingMatches = [...html.matchAll(/<h2[^>]*>(?:<[^>]+>)*([1-9])\.\s/g)];
if (headingMatches.length !== 9) throw new Error(`Expected 9 numbered DA-003 h2 sections, found ${headingMatches.length}.`);
if (/Scene\s+[1-9]\s+—/.test(html)) throw new Error("Internal Scene labels remained in DA-003 reader-facing headings.");
if (html.includes("The grave is not a grave")) throw new Error("Overstated grave marketing copy leaked into DA-003 preview output.");
if (/timelineOrder|timelineLabel|sourceOrder|datePrecision|chronologyNote|follows:|precedes:/i.test(source)) {
  throw new Error("Unsupported DA-003 cross-case chronology metadata was materialized.");
}
if (/publicationDate:/i.test(source)) throw new Error("DA-003 publication date was assigned before publication authorization.");
if (!/previewOnly:\s*true/i.test(source)) throw new Error("DA-003 website source is not marked preview-only.");
if (/Source Transcript|Transcript Notes|PPC-DA-003|Contradiction Farming|Hidden Truth Ledger|Pattern Threshold Watchlist/i.test(html)) {
  throw new Error("Internal Dead Air development or continuity material leaked into the DA-003 reader-facing preview.");
}

const imgMatch = html.match(/<img[^>]+da-003-cover-option-a-evidence-crop-preview\.jpg[^>]+alt="([^"]*)"/);
if (!imgMatch || !imgMatch[1].trim()) throw new Error("DA-003 preview cover is missing descriptive alt text.");
if (imgMatch[1] !== expectedCoverAlt) {
  throw new Error("DA-003 preview cover alt text differs from the approved neutral evidence description.");
}

console.log(`DA-003 repository-native private-preview validation PASS: canonical approved source ${sourceHash} (raw approved export ${expectedRawExportSha256}); cover ${coverHash}; nine numbered sections; standard source note; noindex; social metadata; ShortStory structured data; accurate cover alt text; chronology neutrality; claim ceiling; no publication date; no internal-material leakage.`);
