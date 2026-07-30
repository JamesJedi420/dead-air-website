# DA-001 Release Preparation

## Current state

DA-001 — *The Building Keeps the Hour* remains a withheld draft. Its controlled manuscript is stored privately outside this public repository. The public repository retains the publication boundary, approved-source attestation, superseded Git-source identifier, chronology, section map, continuity identifiers, and the owner's accepted-risk record.

Private storage contains the definitive approved story, website release draft, post-production package, revision notes, and the archived exact Git source. Those files are owner-only in the Drive folder `Dead Air Archive — Private Manuscripts`.

The public preparation record retains:

- `status: withheld`;
- `draft: true`;
- no publication date;
- separate publication approval;
- authoritative revision `Final Approved Story v17`;
- source document ID `1ftFFygxUKADwJwtKetBCJQ_GkVMzUvqvuDB1cQRzkSE`;
- private-export SHA-256 `eaba2ab84b2949382e99f4eef29afffffbe5cf8d7491b47cb680e6272967a518`;
- canonical SHA-256 `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415`;
- canonical word count `23,621`;
- superseded Git blob SHA-1 `784b2bbc7cd634a143845b4b293de73aeb3c5720`;
- no repository path to the manuscript;
- explicit acceptance that historical Git objects remain reachable.

## Approved-source alignment

The July 30, 2026 release-preparation audit compared the archived Git source with the private `Final Approved Story v17` approved by the user on July 25, 2026. The files were not equivalent: 188 manuscript paragraphs differed, and the Git source retained superseded titles for Scenes 4–6.

The private revision record identifies `Final Approved Story v17` as the definitive approved manuscript. The former Git blob remains a historical and superseded source identifier and must not be used for publication.

## `google-doc-text-v1`

`scripts/lib/da001-canonicalizer-v1.mjs` is the normative implementation. It defines these exact steps:

1. Read the Google Docs export as UTF-8 text.
2. Remove one leading byte-order mark when present.
3. Normalize CRLF or CR line endings to LF.
4. Trim every exported line and discard empty lines.
5. Require the first non-empty line to equal `The Building Keeps the Hour`.
6. Require the second non-empty line to equal `DA-001 — Final Approved Story v17`.
7. Remove those two identification lines.
8. Require the ten approved `Scene N — Title` lines in exact order and prefix each with `## `.
9. Join every remaining non-empty paragraph with exactly one blank line.
10. Prepend this fixed frontmatter and end the file with one LF:

```yaml
---
slug: da-001-the-building-keeps-the-hour
title: The Building Keeps the Hour
approvedRevision: Final Approved Story v17
sourceDocumentId: 1ftFFygxUKADwJwtKetBCJQ_GkVMzUvqvuDB1cQRzkSE
status: withheld
draft: true
---
```

Story words are counted only after the frontmatter using the JavaScript Unicode global expression `\b\w+(?:[’'-]\w+)*\b`.

The approved export produces SHA-256 `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415` and 23,621 story words. `src/data/da-001-canonicalization-attestation.json` records the private verification, while the source remains outside the repository.

The committed fixtures under `scripts/fixtures/da001-google-doc-text-v1/` prove the transformation, line-ending rules, heading conversion, digest calculation, and word-count implementation on non-manuscript text. `scripts/test-da001-canonicalizer.mjs` also requires the manifest, canonicalizer constants, and private-source attestation to agree.

An authorized private verification uses:

```bash
npm run verify:da001-private-source -- /private/path/da-001-v17.txt
```

## Editorial and continuity proof

The line-level editorial and continuity proof completed on July 30, 2026 with no required manuscript revision.

The proof confirmed:

- ten sequential scene headings matching the definitive v17 document;
- balanced smart quotation marks and no ASCII-quote contamination;
- no consecutive duplicate-word errors;
- no remaining `never`, `did not`, or `didn't` constructions;
- consistent Bellweather geography, chair arithmetic, key custody, recorder handling, booth access, and final threshold procedure;
- Diane Madsen, Evan Kruse, Abby Larson, Bellweather High School, the unidentified wet brass key, and the unresolved Bellweather-phenomena relationship carry consistently into DA-002;
- DA-002 accurately treats DA-001 as the first investigation involving disputed recordings, the relocated chair, Wayne's route, and the unidentified key.

The proof changes release metadata only. It introduces no plot, prose, canon, chronology, or publication-status change.

## Active repository boundary

Before publication approval, the active checkout validator rejects:

- every file under `src/manuscripts/da-001/`;
- any `src/content/stories/da-001-the-building-keeps-the-hour.*` entry;
- a file whose UTF-8 contents equal the approved canonical SHA-256;
- a text file with at least three approved scene headings and at least 3,000 words;
- a text file with at least one approved scene heading, one approved prose fingerprint, and at least 1,000 words;
- a text file containing at least two approved prose fingerprints;
- a DA-001-named text file containing the approved title and at least 1,000 words.

The scan walks the active checkout while excluding generated or dependency directories: `.git`, `.astro`, `.netlify`, `dist`, and `node_modules`. Its exact control scripts, documentation, and synthetic fixtures are explicitly exempt because they necessarily contain the identifiers and fingerprints used by the scan. The validator detects the approved manuscript and common renamed, raw-export, and split-scene forms; it is not represented as a general-purpose plagiarism or semantic-content detector.

`scripts/validate-da001-output.mjs` separately confirms that no DA-001 route, title, slug, RSS item, sitemap entry, search/index reference, asset path, or timeline entry reaches deployed output.

This boundary governs the active repository tree and public website. It does not claim that historical Git objects are confidential or inaccessible.

## Narrative placement

DA-001 retains archive position 1 as the initial Bellweather investigation. DA-002 retains archive position 2 as the return investigation and attempted cleansing.

The future DA-001 publication metadata is fixed as:

- `timelineOrder: 1`
- `timelineLabel: Initial Bellweather investigation`
- `sourceOrder: Original investigation`
- `datePrecision: relative`
- `follows: []`
- `precedes: stories/da-002-the-name-in-the-room`

The chronology note preserves only the supportable relationship: DA-001 occurs before DA-002 according to the approximate order of the source investigations and transcripts. No exact in-world interval is established.

## Public section map

| Private-source heading | Public heading |
| --- | --- |
| Scene 1 — Three-Thirty | 1. Three-Thirty |
| Scene 2 — Permission Slips | 2. Permission Slips |
| Scene 3 — The Quiet Test | 3. The Quiet Test |
| Scene 4 — Four Seconds | 4. Four Seconds |
| Scene 5 — The Markers | 5. The Markers |
| Scene 6 — The West Route | 6. The West Route |
| Scene 7 — The Cut | 7. The Cut |
| Scene 8 — The Glassless Window | 8. The Glassless Window |
| Scene 9 — The Key That Is Not Hers | 9. The Key That Is Not Hers |
| Scene 10 — Source Track | 10. Source Track |

No publication candidate is generated by the public build.

## Publication blockers

DA-001 remains unavailable to public indexes until all the following occur:

1. The authorized private source passes `verify:da001-private-source`.
2. A publication date is chosen deliberately.
3. A private release materializer receives the source through a non-repository input and writes a temporary content entry using only the approved metadata and heading transformations.
4. A private deploy preview passes desktop and mobile proofing.
5. The published route, canonical metadata, source note, accessibility landmarks, internal links, RSS, sitemap, indexes, and timeline position pass DA-001-specific release validation.
6. Separate publication approval authorizes `status: active` and `draft: false`.

Changing status or draft directly remains prohibited. The public preparation manifest supplies no source path and no automatic release path.

## Historical disclosure decision

The owner explicitly chose on July 30, 2026 to leave repository history unchanged and proceed. Historical Git reachability is therefore an accepted disclosure risk, not a publication blocker. DA-001 is not represented as confidential against people who possess old commit, pull-request, fork, or clone references.

The accepted scope is limited to active-tree and public-output protection. The decision may be revisited if stricter confidentiality requirements arise later.
