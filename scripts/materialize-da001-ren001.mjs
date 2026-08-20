import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

await import("./materialize-da001.mjs");

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8"),
);
const outputPath = path.join(root, "src", "content", "stories", `${manifest.slug}.md`);
const legacySchoolToken = ["Bell", "weather"].join("");
const legacySchoolSlugToken = ["bell", "weather"].join("");

let manuscript = await readFile(outputPath, "utf8");
manuscript = manuscript
  .replaceAll(legacySchoolToken, "Cedar Plain")
  .replaceAll(legacySchoolSlugToken, "cedar-plain");

await writeFile(outputPath, manuscript, "utf8");
console.log("Applied REN-001 Cedar Plain school-identity migration after DA-001 frozen-source materialization.");
