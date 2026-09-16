import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const synchronizations = {
  "src/content/stories/da-002-the-name-in-the-room.md": [
    {
      before: "revision: Final Approved Story v13",
      after: "revision: Final Approved Story v15",
    },
    {
      before: "He spoke reluctantly. His eyes moved toward the cabinet and away.",
      after: "His eyes moved toward the cabinet and away.",
    },
    {
      before: "Diane had prepared for an argument. Miriam agreed, so Diane had nothing to answer.",
      after: "Diane had prepared for an argument. Miriam agreed.",
    },
    {
      before: "She spoke without theatrical emphasis. Her tone was gentle. Evan had no easy reply.",
      after: "Her tone was gentle. Evan had no easy reply.",
    },
    {
      before: "She offered without challenging Diane.",
      after: "",
    },
    {
      before: "Miriam had made the distinction without prompting.",
      after: "",
    },
    {
      before: "Diane had asked for boundaries. Miriam had also named each way the group had built the story. The card trembled once between her fingers. She steadied it against her palm.",
      after: "The card trembled once between her fingers. She steadied it against her palm.",
    },
    {
      before: "“I want to record the correction first.”\n\nAbby had brought a spiral notebook",
      after: "“I want to record the correction first.”\n\nDiane looked at her.\n\nAbby had brought a spiral notebook",
    },
  ],
  "src/content/stories/da-003-the-recorder-kept-running.md": [
    {
      before: "revision: Final Approved Story v9",
      after: "revision: Final Approved Story v12",
    },
    {
      before: "Maren turned the camera on herself long enough to state the time, location, route division, reunion time, and the rule they had already broken by separating. Then she filmed Jonah repeating his route and conditions. She did not ask him to explain what he expected to prove. His proposal was already on the earlier recording. Arguing again would not undo the separation she had just authorized.",
      after: "Maren turned the camera on herself long enough to state the time, location, route division, reunion time, and the rule they had already broken by separating. Then she filmed Jonah repeating his route and conditions.",
    },
    {
      before: "The same timing had followed an ordinary statement. Maren could no longer treat the earlier sequence as unusual, even though she still felt the jolt of hearing the frog call before her mouth had fully closed.",
      after: "She still felt the jolt of hearing the frog call before her mouth had fully closed.",
    },
  ],
};

let synchronizationCount = 0;

for (const [relativePath, fileSynchronizations] of Object.entries(synchronizations)) {
  const absolutePath = path.join(root, relativePath);
  let text;
  try {
    text = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to read ${relativePath}: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }

  for (const synchronization of fileSynchronizations) {
    const expected = synchronization.expected ?? 1;
    const occurrences = text.split(synchronization.before).length - 1;
    if (occurrences !== expected) {
      throw new Error(
        `${relativePath}: expected ${expected} approved-manuscript synchronization target(s) ${JSON.stringify(synchronization.before)}, found ${occurrences}.`,
      );
    }
    text = text.split(synchronization.before).join(synchronization.after);
    synchronizationCount += occurrences;
  }

  try {
    await writeFile(absolutePath, text, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to write ${relativePath}: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }
}

console.log(
  `Applied ${synchronizationCount} bounded approved-manuscript synchronization changes across ${Object.keys(synchronizations).length} story file(s).`,
);
