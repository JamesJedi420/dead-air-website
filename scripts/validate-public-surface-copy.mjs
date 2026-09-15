import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const publicSurfaceFiles = [
  "dist/index.html",
  "dist/stories/index.html",
  "dist/cases/index.html",
  "dist/characters/index.html",
  "dist/locations/index.html",
  "dist/objects/index.html",
  "dist/mysteries/index.html",
  "dist/timeline/index.html",
  "dist/search/index.html",
  "dist/about/index.html",
  "dist/content-notes/index.html",
  "dist/research-and-provenance/index.html",
];

const forbiddenMarkers = [
  ["publication boundary", /publication boundary/i],
  ["private production material", /private production material/i],
  ["publish edited public-facing entries", /publish edited public-facing entries/i],
  ["commit raw transcripts", /commit raw transcripts/i],
  ["private collaborators", /private collaborators/i],
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
  ["deploy preview", /deploy preview/i],
  ["repository-native", /repository-native/i],
  ["approved-source hash", /approved-source hash/i],
  ["release gate", /release gate/i],
];

const failures = [];

for (const relativePath of publicSurfaceFiles) {
  const absolutePath = path.join(root, relativePath);
  let html;

  try {
    html = await readFile(absolutePath, "utf8");
  } catch (error) {
    failures.push(`${relativePath}: could not read rendered public surface (${error.message})`);
    continue;
  }

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

console.log("Public-surface role-separation validation passed.");
