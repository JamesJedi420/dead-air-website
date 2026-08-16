import { createDecipheriv, createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const storyPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const manuscriptCipherPath = path.join(root, "src", "private-payloads", "da-003", "manuscript.enc.json");
const coverCipherPath = path.join(root, "src", "private-payloads", "da-003", "cover.enc.json");
const expectedSourceSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const expectedCoverSha256 = "d5ebd224f85842f4d5e7a362e71eb6031c95e898dcf2801288c7cfcccc049019";
// The public branch stores authenticated ciphertext only; Netlify deploy-preview supplies the decryption key.
const keyHex = process.env.DA003_PREVIEW_KEY_HEX;
const context = process.env.CONTEXT ?? process.env.NETLIFY_CONTEXT ?? "local";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const removeMaterializedAssets = async () => {
  await rm(storyPath, { force: true });
  await rm(coverPath, { force: true });
};

const decryptPayload = async (filePath) => {
  if (!keyHex) throw new Error("DA003_PREVIEW_KEY_HEX is required for protected DA-003 preview materialization.");
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) throw new Error("DA003_PREVIEW_KEY_HEX must decode to exactly 32 bytes.");

  const payload = JSON.parse(await readFile(filePath, "utf8"));
  const encrypted = Buffer.from(payload.ciphertext, "base64");
  if (encrypted.length < 17) throw new Error(`Encrypted DA-003 payload is too short: ${filePath}`);
  const ciphertext = encrypted.subarray(0, encrypted.length - 16);
  const tag = encrypted.subarray(encrypted.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(payload.iv, "base64"));
  decipher.setAAD(Buffer.from(payload.aad, "utf8"));
  decipher.setAuthTag(tag);
  return gunzipSync(Buffer.concat([decipher.update(ciphertext), decipher.final()]));
};

if (context === "production") {
  await removeMaterializedAssets();
  if (keyHex) throw new Error("DA-003 private-preview decryption key must never be available in production context.");
  console.log("DA-003 remains withheld in production; encrypted preview payloads are inert without the deploy-preview key.");
  process.exit(0);
}

if (context !== "deploy-preview") {
  await removeMaterializedAssets();
  console.log(`DA-003 remains withheld in ${context} context; private materialization is deploy-preview only.`);
  process.exit(0);
}

if (!keyHex) {
  await removeMaterializedAssets();
  console.log("DA-003 deploy-preview key is unavailable; readable manuscript and cover remain withheld.");
  process.exit(0);
}

const sourceBytes = await decryptPayload(manuscriptCipherPath);
const actualSourceHash = sha256(sourceBytes);
if (actualSourceHash !== expectedSourceSha256) {
  throw new Error(`DA-003 source integrity failure: expected ${expectedSourceSha256}, got ${actualSourceHash}.`);
}

const coverBytes = await decryptPayload(coverCipherPath);
const actualCoverHash = sha256(coverBytes);
if (actualCoverHash !== expectedCoverSha256) {
  throw new Error(`DA-003 cover integrity failure: expected ${expectedCoverSha256}, got ${actualCoverHash}.`);
}

const source = sourceBytes.toString("utf8");
const headings = [...source.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) throw new Error(`Expected 9 DA-003 scene headings, found ${headings.length}.`);
const body = source.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");

const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: After a scouting trip leaves her friend injured and unable to explain what happened, Maren returns to a wooded preserve under strict rules—and discovers that the hardest evidence to control may be the story they tell about it.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: Final Approved Story v8\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: true\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\ncoverImage: /images/da-003-cover-option-a-evidence-crop-preview.jpg\ncoverAlt: Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, grave marker, or apparition is visible.\n---\n\n`;

await mkdir(path.dirname(storyPath), { recursive: true });
await mkdir(path.dirname(coverPath), { recursive: true });
await writeFile(storyPath, frontmatter + body, "utf8");
await writeFile(coverPath, coverBytes);

console.log(`Materialized SSO-protected DA-003 preview from encrypted approved-v8 payload (${actualSourceHash}) and evidence-focused approved-master derivative (${actualCoverHash}); chronology remains unspecified and production publication state is unchanged.`);
