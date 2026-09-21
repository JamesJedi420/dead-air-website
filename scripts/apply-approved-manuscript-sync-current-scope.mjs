import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourcePath = path.join(root, "scripts", "apply-approved-manuscript-sync.mjs");
const da004Path = "src/content/stories/da-004-close-enough-to-recognize.md";
const marker = "let synchronizationCount = 0;";

const source = await readFile(sourcePath, "utf8");
const da004Key = `${JSON.stringify(da004Path)}: [`;
if (!source.includes(da004Key)) {
  throw new Error("Approved-manuscript sync no longer contains the expected DA-004 synchronization scope.");
}
if (!source.includes(marker)) {
  throw new Error("Approved-manuscript sync no longer contains the synchronization-count marker.");
}

const patched = source.replace(
  marker,
  `// DA-004 now materializes directly from its authoritative v1.10 source lock.\n// Keep the inherited v1.7→v1.10 synchronization definitions for auditability,\n// but do not reapply them after authoritative v1.10 materialization.\ndelete synchronizations[${JSON.stringify(da004Path)}];\n\n${marker}`,
);

const tempPath = path.join(root, "scripts", ".scoped-apply-approved-manuscript-sync.mjs");
await writeFile(tempPath, patched, "utf8");
try {
  await import(`${pathToFileURL(tempPath).href}?scope=${Date.now()}-${Math.random()}`);
} finally {
  await unlink(tempPath).catch(() => {});
}

console.log("Applied approved-manuscript synchronization to DA-001–DA-003 only; DA-004 reserved for authoritative v1.10 materialization.");
