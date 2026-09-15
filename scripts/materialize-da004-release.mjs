import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-004");
const sourceLockPath = path.join(sourceDirectory, "source-lock.json");
const outputPath = path.join(root, "src", "content", "stories", "da-004-close-enough-to-recognize.md");

const sourceLock = JSON.parse(await readFile(sourceLockPath, "utf8"));
const sourceGoogleDocId = "1RB0F4ShpEv9ewV9gXDkm4woHfaCGLDz9TV0xNYqHF38";
const sourceGoogleDocRevisionId = "ANLCKQmfEqSBabL5tpiv0nQaM2sOUc4pCvWufpRpil4o45XUd59NmY1AD0ygCNIJbGMBy7uY4D2DkJq312R2RMV5Nc3vWVs3n1ve8LOF3m4";
const frozenSourceRevision = "Final Approved Story v1.7";
const correctedRevision = "Final Approved Story v1.8";
const publicationDate = "2026-09-14";
const approvedWebsiteCardSubtitle = "Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const approvedAlt = "A small field recorder rests on a bench beside an empty, warmly lit hotel corridor leading to a closed STAFF ONLY door.";
const openingFingerprint = "By the time Eli turned the camera on, rain had sheeted across the Kestrel’s front drive hard enough to turn the headlights of arriving cars into white smears on the pavement.";
const closingFingerprint = "Neither of them named what had made the rhythm.";
const expectedSceneTitles = ["Arrival","Public Ghosts","Employee Passage","One, Then Two","Source Hunt","The Chair / The Lie","Control Test","Martin Follows","The New Sequence","Raw Audio"];

const v18ContrastiveProseReplacements = [
  ["The guide walked two steps closer but did not enter.", "The guide walked two steps closer and stayed in the corridor."],
  ["Martin glanced at Eli, but he did not comment on the answer.", "Martin glanced at Eli without commenting on the answer."],
  ["He did not look impatient. He looked at the switch, then the fixture, then the ceiling vent.", "Martin studied the switch, then the fixture, then the ceiling vent."],
  ["The air felt cooler away from the vent, but not sharply so.", "The air away from the vent felt only slightly cooler."],
  ["Not from any of the hotel stories.\n\nFrom the old ghost story.", "Martin knew the rhythm from the old ghost story."],
  [
    "There it was—the question Eli had brought six hours and three bags of equipment to ask. Not what made the sound. Not where it came from. Something.",
    "There it was—the question Eli had brought six hours and three bags of equipment to ask: whether the sound meant something was in the room.",
  ],
  ["He did not touch it. He looked at the number, then back toward their room as if the distance between them mattered.", "He stopped short of the door and looked at the number, then back toward their room as if the distance between them mattered."],
  ["He did not try again.\n\nHe looked along the wall instead,", "He let the attempt go and looked along the wall instead,"],
  ["It was not dramatic. His shoulders dropped perhaps half an inch. His jaw loosened.", "His shoulders dropped perhaps half an inch. His jaw loosened."],
  ["Eli lowered it but did not turn it off.", "Eli lowered it and kept it running."],
  ["Martin did not enter. He listened to the doors open,", "Martin stayed outside the elevator and listened to the doors open,"],
  ["Eli did not move farther into the room.", "Eli stopped at the threshold."],
  ["He did not touch the camera.\n\nHe crossed to the bed", "He left the camera on the dresser and crossed to the bed"],
  ["Eli picked up the camera but did not unplug it.", "Eli picked up the camera, leaving the cable connected."],
  ["“Not the same,” Eli said.", "“Different,” Eli said."],
  ["“Not after the source hunt. Before it.”", "“Before the source hunt.”"],
  [
    "He heard the old story as memory, not words: the part he had carried longest, the small pause that made the second pair feel deliberate.",
    "The part of the old story he remembered most clearly was the small pause that made the second pair feel deliberate.",
  ],
  ["Not loud.\n\nNot sharp enough to place.\n\nTwo distinct impacts with a small space between them.", "Two faint, distinct impacts came with a small space between them, too diffuse to place."],
  ["Martin did not try to stop him.", "Martin let him go."],
  ["The nausea did not vanish.\n\nHe walked several paces back the way he had come.", "The nausea stayed with him as he walked several paces back the way he had come."],
  ["Not a knock.\n\nNot plumbing, at least not in the way the plumbing had sounded anywhere else that night.\n\nA thin human register reached him from farther down the corridor—more than one tone overlapping, or one voice changing pitch.", "A thin human register reached him from farther down the corridor—more than one tone overlapping, or one voice changing pitch. It sounded unlike the knocks or plumbing he had heard earlier."],
  ["Eli did not say it.\n\nHe moved toward the bend.", "Eli kept the thought to himself and moved toward the bend."],
  ["He raised the camera but did not speak.", "He raised the camera in silence."],
  ["The sound was not loud. It had the compact quality of something striking a hard surface beyond the wall or door.", "The sound was faint and compact, like something striking a hard surface beyond the wall or door."],
  ["He did not move toward the door at first. He listened for Eli’s voice, footsteps, the camera strap against a wall—anything human and immediate.", "He stayed where he was and listened for Eli’s voice, footsteps, the camera strap against a wall—anything human and immediate."],
  [
    "He could not place them at the door. He could not prove Eli had made them. He could not tell whether the intervals had been exact or merely close enough for recognition.",
    "The apparent source remained somewhere on the hall side of the room. He had no proof that Eli made the knocks, and memory alone could not establish whether the intervals were exact or merely close enough for recognition.",
  ],
  ["Not fast, but he did not stop at the first guest-room door.", "He walked slowly past the first guest-room door."],
  [
    "That made the moment stronger.\n\nIt did not make the location cleaner.",
    "That made the moment stronger. The source remained just as hard to place.",
  ],
  [
    "The camera microphone would get the impacts if they were loud enough. It would not preserve what the corridor had sounded like around them or how sharply the last two knocks had seemed to sit against everything else.",
    "The camera microphone could capture impacts loud enough to reach it. The recording would flatten the corridor’s acoustic context and the apparent sharpness of the last two knocks.",
  ],
  [
    "They had reached the same problem that had stopped them earlier. The hotel did not belong to them. A staff door was not permission to enter because something interesting had happened behind it.",
    "They had reached the same problem that had stopped them earlier. They were guests in someone else’s building. The closed staff door marked a boundary they had no right to cross simply because something interesting had happened behind it.",
  ],
  ["Eli watched him place two fingers against the painted surface.\n\nNot his ear.\n\nHis knuckles.", "Eli watched Martin bring his hand up to the painted surface, knuckles first."],
  [
    "The gesture looked different coming from him than it ever had in Eli’s memory. There was no ghost story attached to it now. No voice lowered for a child. No performance.\n\nJust Martin standing in a hotel corridor after two hours of insisting that a pattern was not a source, a resemblance was not a cause, and hearing something did not make it communication.",
    "The gesture looked different coming from him than it ever had in Eli’s memory. Martin stood in a hotel corridor after two hours spent separating pattern from source, resemblance from cause, and hearing from communication.",
  ],
  ["There it was.\n\nNot relief exactly.\n\nSomething close enough.", "Martin’s face eased with something close to relief."],
  ["Martin had called out, not Eli.", "Martin was the one who had called out."],
  [
    "For the first time since the new sequence, something in his face eased.\n\nNot because the event had become ordinary.\n\nBecause they disagreed.",
    "For the first time since the new sequence, something in his face eased. Eli had heard a different direction.",
  ],
  ["He did not write explained.", "He left the word explained out of his notes."],
  ["Eli added, “But I’m not putting it in a clip like it came out of nowhere either.”", "Eli added, “If I use it, the clip keeps the surrounding sound.”"],
  [
    "On the laptop, the sounds were dull. That was the first thing Eli noticed. Not quiet or hidden. Dull. Three short impacts with none of the shape the room had seemed to give them at the time.",
    "On the laptop, the sounds were dull. That was the first thing Eli noticed. Three short impacts carried none of the shape the room had seemed to give them at the time.",
  ],
  [
    "The laptop gave them no useful distance. No convincing wall. No bathroom side. No sense that the final two had come from somewhere different than the first.\n\nJust impacts captured from one recording position.",
    "The laptop reduced the sequence to three impacts from one recording position. Distance, wall position, and any shift between the first and second pair were indeterminate.",
  ],
  [
    "The peaks gave him intervals in the recording. They could not tell him how either man had grouped the sounds before recognizing the pattern.\n\nThe recording could tell him when the impacts reached the microphone. It could not tell him what surface made them, how far away that surface had been, or whether the apparent spacing had carried the same shape before two tired people recognized it.",
    "The peaks fixed the intervals captured by the microphone. Surface, distance, and each man’s pre-recognition grouping remained outside the file.",
  ],
  ["The post-confession recurrence was not there.\n\nThey both knew why.", "They had no recording of the post-confession recurrence. They both knew why."],
  [
    "There was only their memory of sitting in the room after Martin said the rhythm had come from nowhere but him, and then hearing it.",
    "There was only their memory of sitting in the room after Martin admitted he had invented the rhythm himself, and then hearing it.",
  ],
  [
    "The words were available too.\n\nIf he wanted them.\n\nHe did not say them.",
    "Candidate words came to him from the tour stories, and he kept them out of the notes.",
  ],
  ["He did not open an audio filter.\n\nHe did not type a candidate phrase into the notes.", "He left the audio unfiltered and the candidate-phrase field blank."],
  [
    "Nothing about it sounded as far behind them as Eli remembered.\n\nNothing about it sounded clearly left.\n\nNothing placed it near the guest hall.\n\nThe microphone had captured an impact.\n\nThat was all.",
    "The laptop gave the impact no reliable direction. The distance and leftward placement Eli remembered were absent from the file; the microphone had captured only the impact itself.",
  ],
  ["Eli did not stop the playback.\n\nTheir recorded voices came next.", "Eli let the playback continue into their recorded voices."],
  ["He did not say answer.\n\nHe did not say ghost.", "He avoided the words answer and ghost."],
  ["“Not the export?”\n\n“The originals.”", "“You’re sending the originals?”\n\n“The originals.”"],
  ["No challenge.\n\nNo correction.", "Martin let the answer stand."],
  ["The distant voice-like recording still did not contain words he could defend.", "The distant voice-like recording remained unintelligible."],
  ["The file preserved the impacts.\n\nIt did not preserve an explanation.", "The file preserved the impacts without explaining them."],
];

const assets = {
  coverImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789455274/dead-air/da-004/publication/da004_art001_v2_3_16x9_1600x900.webp",
  keyArtImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789455282/dead-air/da-004/publication/da004_art001_v2_3_2x3_1024x1536.webp",
  cardImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370665/dead-air/da-004/publication/da004_art001_v2_1_3x2_1536x1024.webp",
  squareImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370677/dead-air/da-004/publication/da004_art001_v2_1_1x1_1254x1254.webp",
  ogImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370687/dead-air/da-004/publication/da004_art001_v2_1_og_1200x630.webp",
  socialImage: "https://res.cloudinary.com/szvtq9d8/image/upload/v1789370700/dead-air/da-004/publication/da004_art001_v2_1_4x5_1080x1350.webp",
};

for (const [field, actual, expected] of [
  ["case", sourceLock.case, "DA-004"],
  ["title", sourceLock.title, "Close Enough to Recognize"],
  ["approvedRevision", sourceLock.approvedRevision, frozenSourceRevision],
  ["authoritativeGoogleDocId", sourceLock.authoritativeGoogleDocId, sourceGoogleDocId],
  ["authoritativeGoogleDocRevisionId", sourceLock.authoritativeGoogleDocRevisionId, sourceGoogleDocRevisionId],
  ["fragmentCount", sourceLock.fragmentCount, 10],
  ["lockStatus", sourceLock.lockStatus, "IMMUTABLE_APPROVED_SOURCE"],
  ["publicationDate", sourceLock.publicationDate, publicationDate],
]) {
  if (actual !== expected) throw new Error(`DA-004 source lock ${field} mismatch: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
}
if (sourceLock.publicReleaseAuthorized !== true) throw new Error("DA-004 publicReleaseAuthorized must be true after explicit publication authorization.");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const normalizeParagraphs = (value) => value.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").split(/\n+/).map((line)=>line.trimEnd()).filter(Boolean).join("\n\n").trimEnd()+"\n";
const sourceFiles = (await readdir(sourceDirectory)).filter((name)=>/^part-\d{2}\.mdfrag$/.test(name)).sort();
if (sourceFiles.length !== 10) throw new Error(`Expected 10 DA-004 manuscript fragments, found ${sourceFiles.length}.`);
const imported = (await Promise.all(sourceFiles.map((name)=>readFile(path.join(sourceDirectory,name),"utf8")))).join("\n");
const normalized = normalizeParagraphs(imported);
const headingPattern = /^DA-004 — Scene (\d{2}) — (.+?) — (?:Approved Draft|Draft) v[0-9.]+$/gm;
const headings = [...normalized.matchAll(headingPattern)];
if (headings.length !== 10) throw new Error(`Expected 10 DA-004 source headings, found ${headings.length}.`);
for (let i=0;i<headings.length;i+=1) {
  const [,number,title]=headings[i];
  if(number!==String(i+1).padStart(2,"0")||title!==expectedSceneTitles[i]) throw new Error(`Unexpected DA-004 scene heading at ${i+1}.`);
}
if (!normalized.includes(openingFingerprint) || !normalized.trimEnd().endsWith(closingFingerprint)) throw new Error("DA-004 approved source fingerprints failed.");
const canonicalSource = normalized.replace(headingPattern,(_m,n,t)=>`Scene ${n} — ${t}`);
const canonicalSourceSha256 = sha256(Buffer.from(canonicalSource,"utf8"));
if (canonicalSourceSha256 !== sourceLock.canonicalFragmentSha256) throw new Error(`DA-004 approved-source hash drift: ${canonicalSourceSha256}.`);
const words = canonicalSource.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
if (words.length < 16000 || words.length > 18500) throw new Error(`DA-004 source word-count sanity check failed: ${words.length}.`);

let correctedSource = canonicalSource;
for (const [before, after] of v18ContrastiveProseReplacements) {
  const occurrences = correctedSource.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one DA-004 v1.8 contrastive-prose target ${JSON.stringify(before)}, found ${occurrences}.`);
  }
  correctedSource = correctedSource.replace(before, after);
}

const body = correctedSource.replace(/^Scene (\d{2}) — (.+)$/gm,(_m,n,t)=>`## ${Number(n)}. ${t}`);
const artFrontmatter = Object.entries(assets).map(([role,url])=>`${role}: "${url}"`).join("\n");
const frontmatter = `---\nslug: da-004-close-enough-to-recognize\ntitle: Close Enough to Recognize\nsummary: ${approvedWebsiteCardSubtitle}\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 65–81 minutes\nrevision: ${correctedRevision}\npublicationDate: ${publicationDate}\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: false\n${artFrontmatter}\ncoverImageWidth: 1600\ncoverImageHeight: 900\ncoverAlt: \"${approvedAlt}\"\nogImageAlt: \"${approvedAlt}\"\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - haunted hotel\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impacts\n  - voice-like audio\n  - disputed sound direction\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - environmental comparisons\n  - negative observations\nlocations:\n  - Kestrel Hotel\ncontentWarnings:\n  - Psychological distress and panic\n  - Nausea and bodily unease\n  - Unexplained knocking and voice-like audio\n  - Contested hotel ghost lore\n  - Nighttime wandering in restricted-adjacent hotel corridors\ncontentNotes:\n  - Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive:true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");
console.log(`DA-004 ${correctedRevision} publication edition materialized over frozen ${frozenSourceRevision}; source ${canonicalSourceSha256}; bounded contrastive-prose correction layer applied; corrected responsive release art wired; publicationDate=${publicationDate}; publicReleaseAuthorized=true.`);
