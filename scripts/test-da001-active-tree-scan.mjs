import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const probePath = path.join(root, ".da001-boundary-probe.md");
const fingerprintOne = [
  "At twenty minutes past three, only Bellweather High’s",
  " machinery remained active.",
].join("");
const fingerprintTwo = [
  "The following afternoon, Diane found the gray chair in the main lobby beneath a paper sign",
  " that read PARANORMAL DOCUMENTARY CHECK-IN.",
].join("");
const probe = [
  "The Building Keeps the Hour",
  "Scene 1 — Three-Thirty",
  fingerprintOne,
  "Scene 2 — Permission Slips",
  fingerprintTwo,
  "Scene 3 — The Quiet Test",
  "probe ".repeat(3000),
].join("\n\n");

try {
  await writeFile(probePath, probe, "utf8");
  const result = spawnSync(process.execPath, ["scripts/validate-da001-preparation.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  assert.notEqual(result.status, 0, "DA-001 active-tree scanner accepted the synthetic leak");
  assert.match(output, /\.da001-boundary-probe\.md/, "DA-001 active-tree scanner did not identify the probe path");
} finally {
  await rm(probePath, { force: true });
}

console.log("DA-001 active-tree fixture passed: the validator rejected a renamed manuscript-like probe.");
