import { createDecipheriv, createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const payloadDir = path.join(root, "src", "private-payloads", "da-003");
const storyPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-preview.jpg");
const expectedSourceSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const keyHex = process.env.DA003_PREVIEW_KEY_HEX;

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const readJoined = async (prefix) => {
  const files = (await readdir(payloadDir)).filter((name) => name.startsWith(prefix)).sort();
  if (!files.length) throw new Error(`No encrypted DA-003 ${prefix} payload parts found.`);
  return files.map(async (name) => readFile(path.join(payloadDir, name), "utf8"));
};

const decryptPayload = async (prefix) => {
  const pieces = await Promise.all(await readJoined(prefix));
  const payload = JSON.parse(pieces.join(""));
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) throw new Error("DA003_PREVIEW_KEY_HEX must decode to 32 bytes.");
  const encrypted = Buffer.from(payload.ciphertext, "base64");
  const tag = encrypted.subarray(encrypted.length - 16);
  const ciphertext = encrypted.subarray(0, encrypted.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(payload.iv, "base64"));
  decipher.setAAD(Buffer.from(payload.aad, "utf8"));
  decipher.setAuthTag(tag);
  return gunzipSync(Buffer.concat([decipher.update(ciphertext), decipher.final()]));
};

if (!keyHex) {
  await rm(storyPath, { force: true });
  await rm(coverPath, { force: true });
  console.log("DA-003 preview key absent; private manuscript and cover remain withheld from this build.");
  process.exit(0);
}

const sourceBytes = await decryptPayload("manuscript-part-");
const actualHash = sha256(sourceBytes);
if (actualHash !== expectedSourceSha256) {
  throw new Error(`DA-003 source integrity failure: expected ${expectedSourceSha256}, got ${actualHash}.`);
}

const source = sourceBytes.toString("utf8");
const headings = [...source.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) throw new Error(`Expected 9 DA-003 scene headings, found ${headings.length}.`);

const body = source.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");
const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: After a scouting trip leaves her friend injured and unable to explain what happened, Maren returns to a wooded preserve under strict rules—and discovers that the hardest evidence to control may be the story they tell about it.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: Final Approved Story v8\ncanonicalStatus: established canon\ndraft: false\ntimelineOrder: 3\ntimelineLabel: Controlled return investigation at Harrow River State Preserve\nsourceOrder: Independent investigation case\ndatePrecision: relative\nchronologyNote: DA-003 is an independent completed case; its exact year and relation to DA-001/DA-002 remain unspecified.\nfollows:\n  - collection: stories\n    slug: da-002-the-name-in-the-room\nprecedes: []\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\ncoverImage: /images/da-003-cover-option-a-preview.jpg\ncoverAlt: A dark documentary-style cover image showing an unfinished structure in wooded darkness with a portable recorder in the foreground.\n---\n\n`;

await mkdir(path.dirname(storyPath), { recursive: true });
await writeFile(storyPath, frontmatter + body, "utf8");

const coverBytes = await decryptPayload("cover-part-");
await mkdir(path.dirname(coverPath), { recursive: true });
await writeFile(coverPath, coverBytes);

console.log(`Materialized password/SSO-protected DA-003 private preview from approved v8 (${actualHash}); no production publication state changed.`);