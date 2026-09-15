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
const alt = "A small field recorder rests on a bench beside an empty, warmly lit hotel corridor leading to a closed STAFF ONLY door.";
const publicationDate = "2026-09-14";
const expectedSourceSha = "3ccd31348217394e176baa690b653a5c608ee8e5c2df72b0ad4a35df83c9be71";
const canonicalUrl = `https://readdeadair.com/stories/${slug}/`;
const assets = [
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789453458/dead-air/da-004/publication/da004_art001_v2_2_16x9_1600x900.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789453465/dead-air/da-004/publication/da004_art001_v2_2_2x3_1024x1536.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp",
  "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp",
];
const oldAlt = "A small field recorder rests on a table beside rain-streaked windows overlooking dark pines; warm hotel lights lead down an empty corridor to a closed STAFF ONLY door.";
const oldAssetToken = "__v1.0__20260908.webp";

const exists = async (target) => { try { return (await stat(target)).isFile() || (await stat(target)).isDirectory(); } catch (e) { if (e?.code === "ENOENT") return false; throw e; } };
const readText = async (relative) => readFile(path.join(dist, relative), "utf8");

if (!(await exists(dist))) throw new Error("Astro dist directory missing.");
const lock = JSON.parse(await readFile(lockPath, "utf8"));
if (lock.canonicalFragmentSha256 !== expectedSourceSha || lock.publicReleaseAuthorized !== true || lock.publicationDate !== publicationDate || lock.lockStatus !== "IMMUTABLE_APPROVED_SOURCE") throw new Error("DA-004 publication source lock mismatch.");

const sourceText = await readFile(source, "utf8");
for (const value of [
  `slug: ${slug}`, `title: ${title}`, `summary: ${summary}`, "status: active", "draft: false", "previewOnly: false", `publicationDate: ${publicationDate}`, `coverAlt: \"${alt}\"`, `ogImageAlt: \"${alt}\"`, "## 1. Arrival", "## 10. Raw Audio",
]) if (!sourceText.includes(value)) throw new Error(`DA-004 publication source missing ${value}`);
for (const asset of assets) if (!sourceText.includes(asset)) throw new Error(`DA-004 publication source missing approved release asset ${asset}`);
if (sourceText.includes(oldAlt) || sourceText.includes(oldAssetToken)) throw new Error("Superseded DA-004 release-art lineage remains active in publication source.");

const publicPage = path.join(dist, "stories", slug, "index.html");
const previewPage = path.join(dist, "preview", slug, "index.html");
if (!(await exists(publicPage))) throw new Error("DA-004 public story route missing.");
if (await exists(previewPage)) throw new Error("DA-004 private preview route must not ship after publication authorization.");
const html = await readFile(publicPage, "utf8");
for (const value of [title, summary, alt, canonicalUrl, "fetchpriority=\"high\"", "loading=\"eager\"", "article:published_time"]) if (!html.includes(value)) throw new Error(`DA-004 public page missing ${value}`);
if (/noindex|nofollow|noarchive/i.test(html)) throw new Error("DA-004 public story page remains noindexed.");
for (const asset of assets) if (!html.includes(asset)) throw new Error(`DA-004 public page/structured data missing approved asset ${asset}`);
if (html.includes(oldAlt) || html.includes(oldAssetToken)) throw new Error("Superseded DA-004 art/alt leaked into public page.");

const storiesIndex = await readText("stories/index.html");
if (!storiesIndex.includes(title) || !storiesIndex.includes(slug)) throw new Error("DA-004 missing from public stories archive.");
const feed = await readText("feed.xml");
if (!feed.includes(title) || !feed.includes(`/stories/${slug}/`) || !feed.includes("2026")) throw new Error("DA-004 missing or incomplete in RSS feed.");
const feedOccurrences = feed.split(`<title>${title}</title>`).length - 1;
if (feedOccurrences !== 1) throw new Error(`Expected exactly one DA-004 RSS item, found ${feedOccurrences}.`);

const sitemapFiles = (await readdir(dist)).filter((name) => /^sitemap.*\.xml$/i.test(name));
let sitemapText = "";
for (const name of sitemapFiles) sitemapText += await readText(name);
if (!sitemapText.includes(`/stories/${slug}/`)) throw new Error("DA-004 missing from public sitemap output.");

const forbiddenFeedTokens = ["previewOnly: true", "status: withheld", "publicReleaseAuthorized", "PTW-", "CPO-"];
for (const token of forbiddenFeedTokens) if (feed.includes(token)) throw new Error(`Internal/withheld token leaked into RSS: ${token}`);

console.log("DA-004 release validation PASS: public route, indexability, publication metadata, approved responsive art, archive, RSS, sitemap, and leak controls confirmed.");
