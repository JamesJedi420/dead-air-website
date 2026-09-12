import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, "dist");
const source = path.join(root, "src/content/stories/da-004-close-enough-to-recognize.md");
const lockPath = path.join(root, "src/manuscripts/da-004/source-lock.json");
const preview = process.env.CONTEXT === "deploy-preview";
const slug = "da-004-close-enough-to-recognize";
const title = "Close Enough to Recognize";
const summary = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const alt = "A small field recorder rests on a table beside rain-streaked windows overlooking dark pines; warm hotel lights lead down an empty corridor to a closed STAFF ONLY door.";
const expectedSourceSha = "3ccd31348217394e176baa690b653a5c608ee8e5c2df72b0ad4a35df83c9be71";
const assets = [
  ["da-004-close-enough-to-recognize__story-hero-master__staff-threshold-corridor__16x9__rain-documentary__v1.0__20260908.webp", "823307bfbbcf3c3b173ff31fda0b478a34bed2e493d9a587696d3c026841af54"],
  ["da-004-close-enough-to-recognize__key-art__staff-threshold-corridor__2x3__rain-documentary__v1.0__20260908.webp", "0908bee942f2aab60d9445b0c199247614f167a9eca398f84c1dc9b646fe6097"],
  ["da-004-close-enough-to-recognize__story-card__staff-threshold-corridor__3x2__rain-documentary__v1.0__20260908.webp", "6daeae68ef49d2cb74536981b25e7d8398e240fb536098c75d02352faa7b0aa7"],
  ["da-004-close-enough-to-recognize__square__staff-threshold-corridor__1x1__rain-documentary__v1.0__20260908.webp", "597bfbdf9934e03a8b32d5fb64bb1d58f9ef72eeaaaae1bcbcee4b0d42243eb5"],
  ["da-004-close-enough-to-recognize__open-graph__staff-threshold-corridor__1200x630__rain-documentary__v1.0__20260908.webp", "033213c7eec60eb1810ac984ebeaaf45ad310fe010e716f00a9328775fe8b467"],
  ["da-004-close-enough-to-recognize__social__staff-threshold-corridor__4x5__rain-documentary__v1.0__20260908.webp", "219d68789b934204967f811d661a77f699fb3ff56bea9c52d6b4118ec5d7634b"],
];

const errorDetail = (error) => error instanceof Error ? error.message : String(error);

const statOrNull = async (target, label) => {
  try {
    return await stat(target);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw new Error(`Failed to inspect ${label} at ${target}: ${errorDetail(error)}`);
  }
};

const exists = async (target, label = "path") => Boolean(await statOrNull(target, label));

const requireDirectory = async (target, label) => {
  const info = await statOrNull(target, label);
  if (!info || !info.isDirectory()) throw new Error(`${label} is missing or is not a directory: ${target}`);
};

const requireFile = async (target, label) => {
  const info = await statOrNull(target, label);
  if (!info || !info.isFile()) throw new Error(`${label} is missing or is not a file: ${target}`);
};

const readChecked = async (target, label, encoding) => {
  try {
    return encoding ? await readFile(target, encoding) : await readFile(target);
  } catch (error) {
    throw new Error(`Failed to read ${label} at ${target}: ${errorDetail(error)}`);
  }
};

await requireDirectory(dist, "Astro output directory");
await requireFile(source, "DA-004 materialized withheld website source");
await requireFile(lockPath, "DA-004 source lock");

const lock = JSON.parse(await readChecked(lockPath, "DA-004 source lock", "utf8"));
if (lock.canonicalFragmentSha256 !== expectedSourceSha || lock.publicReleaseAuthorized !== false || lock.lockStatus !== "IMMUTABLE_APPROVED_SOURCE") {
  throw new Error("DA-004 source lock changed.");
}

const sourceText = await readChecked(source, "DA-004 materialized withheld website source", "utf8");
for (const value of [
  `slug: ${slug}`,
  `title: ${title}`,
  `summary: ${summary}`,
  "status: withheld",
  "draft: true",
  "previewOnly: true",
  `coverAlt: \"${alt}\"`,
  "## 1. Arrival",
  "## 10. Raw Audio",
]) {
  if (!sourceText.includes(value)) throw new Error(`DA-004 materialized source missing ${value}`);
}
if (/publicationDate:/i.test(sourceText)) throw new Error("DA-004 must not have a publication date.");

const previewPage = path.join(dist, "preview", slug, "index.html");
const publicPage = path.join(dist, "stories", slug, "index.html");
const assetDir = path.join(dist, "images", "da-004");

if (preview) {
  if (!(await exists(previewPage, "DA-004 deploy-preview route"))) throw new Error("DA-004 deploy-preview route missing.");
  if (await exists(publicPage, "DA-004 public story route")) throw new Error("DA-004 public story route generated during preview.");

  const html = await readChecked(previewPage, "DA-004 deploy-preview page", "utf8");
  for (const value of [title, summary, alt, "noindex,nofollow,noarchive", "fetchpriority=\"high\"", "loading=\"eager\""]) {
    if (!html.includes(value)) throw new Error(`DA-004 preview missing ${value}`);
  }
  if (/article:published_time/.test(html)) throw new Error("DA-004 preview leaked publication time.");

  for (const [filename, expected] of assets) {
    const file = path.join(assetDir, filename);
    if (!(await exists(file, `DA-004 preview asset ${filename}`))) throw new Error(`Missing preview asset ${filename}`);
    const bytes = await readChecked(file, `DA-004 preview asset ${filename}`);
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== expected) throw new Error(`Preview asset hash mismatch ${filename}`);
  }

  for (const relative of ["stories/index.html", "feed.xml", "sitemap-index.xml"]) {
    const file = path.join(dist, relative);
    if (await exists(file, `DA-004 isolation target ${relative}`)) {
      const text = await readChecked(file, `DA-004 isolation target ${relative}`, "utf8");
      if (text.includes(title) || text.includes(slug)) throw new Error(`DA-004 leaked into ${relative}`);
    }
  }

  console.log("DA-004 deploy-preview validation PASS: private route, six assets, noindex, no publication metadata, and archive/feed/sitemap isolation confirmed.");
} else {
  if (await exists(previewPage, "DA-004 preview route") || await exists(publicPage, "DA-004 public story route") || await exists(assetDir, "DA-004 public asset directory")) {
    throw new Error("DA-004 reader-facing route/assets generated outside deploy-preview context.");
  }

  const forbidden = [
    title,
    slug,
    summary,
    "By the time Eli turned the camera on",
    "Neither of them named what had made the rhythm.",
  ];
  const files = [];
  const walk = async (directory) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      throw new Error(`Failed to read output directory during DA-004 leakage scan at ${directory}: ${errorDetail(error)}`);
    }

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(entryPath);
      else if (entry.isFile() && /\.(html|xml|json|txt|js|css|map)$/i.test(entry.name)) files.push(entryPath);
    }
  };

  await walk(dist);
  for (const file of files) {
    const relative = path.relative(dist, file);
    const text = await readChecked(file, `DA-004 leakage-scan output ${relative}`, "utf8");
    for (const value of forbidden) {
      if (text.includes(value)) throw new Error(`DA-004 leaked into ${relative}`);
    }
  }

  console.log(`DA-004 withheld-output validation PASS across ${files.length} text outputs; no reader-facing leakage; publicReleaseAuthorized=false.`);
}
