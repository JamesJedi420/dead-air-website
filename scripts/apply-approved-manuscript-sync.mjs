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
      after: "revision: \"Final Approved Story v23\"",
    },
    {
      before: "“Continuous footage of us,” Diane said. “The lobby, the stairs, and this room are all outside the frame.”",
      after: "“Continuous footage of us,” Diane said. “Not the lobby. Not the stairs. Not this room.”",
    },
    {
      before: "Ron’s face hardened. “I gave you an interview. Leave it there.”",
      after: "Ron’s face hardened. “My account was an interview, not an invitation.”",
    },
    {
      before: "Ron heard the limit in Diane’s answer.",
      after: "Diane’s answer was not a promise.\n\nRon heard the difference.",
    },
    {
      before: "He treated her warning as material.",
      after: "",
    },
    {
      before: "Diane marked the comment without looking at Abby. Abby had named the years of repetition instead of the mystery.",
      after: "Diane marked the comment without looking at Abby.",
    },
    {
      before: "The sentence stated the conflict plainly. Diane watched Evan absorb it as rebuke and usable audio.",
      after: "",
    },
    {
      before: "Diane looked from one face to the next. Evan had supplied the phrase, and the others had repeated it until his interpretation resembled shared observation.",
      after: "Diane looked from one face to the next.",
    },
    {
      before: "Placed after his question, the filtered corridor noise functioned as an answer.",
      after: "",
    },
    {
      before: "In that form, Evan’s edit imposed timing, intention, and an almost playful cruelty. It removed the separate locations and shortened the hours between sources. Evan’s questions now appeared deliberate, and the sounds followed them as though recorded in response.",
      after: "It removed the separate locations and shortened the hours between sources.",
    },
    {
      before: "Diane watched the timeline. Each cut imposed rhythm on uncertain material. Evan had shortened gaps, lowered noise, and placed the piano note between phrases like punctuation. By putting Wayne’s incomplete file after a spoken name, he made it function as a response.",
      after: "Diane watched the timeline. Evan had shortened gaps, lowered noise, and placed the piano note between phrases like punctuation.",
    },
    {
      before: "“No,” she said, though the word addressed herself as much as Evan.",
      after: "“No,” she said.",
    },
    {
      before: "Their order made the two phrases sound like an exchange.",
      after: "",
    },
    {
      before: "Her agreement left him no reason to claim triumph. Diane had begun by insisting that incomplete coverage remained incomplete. The same principle now admitted an ordinary path into the room.",
      after: "",
    },
    {
      before: "Diane held still. No voice, cold breath, or light change accompanied the mechanical transfer of force through worn metal, the withdrawal of a bolt, and the faint release of paint along the door’s edge. The key fit the lock. That fact required no interpretation.",
      after: "Diane held still. No voice, cold breath, or light change accompanied the mechanical transfer of force through worn metal, the withdrawal of a bolt, and the faint release of paint along the door’s edge. The key fit the lock.",
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
const synchronizationMismatches = [];

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
      synchronizationMismatches.push(
        `${relativePath}: expected ${expected} approved-manuscript synchronization target(s) ${JSON.stringify(synchronization.before)}, found ${occurrences}.`,
      );
      continue;
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

if (synchronizationMismatches.length > 0) {
  throw new Error(
    `Approved-manuscript synchronization preflight found ${synchronizationMismatches.length} mismatch(es):\n${synchronizationMismatches.join("\n")}`,
  );
}

console.log(
  `Applied ${synchronizationCount} bounded approved-manuscript synchronization changes across ${Object.keys(synchronizations).length} story file(s).`,
);
