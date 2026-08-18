import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const storySourcePath = path.join(
  root,
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);
const cssPath = path.join(root, "src", "styles", "global.css");
const netlifyConfigPath = path.join(root, "netlify.toml");
const textExtensions = new Set([".html", ".xml", ".json", ".txt", ".js", ".css", ".map"]);

const title = "The Name in the Room";
const summary = "A documentary crew returns to Bellweather High for a final session with a medium. In the basement, equipment fails, a fire door moves, and a sound recording leaves much to interpretation.";
const sourceNote = "Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.";
const slug = "da-002-the-name-in-the-room";
const route = `/stories/${slug}/`;
const canonicalUrl = `https://dead-air-website.netlify.app${route}`;
const legacyRoute = "/dead-air-da-002-the-name-in-the-room";
const publishedTime = "2026-07-27T00:00:00.000Z";
const numberedHeadings = [
  "1. Terms of Return",
  "2. The First Room",
  "3. Two Devices",
  "4. The Student They Build",
  "5. The Fire Door",
  "6. The Personal Reading",
  "7. What We Call Clean",
  "8. The Auditorium Search",
  "9. The Final Source",
];
const legacySceneHeadings = [
  "Scene 1 — Terms of Return",
  "Scene 2 — The First Room",
  "Scene 3 — Two Devices",
  "Scene 4 — The Student They Build",
  "Scene 5 — The Fire Door",
  "Scene 6 — The Personal Reading",
  "Scene 7 — What We Call Clean",
  "Scene 8 — The Auditorium Search",
  "Scene 9 — The Final Source",
];
const driveIds = [
  "1x6cnnql3BhBg_YJkddcOUDWaeXY1lPNh9qhrjLHKpiU",
  "1Nwf6yHNIOtqg0CjbzA7bcwl8Gl50kjWgIXw0CijX1Sc",
  "1r4On4JlFCqa_5ct7-Eb4IuFNWf-nT6Z31LnqZsgfh8M",
  "10pybWytAStpmXViLIb2MaNjBTdMpxsWN",
];

const storySource = await readFile(storySourcePath, "utf8");
const status = storySource.match(/^status:\s*(.+)$/m)?.[1]?.trim();
const draft = storySource.match(/^draft:\s*(.+)$/m)?.[1]?.trim();
const publicationDate = storySource.match(/^publicationDate:\s*(.+)$/m)?.[1]?.trim();
const isPublished = draft === "false" && status !== "withheld";

if (!(await stat(outputDirectory)).isDirectory()) {
  throw new Error("Astro output directory dist was not created.");
}

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath);
    else if (entry.isFile()) files.push(entryPath);
  }
};
await walk(outputDirectory);

const failures = [];
const fail = (message) => failures.push(message);
const outputPath = (relativePath) => path.join(outputDirectory, ...relativePath.split("/"));
const exists = async (filePath) => {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
};

if (!isPublished) {
  const forbiddenValues = [
    "DA-002",
    title,
    slug,
    "dead-air-da-002-the-name-in-the-room",
    "Diane saw the second tripod",
    "Abby reached the stairwell landing before Evan touched the lever",
    "Miriam Vale",
  ];

  for (const filePath of files) {
    const relativePath = path.relative(outputDirectory, filePath).replaceAll(path.sep, "/");
    const normalizedPath = relativePath.toLowerCase();
    if (normalizedPath.includes("da-002") || normalizedPath.includes("the-name-in-the-room")) {
      fail(`${relativePath}: withheld route or asset path generated`);
    }
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;
    const content = await readFile(filePath, "utf8");
    for (const forbiddenValue of forbiddenValues) {
      if (content.includes(forbiddenValue)) {
        fail(`${relativePath}: contains ${JSON.stringify(forbiddenValue)}`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`DA-002 withheld-output validation failed:\n${failures.join("\n")}`);
  }

  console.log(
    `DA-002 withheld-output validation passed across ${files.length} deployed files: no route, index, RSS, sitemap, taxonomy, slug, title, or excerpt leakage detected.`,
  );
  process.exit(0);
}

if (status !== "active") fail(`Expected published status active, received ${status ?? "missing"}.`);
if (draft !== "false") fail(`Expected draft false, received ${draft ?? "missing"}.`);
if (publicationDate !== "2026-07-27") {
  fail(`Expected publicationDate 2026-07-27, received ${publicationDate ?? "missing"}.`);
}

const storyHtmlPath = outputPath(`stories/${slug}/index.html`);
if (!(await exists(storyHtmlPath))) {
  fail(`Missing published story route ${route}.`);
} else {
  const html = await readFile(storyHtmlPath, "utf8");
  const assertions = [
    [html.includes('<html lang="en">'), "html language is not en"],
    [html.includes('name="viewport" content="width=device-width, initial-scale=1"'), "viewport metadata missing"],
    [html.includes(`<title>${title} | The Dead Air Archive</title>`), "document title incorrect"],
    [html.includes(`name="description" content="${summary}"`), "meta description incorrect"],
    [html.includes(`rel="canonical" href="${canonicalUrl}"`), "canonical URL incorrect"],
    [html.includes('property="og:type" content="article"'), "Open Graph type is not article"],
    [html.includes(`property="og:url" content="${canonicalUrl}"`), "Open Graph URL incorrect"],
    [html.includes(`property="article:published_time" content="${publishedTime}"`), "article publication time incorrect"],
    [html.includes('name="twitter:card" content="summary"'), "Twitter card metadata missing"],
    [html.includes('id="main-content" tabindex="-1"'), "keyboard-focusable main landmark missing"],
    [html.includes('href="#main-content"'), "skip link missing"],
    [html.includes('role="note"'), "story source-note landmark missing"],
    [html.includes(sourceNote), "standard story source note missing"],
    [!html.includes("Fictionalization and Source Note"), "legacy source-note heading remains"],
    [!html.includes("This literary paranormal-horror story adapts reported paranormal-investigation"), "legacy source-note paragraph remains"],
    [html.includes("Content Notes"), "content-notes region missing"],
    [html.includes("No graphic violence."), "content note text missing"],
    [html.includes("Abby reached the stairwell landing before Evan touched the lever."), "corrected Scene 8 opening missing"],
    [html.includes("The cabinet held two labels, two chains of custody, and no name."), "custody ending missing"],
    [!html.toLowerCase().includes("withheld"), "withheld label leaked into published story"],
  ];
  for (const [passed, message] of assertions) if (!passed) fail(`${route}: ${message}`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) fail(`${route}: expected one h1, found ${h1Count}`);

  const sourceNoteIndex = html.indexOf(sourceNote);
  const firstSectionIndex = html.indexOf(numberedHeadings[0]);
  if (sourceNoteIndex < 0 || firstSectionIndex < 0 || sourceNoteIndex >= firstSectionIndex) {
    fail(`${route}: standard source note must appear before section 1`);
  }

  for (const legacyHeading of legacySceneHeadings) {
    if (html.includes(legacyHeading)) fail(`${route}: legacy production heading remains: ${legacyHeading}`);
  }

  let priorIndex = -1;
  for (const heading of numberedHeadings) {
    const headingIndex = html.indexOf(heading);
    if (headingIndex < 0) fail(`${route}: missing heading ${heading}`);
    else if (headingIndex <= priorIndex) fail(`${route}: heading order invalid at ${heading}`);
    priorIndex = headingIndex;
  }

  const visibleText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (visibleText.length < 125000) {
    fail(`${route}: long-form output is unexpectedly short (${visibleText.length} characters)`);
  }

  for (const driveId of driveIds) {
    if (html.includes(driveId)) fail(`${route}: restricted Drive identifier leaked: ${driveId}`);
  }

  for (const imageTag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt=("[^"]*"|'[^']*')/i.test(imageTag)) fail(`${route}: image without alt attribute`);
  }

  const hrefs = [...html.matchAll(/\bhref=(?:"([^"]+)"|'([^']+)')/gi)].map((match) => match[1] ?? match[2]);
  for (const href of hrefs) {
    if (!href || href.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;
    const targetUrl = new URL(href, canonicalUrl);
    let targetPath = decodeURIComponent(targetUrl.pathname).replace(/^\/+/, "");
    const candidates = [];
    if (!targetPath) candidates.push(outputPath("index.html"));
    else if (targetPath.endsWith("/")) candidates.push(outputPath(`${targetPath}index.html`));
    else if (path.extname(targetPath)) candidates.push(outputPath(targetPath));
    else {
      candidates.push(outputPath(`${targetPath}/index.html`));
      candidates.push(outputPath(`${targetPath}.html`));
    }
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      fail(`${route}: broken internal link ${href}`);
    }
  }
}

const rssPath = outputPath("rss.xml");
if (!(await exists(rssPath))) fail("RSS output missing.");
else {
  const rss = await readFile(rssPath, "utf8");
  if (!rss.includes(title) || !rss.includes(route)) fail("RSS does not include the published DA-002 story.");
}

const sitemapPath = outputPath("sitemap-0.xml");
const sitemapIndexPath = outputPath("sitemap-index.xml");
const sitemapCandidates = [sitemapPath, sitemapIndexPath, outputPath("sitemap.xml")];
const availableSitemaps = [];
for (const candidate of sitemapCandidates) if (await exists(candidate)) availableSitemaps.push(candidate);
if (availableSitemaps.length === 0) fail("Sitemap output missing.");
else {
  const sitemapText = (await Promise.all(availableSitemaps.map((file) => readFile(file, "utf8")))).join("\n");
  if (!sitemapText.includes(canonicalUrl)) fail("Sitemap does not include the canonical DA-002 route.");
}

const indexReferences = [];
for (const filePath of files.filter((file) => file.endsWith(".html") && file !== storyHtmlPath)) {
  const html = await readFile(filePath, "utf8");
  if (html.includes(route) && html.includes(title)) indexReferences.push(path.relative(outputDirectory, filePath));
}
if (indexReferences.length === 0) fail("No public HTML index links to the DA-002 story.");

const css = await readFile(cssPath, "utf8");
if (!css.includes("--reading-width: 42rem")) fail("Readable long-form width token is missing.");
if (!/\.prose\s*\{[^}]*max-width:\s*var\(--reading-width\)/s.test(css)) fail("Prose width is not constrained.");
if (!/@media\s*\(max-width:\s*760px\)/.test(css)) fail("Mobile breakpoint is missing.");
if (!/html\s*\{[^}]*font-size:\s*16px/s.test(css)) fail("Mobile root font-size rule is missing.");
if (!/html\s*\{[^}]*line-height:\s*1\.65/s.test(css)) fail("Readable global line height is missing.");
if (!/:focus-visible/.test(css)) fail("Visible keyboard focus styling is missing.");

const netlifyConfig = await readFile(netlifyConfigPath, "utf8");
for (const fromPath of [legacyRoute, `${legacyRoute}/`]) {
  const blockPattern = new RegExp(
    `\\[\\[redirects\\]\\][\\s\\S]*?from\\s*=\\s*"${fromPath.replaceAll("/", "\\/")}"[\\s\\S]*?to\\s*=\\s*"${route.replaceAll("/", "\\/")}"[\\s\\S]*?status\\s*=\\s*301`,
  );
  if (!blockPattern.test(netlifyConfig)) fail(`Missing permanent redirect from ${fromPath} to ${route}.`);
}

if (failures.length > 0) {
  throw new Error(`DA-002 publication validation failed:\n${failures.join("\n")}`);
}

console.log(
  `DA-002 publication validation passed: manuscript route, standardized source note, metadata, canonical URL, publication date, numbered section order, content notes, long-form output, responsive reading CSS, accessibility hooks, internal links, public indexes, RSS, sitemap, and legacy redirects verified.`,
);
