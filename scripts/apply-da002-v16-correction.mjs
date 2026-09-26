import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const storyPath = path.join(
  process.cwd(),
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);

const corrections = [
  {
    before: "revision: Final Approved Story v15",
    after: "revision: Final Approved Story v16",
  },
  {
    before: "You set the end point. Then you honor it.",
    after: "",
  },
  {
    before: "Diane held the facilities recorder close enough to capture the spoken time without turning the act into ceremony.",
    after: "Diane held the facilities recorder close enough to capture the spoken time.",
  },
];

const preSatisfied = [
  {
    absent: "Ron stated the fact without accusation.",
    reason: "Already removed by the approved SPE-2893 publication layer before the v16 correction runs.",
  },
  {
    absent: "Her tone was gentle. Evan had no easy reply.",
    reason: "Already narrowed to ‘Her tone was gentle.’ by the approved SPE-2893 publication layer before the v16 correction runs.",
  },
];

let manuscript = await readFile(storyPath, "utf8");

for (const condition of preSatisfied) {
  if (manuscript.includes(condition.absent)) {
    throw new Error(
      `DA-002 v16 pre-satisfied condition failed; stale text remains ${JSON.stringify(condition.absent)}. ${condition.reason}`,
    );
  }
}

let correctionCount = 0;
for (const correction of corrections) {
  const occurrences = manuscript.split(correction.before).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `DA-002 v16 correction preflight expected exactly one target ${JSON.stringify(correction.before)}, found ${occurrences}.`,
    );
  }
  manuscript = manuscript.replace(correction.before, correction.after);
  correctionCount += 1;
}

await writeFile(storyPath, manuscript, "utf8");
console.log(
  `Applied DA-002 Final Approved Story v16 correction layer: ${correctionCount - 1} remaining prose corrections plus version synchronization; ${preSatisfied.length} approved v16 prose corrections were already satisfied by the existing publication layer.`,
);
