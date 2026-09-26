import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const da004Path = "src/content/stories/da-004-close-enough-to-recognize.md";
const marker = "let repairCount = 0;";
const legacyScripts = [
  "scripts/apply-contrastive-prose-repair.mjs",
  "scripts/apply-house-cadence-prose-repair.mjs",
];

for (const relativePath of legacyScripts) {
  const absolutePath = path.join(root, relativePath);
  const source = await readFile(absolutePath, "utf8");
  const da004Key = `${JSON.stringify(da004Path)}: [`;
  if (!source.includes(da004Key)) {
    throw new Error(`${relativePath} no longer contains the expected DA-004 legacy repair scope.`);
  }
  if (!source.includes(marker)) {
    throw new Error(`${relativePath} no longer contains the repair-count marker.`);
  }

  const patched = source.replace(
    marker,
    `// DA-004 now materializes directly from its authoritative v1.12 source lock.\n// Keep the historical repair definitions for auditability, but do not mutate DA-004 after source lock.\ndelete repairs[${JSON.stringify(da004Path)}];\n\n${marker}`,
  );
  const tempPath = path.join(root, "scripts", `.scoped-${path.basename(relativePath)}`);
  await writeFile(tempPath, patched, "utf8");
  try {
    await import(`${pathToFileURL(tempPath).href}?scope=${Date.now()}-${Math.random()}`);
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}

console.log("Applied legacy prose-repair layers to DA-001–DA-003 only; DA-004 reserved for authoritative v1.12 materialization.");
