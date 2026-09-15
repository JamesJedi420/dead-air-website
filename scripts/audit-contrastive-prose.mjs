import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const storiesDir = path.join(process.cwd(), "src", "content", "stories");
const files = (await readdir(storiesDir)).filter((name) => name.endsWith(".md")).sort();
const hits = [];

const add = (file, kind, line, excerpt) => {
  const normalized = excerpt.replace(/\s+/g, " ").trim();
  const key = `${file}:${line}:${kind}:${normalized}`;
  if (!hits.some((hit) => hit.key === key)) hits.push({ key, file, kind, line, excerpt: normalized });
};

for (const file of files) {
  const text = await readFile(path.join(storiesDir, file), "utf8");
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const lines = body.split(/\r?\n/);
  const lineOf = (index) => body.slice(0, index).split("\n").length;

  const regexes = [
    ["NOT…BUT", /\bnot\b[^.!?\n]{0,180}\bbut\b[^.!?\n]{0,180}/gi],
    ["BUT…NOT", /\bbut\b[^.!?\n]{0,180}\bnot\b[^.!?\n]{0,180}/gi],
    ["NEGATION…BUT", /\b(?:isn't|aren't|wasn't|weren't|don't|doesn't|didn't|can't|couldn't|won't|wouldn't|shouldn't|hasn't|haven't|hadn't)\b[^.!?\n]{0,180}\bbut\b[^.!?\n]{0,180}/gi],
    ["COMMA-NOT", /,[ \t]+not\b[^.!?\n]{0,140}/gi],
  ];

  for (const [kind, regex] of regexes) {
    for (const match of body.matchAll(regex)) add(file, kind, lineOf(match.index), match[0]);
  }

  // Catch the clipped rhetorical reversal the user identified:
  // a short paragraph beginning with "Not ..." followed by another short paragraph.
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    if (!/^Not\b/.test(current) || current.length > 180) continue;
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    const next = j < lines.length ? lines[j].trim() : "";
    if (next && next.length <= 180 && !/^#{1,6}\s/.test(next)) {
      add(file, "NOT-PARAGRAPH→PIVOT", i + 1, `${current} / ${next}`);
    }
  }

  // Catch common negative-then-positive correction pairs such as
  // "It wasn't X. It was Y." or "He didn't X. He Y."
  const sentencePair = /([^.!?\n]{0,80}\b(?:isn't|aren't|wasn't|weren't|don't|doesn't|didn't|can't|couldn't|won't|wouldn't|shouldn't|hasn't|haven't|hadn't)\b[^.!?\n]{0,140}[.!?])\s+(?:\n\s*)?([^.!?\n]{1,180}[.!?])/gi;
  for (const match of body.matchAll(sentencePair)) {
    const second = match[2].trim();
    if (/^(?:It|He|She|They|That|This|The|What|Where|When|From|Only|Just|Instead|Now|Then)\b/i.test(second)) {
      add(file, "NEGATIVE→CORRECTION", lineOf(match.index), `${match[1]} ${second}`);
    }
  }
}

console.log(`Contrastive-prose audit: ${hits.length} candidate construction(s).`);
for (const hit of hits) console.log(`${hit.file}:${hit.line} [${hit.kind}] ${hit.excerpt}`);

// Temporary audit mode: fail so CI preserves the complete candidate list in logs.
if (process.env.CONTRAST_AUDIT_FAIL === "1" && hits.length) process.exit(1);
