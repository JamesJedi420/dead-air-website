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
  "src/content/stories/da-001-after-the-main-fan-stops.md": [
    {
      before: "revision: \"Final Approved Story v20\"",
      after: "revision: \"Final Approved Story v22\"",
    },
    {
      before: "That made her useful to every version of the evening and loyal to none of them.",
      after: "",
    },
    {
      before: "“Continuous footage of us,” Diane said. “The lobby, the stairs, and this room are all outside the frame.”",
      after: "“Continuous footage of us,” Diane said. “Not the lobby. Not the stairs. Not this room.”",
    },
    {
      before: "He disliked the distinction because he understood it.",
      after: "",
    },
    {
      before: "Ron’s face hardened. “I gave you an interview. Leave it there.”",
      after: "Ron’s face hardened. “My account was an interview, not an invitation.”",
    },
    {
      before: "He had already imagined the opposite.",
      after: "",
    },
    {
      before: "Abby used her name carefully, as if speaking it did not grant access to the room Diane kept separate.",
      after: "",
    },
    {
      before: "Diane heard him connect her to the line under the door before he said a word.",
      after: "",
    },
    {
      before: "Ron heard the limit in Diane’s answer.",
      after: "Diane’s answer was not a promise.\n\nRon heard the difference.",
    },
    {
      before: "The sentence did not settle whether she owed him trust. It only told him where to stand.",
      after: "",
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
