import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const repairs = {
  "src/content/stories/da-001-after-the-main-fan-stops.md": [
    {
      before: "Laura’s mouth tightened at the leading shape of the sentence. “The corridor has been empty when I looked.”",
      after: "Laura said, “The corridor has been empty when I looked.”",
    },
    {
      before: "Diane looked at him for a moment.",
      after: "Diane looked at him.",
    },
    {
      before: "Evan said nothing.",
      after: "",
    },
    {
      before: "Neither spoke for a moment.",
      after: "",
    },
    {
      before: "Diane said nothing.",
      after: "",
    },
    {
      before: "He looked at her for several seconds before writing the time.",
      after: "He looked at her, then wrote the time.",
    },
  ],
  "src/content/stories/da-002-the-name-in-the-room.md": [
    {
      before: "Evan’s mouth tightened. “My mother talks about my work.”",
      after: "Evan said, “My mother talks about my work.”",
    },
    {
      before: "Evan’s mouth tightened. “You think her blanket caused it.”",
      after: "Evan said, “You think her blanket caused it.”",
    },
    {
      before: "Evan’s jaw tightened. He pointed into the opening.",
      after: "Evan pointed into the opening.",
    },
    {
      before: "Evan’s shoulders dropped slightly.",
      after: "",
    },
    {
      before: "Miriam closed her eyes for a moment.",
      after: "Miriam closed her eyes.",
    },
    {
      before: "Evan turned the camera toward Diane for a moment, then back to Miriam.",
      after: "Evan turned the camera toward Diane, then back to Miriam.",
    },
    {
      before: "No one spoke for several seconds.",
      after: "",
    },
    {
      before: "Miriam nodded once. “Then I will state the limit. I heard your name before the formal start. I cannot present it as private information.”",
      after: "Miriam nodded. “Then I will state the limit. I heard your name before the formal start. I cannot present it as private information.”",
    },
    {
      before: "Miriam nodded once.",
      after: "Miriam nodded.",
    },
    {
      before: "The assistant’s shoulders dropped a fraction.",
      after: "",
    },
    {
      before: "For several seconds, Diane heard only machinery:",
      after: "Diane heard only machinery:",
    },
    {
      before: "“I want to record the correction first.”\n\nDiane looked at her.",
      after: "“I want to record the correction first.”",
    },
    {
      before: "Diane looked at her. “What produced that interpretation?”",
      after: "Diane asked, “What produced that interpretation?”",
    },
    {
      before: "Diane looked at her. “For what?”",
      after: "“For what?” Diane asked.",
    },
  ],
  "src/content/stories/da-003-the-recorder-kept-running.md": [
    {
      before: "Jonah watched the lens for another second. His shoulders dropped, not far, but enough that she saw how tightly he had been bracing them.",
      after: "Jonah watched the lens. He stopped bracing his shoulders.",
    },
    {
      before: "Jonah followed her gaze. For several seconds he did not move.",
      after: "Jonah followed her gaze to the page.",
    },
    {
      before: "Jonah held it for a moment, then released it.",
      after: "Jonah held it, then released it.",
    },
    {
      before: "His mouth tightened. He faced the fireplace again.",
      after: "He faced the fireplace again.",
    },
    {
      before: "Maren waited.",
      after: "",
      expected: 6,
    },
    {
      before: "He stared at her for a moment, then walked through the open side.",
      after: "He stared at her, then walked through the open side.",
    },
    {
      before: "nodded once",
      after: "nodded",
      expected: 2,
    },
  ],
  "src/content/stories/da-004-close-enough-to-recognize.md": [
    {
      before: "For a moment he looked at Eli rather than the camera.",
      after: "He looked at Eli rather than the camera.",
    },
    {
      before: "Eli waited for the rest. Martin ran his thumb over the hinge screw again.",
      after: "Martin ran his thumb over the hinge screw again.",
    },
    {
      before: "Eli kept filming. Martin said nothing else, but when the group moved toward the stairwell he glanced once at Eli’s camera screen, where the guide’s last answer had been captured along with the running time code.",
      after: "Eli kept filming. When the group moved toward the stairwell, Martin glanced at Eli’s camera screen, where the guide’s last answer had been captured along with the running time code.",
    },
    {
      before: "At the word doors, Eli glanced at Martin. Martin was already looking at him. Neither said anything, and Eli kept filming.",
      after: "At the word doors, Eli found Martin already looking at him and kept filming.",
    },
    {
      before: "Martin glanced at Eli, but he did not comment on the answer.",
      after: "",
    },
    {
      before: "Martin nodded once. “Okay.”",
      after: "“Okay,” Martin said.",
    },
    {
      before: "Martin gave no sign that the answer had settled anything.",
      after: "",
    },
    {
      before: "Eli turned the camera toward himself for a moment.",
      after: "Eli turned the camera toward himself.",
    },
    {
      before: "Martin did not add anything.",
      after: "",
    },
    {
      before: "Eli lowered the camera a fraction.",
      after: "Eli lowered the camera.",
      expected: 2,
    },
    {
      before: "Martin looked at him for a moment.",
      after: "",
    },
    {
      before: "No one spoke for a while.",
      after: "",
    },
    {
      before: "The silence left him staring at the bathroom wall and the entrance door.",
      after: "",
    },
    {
      before: "His shoulders dropped perhaps half an inch. His jaw loosened.",
      after: "",
    },
    {
      before: "Eli noticed anyway.",
      after: "",
    },
    {
      before: "The man with the ice bucket walked past them, nodded once, and continued toward the machine.",
      after: "The man with the ice bucket walked past them and continued toward the machine.",
    },
    {
      before: "Martin’s mouth tightened. “Yes.”",
      after: "“Yes,” Martin said.",
    },
    {
      before: "Martin’s mouth tightened.",
      after: "",
    },
    {
      before: "Still nothing.",
      after: "",
    },
    {
      before: "Martin looked at him for several seconds.",
      after: "",
    },
    {
      before: "Martin’s mouth tightened slightly at the camera-facing voice, but he said nothing.",
      after: "",
    },
    {
      before: "A pipe clicked.\n\nThen nothing.\n\nHe waited.\n\nNo second impact followed. No third.",
      after: "A pipe clicked.\n\nNo second or third impact followed.",
    },
    {
      before: "He waited.\n\nThe candy did nothing.\n\nThirty seconds passed.\n\nThen another thirty.",
      after: "The candy remained still for a full minute.",
    },
    {
      before: "He walked several paces back the way he had come.\n\nWaited.\n\nIt eased a little.",
      after: "He walked several paces back the way he had come and waited until it eased a little.",
    },
    {
      before: "For several seconds he stared at his own hand.",
      after: "He stared at his own hand.",
    },
    {
      before: "He waited.\n\nNothing.\n\nHe held it the same way again.\n\nNothing.",
      after: "He held it the same way again. The candy stayed still.",
    },
    {
      before: "Eli waited for the rest.\n\nNothing followed.\n\nHe continued.",
      after: "No second impact followed. Eli continued.",
    },
    {
      before: "He stood without moving his feet.\n\nNothing.\n\nHe brought the camera up and pointed it toward the bend.\n\nTwenty seconds passed.\n\nThen something sounded again.",
      after: "He stood without moving his feet and brought the camera up toward the bend.\n\nTwenty seconds passed before something sounded again.",
    },
    {
      before: "He looked up and waited. Nothing followed, and after several seconds he let the sound go.",
      after: "He looked up. The sound did not repeat, and he let it go.",
    },
    {
      before: "A minute passed.\n\nThen another.\n\nNo Eli.",
      after: "Two minutes passed without Eli returning.",
    },
    {
      before: "He ended the call before voicemail and checked for a message.\n\nNothing.",
      after: "He ended the call before voicemail and checked for a message. There was none.",
    },
    {
      before: "Martin called again. Four rings.\n\nNothing.",
      after: "Martin called again. Four rings went unanswered.",
    },
    {
      before: "“Eli.”\n\nHis voice carried farther than he expected.\n\nNo response.",
      after: "“Eli.”\n\nHis voice carried farther than he expected.",
    },
    {
      before: "No answer to either call.\n\n“Eli?”\n\nNothing.\n\nMartin walked.",
      after: "His calls were still unanswered.\n\n“Eli?” Martin called once more, then walked.",
    },
    {
      before: "Eli held his eyes for a moment, then looked down the corridor.",
      after: "Eli broke eye contact and looked down the corridor.",
    },
    {
      before: "Martin waited for the rest.",
      after: "",
    },
    {
      before: "“Exactly?”\n\nMartin looked at him.\n\nEli waited.\n\n“No,” Martin said. “I didn’t time it.”",
      after: "“Exactly?”\n\n“No,” Martin said. “I didn’t time it.”",
    },
    {
      before: "Eli nodded once.",
      after: "Eli nodded.",
    },
    {
      before: "For several seconds neither of them spoke. The corridor continued around them as it had all night: low mechanical vibration through the wall, air through the ceiling vents, a faint plumbing sound somewhere farther along the floor.\n\nNothing else followed.",
      after: "They listened to the corridor’s low mechanical vibration, ceiling ventilation, and faint plumbing. The knocks did not repeat.",
    },
    {
      before: "Martin nodded once.",
      after: "Martin nodded.",
    },
    {
      before: "They waited.\n\nNothing repeated.",
      after: "The sound did not repeat.",
    },
    {
      before: "After several seconds he stepped back.",
      after: "He stepped back.",
    },
    {
      before: "They listened again.\n\nTen seconds.\n\nTwenty.\n\nNothing.",
      after: "They listened for twenty seconds. Nothing repeated.",
    },
    {
      before: "He waited.\n\nThen he knocked twice.",
      after: "After the pause, he knocked twice.",
    },
    {
      before: "No one answered.\n\nThey waited.\n\nA faint mechanical hum continued",
      after: "No one answered. A faint mechanical hum continued",
    },
    {
      before: "Martin said nothing.\n\nEli waited.\n\n“Another hall?” he said.",
      after: "Martin said nothing.\n\n“Another hall?” Eli said.",
    },
    {
      before: "Martin’s jaw tightened.",
      after: "",
      expected: 2,
    },
    {
      before: "Martin looked toward it for several seconds.",
      after: "Martin looked toward it.",
    },
    {
      before: "Eli waited.\n\nAt last Martin nodded.\n\n“Okay.”",
      after: "“Okay,” Martin said at last.",
    },
    {
      before: "For several seconds they listened to the fan in the room above the quiet laptop.",
      after: "They listened to the fan in the room above the quiet laptop.",
    },
    {
      before: "Eli waited.\n\nMartin rubbed his thumb against his forefinger.",
      after: "Martin rubbed his thumb against his forefinger.",
    },
    {
      before: "A moment later he nodded.\n\n“Got it.”",
      after: "“Got it,” he said a moment later.",
    },
  ],
};

let repairCount = 0;

for (const [relativePath, fileRepairs] of Object.entries(repairs)) {
  const absolutePath = path.join(root, relativePath);
  let text = await readFile(absolutePath, "utf8");

  for (const repair of fileRepairs) {
    const expected = repair.expected ?? 1;
    const occurrences = text.split(repair.before).length - 1;
    if (occurrences !== expected) {
      throw new Error(
        `${relativePath}: expected ${expected} house-cadence target(s) ${JSON.stringify(repair.before)}, found ${occurrences}.`,
      );
    }
    text = text.split(repair.before).join(repair.after);
    repairCount += occurrences;
  }

  await writeFile(absolutePath, text, "utf8");
}

console.log(`Applied ${repairCount} bounded house-cadence prose repairs across ${Object.keys(repairs).length} published stories.`);
