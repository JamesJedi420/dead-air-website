import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

await import("./materialize-da001.mjs");

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const outputPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const legacySchoolToken = ["Bell", "weather"].join("");
const legacySchoolSlugToken = ["bell", "weather"].join("");
const v21ContrastiveProseReplacements = [
  [
    "“Continuous footage of us,” Diane said. “Not the lobby. Not the stairs. Not this room.”",
    "“Continuous footage of us,” Diane said. “The lobby, the stairs, and this room were outside the camera.”",
  ],
  [
    "Ron’s face hardened. “My account was an interview, not an invitation.”",
    "Ron’s face hardened. “I gave you an interview. I didn’t agree to be part of another test.”",
  ],
  ["“Images, not audio.”", "“They’re still images. There’s no audio.”"],
  [
    "Diane had apologized before asking for his help. Not for the sounds. For keeping the students below after his first refusal, for granting the booth test after he withdrew, and for treating his fear as another condition to record.",
    "Diane had apologized before asking for his help. She apologized for keeping the students below after his first refusal, for granting the booth test after he withdrew, and for treating his fear as another condition to record.",
  ],
];

let manuscript = await readFile(outputPath, "utf8");
manuscript = manuscript
  .replaceAll(legacySchoolToken, "Cedar Plain")
  .replaceAll(legacySchoolSlugToken, "cedar-plain");

for (const [before, after] of v21ContrastiveProseReplacements) {
  const occurrences = manuscript.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `Expected exactly one DA-001 v21 contrastive-prose target ${JSON.stringify(before)}, found ${occurrences}.`,
    );
  }
  manuscript = manuscript.replace(before, after);
}

const oldRevisionLine = 'revision: "Final Approved Story v20"';
const newRevisionLine = 'revision: "Final Approved Story v21"';
const revisionOccurrences = manuscript.split(oldRevisionLine).length - 1;
if (revisionOccurrences !== 1) {
  throw new Error(`Expected one DA-001 v20 revision marker before v21 correction, found ${revisionOccurrences}.`);
}
manuscript = manuscript.replace(oldRevisionLine, newRevisionLine);

await writeFile(outputPath, manuscript, "utf8");
console.log(
  "Applied REN-001 Cedar Plain school-identity migration and DA-001 Final Approved Story v21 contrastive-prose correction layer after frozen-source materialization.",
);
