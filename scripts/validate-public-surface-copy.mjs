import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");

const forbiddenMarkers = [
  ["publication boundary", /publication boundary/i],
  ["reader-facing", /reader-facing/i],
  ["private production material", /private production material/i],
  ["publish edited public-facing entries", /publish edited public-facing entries/i],
  ["commit raw transcripts", /commit raw transcripts/i],
  ["private collaborators", /private collaborators/i],
  ["private source material", /private source material/i],
  ["hidden canon", /hidden canon/i],
  ["unpublished continuity", /unpublished continuity/i],
  ["internal research notes", /internal research notes/i],
  ["internal development notes/records", /internal development (?:notes|records)/i],
  ["approved cross-references", /approved cross-references/i],
  ["public-source discipline", /public-source discipline/i],
  ["collection metadata", /collection metadata/i],
  ["public content is imported", /public content is imported/i],
  ["provisional canon threads", /provisional canon threads/i],
  ["narrative chronology metadata", /narrative chronology metadata/i],
  ["approved public metadata", /approved public metadata/i],
  ["inside Dead Air continuity", /inside Dead Air continuity/i],
  ["source investigations and transcripts", /source investigations and transcripts/i],
  ["foundation build", /foundation build/i],
  ["deploy preview", /deploy preview/i],
  ["repository-native", /repository-native/i],
  ["approved-source hash", /approved-source hash/i],
  ["release gate", /release gate/i],
];

const collectHtml = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(entryPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }

  return files;
};

const failures = [];
let publicSurfaceFiles = [];

try {
  publicSurfaceFiles = await collectHtml(distRoot);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Public-surface role-separation validation could not inspect dist: ${message}`);
  process.exit(1);
}

if (publicSurfaceFiles.length === 0) {
  console.error("Public-surface role-separation validation found no rendered HTML surfaces.");
  process.exit(1);
}

for (const absolutePath of publicSurfaceFiles) {
  const relativePath = path.relative(root, absolutePath).replaceAll(path.sep, "/");
  const html = await readFile(absolutePath, "utf8");

  for (const [label, pattern] of forbiddenMarkers) {
    if (pattern.test(html)) {
      failures.push(`${relativePath}: contains internal-policy marker "${label}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Public-surface role-separation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Public-surface role-separation validation passed across ${publicSurfaceFiles.length} rendered HTML surfaces.`);
