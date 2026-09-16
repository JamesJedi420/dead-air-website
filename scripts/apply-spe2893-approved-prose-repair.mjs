import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spe2893Manifest } from "./spe2893-approved-delta-manifest.mjs";

const root = process.cwd();

let repairCount = 0;
let storyCount = 0;

for (const [relativePath, record] of Object.entries(spe2893Manifest)) {
  const absolutePath = path.join(root, relativePath);
  let text = await readFile(absolutePath, "utf8");

  for (const repair of record.repairs) {
    const expected = repair.expected ?? 1;
    const occurrences = text.split(repair.before).length - 1;

    if (occurrences !== expected) {
      throw new Error(
        `${relativePath}: expected ${expected} SPE-2893 target(s) ${JSON.stringify(repair.before)}, found ${occurrences}.`,
      );
    }

    text = text.split(repair.before).join(repair.after);
    repairCount += occurrences;
  }

  await writeFile(absolutePath, text, "utf8");
  storyCount += 1;
}

console.log(
  `Applied ${repairCount} approved SPE-2893 publication-layer repairs across ${storyCount} story file(s).`,
);
