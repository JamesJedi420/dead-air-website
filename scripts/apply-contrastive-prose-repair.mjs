import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const repairs = {
  "src/content/stories/da-001-after-the-main-fan-stops.md": [
    [
      "“Continuous footage of us,” Diane said. “Not the lobby. Not the stairs. Not this room.”",
      "“Continuous footage of us,” Diane said. “The lobby, the stairs, and this room are all outside the frame.”",
    ],
    [
      "Ron’s face hardened. “My account was an interview, not an invitation.”",
      "Ron’s face hardened. “I gave you an interview. Leave it there.”",
    ],
    [
      "Diane’s answer was not a promise.\n\nRon heard the difference.",
      "Ron heard the limit in Diane’s answer.",
    ],
  ],
  "src/content/stories/da-002-the-name-in-the-room.md": [
    [
      "Ron answered before she could. “A cleansing is not an investigation.”\n\n“That’s why we’re recording it.”",
      "Ron answered before she could. “You came here to do a cleansing. Stop calling it an investigation.”\n\n“That’s why we’re recording it.”",
    ],
    [
      "“I already have my phone out.”\n\n“That is not a control.”\n\n“It is a camera.”",
      "“I already have my phone out.”\n\n“A phone camera doesn’t give us a control.”\n\n“It gives us a second angle.”",
    ],
    [
      "“A taunter.”\n\n“That is a useful word for the behavior. It is not a name.”",
      "“A taunter.”\n\n“Use that for the behavior if it helps. We still don’t have a name.”",
    ],
    [
      "“A woman. Older. She associates herself with performance, but not with the students in the way the young person downstairs seemed to.”",
      "“A woman. Older. She associates herself with performance. Her connection to the students feels different from the young person downstairs.”",
    ],
  ],
  "src/content/stories/da-003-the-recorder-kept-running.md": [
    [
      "Then not a scream. A long call with a break in the middle.",
      "Then he described a long call with a break in the middle.",
    ],
    [
      "She lowered the camera but did not stop recording. “What happened to your hand?”",
      "She lowered the camera with the recording still running. “What happened to your hand?”",
    ],
    [
      "“I was angry before I was scared. You asked whether we should keep going, and I wanted you to stop talking. Not because you were wrong.” He looked down at the notebook. “Because if you said we should leave, I knew I’d leave.”",
      "“I was angry before I was scared. You asked whether we should keep going, and I wanted you to stop talking.” He looked down at the notebook. “I knew I’d leave if you said we should.”",
    ],
    [
      "He touched the loose edge of his bandage but did not lift it.",
      "His fingers rested on the loose edge of the bandage, leaving it in place.",
    ],
    [
      "The pressure in the ear shifted but did not clear.",
      "The pressure in her ear shifted and remained.",
    ],
    [
      "The generator faded. Its vibration no longer entered the ground, and the ringing in Maren’s right ear became more noticeable in the quieter air. She swallowed twice. The pressure shifted but did not clear completely.",
      "The generator faded. Its vibration no longer entered the ground, and the ringing in Maren’s right ear became more noticeable in the quieter air. She swallowed twice. The pressure shifted, then lingered.",
    ],
    [
      "Their lights reached the next curve but not the ground beyond it.",
      "Their lights reached the next curve; the ground beyond remained dark.",
    ],
    [
      "His route continued toward the dark line of the closed staff path but did not reach it.",
      "His route ended short of the dark line of the closed staff path.",
    ],
    [
      "She loosened her grip but did not release him.",
      "She loosened her grip and kept hold of him.",
    ],
    [
      "Maren kept the camera light ahead but did not restart the recording.",
      "Maren kept the camera light ahead and left the recording off.",
    ],
    [
      "He lowered the recorder but did not stop it.",
      "He lowered the recorder and left it running.",
    ],
    [
      "By early afternoon, the night had become smaller on paper.\n\nNot harmless. Not explained. Smaller.\n\nMaren had six entries left in the unresolved column.",
      "By early afternoon, Maren had reduced the night to six entries in the unresolved column. The list gave each one a boundary without explaining it.",
    ],
    [
      "Not the enhanced copy. Not a filtered export. Just the raw duplicate she had transferred that morning.",
      "She opened the raw duplicate she had transferred that morning.",
    ],
  ],
  "src/content/stories/da-004-close-enough-to-recognize.md": [
    [
      "“Not equipment.” Eli rested one hand on the dresser beside the camera. “One thing that happens while we’re both there. Same time, same place. Something you can’t explain away tomorrow.”",
      "Eli rested one hand on the dresser beside the camera. “I mean one thing that happens while we’re both there. Same time, same place. Something you can’t explain away tomorrow.”",
    ],
    [
      "The guide walked two steps closer but did not enter.",
      "The guide walked two steps closer and stopped at the threshold.",
    ],
    [
      "“Cold. Not cold exactly.” Eli dragged two fingers from his wrist toward his elbow. “Like electricity under the skin.”",
      "“Cold.” Eli dragged two fingers from his wrist toward his elbow. “More like electricity under the skin.”",
    ],
    [
      "The air felt cooler away from the vent, but not sharply so.",
      "The air away from the vent felt only slightly cooler.",
    ],
    [
      "He knew the rhythm.\n\nNot from any of the hotel stories.\n\nFrom the old ghost story.\n\nOne, then two.\n\nHe had told it to Eli when Eli was a child.",
      "He knew the rhythm from the old ghost story he had told Eli when Eli was a child.\n\nOne, then two.",
    ],
    [
      "There it was—the question Eli had brought six hours and three bags of equipment to ask. Not what made the sound. Not where it came from. Something.",
      "There it was—the question Eli had brought six hours and three bags of equipment to ask. He wanted Martin to say there was something in the room.",
    ],
    [
      "Eli lowered it but did not turn it off.",
      "Eli lowered it and left the camera running.",
    ],
    [
      "It was not dramatic. His shoulders dropped perhaps half an inch. His jaw loosened.",
      "His shoulders dropped perhaps half an inch. His jaw loosened.",
    ],
    [
      "Eli picked up the camera but did not unplug it.",
      "Eli picked up the camera, leaving the charger connected.",
    ],
    [
      "“Not because you thought we might find something.”",
      "“You thought we might find something too?”",
    ],
    [
      "“Not after the source hunt. Before it.”",
      "“You were scared in the room, before the source hunt.”",
    ],
    [
      "He heard the old story as memory, not words: the part he had carried longest, the small pause that made the second pair feel deliberate.",
      "The old story returned as a remembered cadence: the part he had carried longest, the small pause that made the second pair feel deliberate.",
    ],
    [
      "“Nobody told me that rhythm,” Martin said. “I didn’t read it somewhere. It wasn’t a family story. I made up the knocks.”",
      "“Nobody told me that rhythm,” Martin said. “I made it up. The knocks were mine.”",
    ],
    [
      "Not loud.\n\nNot sharp enough to place.\n\nTwo distinct impacts with a small space between them.",
      "Two distinct impacts came with a small space between them, too soft and blunt to place precisely.",
    ],
    [
      "He raised the camera but did not speak.",
      "He raised the camera and stayed silent.",
    ],
    [
      "Not fast, but he did not stop at the first guest-room door.",
      "He walked at a measured pace and passed the first guest-room door without stopping.",
    ],
    [
      "“I opened the door. Nobody there. I thought it was you.”\n\n“It wasn’t.”\n\n“I called you.”",
      "“I opened the door. Nobody there. I thought it was you.”\n\n“I was over here.”\n\n“I called you.”",
    ],
    [
      "“You get yours?”\n\n“Not the knocks.”\n\n“The voices.”\n\n“Some of it, maybe. I don’t know what the mic picked up.”",
      "“You get yours?”\n\n“Some of the voices, maybe. I don’t know what the mic picked up.”",
    ],
    [
      "It was not a question.",
      "Eli said it flatly.",
    ],
    [
      "That made the moment stronger.\n\nIt did not make the location cleaner.",
      "Both of them had heard it from the same side. The locked door still gave them no source.",
    ],
    [
      "Eli watched him place two fingers against the painted surface.\n\nNot his ear.\n\nHis knuckles.",
      "Eli watched him raise his knuckles to the painted surface.",
    ],
    [
      "The gesture looked different coming from him than it ever had in Eli’s memory. There was no ghost story attached to it now. No voice lowered for a child. No performance.\n\nJust Martin standing in a hotel corridor after two hours of insisting that a pattern was not a source, a resemblance was not a cause, and hearing something did not make it communication.",
      "The gesture looked different coming from him than it ever had in Eli’s memory. Martin stood in the hotel corridor and repeated the cadence in his ordinary voice. Eli watched his father wait for an answer after two hours of demanding a source, a mechanism, and proof before he would call any sound communication.",
    ],
    [
      "There it was.\n\nNot relief exactly.\n\nSomething close enough.",
      "Some of the tension left Martin’s face.",
    ],
    [
      "Martin had called out, not Eli.",
      "This time Martin had called out.",
    ],
    [
      "For the first time since the new sequence, something in his face eased.\n\nNot because the event had become ordinary.\n\nBecause they disagreed.",
      "For the first time since the new sequence, something in Martin’s face eased when Eli placed the sound somewhere else.",
    ],
  ],
};

let repairCount = 0;

for (const [relativePath, replacements] of Object.entries(repairs)) {
  const absolutePath = path.join(root, relativePath);
  let text = await readFile(absolutePath, "utf8");

  for (const [before, after] of replacements) {
    const occurrences = text.split(before).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `${relativePath}: expected exactly one contrastive-prose repair target ${JSON.stringify(before)}, found ${occurrences}.`,
      );
    }
    text = text.replace(before, after);
    repairCount += 1;
  }

  await writeFile(absolutePath, text, "utf8");
}

const forbiddenCurrentPhrases = [
  "Not from any of the hotel stories.",
  "Not because the event had become ordinary.",
  "Not the enhanced copy. Not a filtered export. Just the raw duplicate",
  "Not harmless. Not explained. Smaller.",
];

for (const relativePath of Object.keys(repairs)) {
  const text = await readFile(path.join(root, relativePath), "utf8");
  for (const phrase of forbiddenCurrentPhrases) {
    if (text.includes(phrase)) {
      throw new Error(`${relativePath}: repaired publication still contains ${JSON.stringify(phrase)}.`);
    }
  }
}

console.log(`Applied ${repairCount} bounded contrastive-prose repairs across ${Object.keys(repairs).length} published stories.`);
