import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-004");
const sourceLockPath = path.join(sourceDirectory, "source-lock.json");
const outputPath = path.join(root, "src", "content", "stories", "da-004-close-enough-to-recognize.md");
const releaseAssetDirectory = path.join(root, "release-assets", "da-004");
const publicAssetDirectory = path.join(root, "public", "images", "da-004");
const isDeployPreview = process.env.CONTEXT === "deploy-preview";

const sourceLock = JSON.parse(await readFile(sourceLockPath, "utf8"));
const sourceGoogleDocId = "1RB0F4ShpEv9ewV9gXDkm4woHfaCGLDz9TV0xNYqHF38";
const sourceGoogleDocRevisionId = "ANLCKQmfEqSBabL5tpiv0nQaM2sOUc4pCvWufpRpil4o45XUd59NmY1AD0ygCNIJbGMBy7uY4D2DkJq312R2RMV5Nc3vWVs3n1ve8LOF3m4";
const approvedRevision = "Final Approved Story v1.7";
const approvedWebsiteCardSubtitle = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const approvedAlt = "A small field recorder rests on a table beside rain-streaked windows overlooking dark pines; warm hotel lights lead down an empty corridor to a closed STAFF ONLY door.";
const openingFingerprint = "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.";
const closingFingerprint = "Neither of them named what had made the rhythm.";
const expectedSceneTitles = ["Arrival","Public Ghosts","Employee Passage","One, Then Two","Source Hunt","The Chair / The Lie","Control Test","Martin Follows","The New Sequence","Raw Audio"];

const assets = {
  coverImage: ["da-004-close-enough-to-recognize__story-hero-master__staff-threshold-corridor__16x9__rain-documentary__v1.0__20260908.webp", "823307bfbbcf3c3b173ff31fda0b478a34bed2e493d9a587696d3c026841af54"],
  keyArtImage: ["da-004-close-enough-to-recognize__key-art__staff-threshold-corridor__2x3__rain-documentary__v1.0__20260908.webp", "0908bee942f2aab60d9445b0c199247614f167a9eca398f84c1dc9b646fe6097"],
  cardImage: ["da-004-close-enough-to-recognize__story-card__staff-threshold-corridor__3x2__rain-documentary__v1.0__20260908.webp", "6daeae68ef49d2cb74536981b25e7d8398e240fb536098c75d02352faa7b0aa7"],
  squareImage: ["da-004-close-enough-to-recognize__square__staff-threshold-corridor__1x1__rain-documentary__v1.0__20260908.webp", "597bfbdf9934e03a8b32d5fb64bb1d58f9ef72eeaaaae1bcbcee4b0d42243eb5"],
  ogImage: ["da-004-close-enough-to-recognize__open-graph__staff-threshold-corridor__1200x630__rain-documentary__v1.0__20260908.webp", "033213c7eec60eb1810ac984ebeaaf45ad310fe010e716f00a9328775fe8b467"],
  socialImage: ["da-004-close-enough-to-recognize__social__staff-threshold-corridor__4x5__rain-documentary__v1.0__20260908.webp", "219d68789b934204967f811d661a77f699fb3ff56bea9c52d6b4118ec5d7634b"],
};

for (const [field, actual, expected] of [["case",sourceLock.case,"DA-004"],["title",sourceLock.title,"Close Enough to Recognize"],["approvedRevision",sourceLock.approvedRevision,approvedRevision],["authoritativeGoogleDocId",sourceLock.authoritativeGoogleDocId,sourceGoogleDocId],["authoritativeGoogleDocRevisionId",sourceLock.authoritativeGoogleDocRevisionId,sourceGoogleDocRevisionId],["fragmentCount",sourceLock.fragmentCount,10],["lockStatus",sourceLock.lockStatus,"IMMUTABLE_APPROVED_SOURCE"]]) {
  if (actual !== expected) throw new Error(`DA-004 source lock ${field} mismatch: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
}
if (sourceLock.publicReleaseAuthorized !== false) throw new Error("DA-004 publicReleaseAuthorized must remain false.");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
for (const [role,[filename,expectedSha]] of Object.entries(assets)) {
  const bytes = await readFile(path.join(releaseAssetDirectory, filename));
  const actual = sha256(bytes);
  if (actual !== expectedSha) throw new Error(`DA-004 ${role} hash mismatch: expected ${expectedSha}, found ${actual}.`);
}
if (isDeployPreview) {
  await mkdir(publicAssetDirectory, { recursive:true });
  for (const [, [filename]] of Object.entries(assets)) await copyFile(path.join(releaseAssetDirectory, filename), path.join(publicAssetDirectory, filename));
} else {
  await rm(publicAssetDirectory, { recursive:true, force:true });
}

const normalizeParagraphs = (value) => value.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").split(/\n+/).map((line)=>line.trimEnd()).filter(Boolean).join("\n\n").trimEnd()+"\n";
const sourceFiles = (await readdir(sourceDirectory)).filter((name)=>/^part-\d{2}\.mdfrag$/.test(name)).sort();
if (sourceFiles.length !== 10) throw new Error(`Expected 10 DA-004 manuscript fragments, found ${sourceFiles.length}.`);
const imported = (await Promise.all(sourceFiles.map((name)=>readFile(path.join(sourceDirectory,name),"utf8")))).join("\n");
const normalized = normalizeParagraphs(imported);
const headingPattern = /^DA-004 — Scene (\d{2}) — (.+?) — (?:Approved Draft|Draft) v[0-9.]+$/gm;
const headings = [...normalized.matchAll(headingPattern)];
if (headings.length !== 10) throw new Error(`Expected 10 DA-004 source headings, found ${headings.length}.`);
for (let i=0;i<headings.length;i+=1) { const [,number,title]=headings[i]; if(number!==String(i+1).padStart(2,"0")||title!==expectedSceneTitles[i]) throw new Error(`Unexpected DA-004 scene heading at ${i+1}.`); }
if (!normalized.includes(openingFingerprint) || !normalized.trimEnd().endsWith(closingFingerprint)) throw new Error("DA-004 approved source fingerprints failed.");
const canonicalSource = normalized.replace(headingPattern,(_m,n,t)=>`Scene ${n} — ${t}`);
const canonicalSourceSha256 = sha256(Buffer.from(canonicalSource,"utf8"));
if (canonicalSourceSha256 !== sourceLock.canonicalFragmentSha256) throw new Error(`DA-004 approved-source hash drift: ${canonicalSourceSha256}.`);
const words = canonicalSource.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
if (words.length < 16000 || words.length > 18500) throw new Error(`DA-004 source word-count sanity check failed: ${words.length}.`);
const body = canonicalSource.replace(/^Scene (\d{2}) — (.+)$/gm,(_m,n,t)=>`## ${Number(n)}. ${t}`);
const urlFor = (filename) => `/images/da-004/${filename}`;
const artFrontmatter = Object.entries(assets).map(([role,[filename]])=>`${role}: ${urlFor(filename)}`).join("\n");
const frontmatter = `---\nslug: da-004-close-enough-to-recognize\ntitle: Close Enough to Recognize\nsummary: ${approvedWebsiteCardSubtitle}\nstatus: withheld\nclassification: Literary paranormal horror\nrevision: ${approvedRevision}\ncanonicalStatus: established canon\ndraft: true\npreviewOnly: true\n${artFrontmatter}\ncoverAlt: \"${approvedAlt}\"\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - haunted hotel\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impacts\n  - voice-like audio\n  - disputed sound direction\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - environmental comparisons\n  - negative observations\nlocations:\n  - Kestrel Hotel\ncontentWarnings:\n  - Psychological distress and panic\n  - Nausea and bodily unease\n  - Unexplained knocking and voice-like audio\n  - Contested hotel ghost lore\n  - Nighttime wandering in restricted-adjacent hotel corridors\ncontentNotes:\n  - Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.\n---\n\n`;
await mkdir(path.dirname(outputPath), { recursive:true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
console.log(`DA-004 withheld website edition materialized; source ${canonicalSourceSha256}; six art roles hash-verified; deploy-preview assets ${isDeployPreview ? "staged" : "withheld"}; publicReleaseAuthorized=false.`);
