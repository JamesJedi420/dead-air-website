import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputDirectory = path.join(process.cwd(), "dist");
const textExtensions = new Set([".html", ".xml", ".json", ".txt", ".js", ".css", ".map"]);
const forbiddenValues = [
  "DA-002",
  "The Name in the Room",
  "da-002-the-name-in-the-room",
  "dead-air-da-002-the-name-in-the-room",
  "Diane saw the second tripod",
  "Abby reached the stairwell landing before Evan touched the lever",
  "Miriam Vale",
];

const files = [];

const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(entryPath);
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
};

if (!(await stat(outputDirectory)).isDirectory()) {
  throw new Error("Astro output directory dist was not created.");
}

await walk(outputDirectory);

const failures = [];

for (const filePath of files) {
  const relativePath = path.relative(outputDirectory, filePath).replaceAll(path.sep, "/");
  const normalizedPath = relativePath.toLowerCase();

  if (normalizedPath.includes("da-002") || normalizedPath.includes("the-name-in-the-room")) {
    failures.push(`${relativePath}: withheld route or asset path generated`);
  }

  if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;

  const content = await readFile(filePath, "utf8");
  for (const forbiddenValue of forbiddenValues) {
    if (content.includes(forbiddenValue)) {
      failures.push(`${relativePath}: contains ${JSON.stringify(forbiddenValue)}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`DA-002 withheld-output validation failed:\n${failures.join("\n")}`);
}

console.log(
  `DA-002 withheld-output validation passed across ${files.length} deployed files: no route, index, RSS, sitemap, taxonomy, slug, title, or excerpt leakage detected.`,
);
