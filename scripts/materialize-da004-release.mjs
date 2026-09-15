import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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
const sourceGoogleDocId = "1RB0F4ShpEv9ewV9gXDkm4woHfaCGLDz9TV0xNYqHF38";
const sourceGoogleDocRevisionId = "ANLCKQmfEqSBabL5tpiv0nQaM2sOUc4pCvWufpRpil4o45XUd59NmY1AD0ygCNIJbGMBy7uY4D2DkJq312R2RMV5Nc3vWVs3n1ve8LOF3m4";
const approvedRevision = "Final Approved Story v1.7";
const publicationDate = "2026-09-14";
const approvedWebsiteCardSubtitle = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const approvedAlt = "An empty, warmly lit hotel corridor leads to a closed dark service door with a brass STAFF ONLY plaque.";
const openingFingerprint = "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.";
const closingFingerprint = "Neither of them named what had made the rhythm.";
const expectedSceneTitles = ["Arrival","Public Ghosts","Employee Passage","One, Then Two","Source Hunt","The Chair / The Lie","Control Test","Martin Follows","The New Sequence","Raw Audio"];

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
  ["fragmentCount", sourceLock.fragmentCount, 10],
  ["lockStatus", sourceLock.lockStatus, "IMMUTABLE_APPROVED_SOURCE"],
  ["publicationDate", sourceLock.publicationDate, publicationDate],
]) {
  if (actual !== expected) throw new Error(`DA-004 source lock ${field} mismatch: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
}
if (sourceLock.publicReleaseAuthorized !== true) throw new Error("DA-004 publicReleaseAuthorized must be true after explicit publication authorization.");

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

const normalizeParagraphs = (value) => value.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").split(/\n+/).map((line)=>line.trimEnd()).filter(Boolean).join("\n\n").trimEnd()+"\n";
const sourceFiles = (await readdir(sourceDirectory)).filter((name)=>/^part-\d{2}\.mdfrag$/.test(name)).sort();
if (sourceFiles.length !== 10) throw new Error(`Expected 10 DA-004 manuscript fragments, found ${sourceFiles.length}.`);
const imported = (await Promise.all(sourceFiles.map((name)=>readFile(path.join(sourceDirectory,name),"utf8")))).join("\n");
const normalized = normalizeParagraphs(imported);
const headingPattern = /^DA-004 — Scene (\d{2}) — (.+?) — (?:Approved Draft|Draft) v[0-9.]+$/gm;
const headings = [...normalized.matchAll(headingPattern)];
if (headings.length !== 10) throw new Error(`Expected 10 DA-004 source headings, found ${headings.length}.`);
for (let i=0;i<headings.length;i+=1) {
  const [,number,title]=headings[i];
  if(number!==String(i+1).padStart(2,"0")||title!==expectedSceneTitles[i]) throw new Error(`Unexpected DA-004 scene heading at ${i+1}.`);
}
if (!normalized.includes(openingFingerprint) || !normalized.trimEnd().endsWith(closingFingerprint)) throw new Error("DA-004 approved source fingerprints failed.");
const canonicalSource = normalized.replace(headingPattern,(_m,n,t)=>`Scene ${n} — ${t}`);
const canonicalSourceSha256 = sha256(Buffer.from(canonicalSource,"utf8"));
if (canonicalSourceSha256 !== sourceLock.canonicalFragmentSha256) throw new Error(`DA-004 approved-source hash drift: ${canonicalSourceSha256}.`);
const words = canonicalSource.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
if (words.length < 16000 || words.length > 18500) throw new Error(`DA-004 source word-count sanity check failed: ${words.length}.`);
const body = canonicalSource.replace(/^Scene (\d{2}) — (.+)$/gm,(_m,n,t)=>`## ${Number(n)}. ${t}`);
const artFrontmatter = Object.entries(assets).map(([role,url])=>`${role}: "${url}"`).join("\n");
const frontmatter = `---\nslug: da-004-close-enough-to-recognize\ntitle: Close Enough to Recognize\nsummary: ${approvedWebsiteCardSubtitle}\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 65–81 minutes\nrevision: ${approvedRevision}\npublicationDate: ${publicationDate}\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: false\n${artFrontmatter}\ncoverImageWidth: 1600\ncoverImageHeight: 900\ncoverAlt: \"${approvedAlt}\"\nogImageAlt: \"${approvedAlt}\"\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - haunted hotel\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impacts\n  - voice-like audio\n  - disputed sound direction\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - environmental comparisons\n  - negative observations\nlocations:\n  - Kestrel Hotel\ncontentWarnings:\n  - Psychological distress and panic\n  - Nausea and bodily unease\n  - Unexplained knocking and voice-like audio\n  - Contested hotel ghost lore\n  - Nighttime wandering in restricted-adjacent hotel corridors\ncontentNotes:\n  - Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive:true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
console.log(`DA-004 publication edition materialized; source ${canonicalSourceSha256}; v3.0 redraw responsive release art wired; publicationDate=${publicationDate}; publicReleaseAuthorized=true.`);
