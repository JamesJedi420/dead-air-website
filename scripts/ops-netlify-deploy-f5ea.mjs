import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const expectedSha = "f5ea86f2e96599b97ef0a288e83e9f366b836902";
const siteId = "78053981-b72d-428f-9622-1b7177ace21d";
const context = process.env.CONTEXT ?? "";
const reviewId = process.env.REVIEW_ID ?? "";
const proxyUrl = process.env.CHATGPT_NETLIFY_DEPLOY_PROXY_URL ?? "";

console.log(`Temporary deployment bridge context=${context} review=${reviewId || "none"}.`);
if (context !== "deploy-preview" || reviewId !== "96") {
  console.log("Temporary production-deploy bridge skipped outside deploy preview 96.");
  process.exit(0);
}

if (!proxyUrl) {
  throw new Error("CHATGPT_NETLIFY_DEPLOY_PROXY_URL is unavailable in the deploy-preview build environment.");
}

execFileSync("git", ["cat-file", "-e", `${expectedSha}^{commit}`], { stdio: "inherit" });
const checkout = mkdtempSync(path.join(tmpdir(), "dead-air-f5ea-"));

try {
  execFileSync("git", ["worktree", "add", "--detach", checkout, expectedSha], { stdio: "inherit" });
  const actualSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: checkout, encoding: "utf8" }).trim();
  if (actualSha !== expectedSha) throw new Error(`Exact-source verification failed: ${actualSha}`);
  console.log(`Exact production source verified: ${actualSha}`);
  execFileSync(
    "npx",
    ["-y", "@netlify/mcp@latest", "--site-id", siteId, "--proxy-path", proxyUrl],
    { cwd: checkout, stdio: "inherit", env: process.env },
  );
} finally {
  try {
    execFileSync("git", ["worktree", "remove", "--force", checkout], { stdio: "ignore" });
  } catch {
    rmSync(checkout, { recursive: true, force: true });
  }
}
