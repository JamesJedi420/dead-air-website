import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spe2893Manifest } from "./spe2893-approved-delta-manifest.mjs";
import { spe2893UpstreamRebases } from "./spe2893-upstream-rebases.mjs";

const root = process.cwd();
const diagnosticDirectory = path.join(root, "artifacts");
const diagnosticPath = path.join(diagnosticDirectory, "spe2893-validation.json");

let repairCount = 0;
let storyCount = 0;
const issues = [];

for (const [relativePath, record] of Object.entries(spe2893Manifest)) {
  const absolutePath = path.join(root, relativePath);
  let text = await readFile(absolutePath, "utf8");

  for (const [repairIndex, repair] of record.repairs.entries()) {
    const expected = repair.expected ?? 1;
    const currentBefore = spe2893UpstreamRebases.get(repair.before) ?? repair.before;
    const occurrences = text.split(currentBefore).length - 1;

    if (occurrences !== expected) {
      issues.push({
        candidateId: record.candidateId,
        relativePath,
        repairIndex,
        expected,
        occurrences,
        candidateBefore: repair.before,
        currentBefore,
      });
      continue;
    }

    text = text.split(currentBefore).join(repair.after);
    repairCount += occurrences;
  }

  await writeFile(absolutePath, text, "utf8");
  storyCount += 1;
}

await mkdir(diagnosticDirectory, { recursive: true });
await writeFile(
  diagnosticPath,
  `${JSON.stringify({ phase: "apply", repairCount, storyCount, issues }, null, 2)}\n`,
  "utf8",
);

if (issues.length > 0) {
  throw new Error(
    `SPE-2893 publication-layer application found ${issues.length} deterministic target mismatch(es). See artifacts/spe2893-validation.json.`,
  );
}

console.log(
  `Applied ${repairCount} approved SPE-2893 publication-layer repairs across ${storyCount} story file(s).`,
);
