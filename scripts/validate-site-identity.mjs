import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = process.cwd();
const distRoot = resolve(root, "dist");
const canonicalOrigin = "https://readdeadair.com";
const homeUrl = `${canonicalOrigin}/`;
const websiteId = `${homeUrl}#website`;
const seriesId = `${homeUrl}#series`;
const legacyHostname = "dead-air-website.netlify.app";
const requiredFiles = [
  "dist/favicon.ico",
  "dist/favicon-32x32.png",
  "dist/apple-touch-icon.png",
  "dist/icon-192.png",
  "dist/icon.svg",
  "dist/safari-pinned-tab.svg",
  "dist/site.webmanifest",
  "dist/images/dead-air-site__open-graph__archive-threshold__1200x630__brand__v1.1__20260913.png",
];

for (const path of requiredFiles) {
  if (!existsSync(resolve(root, path))) {
    throw new Error(`Missing site identity output: ${path}`);
  }
}

const manifest = JSON.parse(readFileSync(resolve(root, "dist/site.webmanifest"), "utf8"));
if (manifest.name !== "Dead Air" || manifest.short_name !== "Dead Air") {
  throw new Error("Site manifest must identify the app as Dead Air.");
}
if (!manifest.icons?.some((icon) => icon.src === "/icon-192.png" && icon.sizes === "192x192")) {
  throw new Error("Site manifest is missing the 192x192 app icon.");
}
if (!manifest.icons?.some((icon) => icon.src === "/icon.svg" && icon.sizes === "any")) {
  throw new Error("Site manifest is missing the scalable app icon.");
}

function walkHtml(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory()
      ? walkHtml(path)
      : path.endsWith(".html")
        ? [path]
        : [];
  });
}

function extractJsonLd(html, pagePath) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`Invalid JSON-LD on ${pagePath}: ${error.message}`);
    }
  });
}

function flattenStructuredData(documents) {
  return documents.flatMap((document) => Array.isArray(document?.["@graph"]) ? document["@graph"] : [document]);
}

function findType(nodes, type) {
  return nodes.find((node) => {
    const nodeType = node?.["@type"];
    return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
  });
}

const home = readFileSync(resolve(root, "dist/index.html"), "utf8");
const homeExpectations = [
  'href="/favicon.ico"',
  'href="/favicon-32x32.png"',
  'href="/icon.svg"',
  'href="/apple-touch-icon.png"',
  'href="/safari-pinned-tab.svg"',
  'href="/site.webmanifest"',
  'property="og:image"',
  'images/dead-air-site__open-graph__archive-threshold__1200x630__brand__v1.1__20260913.png',
  'property="og:image:width" content="1200"',
  'property="og:image:height" content="630"',
  'name="twitter:card" content="summary_large_image"',
  '<title>Dead Air</title>',
];

for (const expectation of homeExpectations) {
  if (!home.includes(expectation)) {
    throw new Error(`Homepage is missing site identity markup: ${expectation}`);
  }
}

let publicSurfaceCount = 0;
let breadcrumbSurfaceCount = 0;
let storySurfaceCount = 0;

for (const htmlPath of walkHtml(distRoot)) {
  const pagePath = relative(distRoot, htmlPath).replaceAll("\\", "/");
  const html = readFileSync(htmlPath, "utf8");

  if (pagePath === "404.html" || html.includes('name="robots" content="noindex,nofollow,noarchive"')) {
    continue;
  }

  publicSurfaceCount += 1;

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonicalMatch) {
    throw new Error(`Public surface is missing a canonical URL: ${pagePath}`);
  }
  const canonicalUrl = canonicalMatch[1];
  const canonical = new URL(canonicalUrl);
  if (canonical.origin !== canonicalOrigin) {
    throw new Error(`Public surface uses a noncanonical origin: ${pagePath} -> ${canonicalUrl}`);
  }

  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/);
  if (!ogUrlMatch || new URL(ogUrlMatch[1]).origin !== canonicalOrigin) {
    throw new Error(`Public surface has an incorrect Open Graph URL: ${pagePath}`);
  }
  if (!html.includes('<meta property="og:site_name" content="Dead Air"')) {
    throw new Error(`Public surface does not identify the Open Graph site as Dead Air: ${pagePath}`);
  }
  if (!html.includes('<meta name="application-name" content="Dead Air"')) {
    throw new Error(`Public surface does not identify the application as Dead Air: ${pagePath}`);
  }
  if (!html.match(/<title>[^<]*Dead Air[^<]*<\/title>/)) {
    throw new Error(`Public surface title does not carry the Dead Air identity: ${pagePath}`);
  }

  const jsonLdText = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join("\n");
  if (`${canonicalUrl}\n${ogUrlMatch[1]}\n${jsonLdText}`.includes(legacyHostname)) {
    throw new Error(`Public metadata leaks the legacy infrastructure hostname: ${pagePath}`);
  }

  const documents = extractJsonLd(html, pagePath);
  const nodes = flattenStructuredData(documents);
  const webPage = findType(nodes, "WebPage");
  const expectedWebPageId = new URL("#webpage", canonicalUrl).toString();
  if (!webPage) {
    throw new Error(`Public surface is missing WebPage structured data: ${pagePath}`);
  }
  if (webPage["@id"] !== expectedWebPageId || webPage.url !== canonicalUrl) {
    throw new Error(`WebPage structured data is not canonical for ${pagePath}`);
  }
  if (webPage.isPartOf?.["@id"] !== websiteId) {
    throw new Error(`WebPage structured data is not linked to the Dead Air WebSite entity: ${pagePath}`);
  }

  const isHome = pagePath === "index.html";
  const website = findType(nodes, "WebSite");
  const series = findType(nodes, "CreativeWorkSeries");
  if (isHome) {
    if (!website) {
      throw new Error("Homepage is missing WebSite structured data.");
    }
    if (website["@id"] !== websiteId || website.url !== homeUrl || website.name !== "Dead Air") {
      throw new Error("Homepage WebSite structured data does not use the canonical Dead Air identity.");
    }
    if (website.alternateName !== "The Dead Air Archive") {
      throw new Error("Homepage WebSite structured data is missing The Dead Air Archive alternate name.");
    }
    if (!series || series["@id"] !== seriesId || series.name !== "Dead Air" || series.url !== homeUrl) {
      throw new Error("Homepage is missing the canonical Dead Air CreativeWorkSeries entity.");
    }
  } else if (website) {
    throw new Error(`WebSite site-name structured data must remain on the canonical homepage: ${pagePath}`);
  }

  if (html.includes('class="breadcrumbs"')) {
    breadcrumbSurfaceCount += 1;
    const breadcrumbs = findType(nodes, "BreadcrumbList");
    if (!breadcrumbs || !Array.isArray(breadcrumbs.itemListElement) || breadcrumbs.itemListElement.length < 2) {
      throw new Error(`Visible breadcrumbs are missing BreadcrumbList structured data: ${pagePath}`);
    }
    breadcrumbs.itemListElement.forEach((item, index) => {
      if (item.position !== index + 1 || typeof item.name !== "string") {
        throw new Error(`BreadcrumbList positions or names are invalid: ${pagePath}`);
      }
      if (!item.item || new URL(item.item).origin !== canonicalOrigin) {
        throw new Error(`BreadcrumbList item is not on the canonical Dead Air origin: ${pagePath}`);
      }
    });
    const lastBreadcrumb = breadcrumbs.itemListElement.at(-1);
    if (lastBreadcrumb.item !== canonicalUrl) {
      throw new Error(`BreadcrumbList does not terminate at the canonical page URL: ${pagePath}`);
    }
  }

  const isStoryDetail = pagePath.startsWith("stories/") && pagePath !== "stories/index.html";
  if (isStoryDetail) {
    storySurfaceCount += 1;
    const story = findType(nodes, "ShortStory");
    if (!story) {
      throw new Error(`Published story is missing ShortStory structured data: ${pagePath}`);
    }
    if (story.url !== canonicalUrl || story.mainEntityOfPage?.["@id"] !== expectedWebPageId) {
      throw new Error(`ShortStory structured data is not linked to its canonical WebPage: ${pagePath}`);
    }
    if (story.isPartOf?.["@id"] !== seriesId) {
      throw new Error(`ShortStory structured data is not linked to the canonical Dead Air series: ${pagePath}`);
    }
  }
}

if (publicSurfaceCount === 0) {
  throw new Error("No indexable public HTML surfaces were found for identity validation.");
}
if (breadcrumbSurfaceCount === 0) {
  throw new Error("No public breadcrumb surfaces were found for structured-data validation.");
}
if (storySurfaceCount === 0) {
  throw new Error("No published story surfaces were found for structured-data validation.");
}

console.log(`Site identity output validated across ${publicSurfaceCount} public surfaces, including ${breadcrumbSurfaceCount} breadcrumb surfaces and ${storySurfaceCount} story surfaces.`);
