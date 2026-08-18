import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4173";
const storyPath = "/stories/da-003-the-recorder-kept-running/";
const title = "The Recorder Kept Running";
const summary = "Maren finds Jonah bleeding in an unfinished house with three pages he does not remember writing. Hours later, he asks her to take him back to Harrow River.";
const coverAlt = "Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, grave marker, or apparition is visible.";
const sourceNote = "Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.";
const outputDirectory = path.join(process.cwd(), "artifacts", "da003-preview-proof");

await mkdir(outputDirectory, { recursive: true });

const openWithRetry = async (page, url) => {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 10_000 });
      assert(response?.ok(), `Expected a successful response for ${url}, received ${response?.status()}.`);
      await page.evaluate(() => document.fonts.ready);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw lastError;
};

const settleAfterScroll = async (page) => {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};

const assertNoHorizontalOverflow = async (page, label) => {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  assert(
    dimensions.documentWidth <= dimensions.viewportWidth + 1,
    `${label} has horizontal overflow: document ${dimensions.documentWidth}px, viewport ${dimensions.viewportWidth}px.`,
  );
};

const verifyHeadMetadata = async (page) => {
  assert.equal(await page.title(), `${title} | The Dead Air Archive`);
  assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), summary);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,nofollow,noarchive");
  assert.equal(await page.locator('meta[property="og:title"]').getAttribute("content"), title);
  assert.equal(await page.locator('meta[property="og:description"]').getAttribute("content"), summary);
  assert.match(
    (await page.locator('meta[property="og:image"]').getAttribute("content")) ?? "",
    /da-003-cover-option-a-evidence-crop-preview\.jpg/,
  );
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  assert(structuredData?.includes('"@type":"ShortStory"'), "DA-003 ShortStory structured data is missing.");
};

const verifyStoryPage = async (page, label) => {
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  await page.getByText("Final Approved Story v8", { exact: false }).waitFor();
  await page.getByText(sourceNote, { exact: true }).waitFor();
  await verifyHeadMetadata(page);

  const cover = page.locator(`img[alt="${coverAlt}"]`);
  assert.equal(await cover.count(), 1, "Expected exactly one approved DA-003 cover derivative.");
  const coverLoaded = await cover.evaluate((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  assert(coverLoaded, "DA-003 approved cover derivative did not render successfully.");

  const sectionHeadings = page.getByRole("heading", { level: 2 });
  const numbered = [];
  for (let index = 0; index < (await sectionHeadings.count()); index += 1) {
    const text = (await sectionHeadings.nth(index).innerText()).trim();
    if (/^[1-9]\.\s/.test(text)) numbered.push(text);
  }
  assert.equal(numbered.length, 9, `Expected nine numbered DA-003 sections, found ${numbered.length}.`);
  numbered.forEach((heading, index) => assert.match(heading, new RegExp(`^${index + 1}\\.\\s`)));
  assert(!(await page.locator("body").innerText()).match(/Scene\s+[1-9]\s+—/), "Production Scene labels leaked into reader-facing output.");
  await assertNoHorizontalOverflow(page, label);
};

const verifyStoriesCard = async (page, label, prefix) => {
  await openWithRetry(page, `${baseUrl}/stories/`);
  const card = page.locator('[data-entry][data-title="the recorder kept running"]');
  assert.equal(await card.count(), 1, "Stories page must contain exactly one DA-003 preview card.");
  assert.equal(await card.getAttribute("data-summary"), summary.toLowerCase());
  assert.equal(await card.getByRole("link", { name: title, exact: true }).count(), 1);
  await card.getByText(summary, { exact: true }).waitFor();
  await card.scrollIntoViewIfNeeded();
  await settleAfterScroll(page);
  await assertNoHorizontalOverflow(page, `${label} Stories index`);
  await page.screenshot({ path: path.join(outputDirectory, `${prefix}-stories-card.png`) });
};

const verifyTimelineNeutrality = async (page) => {
  await openWithRetry(page, `${baseUrl}/timeline/`);
  const text = await page.locator("body").innerText();
  assert(!text.includes(title), "DA-003 appeared in the public chronology before chronology authorization.");
};

const captureStoryProof = async (page, label, prefix) => {
  await openWithRetry(page, `${baseUrl}${storyPath}`);
  await verifyStoryPage(page, label);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settleAfterScroll(page);
  await page.screenshot({ path: path.join(outputDirectory, `${prefix}-story-top.png`) });

  for (const [sectionNumber, suffix] of [[5, "section-5"], [9, "section-9"]]) {
    const heading = page.getByRole("heading", { level: 2, name: new RegExp(`^${sectionNumber}\\.\\s`) });
    assert.equal(await heading.count(), 1, `Expected exactly one DA-003 section ${sectionNumber} heading.`);
    await heading.scrollIntoViewIfNeeded();
    await settleAfterScroll(page);
    await page.screenshot({ path: path.join(outputDirectory, `${prefix}-${suffix}.png`) });
  }

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await settleAfterScroll(page);
  await page.screenshot({ path: path.join(outputDirectory, `${prefix}-footer.png`) });
};

const browser = await chromium.launch({ headless: true });
let desktopContext;
let mobileContext;

try {
  desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const desktopPage = await desktopContext.newPage();
  await verifyStoriesCard(desktopPage, "Desktop", "da003-desktop-1440");
  await captureStoryProof(desktopPage, "Desktop DA-003 preview", "da003-desktop-1440");
  await verifyTimelineNeutrality(desktopPage);

  mobileContext = await browser.newContext({ ...devices["iPhone 13"] });
  const mobilePage = await mobileContext.newPage();
  await verifyStoriesCard(mobilePage, "iPhone 13", "da003-mobile-iphone-13");
  await captureStoryProof(mobilePage, "Mobile DA-003 preview", "da003-mobile-iphone-13");
  await verifyTimelineNeutrality(mobilePage);

  console.log(
    "DA-003 private-preview rendered proof PASS: Stories card title/subtitle, story metadata, noindex controls, approved cover derivative, source note, nine ordered sections, chronology neutrality, desktop/iPhone layouts, and horizontal-overflow checks verified.",
  );
} finally {
  await mobileContext?.close();
  await desktopContext?.close();
  await browser.close();
}
