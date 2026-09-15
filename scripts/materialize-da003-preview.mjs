import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "manuscripts", "da-003");
const outputPath = path.join(root, "src", "content", "stories", "da-003-the-recorder-kept-running.md");
const coverPath = path.join(root, "public", "images", "da-003-cover-option-a-evidence-crop-preview.jpg");
const approvedRawExportSha256 = "522786572da7ddd784045b07adb7ca79ab0e4165ed7d0418af9ef3ec0a2f401f";
const approvedCanonicalSourceSha256 = "be4851565b63d561e7ee3f1c92a3d0b8087eb74c651ab518330bfa08a77fdb3f";
const approvedCoverPreviewSha256 = "d5ebd224f85842f4d5e7a362e71eb6031c95e898dcf2801288c7cfcccc049019";
const correctedRevision = "Final Approved Story v10";
const correctiveBefore = "four hard wheel contacts followed by a softer drag";
const correctiveAfter = "four hard contacts from the wheels followed by a softer drag";
const v10ContrastiveProseReplacements = [
  [
    "She walked around the rear bumper. Jonah was not crouched beside the car, not behind the utility box at the lot line, not on the short concrete walk to his townhouse. His front door stood closed.",
    "She walked around the rear bumper and checked beside the car, behind the utility box at the lot line, and the short concrete walk to his townhouse. Jonah was nowhere in sight. His front door stood closed.",
  ],
  ["Not much. A partial handprint, dragged downward six inches. Fresh enough to shine.", "A partial handprint, dragged downward six inches. Fresh enough to shine."],
  ["She lowered the camera but did not stop recording.", "She lowered the camera and kept recording."],
  [
    "Jonah watched the lens for another second. His shoulders dropped, not far, but enough that she saw how tightly he had been bracing them.",
    "Jonah watched the lens for another second. His shoulders dropped a fraction, enough for her to see how tightly he had been bracing them.",
  ],
  ["Jonah did not accuse her. He did not need to.", "Jonah left the accusation unspoken."],
  ["Use the messenger for an emergency, not for routine check-ins.", "Use the messenger only in an emergency. Skip routine check-ins."],
  ["He touched the loose edge of his bandage but did not lift it.", "He touched the loose edge of his bandage and left it in place."],
  ["The pressure in the ear shifted but did not clear.", "The pressure in her ear shifted without clearing."],
  ["Their lights reached the next curve but not the ground beyond it.", "Their lights reached the next curve; the ground beyond remained dark."],
  ["The pressure shifted but did not clear completely.", "The pressure eased slightly and remained."],
  ["This sound did not resemble the cry. It began with several short barks,", "This sound began with several short barks,"],
  ["She moved beside him, not past him.", "She stopped beside him."],
  ["Crickets fell quiet in patches, not all at once.", "The crickets quieted patch by patch."],
  [
    "His route continued toward the dark line of the closed staff path but did not reach it. The impressions turned into the trees before the rise.",
    "His route continued toward the dark line of the closed staff path. Before the rise, the impressions turned into the trees.",
  ],
  ["She loosened her grip but did not release him.", "She loosened her grip and kept hold of him."],
  ["Maren kept the camera light ahead but did not restart the recording.", "Maren kept the camera light ahead with the recording still off."],
  ["The new blood had spread through the gauze at his palm but had not reached his wrist.", "The new blood had spread through the gauze at his palm and stopped short of his wrist."],
  ["He lowered the recorder but did not stop it.", "He lowered the recorder and let it keep running."],
  ["I approached from the staff route, not from your track.", "I came in by the staff route. I stayed off your track."],
  [
    "I’m sending the location to our resource staff because you were off trail near a protected zone, not because I think you found a grave.",
    "I’m sending the location to our resource staff because you were off trail near a protected zone. The photograph doesn’t establish a grave.",
  ],
  [
    "“Not while I was there. It was faceup, close to the middle. I took three photos, then bagged it. I did not unlock it.”",
    "“It was faceup, close to the middle when I was there. I took three photos, then bagged it. I left it locked.”",
  ],
  [
    "The camera time and phone time were not exact enough to align by the displayed clocks, but they could still compare elapsed time without matching the clocks exactly.",
    "The displayed clocks would not align exactly. Elapsed time still gave them a usable comparison.",
  ],
  [
    "The timing was close enough to make the phone placement a viable source, but the devices did not share a stable clock offset.",
    "The timing left the phone placement as a viable source. Clock drift prevented an exact match across devices.",
  ],
  [
    "Maren remembered the third as coming from the opposite side after both had shifted position, but the phone recording did not provide a reliable bearing.",
    "Maren remembered the third as coming from the opposite side after both had shifted position. The phone recording offered no reliable bearing.",
  ],
  ["Maren marked the time from file start, not clock time.", "Maren marked elapsed time from the start of the file."],
  [
    "All three audio recorders captured the distant cry, but they had not been positioned as a microphone array for direction finding.",
    "All three audio recorders captured the distant cry. Their placement was never designed for direction finding.",
  ],
  [
    "Not harmless. Not explained. Smaller.",
    "The remaining incidents were smaller and unresolved; Maren could not dismiss them as harmless.",
  ],
  ["Maren did not reach for the pen. He did.", "Jonah reached for the pen before Maren moved."],
  [
    "She did not delete the raw media. She locked the phone copy and all cards under restricted project custody, with access limited to the two of them until they decided what could be retained for private documentation.",
    "She kept the raw media and locked the phone copy and all cards under restricted project custody, with access limited to the two of them until they decided what could be retained for private documentation.",
  ],
  ["His face tightened, but he did not argue.", "His face tightened. He stayed quiet."],
  [
    "Not the enhanced copy. Not a filtered export. Just the raw duplicate she had transferred that morning.",
    "She used the raw duplicate she had transferred that morning, with no enhancement or filtering.",
  ],
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalizeSource = (value) => value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 18) throw new Error(`Expected 18 DA-003 manuscript fragments, found ${sourceFiles.length}.`);

const importedSource = (await Promise.all(sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")))).join("");
const approvedSource = canonicalizeSource(importedSource);
const actualCanonicalSourceSha256 = sha256(Buffer.from(approvedSource, "utf8"));
if (actualCanonicalSourceSha256 !== approvedCanonicalSourceSha256) {
  throw new Error(`DA-003 canonical approved-source integrity check failed. Expected ${approvedCanonicalSourceSha256}, received ${actualCanonicalSourceSha256}. Raw authoritative Google export remains separately frozen as ${approvedRawExportSha256}.`);
}

const coverBytes = await readFile(coverPath);
const actualCoverSha256 = sha256(coverBytes);
if (actualCoverSha256 !== approvedCoverPreviewSha256) {
  throw new Error(`DA-003 approved-cover derivative integrity check failed. Expected ${approvedCoverPreviewSha256}, received ${actualCoverSha256}.`);
}

const headings = [...approvedSource.matchAll(/^Scene (\d+) — (.+)$/gm)];
if (headings.length !== 9) throw new Error(`Expected 9 DA-003 scene headings in approved source, found ${headings.length}.`);

let correctedSource = approvedSource;
const correctiveOccurrences = correctedSource.split(correctiveBefore).length - 1;
if (correctiveOccurrences !== 1) {
  throw new Error(`Expected exactly one DA-003 corrective target ${JSON.stringify(correctiveBefore)}, found ${correctiveOccurrences}.`);
}
correctedSource = correctedSource.replace(correctiveBefore, correctiveAfter);

for (const [before, after] of v10ContrastiveProseReplacements) {
  const occurrences = correctedSource.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one DA-003 v10 contrastive-prose target ${JSON.stringify(before)}, found ${occurrences}.`);
  }
  correctedSource = correctedSource.replace(before, after);
}

const body = correctedSource.replace(/^Scene (\d+) — (.+)$/gm, "## $1. $2");
if (/^Scene\s+\d+\s+—/m.test(body) || /^##\s+Scene\s+\d+/m.test(body)) throw new Error("A production Scene label remained in the DA-003 website output.");

const frontmatter = `---\nslug: da-003-the-recorder-kept-running\ntitle: The Recorder Kept Running\nsummary: Maren finds Jonah bleeding in an unfinished house with three pages he does not remember writing. Hours later, he asks her to take him back to Harrow River.\nstatus: active\nclassification: Literary paranormal horror\nreadingTime: 86–108 minutes\nrevision: ${correctedRevision}\npublicationDate: 2026-08-18\ncanonicalStatus: established canon\ndraft: false\npreviewOnly: false\ntags:\n  - literary paranormal horror\n  - documentary horror\n  - psychological horror\n  - wilderness horror\nphenomenon:\n  - ambiguous recorded sound\n  - unexplained impact\n  - disputed physical disturbance\n  - speech-like modulation\n  - unresolved unattended recording\nevidenceType:\n  - direct perception\n  - camera recordings\n  - audio recordings\n  - phone voice memo\n  - radio contact\n  - maps and site records\n  - environmental comparisons\n  - negative observations\n  - evidence custody\nlocations:\n  - Harrow River State Preserve\ncontentWarnings:\n  - Psychological distress and panic\n  - Minor hand injury\n  - Memory loss and uncertainty\n  - References to murder and violence in contested site lore\n  - Ambiguous audio and impacts\n  - Nighttime wilderness and off-trail risk\ncontentNotes:\n  - Fictionalized literary horror; disputed folklore and unresolved recordings are not presented as verified paranormal fact.\ncoverImage: /images/da-003-cover-option-a-evidence-crop-preview.jpg\ncoverAlt: Portable recorder resting on wet rocks beside dark water beneath the Dead Air mark; no person, grave marker, or apparition is visible.\n---\n\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${frontmatter}${body}`, "utf8");

console.log(`Materialized DA-003 ${correctedRevision} for Website v1.2 correction (${sha256(Buffer.from(`${frontmatter}${body}`, "utf8"))}); frozen Website v1.0 canonical source preserved (${actualCanonicalSourceSha256}; raw approved export ${approvedRawExportSha256}); bounded v9 objective and v10 contrastive-prose correction layers applied; approved Option A evidence-focused derivative preserved (${actualCoverSha256}); public divisions rendered as nine numbered headings; cross-case chronology remains unspecified; original publication date remains 2026-08-18.`);
