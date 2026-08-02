import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4173";
const storyPath = "/stories/da-001-the-building-keeps-the-hour/";
const outputDirectory = path.join(process.cwd(), "artifacts", "da001-visual-proof");
const sections = [
  "1. Three-Thirty",
  "2. Permission Slips",
  "3. The Quiet Test",
  "4. Four Seconds",
  "5. The Markers",
  "6. The West Route",
  "7. The Cut",
  "8. The Glassless Window",
  "9. The Key That Is Not Hers",
  "10. Source Track",
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

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

const verifyStoryContent = async (page) => {
  assert.equal(await page.title(), "The Building Keeps the Hour | The Dead Air Archive");
  await page.getByRole("heading", { name: "The Building Keeps the Hour", exact: true }).waitFor();
  await page.getByText("Final Approved Story v17", { exact: false }).waitFor();
  await page
    .getByText(
      "Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.",
      { exact: true },
    )
    .waitFor();

  const sectionOffsets = [];
  for (const section of sections) {
    const heading = page.getByRole("heading", { name: section, exact: true });
    assert.equal(await heading.count(), 1, `Expected exactly one published section heading ${JSON.stringify(section)}.`);
    sectionOffsets.push(await heading.evaluate((element) => element.getBoundingClientRect().top + window.scrollY));
  }
  for (let index = 1; index < sectionOffsets.length; index += 1) {
    assert(
      sectionOffsets[index] > sectionOffsets[index - 1],
      `Published section ${index + 1} must render after section ${index}.`,
    );
  }
};

const settleAfterScroll = async (page) => {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
};

const captureViewportProof = async (page, prefix) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await settleAfterScroll(page);
  await page.screenshot({ path: path.join(outputDirectory, `${prefix}-top.png`) });

  for (const [heading, suffix] of [
    ["5. The Markers", "section-5"],
    ["10. Source Track", "section-10"],
  ]) {
    const locator = page.getByRole("heading", { name: heading, exact: true });
    await locator.scrollIntoViewIfNeeded();
    await settleAfterScroll(page);
    const box = await locator.boundingBox();
    assert(box && box.y >= 0 && box.y < (await page.evaluate(() => window.innerHeight)), `${heading} is not visible after scrolling.`);
    await page.screenshot({ path: path.join(outputDirectory, `${prefix}-${suffix}.png`) });
  }

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await settleAfterScroll(page);
  await page.screenshot({ path: path.join(outputDirectory, `${prefix}-footer.png`) });
};

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const desktopPage = await desktopContext.newPage();
await openWithRetry(desktopPage, `${baseUrl}${storyPath}`);
await verifyStoryContent(desktopPage);
await assertNoHorizontalOverflow(desktopPage, "Desktop DA-001 page");
await captureViewportProof(desktopPage, "da001-desktop-1440");

const storiesHref = await desktopPage.getByRole("link", { name: "Stories", exact: true }).first().getAttribute("href");
const timelineHref = await desktopPage.getByRole("link", { name: "Timeline", exact: true }).first().getAttribute("href");
assert.equal(new URL(storiesHref, desktopPage.url()).pathname, "/stories/");
assert.equal(new URL(timelineHref, desktopPage.url()).pathname, "/timeline/");

await openWithRetry(desktopPage, `${baseUrl}/stories/`);
const storyIndexLink = desktopPage.getByRole("link", { name: "The Building Keeps the Hour", exact: true });
assert.equal(await storyIndexLink.count(), 1, "Stories index must link to DA-001 exactly once.");
assert.equal(new URL(await storyIndexLink.getAttribute("href"), desktopPage.url()).pathname, storyPath);

await openWithRetry(desktopPage, `${baseUrl}/timeline/`);
const timelineItems = desktopPage.locator(".timeline-list > li");
let da001Index = -1;
let da002Index = -1;
let da001Text = "";
let da002Text = "";
for (let index = 0; index < (await timelineItems.count()); index += 1) {
  const text = await timelineItems.nth(index).innerText();
  if (text.includes("The Building Keeps the Hour")) {
    da001Index = index;
    da001Text = text;
  }
  if (text.includes("The Name in the Room")) {
    da002Index = index;
    da002Text = text;
  }
}
assert(da001Index >= 0, "Timeline must contain the DA-001 story entry.");
assert(da002Index > da001Index, "Timeline must place the DA-002 story entry after DA-001.");
assert.match(da001Text, /Archive position\s+1/i, "DA-001 timeline card must show archive position 1.");
assert.match(da002Text, /Archive position\s+2/i, "DA-002 timeline card must show archive position 2.");
await assertNoHorizontalOverflow(desktopPage, "Desktop timeline page");

const mobileContext = await browser.newContext({ ...devices["iPhone 13"] });
const mobilePage = await mobileContext.newPage();
await openWithRetry(mobilePage, `${baseUrl}${storyPath}`);
await verifyStoryContent(mobilePage);
await assertNoHorizontalOverflow(mobilePage, "Mobile DA-001 page");
await captureViewportProof(mobilePage, "da001-mobile-iphone-13");

await mobileContext.close();
await desktopContext.close();
await browser.close();

console.log(
  "DA-001 visual proof passed: desktop and iPhone 13 viewport captures cover the page top, Section 5, Section 10, and footer; layouts have no horizontal overflow; story metadata, source note, ten ordered sections, stories-index link, navigation paths, and DA-001 → DA-002 chronology are correct.",
);
