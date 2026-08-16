import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const context = process.env.CONTEXT ?? process.env.NETLIFY_CONTEXT ?? "local";
const keyPresent = Boolean(process.env.DA003_PREVIEW_KEY_HEX);
const manuscriptPayloadComplete = Array.from({ length: 5 }, (_, index) =>
  Boolean(process.env[`DA003_MANUSCRIPT_PART_${String(index).padStart(2, "0")}`]),
).every(Boolean);
const previewPayloadComplete = keyPresent && manuscriptPayloadComplete;

const routePath = path.join(root, "dist", "stories", "da-003-the-recorder-kept-running", "index.html");
const storySource = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg");
const exists = async (file) => access(file).then(() => true).catch(() => false);

if (context !== "deploy-preview" || !previewPayloadComplete) {
  if (await exists(storySource)) throw new Error(`DA-003 readable story source exists outside a complete deploy-preview gate (${context}).`);
  if (await exists(routePath)) throw new Error(`DA-003 route leaked into a non-preview or incomplete build (${context}).`);
  if (await exists(coverPath)) throw new Error(`DA-003 cover leaked into a non-preview or incomplete build (${context}).`);
  console.log(`DA-003 withheld validation passed for ${context}: no readable source, route, or cover leaked.`);
  process.exit(0);
}

if (!(await exists(routePath))) throw new Error("DA-003 private-preview route was not generated.");
const html = await readFile(routePath, "utf8");
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
  'type="application/ld+json"',
  '"@type":"ShortStory"',
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`DA-003 preview output missing ${JSON.stringify(needle)}.`);
}

const headingMatches = [...html.matchAll(/<h2[^>]*>(?:<[^>]+>)*([1-9])\.\s/g)];
if (headingMatches.length !== 9) throw new Error(`Expected 9 numbered DA-003 h2 sections, found ${headingMatches.length}.`);
if (/Scene\s+[1-9]\s+—/.test(html)) throw new Error("Internal Scene labels remained in DA-003 public-facing preview headings.");
if (html.includes("The grave is not a grave")) throw new Error("Overstated grave marketing copy leaked into DA-003 preview output.");
if (/timelineOrder|follows:\s*da-002|precedes:/i.test(await readFile(storySource, "utf8"))) {
  throw new Error("Unsupported DA-003 cross-case chronology metadata was materialized.");
}

const hasCover = await exists(coverPath);
if (hasCover) {
  for (const needle of [
    "da-003-cover-option-a-preview.jpg",
    'class="da003-evidence-crop"',
    'property="og:image"',
    'name="twitter:image"',
    'name="twitter:card" content="summary_large_image"',
  ]) {
    if (!html.includes(needle)) throw new Error(`DA-003 approved cover was materialized but metadata/rendering is missing ${JSON.stringify(needle)}.`);
  }
  const imgMatch = html.match(/<img[^>]+da-003-cover-option-a-preview\.jpg[^>]+alt="([^"]*)"/);
  if (!imgMatch || !imgMatch[1].trim()) throw new Error("DA-003 preview cover is missing descriptive alt text.");
  const alt = imgMatch[1].toLowerCase();
  if (/unfinished|cabin|grave|protector|haunted|apparition visible|ghost visible/.test(alt)) {
    throw new Error("DA-003 cover alt text implies unsupported geography or paranormal certainty.");
  }
  console.log("DA-003 private-preview validation PASS: approved v8 route, nine numbered sections, source note, noindex, structured data, constrained cover crop, neutral alt text, social image metadata, and claim ceiling verified.");
} else {
  console.warn("DA-003 private-preview validation PARTIAL PASS: manuscript, source note, noindex, structured data, and claim ceiling verified; approved cover payload is not yet materialized and remains a release-verification blocker.");
}
