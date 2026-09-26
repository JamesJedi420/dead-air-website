import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const storyPath = path.join(
  process.cwd(),
  "src",
  "content",
  "stories",
  "da-001-after-the-main-fan-stops.md",
);

let text = await readFile(storyPath, "utf8");

const replacements = [
  {
    label: "revision marker",
    before: 'revision: "Final Approved Story v23"',
    after: 'revision: "Final Approved Story v24"',
  },
  {
    label: "chair custody sentence",
    before: "Someone had moved the chair after inventory, so the figure required another check.",
    after: "The chair had changed location after inventory, so the figure required another check.",
  },
];

for (const { label, before, after } of replacements) {
  const occurrences = text.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `DA-001 v24 ${label}: expected exactly one approved publication target ${JSON.stringify(before)}, found ${occurrences}.`,
    );
  }
  text = text.replace(before, after);
}

await writeFile(storyPath, text, "utf8");
console.log("Applied bounded DA-001 Final Approved Story v24 publication synchronization.");
