import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const listName = "awlist6907601";
const formAction = "https://www.aweber.com/scripts/addlead.pl";
const successUrl = "https://readdeadair.com/subscribe/thanks/";
const existingUrl = "https://readdeadair.com/subscribe/already-subscribed/";

const read = (relativePath) => readFile(path.join(dist, relativePath), "utf8");
const fail = (message) => {
  throw new Error(`Newsletter signup validation failed: ${message}`);
};

const hasNoindex = (html) => /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
  || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);

const requireSignup = (html, label) => {
  if (!html.includes("data-newsletter-signup")) fail(`${label} is missing the newsletter signup component.`);
  if (!html.includes(`action=\"${formAction}\"`)) fail(`${label} has the wrong AWeber form action.`);
  if (!html.includes(`name=\"listname\" value=\"${listName}\"`)) fail(`${label} has the wrong AWeber list id.`);
  if (!html.includes(`name=\"redirect\" value=\"${successUrl}\"`)) fail(`${label} has the wrong success redirect.`);
  if (!html.includes(`name=\"meta_redirect_onlist\" value=\"${existingUrl}\"`)) fail(`${label} has the wrong existing-subscriber redirect.`);
  if (!html.includes('name="email"') || !/<input[^>]+type=["']email["'][^>]+required/i.test(html)) {
    fail(`${label} is missing a required email field.`);
  }
  if (/custom\s+(utm|referrer)/i.test(html)) fail(`${label} unexpectedly adds UTM/referrer collection.`);
};

const home = await read("index.html");
requireSignup(home, "Homepage");
if (!home.includes('href="/subscribe/"')) fail("Footer does not link to the email-updates page.");

const subscribe = await read("subscribe/index.html");
requireSignup(subscribe, "Email-updates page");

const privacy = await read("privacy/index.html");
if (!privacy.includes("AWeber")) fail("Privacy page does not disclose AWeber processing.");
if (!privacy.includes("does not intentionally collect analytics or track visitors")) {
  fail("Privacy page no longer states the website analytics posture.");
}

for (const relativePath of ["subscribe/thanks/index.html", "subscribe/already-subscribed/index.html"]) {
  const html = await read(relativePath);
  if (!hasNoindex(html)) fail(`${relativePath} must be noindex.`);
  if (html.includes("data-newsletter-signup")) fail(`${relativePath} must not render another signup form.`);
}

const storiesRoot = path.join(dist, "stories");
const storyDirs = await readdir(storiesRoot, { withFileTypes: true });
let publicStoryCount = 0;
for (const entry of storyDirs) {
  if (!entry.isDirectory()) continue;
  const relativePath = path.join("stories", entry.name, "index.html");
  try {
    await access(path.join(dist, relativePath));
  } catch {
    continue;
  }
  const html = await read(relativePath);
  if (hasNoindex(html)) {
    if (html.includes("data-newsletter-signup")) fail(`${relativePath} is noindex but exposes the signup form.`);
    continue;
  }
  publicStoryCount += 1;
  requireSignup(html, relativePath);
}
if (publicStoryCount === 0) fail("No public story pages were available for signup validation.");

const sitemapFiles = (await readdir(dist)).filter((name) => /^sitemap.*\.xml$/i.test(name));
if (sitemapFiles.length === 0) fail("No sitemap output found.");
let sitemapText = "";
for (const name of sitemapFiles) sitemapText += await read(name);
if (!sitemapText.includes("https://readdeadair.com/subscribe/")) fail("Public email-updates page is missing from sitemap output.");
if (sitemapText.includes("/subscribe/thanks/") || sitemapText.includes("/subscribe/already-subscribed/")) {
  fail("Noindex signup response pages must not appear in sitemap output.");
}

console.log(`Newsletter signup validation passed across homepage, subscribe page, and ${publicStoryCount} public story pages.`);
