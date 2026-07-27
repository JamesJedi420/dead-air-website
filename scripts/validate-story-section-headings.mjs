import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const storyDirectory = path.join(process.cwd(), "src", "content", "stories");
const storyFiles = (await readdir(storyDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const failures = [];
let publishedStoriesChecked = 0;
let numberedSectionsChecked = 0;

for (const fileName of storyFiles) {
  const filePath = path.join(storyDirectory, fileName);
  const content = await readFile(filePath, "utf8");
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!frontmatterMatch) {
    failures.push(`${fileName}: missing YAML frontmatter`);
    continue;
  }

  const frontmatter = frontmatterMatch[1];
  const status = frontmatter.match(/^status:\s*(.+)$/m)?.[1]?.trim();
  const draft = frontmatter.match(/^draft:\s*(.+)$/m)?.[1]?.trim();
  const isPublished = draft === "false" && status !== "withheld";

  if (!isPublished) continue;
  publishedStoriesChecked += 1;

  const body = content.slice(frontmatterMatch[0].length);
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());

  for (const [index, heading] of headings.entries()) {
    const expectedNumber = index + 1;
    const expectedPrefix = `${expectedNumber}. `;

    if (/^Scene\s+\d+\b/i.test(heading)) {
      failures.push(`${fileName}: production scene label published as ${JSON.stringify(heading)}`);
      continue;
    }

    if (!heading.startsWith(expectedPrefix) || heading.slice(expectedPrefix.length).trim().length === 0) {
      failures.push(
        `${fileName}: expected level-two heading ${expectedNumber} in the form ${JSON.stringify(`${expectedNumber}. Section Title`)}, received ${JSON.stringify(heading)}`,
      );
      continue;
    }

    numberedSectionsChecked += 1;
  }
}

if (failures.length > 0) {
  throw new Error(`Published story section-heading validation failed:\n${failures.join("\n")}`);
}

console.log(
  `Published story section-heading validation passed across ${publishedStoriesChecked} published stories and ${numberedSectionsChecked} numbered sections. Continuous stories without level-two divisions remain valid.`,
);
