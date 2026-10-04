import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, "dist");
const source = path.join(root, "src/content/stories/da-004-close-enough-to-recognize.md");
const lockPath = path.join(root, "src/manuscripts/da-004/source-lock.json");
const slug = "da-004-close-enough-to-recognize";
const title = "Close Enough to Recognize";
const summary = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const alt = "An empty, warmly lit hotel corridor leads to a closed dark service door with a brass STAFF ONLY plaque.";
const publicationDate = "2026-09-14";
const expectedSourceSha = "2faf3f416afcb1f624d482d02954b92e25af57f35bfff8030b9d846765724944";
const expectedRevision = "Final Approved Story v1.13";
const canonicalUrl = `https://readdeadair.com/stories/${slug}/`;
const hero = "/assets/da-004/da004_art001_v3_0_16x9_1600x900.webp";
const mobile = "/assets/da-004/da004_art001_v3_0_2x3_1024x1536.webp";
const approvedWarnings = [
  "Family conflict involving a childhood deception",
  "Anxiety and acute investigation stress",
  "Nausea and bodily unease",
];
const supersededWarningItems = [
  "Psychological distress and panic",
  "Unexplained knocking and voice-like audio",
  "Contested hotel ghost lore",
  "Nighttime wandering in restricted-adjacent hotel corridors",
];
const approvedSpatialRepairs = [
  "One knock sounded from the staff-door side of the junction.",
  "Then two knocks sounded from the same side of the junction.",
];
const supersededSpatialPhrases = [
  "One knock sounded from beyond the closed staff door beside the junction.",
  "Then two knocks came from beyond the closed staff door.",
];
const sourceNote = "Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.";
const assets = [
  hero,
  mobile,
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp",
];
const oldAlt = "A small field recorder rests on a bench beside an empty, warmly lit hotel corridor leading to a closed STAFF ONLY door.";
const oldAssetTokens = ["__v1.0__20260908.webp","da004_art001_v2_1_16x9_1600x900.webp","da004_art001_v2_1_2x3_1024x1536.webp","da004_art001_v2_2_16x9_1600x900.webp","da004_art001_v2_2_2x3_1024x1536.webp","da004_art001_v2_3_16x9_1600x900.webp","da004_art001_v2_3_2x3_1024x1536.webp"];

const exists = async (target) => { try { const s = await stat(target); return s.isFile() || s.isDirectory(); } catch (e) { if (e?.code === "ENOENT") return false; throw e; } };
const readText = async (relative) => readFile(path.join(dist, relative), "utf8");

if (!(await exists(dist))) throw new Error("Astro dist directory missing.");
const lock = JSON.parse(await readFile(lockPath, "utf8"));
if (lock.canonicalSourceSha256 !== expectedSourceSha || lock.approvedRevision !== expectedRevision || lock.publicReleaseAuthorized !== false || lock.publicationDate !== publicationDate || lock.lockStatus !== "IMMUTABLE_APPROVED_SOURCE") throw new Error("DA-004 v1.13 non-public corrective source lock mismatch.");

const sourceText = await readFile(source, "utf8");
for (const value of [`slug: ${slug}`, `title: ${title}`, `summary: ${summary}`, "status: active", "draft: false", "previewOnly: false", `revision: ${expectedRevision}`, "suppressPublicRevision: true", `publicationDate: ${publicationDate}`, `coverAlt: \"${alt}\"`, `ogImageAlt: \"${alt}\"`, "## 1. Arrival", "## 10. Raw Audio"]) if (!sourceText.includes(value)) throw new Error(`DA-004 approved source missing ${value}`);
for (const repair of approvedSpatialRepairs) if (!sourceText.includes(repair)) throw new Error(`DA-004 v1.13 approved spatial repair missing: ${repair}`);
for (const stale of supersededSpatialPhrases) if (sourceText.includes(stale)) throw new Error(`DA-004 v1.12 superseded spatial wording remains: ${stale}`);
for (const warning of approvedWarnings) if (!sourceText.includes(`  - ${warning}`)) throw new Error(`DA-004 approved source missing integrity-audited warning ${warning}`);
for (const warning of supersededWarningItems) if (sourceText.includes(warning)) throw new Error(`Superseded/non-warning DA-004 content-note item remains in approved source: ${warning}`);
if (sourceText.includes("contentNotes:") || sourceText.includes(sourceNote)) throw new Error("DA-004 source/fictionalization disclosure must not be embedded in the warning-box metadata.");
for (const asset of assets) if (!sourceText.includes(asset)) throw new Error(`DA-004 approved source missing release asset ${asset}`);
if (sourceText.includes(oldAlt) || oldAssetTokens.some((token) => sourceText.includes(token))) throw new Error("Superseded DA-004 hero-art lineage remains active in approved source.");

for (const relative of [hero, mobile]) {
  const target = path.join(dist, relative.replace(/^\//, ""));
  if (!(await exists(target))) throw new Error(`DA-004 v3 responsive art missing from dist: ${relative}`);
  const bytes = await readFile(target);
  if (bytes.length < 1000 || bytes.subarray(0,4).toString("ascii") !== "RIFF" || bytes.subarray(8,12).toString("ascii") !== "WEBP") throw new Error(`DA-004 v3 responsive art is not a valid WebP container: ${relative}`);
}

const publicPage = path.join(dist, "stories", slug, "index.html");
const previewPage = path.join(dist, "preview", slug, "index.html");
if (!(await exists(publicPage))) throw new Error("DA-004 publication story route missing.");
if (await exists(previewPage)) throw new Error("DA-004 obsolete private preview route must not ship.");
const html = await readFile(publicPage, "utf8");
for (const value of [title, summary, alt, canonicalUrl, "fetchpriority=\"high\"", "loading=\"eager\"", "article:published_time"]) if (!html.includes(value)) throw new Error(`DA-004 publication missing ${value}`);
for (const repair of approvedSpatialRepairs) if (!html.includes(repair)) throw new Error(`DA-004 v1.13 rendered spatial repair missing: ${repair}`);
for (const stale of supersededSpatialPhrases) if (html.includes(stale)) throw new Error(`DA-004 v1.12 superseded spatial wording leaked into rendered candidate: ${stale}`);
if (html.includes(expectedRevision) || html.includes("<dt>Revision</dt>")) throw new Error("DA-004 reader-facing page exposes an internal manuscript/revision label.");
if (!/<aside[^>]*aria-label="Content warnings"[^>]*>[\s\S]*?<p class="eyebrow">Content Warnings<\/p>/.test(html)) throw new Error("DA-004 reader-facing warning box must use the approved Content Warnings label and accessibility name.");
if (/aria-label="Content notes"/.test(html)) throw new Error("DA-004 reader-facing warning box still exposes the superseded Content Notes accessibility label.");
for (const warning of approvedWarnings) if (!html.includes(warning)) throw new Error(`DA-004 publication missing integrity-audited warning ${warning}`);
for (const warning of supersededWarningItems) if (html.includes(warning)) throw new Error(`Superseded/non-warning DA-004 content-note item remains reader-facing: ${warning}`);
const sourceNoteOccurrences = html.split(sourceNote).length - 1;
if (sourceNoteOccurrences !== 1) throw new Error(`Expected the separate standard source/fictionalization note exactly once, found ${sourceNoteOccurrences}.`);
if (/noindex|nofollow|noarchive/i.test(html)) throw new Error("DA-004 publication candidate no longer mirrors the currently public route semantics.");
for (const asset of assets) if (!html.includes(asset)) throw new Error(`DA-004 publication/structured data missing approved asset ${asset}`);
if (html.includes(oldAlt) || oldAssetTokens.some((token) => html.includes(token))) throw new Error("Superseded DA-004 hero art/alt leaked into publication.");

const storiesIndex = await readText("stories/index.html");
if (!storiesIndex.includes(title) || !storiesIndex.includes(slug)) throw new Error("DA-004 missing from publication stories archive.");
const feed = await readText("feed.xml");
if (!feed.includes(title) || !feed.includes(`/stories/${slug}/`) || !feed.includes("2026")) throw new Error("DA-004 missing or incomplete in publication RSS feed.");
const feedOccurrences = feed.split(`<title>${title}</title>`).length - 1;
if (feedOccurrences !== 1) throw new Error(`Expected exactly one DA-004 RSS item, found ${feedOccurrences}.`);

const sitemapFiles = (await readdir(dist)).filter((name) => /^sitemap.*\.xml$/i.test(name));
let sitemapText = "";
for (const name of sitemapFiles) sitemapText += await readText(name);
if (!sitemapText.includes(`/stories/${slug}/`)) throw new Error("DA-004 missing from publication sitemap output.");

const forbiddenFeedTokens = ["previewOnly: true", "status: withheld", "publicReleaseAuthorized", "PTW-", "CPO-"];
for (const token of forbiddenFeedTokens) if (feed.includes(token)) throw new Error(`Internal/withheld token leaked into RSS: ${token}`);

console.log("DA-004 v1.13 non-public correction-candidate validation PASS: authoritative source hash/revision, exact two spatial repairs, Content Warnings integrity, separate source note, public revision-label suppression, unchanged publication metadata/date, v3.0 responsive art, archive, RSS, sitemap, and leak controls confirmed; merge/deploy authorization remains separate.");