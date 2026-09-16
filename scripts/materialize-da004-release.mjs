import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-004");
const sourceLockPath = path.join(sourceDirectory, "source-lock.json");
const releaseAssetSourceDirectory = path.join(root, "src", "release-assets", "da004-v3");
const publicAssetDirectory = path.join(root, "public", "assets", "da-004");
const outputPath = path.join(root, "src", "content", "stories", "da-004-close-enough-to-recognize.md");
const desktopAssetFilename = "da004_art001_v3_0_16x9_1600x900.webp";
const mobileAssetFilename = "da004_art001_v3_0_2x3_1024x1536.webp";
const desktopAssetPath = path.join(publicAssetDirectory, desktopAssetFilename);
const mobileAssetPath = path.join(publicAssetDirectory, mobileAssetFilename);

const sourceLock = JSON.parse(await readFile(sourceLockPath, "utf8"));
const sourceGoogleDocId = "1EUA5lOhf7AdNjeYXHOngDuZZ4MNnZW_Q2n-N-s2_zKE";
const sourceGoogleDocRevisionId = "ANLCKQkmSlXuPFN7axutESKIhsFxqMcj3qtjv506QPbnUEgVJtw8Z1xOjBt5-Ao5o9XKdxtr-ch-aFIJ7sqaNQypDd9bCxtpCwSwrsrMFS8";
const approvedRevision = "Final Approved Story v1.10";
const publicationDate = "2026-09-14";
const approvedWebsiteCardSubtitle = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const approvedAlt = "An empty, warmly lit hotel corridor leads to a closed dark service door with a brass STAFF ONLY plaque.";
const openingFingerprint = "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.";
const closingFingerprint = "Neither of them named what had made the rhythm.";
const expectedSceneTitles = ["Arrival","Public Ghosts","Employee Passage","One, Then Two","Source Hunt","The Chair / The Lie","Control Test","Martin Follows","The New Sequence","Raw Audio"];
const canonicalFragmentFiles = Array.from({ length: 10 }, (_value, index) => `part-${String(index + 1).padStart(2, "0")}.mdfrag`);

const assets = {
  coverImage: `/assets/da-004/${desktopAssetFilename}`,
  keyArtImage: `/assets/da-004/${mobileAssetFilename}`,
  cardImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp",
  squareImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp",
  ogImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp",
  socialImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp",
};

for (const [field, actual, expected] of [
  ["case", sourceLock.case, "DA-004"],
  ["title", sourceLock.title, "Close Enough to Recognize"],
  ["approvedRevision", sourceLock.approvedRevision, approvedRevision],
  ["authoritativeGoogleDocId", sourceLock.authoritativeGoogleDocId, sourceGoogleDocId],
  ["authoritativeGoogleDocRevisionId", sourceLock.authoritativeGoogleDocRevisionId, sourceGoogleDocRevisionId],
  ["sourceSnapshotFormat", sourceLock.sourceSnapshotFormat, "utf8-canonical-scene-fragments"],
  ["sceneCount", sourceLock.sceneCount, 10],
  ["canonicalFragmentCount", sourceLock.canonicalFragmentCount, 10],
  ["lockStatus", sourceLock.lockStatus, "IMMUTABLE_APPROVED_SOURCE"],
  ["publicationDate", sourceLock.publicationDate, publicationDate],
  ["publicPredecessorRevision", sourceLock.publicPredecessorRevision, "Final Approved Story v1.7"],
]) {
  if (actual !== expected) throw new Error(`DA-004 source lock ${field} mismatch: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
}
if (sourceLock.publicReleaseAuthorized !== false) throw new Error("DA-004 v1.10 corrective source lock must remain non-public until separate correction publication authorization.");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const decodeReleaseAsset = async (prefix, chunkCount) => {
  const chunks = [];
  for (let index = 1; index <= chunkCount; index += 1) {
    const chunkName = `${prefix}.part${String(index).padStart(2, "0")}.b64`;
    chunks.push((await readFile(path.join(releaseAssetSourceDirectory, chunkName), "utf8")).trim());
  }
  return Buffer.from(chunks.join(""), "base64");
};
const desktopBytes = await decodeReleaseAsset("desktop", 3);
const mobileBytes = await decodeReleaseAsset("mobile", 4);
const desktopSha256 = sha256(desktopBytes);
const mobileSha256 = sha256(mobileBytes);
if (desktopSha256 !== "01a48933e9152e700f810e2af4a0daae02d4738cab564745b0a98e78ba08b118") throw new Error(`DA-004 v3 desktop art hash mismatch: ${desktopSha256}.`);
if (mobileSha256 !== "6866c981fbbccc359fc2032716a0cfb9ad4141cb6177a3c178cc6e50b2959bc4") throw new Error(`DA-004 v3 mobile art hash mismatch: ${mobileSha256}.`);
await mkdir(publicAssetDirectory, { recursive: true });
await writeFile(desktopAssetPath, desktopBytes);
await writeFile(mobileAssetPath, mobileBytes);

const canonicalFragments = await Promise.all(
  canonicalFragmentFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")),
);
const trimmedFragments = canonicalFragments.map((fragment) => fragment.trimEnd());
const assemblyCandidates = [
  { label: "literal-concatenation", text: canonicalFragments.join("") },
  { label: "trimmed-double-newline", text: trimmedFragments.join("\n\n") },
  { label: "trimmed-double-newline-terminal", text: `${trimmedFragments.join("\n\n")}\n` },
  { label: "trimmed-triple-newline", text: trimmedFragments.join("\n\n\n") },
  { label: "trimmed-triple-newline-terminal", text: `${trimmedFragments.join("\n\n\n")}\n` },
];
const resolvedAssembly = assemblyCandidates.find(
  (candidate) => sha256(Buffer.from(candidate.text, "utf8")) === sourceLock.canonicalSourceSha256,
);
if (!resolvedAssembly) {
  const observed = assemblyCandidates
    .map((candidate) => `${candidate.label}=${sha256(Buffer.from(candidate.text, "utf8"))}`)
    .join(", ");
  throw new Error(`DA-004 approved-source assembly does not reproduce locked hash ${sourceLock.canonicalSourceSha256}. Observed: ${observed}.`);
}
const canonicalSource = resolvedAssembly.text;
const canonicalSourceSha256 = sha256(Buffer.from(canonicalSource, "utf8"));
if (/DA-004 — Final Approved Story|REVISION STATUS:/m.test(canonicalSource)) throw new Error("DA-004 canonical fragments contain document-level preamble material.");

const headingPattern = /^Scene (\d{2}) — (.+)$/gm;
const headings = [...canonicalSource.matchAll(headingPattern)];
if (headings.length !== 10) throw new Error(`Expected 10 DA-004 canonical scene headings, found ${headings.length}.`);
for (let i = 0; i < headings.length; i += 1) {
  const [, number, title] = headings[i];
  if (number !== String(i + 1).padStart(2, "0") || title !== expectedSceneTitles[i]) throw new Error(`Unexpected DA-004 scene heading at ${i + 1}.`);
}
if (!canonicalSource.includes(openingFingerprint) || !canonicalSource.trimEnd().endsWith(closingFingerprint)) throw new Error("DA-004 approved source fingerprints failed.");
const words = canonicalSource.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
if (words.length < 15000 || words.length > 17000) throw new Error(`DA-004 source word-count sanity check failed: ${words.length}.`);

const body = canonicalSource.replace(headingPattern, (_m, n, t) => `## ${Number(n)}. ${t}`);
const artFrontmatter = Object.entries(assets).map(([role, url]) => `${role}: "${url}"`).join("\n");
const frontmatter = `---\nslug: da-004-close-enough-to-recognize\ntitle: Close Enough to Recognize\nsummary: ${approvedWebsiteCardSubtitle}\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 65–81 minutes\nrevision: ${approvedRevision}\npublicationDate: ${publicationDate}\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: false\n${artFrontmatter}\ncoverImageWidth: 1600\ncoverImageHeight: 900\ncoverAlt: \"${approvedAlt}\"\nogImageAlt: \"${approvedAlt}\"\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - haunted hotel\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impacts\n  - voice-like audio\n  - disputed sound direction\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - environmental comparisons\n  - negative observations\nlocations:\n  - Kestrel Hotel\ncontentWarnings:\n  - Psychological distress and panic\n  - Nausea and bodily unease\n  - Unexplained knocking and voice-like audio\n  - Contested hotel ghost lore\n  - Nighttime wandering in restricted-adjacent hotel corridors\ncontentNotes:\n  - Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
console.log(`DA-004 v1.10 corrective edition materialized from authoritative source lock ${canonicalSourceSha256} using ${resolvedAssembly.label}; v3.0 responsive release art preserved; publicationDate=${publicationDate}; correctionPublicationAuthorized=false.`);
