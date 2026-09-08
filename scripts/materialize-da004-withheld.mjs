import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-004");
const outputPath = path.join(root, "src", "content", "stories", "da-004-close-enough-to-recognize.md");

const sourceGoogleDocId = "1RB0F4ShpEv9ewV9gXDkm4woHfaCGLDz9TV0xNYqHF38";
const sourceGoogleDocRevisionId = "ANLCKQmfEqSBabL5tpiv0nQaM2sOUc4pCvWufpRpil4o45XUd59NmY1AD0ygCNIJbGMBy7uY4D2DkJq312R2RMV5Nc3vWVs3n1ve8LOF3m4";
const approvedRevision = "Final Approved Story v1.7";
const openingFingerprint = "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.";
const closingFingerprint = "Neither of them named what had made the rhythm.";
const expectedSceneTitles = [
  "Arrival",
  "Public Ghosts",
  "Employee Passage",
  "One, Then Two",
  "Source Hunt",
  "The Chair / The Lie",
  "Control Test",
  "Martin Follows",
  "The New Sequence",
  "Raw Audio",
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const normalizeParagraphs = (value) =>
  value
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .join("\n\n")
    .trimEnd() + "\n";

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));
if (sourceFiles.length !== 10) throw new Error(`Expected 10 DA-004 manuscript fragments, found ${sourceFiles.length}.`);

const imported = (await Promise.all(sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")))).join("\n");
const normalized = normalizeParagraphs(imported);
const headingPattern = /^DA-004 — Scene (\d{2}) — (.+?) — (?:Approved Draft|Draft) v[0-9.]+$/gm;
const headings = [...normalized.matchAll(headingPattern)];
if (headings.length !== 10) throw new Error(`Expected 10 DA-004 source headings, found ${headings.length}.`);

for (let i = 0; i < headings.length; i += 1) {
  const [, sceneNumber, title] = headings[i];
  if (sceneNumber !== String(i + 1).padStart(2, "0")) throw new Error(`Unexpected DA-004 scene number ${sceneNumber} at position ${i + 1}.`);
  if (title !== expectedSceneTitles[i]) throw new Error(`Unexpected DA-004 scene title ${JSON.stringify(title)} at position ${i + 1}; expected ${JSON.stringify(expectedSceneTitles[i])}.`);
}

if (!normalized.includes(openingFingerprint)) throw new Error("DA-004 opening source fingerprint is missing.");
if (!normalized.trimEnd().endsWith(closingFingerprint)) throw new Error("DA-004 closing source fingerprint is missing.");

const canonicalSource = normalized.replace(headingPattern, (_match, sceneNumber, title) => `Scene ${sceneNumber} — ${title}`);
const canonicalSourceSha256 = sha256(Buffer.from(canonicalSource, "utf8"));
const wordMatches = canonicalSource.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
const wordCount = wordMatches.length;
if (wordCount < 16000 || wordCount > 18500) throw new Error(`DA-004 source word-count sanity check failed: ${wordCount}.`);

const body = canonicalSource.replace(/^Scene (\d{2}) — (.+)$/gm, (_match, sceneNumber, title) => `## ${Number(sceneNumber)}. ${title}`);
if (/^DA-004 — Scene\s+\d+/m.test(body) || /^##\s+Scene\s+\d+/m.test(body)) throw new Error("A DA-004 internal Scene label remained in the website body.");

const frontmatter = `---\nslug: da-004-close-enough-to-recognize\ntitle: Close Enough to Recognize\nsummary: A paranormal videographer brings his skeptical father to a mountain hotel. Then the building repeats a knock pattern no one else should know.\nstatus: withheld\nclassification: Literary paranormal horror\nrevision: ${approvedRevision}\ncanonicalStatus: established canon\ndraft: true\npreviewOnly: true\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - haunted hotel\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impacts\n  - voice-like audio\n  - disputed sound direction\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - environmental comparisons\n  - negative observations\nlocations:\n  - Kestrel Hotel\ncontentWarnings:\n  - Psychological distress and panic\n  - Nausea and bodily unease\n  - Unexplained knocking and voice-like audio\n  - Contested hotel ghost lore\n  - Nighttime wandering in restricted-adjacent hotel corridors\ncontentNotes:\n  - Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");

console.log(`DA-004 withheld website edition materialized from ten repository-native scene fragments tied to ${sourceGoogleDocId}@${sourceGoogleDocRevisionId}: ${approvedRevision}; canonical approved-source SHA-256 ${canonicalSourceSha256}; ${wordCount} source tokens by release sanity counter; ten numbered public sections; status withheld/draft/previewOnly; no publication date; no cover/release asset wired.`);
