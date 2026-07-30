import { createHash } from "node:crypto";

export const DA001_CANONICALIZATION_ID = "google-doc-text-v1";
export const DA001_APPROVED_TITLE = "The Building Keeps the Hour";
export const DA001_APPROVED_REVISION = "Final Approved Story v17";
export const DA001_APPROVED_DOCUMENT_TITLE = "DA-001 — Final Approved Story v17 — The Building Keeps the Hour";
export const DA001_APPROVED_SOURCE_DOCUMENT_ID = "1ftFFygxUKADwJwtKetBCJQ_GkVMzUvqvuDB1cQRzkSE";
export const DA001_APPROVED_CANONICAL_SHA256 = "e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415";
export const DA001_APPROVED_WORD_COUNT = 23621;

export const DA001_SOURCE_SECTION_TITLES = Object.freeze([
  "Three-Thirty",
  "Permission Slips",
  "The Quiet Test",
  "Four Seconds",
  "The Markers",
  "The West Route",
  "The Cut",
  "The Glassless Window",
  "The Key That Is Not Hers",
  "Source Track",
]);

export const DA001_WITHHELD_FRONTMATTER = [
  "---",
  "slug: da-001-the-building-keeps-the-hour",
  `title: ${DA001_APPROVED_TITLE}`,
  `approvedRevision: ${DA001_APPROVED_REVISION}`,
  `sourceDocumentId: ${DA001_APPROVED_SOURCE_DOCUMENT_ID}`,
  "status: withheld",
  "draft: true",
  "---",
  "",
  "",
].join("\n");

export const DA001_WORD_PATTERN_SOURCE = String.raw`\b\w+(?:[’'-]\w+)*\b`;

const normalizeExportLines = (rawText) =>
  rawText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const expectedSourceHeadings = () =>
  DA001_SOURCE_SECTION_TITLES.map((title, index) => `Scene ${index + 1} — ${title}`);

export const canonicalizeDa001GoogleDocTextV1 = (rawText) => {
  if (typeof rawText !== "string") throw new TypeError("DA-001 source export must be UTF-8 text.");

  const lines = normalizeExportLines(rawText);
  if (lines[0] !== DA001_APPROVED_TITLE) {
    throw new Error(`DA-001 source title expected ${JSON.stringify(DA001_APPROVED_TITLE)}.`);
  }
  const expectedRevisionLabel = `DA-001 — ${DA001_APPROVED_REVISION}`;
  if (lines[1] !== expectedRevisionLabel) {
    throw new Error(`DA-001 revision label expected ${JSON.stringify(expectedRevisionLabel)}.`);
  }

  const bodyParts = lines.slice(2).map((part) => (/^Scene \d+ — .+$/.test(part) ? `## ${part}` : part));
  const actualHeadings = bodyParts.filter((part) => part.startsWith("## Scene ")).map((part) => part.slice(3));
  const expectedHeadings = expectedSourceHeadings();
  if (JSON.stringify(actualHeadings) !== JSON.stringify(expectedHeadings)) {
    throw new Error(
      `DA-001 source headings changed. Expected ${JSON.stringify(expectedHeadings)}, received ${JSON.stringify(actualHeadings)}.`,
    );
  }

  return `${DA001_WITHHELD_FRONTMATTER}${bodyParts.join("\n\n")}\n`;
};

export const extractDa001CanonicalBody = (canonicalText) => {
  if (!canonicalText.startsWith(DA001_WITHHELD_FRONTMATTER)) {
    throw new Error("DA-001 canonical text does not begin with the fixed google-doc-text-v1 frontmatter.");
  }
  return canonicalText.slice(DA001_WITHHELD_FRONTMATTER.length);
};

export const countDa001StoryWords = (canonicalText) => {
  const body = extractDa001CanonicalBody(canonicalText);
  return body.match(new RegExp(DA001_WORD_PATTERN_SOURCE, "gu"))?.length ?? 0;
};

export const sha256Utf8 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

export const verifyApprovedDa001Export = (rawText) => {
  const canonicalText = canonicalizeDa001GoogleDocTextV1(rawText);
  const canonicalSha256 = sha256Utf8(canonicalText);
  const wordCount = countDa001StoryWords(canonicalText);

  if (canonicalSha256 !== DA001_APPROVED_CANONICAL_SHA256) {
    throw new Error(
      `DA-001 canonical SHA-256 expected ${DA001_APPROVED_CANONICAL_SHA256}, received ${canonicalSha256}.`,
    );
  }
  if (wordCount !== DA001_APPROVED_WORD_COUNT) {
    throw new Error(`DA-001 word count expected ${DA001_APPROVED_WORD_COUNT}, received ${wordCount}.`);
  }

  return { canonicalText, canonicalSha256, wordCount };
};
