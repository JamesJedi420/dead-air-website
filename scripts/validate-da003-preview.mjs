import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const routePath = path.join(root, "dist", "stories", "da-003-the-recorder-kept-running", "index.html");
const storySource = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg");
const manuscriptDirectory = path.join(root, "src", "manuscripts", "da-003");
const expectedSourceSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const expectedCoverSha256 = "69405a56c51d39d41f7a82636840667440e8cbf114e591c7fd95f156ae4a4512";
const exists = async (file) => access(file).then(() => true).catch(() => false);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const sourceFiles = (await readdir(manuscriptDirectory))
  .filter((name) => /^part-\d{2}\.mdfrag$/.test(name))
  .sort((a, b) => a.localeCompare(b));
if (sourceFiles.length !== 18) throw new Error(`Expected 18 DA-003 source fragments, found ${sourceFiles.length}.`);
const approvedSource = (
  await Promise.all(sourceFiles.map((name) => readFile(path.join(manuscriptDirectory, name), "utf8")))
).join("");
const sourceHash = sha256(Buffer.from(approvedSource, "utf8"));
if (sourceHash !== expectedSourceSha256) {
  throw new Error(`DA-003 source-fragment integrity failure: expected ${expectedSourceSha256}, got ${sourceHash}.`);
}

if (!(await exists(routePath))) throw new Error("DA-003 private-preview route was not generated.");
if (!(await exists(storySource))) throw new Error("DA-003 materialized website source is missing.");
if (!(await exists(coverPath))) throw new Error("DA-003 approved Option A preview derivative was not materialized.");
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
  "This is not identified on the public map. That does not make it a grave.",
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
  "da-003-cover-option-a-preview.jpg",
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

const imgMatch = html.match(/<img[^>]+da-003-cover-option-a-preview\.jpg[^>]+alt="([^"]*)"/);
if (!imgMatch || !imgMatch[1].trim()) throw new Error("DA-003 preview cover is missing descriptive alt text.");
const alt = imgMatch[1].toLowerCase();
if (/grave|protector|haunted|apparition|ghost visible/.test(alt)) {
  throw new Error("DA-003 cover alt text implies unsupported paranormal certainty.");
}

console.log(`DA-003 repository-native private-preview validation PASS: approved source ${sourceHash}; cover ${coverHash}; nine numbered sections; standard source note; noindex; social metadata; ShortStory structured data; accurate cover alt text; chronology neutrality; claim ceiling; no publication date; no internal-material leakage.`);
