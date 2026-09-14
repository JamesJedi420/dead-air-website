const siteUrl = process.env.SITE_URL ?? "https://readdeadair.com";
const indexNowKey = process.env.INDEXNOW_KEY;

if (!indexNowKey) {
  throw new Error("INDEXNOW_KEY is required.");
}

const site = new URL(siteUrl);
const sitemapIndexUrl = new URL("/sitemap-index.xml", site).href;
const keyLocation = new URL(`/${indexNowKey}.txt`, site).href;

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1].trim());
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "DeadAir-IndexNow/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

const indexXml = await fetchText(sitemapIndexUrl);
const indexLocs = extractLocs(indexXml);
const sitemapUrls = indexLocs.filter((url) => url.endsWith(".xml"));

let candidateUrls = [];

if (sitemapUrls.length > 0) {
  for (const sitemapUrl of sitemapUrls) {
    const sitemapXml = await fetchText(sitemapUrl);
    candidateUrls.push(...extractLocs(sitemapXml));
  }
} else {
  candidateUrls = indexLocs;
}

const urlList = [...new Set(candidateUrls)]
  .filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === site.hostname && !parsed.pathname.endsWith(".xml");
    } catch {
      return false;
    }
  })
  .sort();

if (urlList.length === 0) {
  throw new Error(`No public URLs found in ${sitemapIndexUrl}.`);
}

if (urlList.length > 10_000) {
  throw new Error(`IndexNow supports at most 10,000 URLs per request; found ${urlList.length}.`);
}

const payload = {
  host: site.hostname,
  key: indexNowKey,
  keyLocation,
  urlList,
};

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8",
    "user-agent": "DeadAir-IndexNow/1.0",
  },
  body: JSON.stringify(payload),
});

const responseBody = await response.text();
console.log(`IndexNow submitted ${urlList.length} URLs with HTTP ${response.status}.`);
if (responseBody) {
  console.log(responseBody);
}

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
}

if (response.status === 202) {
  console.log("IndexNow accepted the batch with key validation pending.");
}
