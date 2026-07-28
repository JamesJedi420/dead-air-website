import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const storyDirectory = path.join(process.cwd(), "src", "content", "stories");

const collectMarkdownFiles = async (directory) => {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMarkdownFiles(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(entryPath);
  }

  return files.sort((left, right) => left.localeCompare(right));
};

const stripMatchingQuotes = (value) => {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value.at(-1);
  return (first === last && (first === '"' || first === "'")) ? value.slice(1, -1) : value;
};

const readFrontmatterScalar = (frontmatter, key) => {
  const line = frontmatter
    .split(/\r?\n/)
    .find((candidate) => new RegExp(`^${key}:`).test(candidate));

  if (!line) return undefined;

  let value = line.slice(line.indexOf(":") + 1).trim();
  if (!value.startsWith('"') && !value.startsWith("'")) {
    value = value.replace(/\s+#.*$/, "").trim();
  }
  return stripMatchingQuotes(value);
};

const parseDraft = (frontmatter, fileName, failures) => {
  const rawDraft = readFrontmatterScalar(frontmatter, "draft");
  if (rawDraft === undefined) return false;
  if (rawDraft === "true") return true;
  if (rawDraft === "false") return false;

  failures.push(`${fileName}: draft must be true or false, received ${JSON.stringify(rawDraft)}`);
  return true;
};

const closingFencePattern = ({ character, length }) =>
  new RegExp(`^ {0,3}${character === "`" ? "`" : "~"}{${length},}[ \\t]*$`);

const extractLevelTwoHeadings = (markdown) => {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const headings = [];
  let fence;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (fence) {
      if (closingFencePattern(fence).test(line)) fence = undefined;
      continue;
    }

    const openingFence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (openingFence) {
      fence = {
        character: openingFence[1][0],
        length: openingFence[1].length,
      };
      continue;
    }

    if (/^(?: {4}|\t)/.test(line)) continue;

    const atxHeading = line.match(/^ {0,3}(#{1,6})(?:[ \\t]+(.*?)|[ \\t]*)$/);
    if (atxHeading) {
      if (atxHeading[1].length === 2) {
        const heading = (atxHeading[2] ?? "")
          .replace(/[ \\t]+#+[ \\t]*$/, "")
          .trim();
        headings.push(heading);
      }
      continue;
    }

    const nextLine = lines[index + 1];
    if (
      line.trim().length > 0 &&
      !/^(?: {4}|\t)/.test(line) &&
      nextLine !== undefined &&
      /^ {0,3}-+[ \\t]*$/.test(nextLine)
    ) {
      headings.push(line.trim());
      index += 1;
    }
  }

  return headings;
};

const parserChecks = [
  {
    name: "fenced code",
    markdown: "```md\n## Scene 1 — Example\n```\n\n## 1. Real Section",
    expected: ["1. Real Section"],
  },
  {
    name: "Setext H2",
    markdown: "Scene 1 — Hidden Label\n----------------------",
    expected: ["Scene 1 — Hidden Label"],
  },
  {
    name: "indented code",
    markdown: "    ## Scene 1 — Example\n\n## 1. Real Section",
    expected: ["1. Real Section"],
  },
];

for (const check of parserChecks) {
  const actual = extractLevelTwoHeadings(check.markdown);
  if (JSON.stringify(actual) !== JSON.stringify(check.expected)) {
    throw new Error(
      `Story section-heading parser self-check failed for ${check.name}: expected ${JSON.stringify(check.expected)}, received ${JSON.stringify(actual)}.`,
    );
  }
}

const storyFiles = await collectMarkdownFiles(storyDirectory);
const failures = [];
let publishedStoriesChecked = 0;
let numberedSectionsChecked = 0;

for (const filePath of storyFiles) {
  const fileName = path.relative(storyDirectory, filePath).replaceAll(path.sep, "/");
  const content = await readFile(filePath, "utf8");
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!frontmatterMatch) {
    failures.push(`${fileName}: missing YAML frontmatter`);
    continue;
  }

  const frontmatter = frontmatterMatch[1];
  const status = readFrontmatterScalar(frontmatter, "status") ?? "fragmentary";
  const draft = parseDraft(frontmatter, fileName, failures);
  const isPublished = !draft && status !== "withheld";

  if (!isPublished) continue;
  publishedStoriesChecked += 1;

  const body = content.slice(frontmatterMatch[0].length);
  const headings = extractLevelTwoHeadings(body);

  for (const [index, heading] of headings.entries()) {
    const expectedNumber = index + 1;
    const expectedPrefix = `${expectedNumber}. `;

    if (/^(?:Scene|Chapter)\s+\d+\b/i.test(heading)) {
      failures.push(`${fileName}: production structural label published as ${JSON.stringify(heading)}`);
      continue;
    }

    if (/^[IVXLCDM]+\.\s+/i.test(heading)) {
      failures.push(`${fileName}: Roman-numeral structural label published as ${JSON.stringify(heading)}`);
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
