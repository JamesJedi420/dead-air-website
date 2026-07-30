import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  DA001_APPROVED_CANONICAL_SHA256,
  DA001_APPROVED_WORD_COUNT,
  DA001_CANONICALIZATION_ID,
  DA001_WORD_PATTERN_SOURCE,
  canonicalizeDa001GoogleDocTextV1,
  countDa001StoryWords,
  sha256Utf8,
} from "./lib/da001-canonicalizer-v1.mjs";

const root = process.cwd();
const fixtureRoot = path.join(root, "scripts", "fixtures", "da001-google-doc-text-v1");
const [input, expected, expectedRecord, manifest, attestation] = await Promise.all([
  readFile(path.join(fixtureRoot, "input.txt"), "utf8"),
  readFile(path.join(fixtureRoot, "expected.md"), "utf8"),
  readFile(path.join(fixtureRoot, "expected.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "src", "data", "da-001-release-preparation.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "src", "data", "da-001-canonicalization-attestation.json"), "utf8").then(JSON.parse),
]);

const actual = canonicalizeDa001GoogleDocTextV1(input);
assert.equal(actual, expected, "google-doc-text-v1 fixture output changed");
assert.equal(sha256Utf8(actual), expectedRecord.canonicalSha256, "fixture SHA-256 changed");
assert.equal(countDa001StoryWords(actual), expectedRecord.wordCount, "fixture word count changed");
assert.equal(expectedRecord.canonicalization, DA001_CANONICALIZATION_ID);

const withoutBom = input.replace(/^\uFEFF/, "");
assert.equal(canonicalizeDa001GoogleDocTextV1(withoutBom), expected, "BOM-free export changed canonical output");
assert.equal(
  canonicalizeDa001GoogleDocTextV1(withoutBom.replace(/\n/g, "\r\n")),
  expected,
  "CRLF export changed canonical output",
);
assert.equal(
  canonicalizeDa001GoogleDocTextV1(withoutBom.replace(/\n/g, "\r")),
  expected,
  "CR export changed canonical output",
);

assert.equal(manifest.source.canonicalization, DA001_CANONICALIZATION_ID);
assert.equal(manifest.source.approvedCanonicalSha256, DA001_APPROVED_CANONICAL_SHA256);
assert.equal(manifest.source.approvedWordCount, DA001_APPROVED_WORD_COUNT);
assert.equal(attestation.canonicalization, DA001_CANONICALIZATION_ID);
assert.equal(attestation.canonicalSha256, DA001_APPROVED_CANONICAL_SHA256);
assert.equal(attestation.wordCount, DA001_APPROVED_WORD_COUNT);
assert.equal(attestation.wordPattern, DA001_WORD_PATTERN_SOURCE);
assert.equal(attestation.verificationStatus, "verified-against-private-source");

assert.throws(
  () => canonicalizeDa001GoogleDocTextV1(input.replace("Scene 5 — The Markers", "Scene 5 — Changed")),
  /source headings changed/,
);
assert.throws(
  () => canonicalizeDa001GoogleDocTextV1(input.replace("Final Approved Story v17", "Final Approved Story v18")),
  /revision label expected/,
);

console.log(
  `DA-001 canonicalizer fixture passed: ${DA001_CANONICALIZATION_ID}; approved attestation ${DA001_APPROVED_CANONICAL_SHA256}, ${DA001_APPROVED_WORD_COUNT} words.`,
);
