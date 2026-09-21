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
const expectedSourceSha = "3ccd31348217394e176baa690b653a5c608ee8e5c2df72b0ad4a35df83c9be71";
const canonicalUrl = `https://readdeadair.com/stories/${slug}/`;
const hero = "/assets/da-004/da004_art001_v3_0_16x9_1600x900.webp";
const mobile = "/assets/da-004/da004_art001_v3_0_2x3_1024x1536.webp";
const assets = [
  hero,
  mobile,
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp",
];
const oldAlt = "A small field recorder rests on a bench beside an empty, warmly lit hotel corridor leading to a closed STAFF ONLY door.";
const oldAssetTokens = [
  "__v1.0__20260908.webp",
  "da004_art001_v2_1_16x9_1600x900.webp",
  "da004_art001_v2_1_2x3_1024x1536.webp",
  "da004_art001_v2_2_16x9_1600x900.webp",
  "da004_art001_v2_2_2x3_1024x1536.webp",
  "da004_art001_v2_3_16x9_1600x900.webp",
  "da004_art001_v2_3_2x3_1024x1536.webp",
];

const exists = async (target) => { try { return (await stat(target)).isFile() || (await stat(target)).isDirectory(); } catch (e) { if (e?.code === "ENOENT") return false; throw e; } };
const readText = async (relative) => readFile(path.join(dist, relative), "utf8");

if (!(await exists(dist))) throw new Error("Astro dist directory missing.");
const lock = JSON.parse(await readFile(lockPath, "utf8"));
if (lock.canonicalFragmentSha256 !== expectedSourceSha || lock.approvedRevision !== "Final Approved Story v1.7" || lock.publicReleaseAuthorized !== true || lock.publicationDate !== publicationDate || lock.lockStatus !== "IMMUTABLE_APPROVED_SOURCE") throw new Error("DA-004 historical v1.7 publication source lock mismatch.");

const sourceText = await readFile(source, "utf8");
for (const value of [
  `slug: ${slug}`, `title: ${title}`, `summary: ${summary}`, "status: active", "draft: false", "previewOnly: false", "revision: Final Approved Story v1.10", `publicationDate: ${publicationDate}`, `coverAlt: \"${alt}\"`, `ogImageAlt: \"${alt}\"`, "## 1. Arrival", "## 10. Raw Audio",
]) if (!sourceText.includes(value)) throw new Error(`DA-004 v1.10 correction source missing ${value}`);
for (const asset of assets) if (!sourceText.includes(asset)) throw new Error(`DA-004 correction source missing approved release asset ${asset}`);
if (sourceText.includes(oldAlt) || oldAssetTokens.some((token) => sourceText.includes(token))) throw new Error("Superseded DA-004 hero-art lineage remains active in correction source.");

for (const relative of [hero, mobile]) {
  const target = path.join(dist, relative.replace(/^\//, ""));
  if (!(await exists(target))) throw new Error(`DA-004 v3 responsive art missing from dist: ${relative}`);
  const bytes = await readFile(target);
  if (bytes.length < 1000 || bytes.subarray(0,4).toString("ascii") !== "RIFF" || bytes.subarray(8,12).toString("ascii") !== "WEBP") throw new Error(`DA-004 v3 responsive art is not a valid WebP container: ${relative}`);
}

const publicPage = path.join(dist, "stories", slug, "index.html");
const previewPage = path.join(dist, "preview", slug, "index.html");
if (!(await exists(publicPage))) throw new Error("DA-004 correction-preview story route missing.");
if (await exists(previewPage)) throw new Error("DA-004 private preview route must not ship after the original publication authorization.");
const html = await readFile(publicPage, "utf8");
for (const value of [title, summary, alt, canonicalUrl, "Final Approved Story v1.10", "fetchpriority=\"high\"", "loading=\"eager\"", "article:published_time"]) if (!html.includes(value)) throw new Error(`DA-004 correction preview missing ${value}`);
if (/noindex|nofollow|noarchive/i.test(html)) throw new Error("DA-004 correction preview unexpectedly renders a noindex public story page.");
for (const asset of assets) if (!html.includes(asset)) throw new Error(`DA-004 correction page/structured data missing approved asset ${asset}`);
if (html.includes(oldAlt) || oldAssetTokens.some((token) => html.includes(token))) throw new Error("Superseded DA-004 hero art/alt leaked into correction page.");

const storiesIndex = await readText("stories/index.html");
if (!storiesIndex.includes(title) || !storiesIndex.includes(slug)) throw new Error("DA-004 missing from correction-build stories archive.");
const feed = await readText("feed.xml");
if (!feed.includes(title) || !feed.includes(`/stories/${slug}/`) || !feed.includes("2026")) throw new Error("DA-004 missing or incomplete in correction-build RSS feed.");
const feedOccurrences = feed.split(`<title>${title}</title>`).length - 1;
if (feedOccurrences !== 1) throw new Error(`Expected exactly one DA-004 RSS item, found ${feedOccurrences}.`);

const sitemapFiles = (await readdir(dist)).filter((name) => /^sitemap.*\.xml$/i.test(name));
let sitemapText = "";
for (const name of sitemapFiles) sitemapText += await readText(name);
if (!sitemapText.includes(`/stories/${slug}/`)) throw new Error("DA-004 missing from correction-build sitemap output.");

const forbiddenFeedTokens = ["previewOnly: true", "status: withheld", "publicReleaseAuthorized", "PTW-", "CPO-"];
for (const token of forbiddenFeedTokens) if (feed.includes(token)) throw new Error(`Internal/withheld token leaked into RSS: ${token}`);

console.log("DA-004 v1.10 non-public correction validation PASS: historical v1.7 source lock preserved; v1.10 overlay rendered; route, indexability, publication metadata, v3.0 responsive art, archive, RSS, sitemap, and leak controls confirmed. Full v1.10 source-lock migration remains required before any later corrective publication merge.");
