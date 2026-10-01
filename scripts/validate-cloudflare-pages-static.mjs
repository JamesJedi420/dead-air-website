import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const requiredRedirects = [
  "/stories/da-001-the-building-keeps-the-hour /stories/da-001-after-the-main-fan-stops/ 301",
  "/stories/da-001-the-building-keeps-the-hour/ /stories/da-001-after-the-main-fan-stops/ 301",
  "/dead-air-da-002-the-name-in-the-room /stories/da-002-the-name-in-the-room/ 301",
  "/dead-air-da-002-the-name-in-the-room/ /stories/da-002-the-name-in-the-room/ 301",
];

const requiredHeaders = [
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy: camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy: form-action 'self' https://www.aweber.com",
  "Cache-Control: public, max-age=31536000, immutable",
];

const mustExist = async (relative) => {
  const absolute = path.join(dist, relative);
  await access(absolute);
  return absolute;
};

const redirectsPath = await mustExist("_redirects");
const headersPath = await mustExist("_headers");
const redirects = await readFile(redirectsPath, "utf8");
const headers = await readFile(headersPath, "utf8");

for (const rule of requiredRedirects) {
  if (!redirects.includes(rule)) throw new Error(`Cloudflare redirect parity missing: ${rule}`);
}

for (const header of requiredHeaders) {
  if (!headers.includes(header)) throw new Error(`Cloudflare header parity missing: ${header}`);
}

if (redirects.includes("dead-air-website.netlify.app")) {
  throw new Error("Netlify hostname redirects must remain on Netlify during migration; do not encode unsupported domain redirects in Pages _redirects.");
}

const astroConfig = await readFile(path.join(root, "astro.config.mjs"), "utf8");
if (!astroConfig.includes('output: "static"')) {
  throw new Error("Cloudflare Pages migration requires the current Astro static-output architecture.");
}

for (const forbidden of ["_worker.js", "functions"]) {
  try {
    await access(path.join(dist, forbidden));
    throw new Error(`Unexpected ${forbidden} output detected; static Pages header/redirect assumptions require review.`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

console.log("Cloudflare Pages static migration validation PASS: static Astro output, redirect parity, and header parity verified.");
