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
  "src/content/stories/da-004-close-enough-to-recognize.md": [
    {
      before: "revision: Final Approved Story v1.7",
      after: "revision: Final Approved Story v1.10",
    },
    {
      before: "There it was—the question Eli had brought six hours and three bags of equipment to ask. He wanted Martin to say there was something in the room.",
      after: "",
    },
    {
      before: "Eli lowered the camera. An hour ago he would have taken Martin’s silence as victory. He had wanted exactly this: his father unable to dismiss something, unable to turn it into a loose hinge or a draft or a story somebody had told before they arrived.\nNow Martin looked less convinced than cornered.",
      after: "Eli lowered the camera. An hour ago he would have taken Martin’s silence as victory. \nNow Martin looked less convinced than cornered.",
    },
    {
      before: "No unexplained chair movement he had to solve. No chair dragging itself across carpet while the room sat empty. No reason to rewind the camera except to confirm a movement Martin had just admitted making.",
      after: "",
    },
    {
      before: "He had separated himself from Martin. He had not separated either of them from the conditions Martin had warned him about.",
      after: "",
    },
    {
      before: "The gesture looked different coming from him than it ever had in Eli’s memory. Martin stood in the hotel corridor and repeated the cadence in his ordinary voice. Eli watched his father wait for an answer after two hours of demanding a source, a mechanism, and proof before he would call any sound communication.",
      after: "The gesture looked different coming from him than it ever had in Eli’s memory.",
    },
    {
      before: "Some of the tension left Martin’s face.",
      after: "",
    },
    {
      before: "For the first time since the new sequence, something in Martin’s face eased when Eli placed the sound somewhere else.\n\nThe new impacts left them with the same problem they had already faced: both men had heard them, and neither could place them precisely.",
      after: "",
    },
    {
      before: "For most of the night, Eli had been the one trying to close that distance.\n\nHe had wanted Martin to move from I heard it to I believe you, from I can’t explain it to something Eli could carry home as confirmation.\n\nNow Martin was trying to move one step past the event himself.\n\nEli did not let him.",
      after: "",
    },
    {
      before: "Martin wanted the recordings.\n\nMartin wanted to listen again.\n\nMartin had followed the knocks out of the room, knocked the rhythm back, and now wanted the original files in his own possession.\n\nEli could have made all of that mean something larger.",
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
