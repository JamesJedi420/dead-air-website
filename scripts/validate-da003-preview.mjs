import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const context = process.env.CONTEXT ?? process.env.NETLIFY_CONTEXT ?? "local";
const keyPresent = Boolean(process.env.DA003_PREVIEW_KEY_HEX);
const routePath = path.join(root, "dist", "stories", "da-003-the-recorder-kept-running", "index.html");
const storySource = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const manuscriptCipherPath = path.join(root, "src", "private-payloads", "da-003", "manuscript.enc.json");
const coverCipherPath = path.join(root, "src", "private-payloads", "da-003", "cover.enc.json");
const exists = async (file) => access(file).then(() => true).catch(() => false);

if (!(await exists(manuscriptCipherPath))) throw new Error("DA-003 encrypted manuscript payload is missing from the private-preview branch.");
if (!(await exists(coverCipherPath))) throw new Error("DA-003 encrypted cover payload is missing from the private-preview branch.");

if (context !== "deploy-preview" || !keyPresent) {
  if (await exists(storySource)) throw new Error(`DA-003 readable story source exists outside an active protected deploy-preview gate (${context}).`);
  if (await exists(routePath)) throw new Error(`DA-003 route leaked into a non-preview or keyless build (${context}).`);
  if (await exists(coverPath)) throw new Error(`DA-003 cover leaked into a non-preview or keyless build (${context}).`);
  console.log(`DA-003 fail-closed validation passed for ${context}: ciphertext may exist, but no readable source, route, or cover is materialized without the deploy-preview key.`);
  process.exit(0);
}

if (!(await exists(routePath))) throw new Error("DA-003 private-preview route was not generated.");
if (!(await exists(coverPath))) throw new Error("DA-003 approved-master evidence crop was not materialized.");

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
  "da-003-cover-option-a-evidence-crop-preview.jpg",
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`DA-003 preview output missing ${JSON.stringify(needle)}.`);
}

const headingMatches = [...html.matchAll(/<h2[^>]*>(?:<[^>]+>)*([1-9])\.\s/g)];
if (headingMatches.length !== 9) throw new Error(`Expected 9 numbered DA-003 h2 sections, found ${headingMatches.length}.`);
if (/Scene\s+[1-9]\s+—/.test(html)) throw new Error("Internal Scene labels remained in DA-003 public-facing preview headings.");
if (html.includes("The grave is not a grave")) throw new Error("Overstated grave marketing copy leaked into DA-003 preview output.");
if (/timelineOrder|follows:|precedes:/i.test(source)) throw new Error("Unsupported DA-003 cross-case chronology metadata was materialized.");
if (/Source Transcript|Transcript Notes|PPC-DA-003|Contradiction Farming|Hidden Truth Ledger|Pattern Threshold Watchlist/i.test(html)) {
  throw new Error("Internal Dead Air development or continuity material leaked into the DA-003 reader-facing preview.");
}

const imgMatch = html.match(/<img[^>]+da-003-cover-option-a-evidence-crop-preview\.jpg[^>]+alt="([^"]*)"/);
if (!imgMatch || !imgMatch[1].trim()) throw new Error("DA-003 preview cover crop is missing descriptive alt text.");
const alt = imgMatch[1].toLowerCase();
if (/unfinished|cabin|grave|protector|haunted|apparition visible|ghost visible/.test(alt)) {
  throw new Error("DA-003 cover alt text implies unsupported geography or paranormal certainty.");
}

console.log("DA-003 private-preview validation PASS: encrypted fail-closed transport, approved-v8 route, nine numbered sections, source note, noindex, social metadata, structured data, evidence-focused approved-master crop, neutral alt text, chronology neutrality, claim ceiling, and internal-material leak checks verified.");
