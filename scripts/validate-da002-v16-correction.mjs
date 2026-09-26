import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const storyPath = path.join(
  process.cwd(),
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);

const manuscript = await readFile(storyPath, "utf8");
const failures = [];
const requireText = (text, label) => {
  if (!manuscript.includes(text)) failures.push(`Missing ${label}: ${JSON.stringify(text)}`);
};
const forbidText = (text, label) => {
  if (manuscript.includes(text)) failures.push(`Stale ${label} remains: ${JSON.stringify(text)}`);
};

requireText("revision: Final Approved Story v16", "v16 revision marker");
forbidText("revision: Final Approved Story v15", "v15 revision marker");

forbidText("You set the end point. Then you honor it.", "procedural aphorism");
forbidText("Ron stated the fact without accusation.", "narratorial endorsement");
forbidText("Her tone was gentle. Evan had no easy reply.", "tone explanation");
requireText("Her tone was gentle.", "approved Miriam delivery");
forbidText(
  "Diane held the facilities recorder close enough to capture the spoken time without turning the act into ceremony.",
  "ceremony phrasing",
);
requireText(
  "Diane held the facilities recorder close enough to capture the spoken time.",
  "approved recorder action",
);

if (failures.length > 0) {
  throw new Error(`DA-002 v16 correction validation failed:\n${failures.join("\n")}`);
}

console.log(
  "DA-002 v16 correction validation passed: revision marker and all four approved v15→v16 prose changes verified; stale v15 targets absent.",
);
