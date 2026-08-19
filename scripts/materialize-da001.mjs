import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-001");
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const outputPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const approvedSourceSha256 = "175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba";
const correctedRevision = "Final Approved Story v20";
const v18CorrectiveReplacements = [
  ["Her shoes made two measured contacts with the concrete.", "Her shoes struck the concrete twice, evenly spaced."],
  ["Two contacts came from the other side, accompanied by the soft collision of keys.", "Two steps came from the other side, accompanied by the soft collision of keys."],
  ["“No,” Ron said. “The point of your project is whatever you put after my voice.”", "“No,” Ron said. “The point of your project is going to be however you frame my takes.”"],
  ["She said the word clearly enough that no edit was necessary.", "She said it clearly."],
  ["“A route can survive the worker. Labels, schedules, objects, habits. This school repeats thousands of people every day without containing any of them.”", "“We still run the same route. Same labels. Same times. Same rooms. That doesn’t mean Wayne is here.”"],
  ["“Context is the pattern between files.”", "“The files don’t mean much by themselves. The pattern is what they do together.”"],
  ["“Compression changes duration. This changes causality.”", "“Cutting time is one thing. Put those sounds together and it looks like one caused the next.”"],
  ["“I recognized something. Recognition establishes what happened inside me. It establishes nothing about what produced the sound.”", "“I recognized something. That tells you what I heard. It doesn’t tell you what made the sound.”"],
  ["“The story is uncertainty.”", "“Then leave it uncertain.”"],
];
const v19SpokenNaturalnessReplacements = [
  ["“You researched an employee,” she said. “That grants you no access to his life.”", "“You found his name online,” she said. “That doesn’t give you the right to dig through his life.”"],
  ["“Certainty belongs after inspection.”", "“Ask me after I inspect it.”"],
  ["“It produced sound. The cause comes after inspection.”", "“It made a sound. We inspect it before we decide why.”"],
  ["“Thinking and having it are separate.”", "“You think it was unlocked. That’s not the same as having it on camera.”"],
  ["“Something like that gives us no baseline.”", "“If you don’t know the count, we don’t have a baseline.”"],
  ["“I’m describing what the camera can support.”", "“I’m saying what the camera shows.”"],
  ["“Reliable observation. Known controls. Repeatable conditions. Complete access records. Original files. Independent review.”", "“Show me it twice under the same conditions. Show me who could get in. Keep the original files. Then I’ll tell you we have something worth arguing about.”"],
  ["“I’m closing the last argument.”", "“I’m trying to end this.”"],
  ["“That’s what every next test becomes.”", "“There’s always one more test.”"],
  ["Ron’s voice dropped. “My reaction belongs to me.”", "Ron’s voice dropped. “You don’t get to use how I feel as evidence.”"],
  ["“Markers record your attention, not the event’s identity.”", "“A marker tells me what you noticed. It doesn’t tell me what made the sound.”"],
  ["“That is a position in your project, not a device timestamp.”", "“That tells me where you put it in the project. It doesn’t tell me when the device made it.”"],
  ["“It resembles those words after you supplied them.”", "“I hear those words now because you told me what to listen for.”"],
  ["“Categories keep people from turning fear into instructions.”", "“Because once people get scared, they start treating every sound like an instruction.”"],
  ["“They are where explanations begin.”", "“No. They’re where you start looking.”"],
  ["She pointed toward the exit. “Now you know why expectation matters. Every sound from here forward arrives with a name attached. Every route looks intentional. Every key sounds like his.”", "She pointed toward the exit. “Now you know why I didn’t tell you. From here on, every key you hear is going to sound like his. Every hallway is going to look like his route.”"],
  ["“It is a conclusion with empty spaces.”", "“You already wrote the answer. You’re just filling in the blanks.”"],
  ["“I need to show you something before you erase the context.”", "“I need to show you something before you turn these into separate clips.”"],
  ["“Context remains in the original files.”", "“They are separate clips.”"],
  ["“That is interpretation.”", "“That’s what you think they do together.”"],
  ["Evan kept one hand on the trackpad. “Raw files do not explain themselves. By tomorrow, everyone in this room will remember a different night. I am trying to make one account that survives us.”", "Evan kept one hand on the trackpad. “Tomorrow Ron remembers one thing, Abby remembers another, and you tell me none of it belongs together. I’m trying to put down what happened before we all change it.”"],
  ["“One account is the problem,” Diane said.", "“You’re cutting four people into one answer,” Diane said."],
  ["“You have seen incidents. You have avoided their relationship.”", "“You keep looking at every piece by itself.”"],
  ["“The components happened,” Evan answered.", "“They all happened,” Evan answered."],
  ["“That matters to us, not to the source.”", "“That changes how we hear it. It doesn’t change the recording.”"],
  ["“You selected a question from one hour and placed it beside a sound from another.”", "“You took a question from one hour and put a sound from another right behind it.”"],
  ["“I hear what you trained me to hear.”", "“I hear it now because you kept telling me what to listen for.”"],
  ["Evan rotated the laptop toward her. “The question is simple. If the pattern is editing, the empty booth gives us room tone. If the pattern follows the route, the booth gives us the next event. Either result helps.”", "Evan rotated the laptop toward her. “If this is us doing it with edits, the booth gives us nothing. If it isn’t, maybe the booth gives us something. Ten minutes.”"],
  ["“I want to stop because Ron withdrew, Diane set an end point, and you keep treating every boundary as another dramatic obstacle.”", "“Ron said he was done. Diane said we were done. You keep hearing no and turning it into the next scene.”"],
  ["“That gives you no claim on him,” Diane said.", "“He told you to stop. You don’t get to use this to pull him back in,” Diane said."],
  ["“It gives the pattern another repetition.”", "“It happened again.”"],
  ["“It gives a tired man an experience in a mechanical building after you spent an hour telling him what the building was doing.”", "“It gives you a tired man who heard something after you spent an hour telling him what to listen for.”"],
  ["“It suggests your attention has narrowed around one destination.”", "“You wrote booth before you found the sound. Now everything points to booth.”"],
  ["“Let us rule out the booth,” he said.", "“Then let’s rule out the booth,” he said."],
  ["“Internal labels guide every cut after them,” Diane said.", "“Once you label it, you start cutting toward the label,” Diane said."],
  ["“They tell you what the material means before you compare it.”", "“You named it before you checked it against the other files.”"],
  ["“I agreed to review evidence and discuss a limited student documentary. I gave no agreement for this sentence.”", "“I agreed to review the files and talk about a limited student documentary. I never agreed to you saying this as fact.”"],
  ["“It is a conclusion wearing an opening’s clothes.”", "“You’re opening with the answer.”"],
  ["Diane kept her eyes on Evan. “Ambiguity protects everyone here from claims the material cannot support. It protects Wayne from becoming a character in your episode. It protects Ron from having fear turned into evidence. It protects Abby from having her continuous record replaced by a cleaner story. It protects you from saying more than you know.”", "Diane kept her eyes on Evan. “Wayne stays out of your episode unless you can prove it was him. Ron said stop. Abby’s raw track stays raw. And you don’t get to call a cleaner edit a truer one.”"],
  ["“This is responsibility.”", "“No. It means Ron gets to say no, and Wayne doesn’t get named because a file sounds close.”"],
  ["“It is the boundary you keep crossing.”", "“No. It’s the difference between what I heard and what you want to put in the narration.”"],
];
const v20DialogueRealismReplacements = [
  ["“Then its location changes again.”", "“Then we log where it turns up.”"],
  ["“Then the device produces another file.”", "“Then we have another file to check.”"],
  ["“This is a basement with uncontrolled routes, active radios, mechanical noise, and a group primed by a personal recording.”", "“We’re in a basement with open routes, active radios, mechanical noise, and four people who already heard a recording they think is personal.”"],
  ["“You placed that interpretation before the second pass.”", "“You told everybody what it said before you played it again.”"],
  ["“It means the software produced a clip from cached data,” Diane said. “We cannot establish when the sound entered the buffer, which input carried it, or whether your playback bled into the recording path.”", "“It means the software pulled a clip out of the cache,” Diane said. “We don’t know when that sound got there, which input caught it, or whether your own playback bled into it.”"],
  ["“It proves no sequence.”", "“It doesn’t prove the order.”"],
  ["“You already turned incomplete controls into certainty.”", "“You already took gaps in the first test and treated them like they settled something.”"],
  ["“That is an audio path requiring inspection.”", "“That tells me there’s an audio path we haven’t checked.”"],
  ["Diane pointed toward the main camera. “Your obstruction is documented. Move now.”", "Diane pointed toward the main camera. “The camera has you blocking me. Move.”"],
  ["“The conditions remain unchanged.”", "“We’re not changing the test.”"],
  ["“Silence continues until retrieval.”", "“Nobody talks until we get the camera back.”"],
  ["“The audio path has compromised the conditions.”", "“We don’t know where that audio came through. The test isn’t clean anymore.”"],
  ["“The maintenance panel remained bolted. The booth door seal remained intact. Exclusion always has defined limits.”", "“The maintenance panel was still bolted. The booth seal was still intact. We only ruled out the routes we checked.”"],
  ["“The camera reduces my balance and occupies one hand.”", "“I need both hands, and I’m not climbing with a camera throwing off my balance.”"],
  ["“You have compromised the access record and increased the load on this path.”", "“You just broke the access record, and you’re putting more weight on this path.”"],
  ["“Reachability and undocumented entry are separate facts.”", "“Knowing the booth can be reached this way isn’t the same as somebody coming through here without us recording it.”"],
  ["“I have no identification.”", "“I don’t know yet.”"],
  ["“It becomes controlled evidence.”", "“If I keep it, we know who has it.”"],
  ["Diane moved between him and the tripod. “Your entry is against instruction and enters the primary camera frame from an unrecorded edge.”", "Diane moved between him and the tripod. “I told you to stay outside. Now you’re coming into the main camera from a side it never recorded.”"],
  ["“Your camera lacks the synchronized clock and began after the test.”", "“Your camera isn’t synced, and you didn’t start it until after the test.”"],
  ["“The first explanation has a mechanism.”", "“The first one gives me something I can test.”"],
  ["“The second has a chair.”", "“And the other one has a chair in a locked room.”"],
  ["“You are making the story about uncertainty.”", "“You’re asking me to make the whole story about what we don’t know.”"],
];

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 12) {
  throw new Error(`Expected 12 DA-001 manuscript fragments, found ${sourceFiles.length}.`);
}

const sourceFragments = await Promise.all(
  sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")),
);
// The first GitHub Contents API write normalized two terminal newlines to one.
// Restore the approved split boundary before hashing and materialization.
sourceFragments[0] += "\n";
const approvedSource = sourceFragments.join("");

const actualSourceSha256 = sha256(approvedSource);
if (actualSourceSha256 !== approvedSourceSha256) {
  throw new Error(
    `DA-001 approved-source integrity check failed. Expected ${approvedSourceSha256}, received ${actualSourceSha256}.`,
  );
}

let body = approvedSource
  .replace(/^# \*\*﻿?The Building Keeps the Hour\*\*\r?\n+/u, "")
  .replace(/^## \*DA-001 — Final Approved Story v17\*\r?\n+/u, "");

const applyCorrectiveLayer = (label, replacements) => {
  for (const [before, after] of replacements) {
    const occurrences = body.split(before).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `Expected exactly one DA-001 ${label} corrective target ${JSON.stringify(before)}, found ${occurrences}.`,
      );
    }
    body = body.replace(before, after);
  }
};

// Preserve the frozen v17 repository import and apply only approved bounded
// corrective layers during materialization. Every target must occur exactly once.
applyCorrectiveLayer("v18", v18CorrectiveReplacements);
applyCorrectiveLayer("v19 spoken-naturalness", v19SpokenNaturalnessReplacements);
applyCorrectiveLayer("v20 dialogue-realism", v20DialogueRealismReplacements);

for (const section of manifest.sections) {
  const sourceHeading = `# **${section.source}**`;
  const publishedHeading = `## ${section.published}`;
  const occurrences = body.split(sourceHeading).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one DA-001 heading ${JSON.stringify(sourceHeading)}, found ${occurrences}.`);
  }
  body = body.replace(sourceHeading, publishedHeading);
}

if (/^#\s+\*\*Scene\s+\d+/im.test(body) || /^##\s+Scene\s+\d+/im.test(body)) {
  throw new Error("A production scene label remained in the materialized DA-001 publication output.");
}

const scalar = (value) => JSON.stringify(value);
const list = (key, values) => [`${key}:`, ...values.map((value) => `  - ${scalar(value)}`)].join("\n");
const relations = (key, values) =>
  values.length === 0
    ? `${key}: []`
    : [
        `${key}:`,
        ...values.flatMap((value) => [
          `  - collection: ${scalar(value.collection)}`,
          `    slug: ${scalar(value.slug)}`,
        ]),
      ].join("\n");

const metadata = manifest.preview.metadata;
const frontmatter = [
  "---",
  `slug: ${scalar(manifest.slug)}`,
  `title: ${scalar(manifest.title)}`,
  `summary: ${scalar(metadata.summary)}`,
  "status: active",
  `classification: ${scalar(metadata.classification)}`,
  `readingTime: ${scalar(metadata.readingTime)}`,
  `revision: ${scalar(correctedRevision)}`,
  `publicationDate: ${manifest.releaseState.publicationDate}`,
  `timelineOrder: ${manifest.chronology.timelineOrder}`,
  `timelineLabel: ${scalar(manifest.chronology.timelineLabel)}`,
  `sourceOrder: ${scalar(manifest.chronology.sourceOrder)}`,
  `datePrecision: ${scalar(manifest.chronology.datePrecision)}`,
  `chronologyNote: ${scalar(manifest.chronology.chronologyNote)}`,
  relations("follows", manifest.chronology.follows),
  relations("precedes", manifest.chronology.precedes),
  `canonicalStatus: ${scalar(metadata.canonicalStatus)}`,
  "draft: false",
  list("tags", metadata.tags),
  list("phenomenon", metadata.phenomenon),
  list("evidenceType", metadata.evidenceType),
  list("locations", metadata.locations),
  list("contentWarnings", metadata.contentWarnings),
  list("contentNotes", metadata.contentNotes),
  list("cases", metadata.cases),
  list("characters", metadata.characters),
  list("objects", metadata.objects),
  list("mysteries", metadata.mysteries),
  "---",
  "",
].join("\n");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
const materializedSha256 = sha256(`${frontmatter}${body}`);
console.log(
  `Materialized DA-001 ${correctedRevision} for release preparation (${materializedSha256}); frozen v17 repository source preserved (${actualSourceSha256}); bounded v18, v19, and v20 corrective layers applied; standard source note supplied by the shared story template; public divisions rendered as numbered section headings; narrative chronology fixed at archive position 1 before DA-002.`,
);
