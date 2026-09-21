import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4175";
const slug = "da-004-close-enough-to-recognize";
const storyPath = `/stories/${slug}/`;
const title = "Close Enough to Recognize";
const revision = "Final Approved Story v1.10";
const summary = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const alt = "An empty, warmly lit hotel corridor leads to a closed dark service door with a brass STAFF ONLY plaque.";
const heroPath = "/assets/da-004/da004_art001_v3_0_16x9_1600x900.webp";
const mobilePath = "/assets/da-004/da004_art001_v3_0_2x3_1024x1536.webp";
const card = "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp";
const square = "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp";
const og = "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp";
const social = "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp";
const allAssets = [heroPath, mobilePath, card, square, og, social];
const out = path.join(process.cwd(), "artifacts", "da004-release-proof");
await mkdir(out, { recursive: true });

const open = async (page, url) => { const r = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }); assert(r?.ok(), `${url} returned ${r?.status()}`); await page.evaluate(() => document.fonts.ready); };
const noOverflow = async (page, label) => { const d = await page.evaluate(() => ({ w: innerWidth, s: document.documentElement.scrollWidth })); assert(d.s <= d.w + 1, `${label} horizontal overflow ${d.s}/${d.w}`); };
const absoluteLocal = (value) => value.startsWith("/") ? new URL(value, baseUrl).href : value;

const verify = async (page, label, isMobile) => {
  await open(page, `${baseUrl}${storyPath}`);
  assert.equal(await page.title(), `${title} | Dead Air`);
  await page.getByText(revision, { exact: false }).waitFor();
  assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), summary);
  assert.equal(await page.locator('meta[name="robots"]').count(), 0, "Correction preview must mirror the currently indexable production route without publishing it.");
  const published = await page.locator('meta[property="article:published_time"]').getAttribute("content");
  assert(published?.startsWith("2026-09-14"), `Unexpected publication time ${published}`);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://readdeadair.com${storyPath}`);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute("content"), og);
  assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute("content"), og);
  assert.equal(await page.locator('meta[property="og:image:alt"]').getAttribute("content"), alt);

  const img = page.locator('#story-hero-image');
  assert.equal(await img.count(), 1);
  assert.equal(await img.getAttribute("alt"), alt);
  assert.equal(await img.getAttribute("loading"), "eager");
  assert.equal(await img.getAttribute("fetchpriority"), "high");
  const current = await img.evaluate((el) => ({ src: el.currentSrc, nw: el.naturalWidth, nh: el.naturalHeight, complete: el.complete }));
  assert(current.complete && current.nw > 0 && current.nh > 0, `${label} hero did not load`);
  const expectedPath = isMobile ? mobilePath : heroPath;
  assert.equal(current.src, absoluteLocal(expectedPath));
  if (isMobile) { assert.equal(current.nw, 1024); assert.equal(current.nh, 1536); } else { assert.equal(current.nw, 1600); assert.equal(current.nh, 900); }
  assert.equal(await page.locator(`link[rel="preload"][as="image"][href="${expectedPath}"]`).count(), 1, `${label} responsive preload missing`);
  assert((await page.evaluate((src) => performance.getEntriesByName(src).length, current.src)) > 0, `${label} hero resource timing missing`);
  assert.equal(await page.locator("main").count(), 1);
  assert.equal(await page.getByRole("heading", { level: 1, name: title, exact: true }).count(), 1);
  const h2 = page.getByRole("heading", { level: 2 }); let numbered = 0;
  for (let i = 0; i < await h2.count(); i += 1) if (/^\d+\.\s/.test((await h2.nth(i).innerText()).trim())) numbered += 1;
  assert.equal(numbered, 10);
  await noOverflow(page, label);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, `${isMobile ? "mobile-iphone13" : "desktop-1440"}-top.png`), fullPage: false });
  const art = page.locator('[data-story-art]'); assert.equal(await art.count(), 1); await art.scrollIntoViewIfNeeded(); await art.screenshot({ path: path.join(out, `${isMobile ? "mobile-iphone13" : "desktop-1440"}-hero.png`) });
};

const verifyPublicationSurfaces = async (page) => {
  for (const route of ["/stories/", "/feed.xml", "/sitemap-index.xml"]) {
    const r = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" }); assert(r?.ok(), `${route} failed ${r?.status()}`);
    const html = await page.content();
    if (route !== "/sitemap-index.xml") assert(html.includes(title) || html.includes(slug), `DA-004 missing from ${route}`);
  }
  for (const url of allAssets) { const r = await page.request.get(absoluteLocal(url)); assert(r.ok(), `Missing approved WebP ${url}`); assert.match(r.headers()["content-type"] ?? "", /image\/webp/); }
};

const browser = await chromium.launch({ headless: true }); let desktop, mobileContext;
try {
  desktop = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const dp = await desktop.newPage(); await verify(dp, "Desktop", false); await verifyPublicationSurfaces(dp);
  mobileContext = await browser.newContext({ ...devices["iPhone 13"] });
  const mp = await mobileContext.newPage(); await verify(mp, "iPhone 13", true);
  console.log("DA-004 v1.10 correction proof PASS: authoritative revision, unchanged publication date/canonical metadata, v3.0 responsive WebP art, exact alt, desktop/mobile crop, semantics, archive/feed surfaces, and ten story sections verified in non-public preview.");
} finally { await mobileContext?.close(); await desktop?.close(); await browser.close(); }
