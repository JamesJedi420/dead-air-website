import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spe2893Manifest } from "./spe2893-approved-delta-manifest.mjs";
import { spe2893UpstreamRebases } from "./spe2893-upstream-rebases.mjs";

const root = process.cwd();
const diagnosticPath = path.join(root, "artifacts", "spe2893-validation.json");

let accountedApprovalDeltas = 0;
let implementedRepairs = 0;
let rebasedTargets = 0;

for (const [relativePath, record] of Object.entries(spe2893Manifest)) {
  const absolutePath = path.join(root, relativePath);
  const text = await readFile(absolutePath, "utf8");

  const accountedForStory = record.repairs.length + record.preSatisfied.length;
  if (accountedForStory !== record.approvalDeltaCount) {
    throw new Error(
      `${record.candidateId}: manifest accounts for ${accountedForStory} approval deltas, expected ${record.approvalDeltaCount}.`,
    );
  }

  for (const repair of record.repairs) {
    const currentBefore = spe2893UpstreamRebases.get(repair.before) ?? repair.before;
    if (currentBefore !== repair.before) {
      rebasedTargets += 1;
    }

    if (text.includes(currentBefore)) {
      throw new Error(
        `${relativePath}: pre-SPE-2893 pipeline wording remains after publication-layer repair: ${JSON.stringify(currentBefore)}.`,
      );
    }

    if (repair.after && !text.includes(repair.after)) {
      throw new Error(
        `${relativePath}: approved SPE-2893 wording is missing: ${JSON.stringify(repair.after)}.`,
      );
    }

    implementedRepairs += repair.expected ?? 1;
  }

  for (const inherited of record.preSatisfied) {
    if (text.includes(inherited.absent)) {
      throw new Error(
        `${relativePath}: SPE-2893 delta expected to be satisfied by an earlier approved layer is present again: ${JSON.stringify(inherited.absent)}.`,
      );
    }
  }

  accountedApprovalDeltas += record.approvalDeltaCount;
}

if (accountedApprovalDeltas !== 50) {
  throw new Error(
    `SPE-2893 approval-delta accounting mismatch: expected 50 across DA-001–DA-004, found ${accountedApprovalDeltas}.`,
  );
}

const da002Path = path.join(root, "src/content/stories/da-002-the-name-in-the-room.md");
const da002 = await readFile(da002Path, "utf8");
if (!da002.includes("revision: Final Approved Story v15")) {
  throw new Error(
    "DA-002 must retain the separately approved Final Approved Story v15 synchronization before SPE-2893 validation.",
  );
}

await writeFile(
  diagnosticPath,
  `${JSON.stringify({
    phase: "validated",
    accountedApprovalDeltas,
    implementedRepairs,
    inheritedApprovedSyncDeltas: accountedApprovalDeltas - implementedRepairs,
    rebasedTargets,
    status: "pass",
  }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Validated ${accountedApprovalDeltas} approved SPE-2893 candidate deltas: ${implementedRepairs} publication-layer repairs plus ${accountedApprovalDeltas - implementedRepairs} deltas already satisfied by the earlier approved-manuscript synchronization; ${rebasedTargets} targets rebased onto prior approved publication wording.`,
);
