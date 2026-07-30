import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  DA001_CANONICALIZATION_ID,
  verifyApprovedDa001Export,
} from "./lib/da001-canonicalizer-v1.mjs";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/verify-da001-private-source.mjs <google-doc-plain-text-export>");
}

const rawText = await readFile(path.resolve(sourcePath), "utf8");
const result = verifyApprovedDa001Export(rawText);
console.log(
  JSON.stringify(
    {
      canonicalization: DA001_CANONICALIZATION_ID,
      canonicalSha256: result.canonicalSha256,
      wordCount: result.wordCount,
      sourcePath: path.resolve(sourcePath),
    },
    null,
    2,
  ),
);
