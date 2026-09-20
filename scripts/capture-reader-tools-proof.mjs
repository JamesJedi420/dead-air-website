import { mkdir } from "node:fs/promises";
import { chromium, devices } from "playwright";

const baseUrl = process.env.READER_TOOLS_BASE_URL ?? "http://127.0.0.1:4176";
const storyPath = "/stories/da-002-the-name-in-the-room/";
const storyUrl = new URL(storyPath, baseUrl).toString();
const storageKey = `dead-air:reading-progress:v1:${storyPath}`;
const proofDir = "artifacts/reader-tools-proof";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const installShareMocks = async (page) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__deadAirCopiedUrl = text;
        },
      },
    });
  });
};

const getStoredProgress = async (page) => page.evaluate((key) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}, storageKey);

const waitForStoredProgress = async (page) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const saved = await getStoredProgress(page);
    if (saved && typeof saved.progress === "number") return saved;
    await page.waitForTimeout(50);
  }
  return null;
};

const assertNoHorizontalOverflow = async (page, label) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!overflow, `${label} has horizontal overflow.`);
};

await mkdir(proofDir, { recursive: true });
const browser = await chromium.launch();

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  await installShareMocks(page);
  await page.goto(storyUrl, { waitUntil: "networkidle" });

  const shareButton = page.locator("[data-share-story]");
  const resumeButton = page.locator("[data-resume-story]");
  const startOverButton = page.locator("[data-start-over]");

  assert(await shareButton.isVisible(), "Published story is missing a visible Share story control.");
  assert(!(await resumeButton.isVisible()), "Resume control should be hidden without stored progress.");
  assert(!(await startOverButton.isVisible()), "Start-over control should be hidden without stored progress.");

  await page.evaluate(() => {
    const body = document.querySelector("[data-story-body]");
    if (!(body instanceof HTMLElement)) throw new Error("Story body missing.");
    const rect = body.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    window.scrollTo(0, top + rect.height * 0.5);
  });

  const stored = await waitForStoredProgress(page);
  assert(stored && typeof stored.progress === "number", "Scrolling did not persist reading progress.");
  assert(stored.progress >= 0.08 && stored.progress < 0.96, `Unexpected stored progress: ${stored.progress}`);

  await page.screenshot({ path: `${proofDir}/reader-tools-desktop-saved.png`, fullPage: true });
  await page.reload({ waitUntil: "networkidle" });

  assert(await resumeButton.isVisible(), "Saved progress did not expose the resume control after reload.");
  assert(await startOverButton.isVisible(), "Saved progress did not expose the start-over control after reload.");
  assert(/^Continue from \d+%$/.test((await resumeButton.textContent())?.trim() ?? ""), "Resume control does not report saved percentage.");

  await resumeButton.click();
  await page.waitForTimeout(650);
  const resumePosition = await page.evaluate(() => {
    const body = document.querySelector("[data-story-body]");
    if (!(body instanceof HTMLElement)) return null;
    const rect = body.getBoundingClientRect();
    const bodyTop = window.scrollY + rect.top;
    return { scrollY: window.scrollY, bodyTop };
  });
  assert(resumePosition && resumePosition.scrollY > resumePosition.bodyTop + 40, "Continue reading did not move into the saved story position.");

  await shareButton.click();
  await page.waitForTimeout(50);
  const copied = await page.evaluate(() => window.__deadAirCopiedUrl ?? null);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  assert(copied === canonical, `Share fallback copied ${copied} instead of canonical URL ${canonical}.`);
  assert((await page.locator("[data-reader-live]").textContent())?.includes("Story link copied."), "Share fallback did not announce copy success.");

  await startOverButton.click();
  await page.waitForTimeout(650);
  assert((await getStoredProgress(page)) === null, "Start over did not clear stored reading progress.");
  await assertNoHorizontalOverflow(page, "Desktop reader tools");
  await page.screenshot({ path: `${proofDir}/reader-tools-desktop-reset.png`, fullPage: true });
  await desktop.close();

  const mobile = await browser.newContext({ ...devices["iPhone 13"] });
  const mobilePage = await mobile.newPage();
  await installShareMocks(mobilePage);
  await mobilePage.goto(storyUrl, { waitUntil: "networkidle" });
  await mobilePage.evaluate(({ key }) => {
    localStorage.setItem(key, JSON.stringify({ progress: 0.42, updatedAt: Date.now() }));
  }, { key: storageKey });
  await mobilePage.reload({ waitUntil: "networkidle" });

  assert(await mobilePage.locator("[data-resume-story]").isVisible(), "Mobile resume control is not visible with saved progress.");
  assert(await mobilePage.locator("[data-start-over]").isVisible(), "Mobile start-over control is not visible with saved progress.");
  assert(await mobilePage.locator("[data-share-story]").isVisible(), "Mobile share control is not visible.");
  await assertNoHorizontalOverflow(mobilePage, "Mobile reader tools");
  await mobilePage.screenshot({ path: `${proofDir}/reader-tools-mobile.png`, fullPage: true });
  await mobile.close();

  console.log("Reader tools proof PASS: local resume persistence/reset, canonical share fallback, accessible status announcement, desktop layout, mobile layout, and horizontal-overflow checks verified.");
} finally {
  await browser.close();
}
