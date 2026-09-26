import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spe2893Manifest } from "./spe2893-approved-delta-manifest.mjs";
import { spe2893UpstreamRebases } from "./spe2893-upstream-rebases.mjs";

const root = process.cwd();
const diagnosticPath = path.join(root, "artifacts", "spe2893-validation.json");
const da004Path = "src/content/stories/da-004-close-enough-to-recognize.md";
const da004 = await readFile(path.join(root, da004Path), "utf8");

let accountedApprovalDeltas = 0;
let implementedRepairs = 0;
let rebasedTargets = 0;

for (const [relativePath, record] of Object.entries(spe2893Manifest)) {
  if (relativePath === da004Path) continue;

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
    if (currentBefore !== repair.before) rebasedTargets += 1;
    if (text.includes(currentBefore)) {
      throw new Error(`${relativePath}: pre-SPE-2893 pipeline wording remains: ${JSON.stringify(currentBefore)}.`);
    }
    if (repair.after && !text.includes(repair.after)) {
      throw new Error(`${relativePath}: approved SPE-2893 wording is missing: ${JSON.stringify(repair.after)}.`);
    }
    implementedRepairs += repair.expected ?? 1;
  }

  for (const inherited of record.preSatisfied) {
    if (text.includes(inherited.absent)) {
      throw new Error(`${relativePath}: inherited SPE-2893 delta is present again: ${JSON.stringify(inherited.absent)}.`);
    }
  }
  accountedApprovalDeltas += record.approvalDeltaCount;
}

if (accountedApprovalDeltas !== 36) {
  throw new Error(`Scoped SPE-2893 accounting mismatch: expected 36 DA-001–DA-003 deltas, found ${accountedApprovalDeltas}.`);
}
if (!da004.includes("revision: Final Approved Story v1.12")) {
  throw new Error("DA-004 must remain the authoritative Final Approved Story v1.12 output while older SPE-2893 DA-004 transforms are bypassed.");
}

const da002 = await readFile(path.join(root, "src/content/stories/da-002-the-name-in-the-room.md"), "utf8");
if (!da002.includes("revision: Final Approved Story v15")) {
  throw new Error("DA-002 must retain the separately approved Final Approved Story v15 website synchronization before scoped SPE-2893 validation.");
}

await writeFile(
  diagnosticPath,
  `${JSON.stringify({
    phase: "validated-current-scope",
    accountedApprovalDeltas,
    implementedRepairs,
    inheritedApprovedSyncDeltas: accountedApprovalDeltas - implementedRepairs,
    rebasedTargets,
    bypassedDA004ApprovalDeltas: 14,
    bypassedDA004Revision: "Final Approved Story v1.12",
    status: "pass",
  }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Validated ${accountedApprovalDeltas} SPE-2893 deltas across DA-001–DA-003; DA-004's 14 older publication-layer deltas are superseded by direct authoritative Final Approved Story v1.12 materialization and validated separately.`,
);
