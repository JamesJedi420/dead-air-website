import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
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

const home = readFileSync(resolve(root, "dist/index.html"), "utf8");
const expectations = [
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
];

for (const expectation of expectations) {
  if (!home.includes(expectation)) {
    throw new Error(`Homepage is missing site identity markup: ${expectation}`);
  }
}

console.log("Site identity output validated.");
