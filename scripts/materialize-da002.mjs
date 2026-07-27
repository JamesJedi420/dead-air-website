import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourceDirectory = path.join(process.cwd(), "src", "manuscripts", "da-002");
const outputPath = path.join(
  process.cwd(),
  "src",
  "content",
  "stories",
  "da-002-the-name-in-the-room.md",
);
const expectedSha256 = "104c25b43c709d30b0aa8c20bd7cb13410073fd67a763e7e9229640973b20964";

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => /^part-\d{2}\.mdfrag$/.test(fileName))
  .sort((left, right) => left.localeCompare(right));

if (sourceFiles.length !== 12) {
  throw new Error(`Expected 12 DA-002 manuscript fragments, found ${sourceFiles.length}.`);
}

const manuscript = (
  await Promise.all(
    sourceFiles.map((fileName) => readFile(path.join(sourceDirectory, fileName), "utf8")),
  )
).join("");

const actualSha256 = createHash("sha256").update(manuscript, "utf8").digest("hex");

if (actualSha256 !== expectedSha256) {
  throw new Error(
    `DA-002 manuscript integrity check failed. Expected ${expectedSha256}, received ${actualSha256}.`,
  );
}

await writeFile(outputPath, manuscript, "utf8");
console.log(`Materialized DA-002 Final Approved Story v12 (${actualSha256}).`);
