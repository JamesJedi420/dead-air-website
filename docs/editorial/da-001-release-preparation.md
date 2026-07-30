# DA-001 Release Preparation

## Current state

DA-001 — *The Building Keeps the Hour* remains a withheld draft. Its controlled manuscript is stored privately outside this public repository. The public repository retains only the publication boundary, approved-source digest, superseded Git-source identifier, chronology, section map, continuity identifiers, and the owner's accepted-risk record needed to prevent accidental active publication.

Private storage contains the definitive approved story, website release draft, post-production package, revision notes, and the archived exact Git source. Those files are owner-only in the Drive folder `Dead Air Archive — Private Manuscripts`.

The public preparation record retains:

- `status: withheld`;
- `draft: true`;
- no publication date;
- separate publication approval;
- authoritative revision `Final Approved Story v17`;
- canonical SHA-256 `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415`;
- canonical word count `23,621`;
- superseded Git blob SHA-1 `784b2bbc7cd634a143845b4b293de73aeb3c5720`;
- no repository path to the manuscript;
- explicit acceptance that historical Git objects remain reachable.

## Approved-source alignment

The July 30, 2026 release-preparation audit compared the archived Git source with the private `Final Approved Story v17` approved by the user on July 25, 2026. The files were not equivalent: 188 manuscript paragraphs differed, and the Git source retained superseded titles for Scenes 4–6.

The private revision record identifies `Final Approved Story v17` as the definitive approved manuscript. The former Git blob remains recorded only as a historical and superseded source identifier. It must not be used for publication.

The approved source is canonicalized as `google-doc-text-v1`:

1. Export the definitive Google Doc as UTF-8 plain text.
2. Remove the byte-order mark when present.
3. Discard the first two non-empty identification lines: story title and revision label.
4. Convert each `Scene N — Title` line to the internal Markdown heading `## Scene N — Title`.
5. Join all remaining non-empty paragraphs with exactly one blank line.
6. Prepend the fixed withheld-source frontmatter used by the private import workflow.
7. Encode with UTF-8 and LF line endings.

The resulting canonical source has SHA-256 `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415` and 23,621 story words. Any authorized release import must reproduce both values before materialization.

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

## Public repository boundary

No DA-001 manuscript may exist under `src/manuscripts/`, `src/content/stories/`, or any other active repository path before publication approval. The `.gitignore` blocks `src/manuscripts/` as a guardrail.

`scripts/validate-da001-preparation.mjs` enforces active-source absence, the authoritative v17 digest record, completed editorial proof, accepted historical-disclosure decision, withheld release state, approved ten-section map, chronology position, DA-002 successor relationship, and shared public continuity identifiers during development, preview, and production builds.

`scripts/validate-da001-output.mjs` confirms that no DA-001 route, title, slug, RSS item, sitemap entry, search/index reference, asset path, or timeline entry reaches deployed output.

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

A future authorized release import will transform the definitive v17 headings as follows:

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

1. The authorized private source is imported through `google-doc-text-v1` and matches the approved SHA-256 and word count.
2. A publication date is chosen deliberately.
3. A private release materializer receives the source through a non-repository input and writes a temporary content entry using only the approved metadata and heading transformations.
4. A private deploy preview passes desktop and mobile proofing.
5. The published route, canonical metadata, source note, accessibility landmarks, internal links, RSS, sitemap, indexes, and timeline position pass DA-001-specific release validation.
6. Separate publication approval authorizes `status: active` and `draft: false`.

Changing status or draft directly remains prohibited. The public preparation manifest supplies no source path and no automatic release path.

## Historical disclosure decision

The owner explicitly chose on July 30, 2026 to leave repository history unchanged and proceed. Historical Git reachability is therefore an accepted disclosure risk, not a publication blocker. DA-001 is not represented as confidential against people who possess old commit, pull-request, fork, or clone references.

The accepted scope is limited to active-tree and public-output protection: the obsolete source remains excluded from `main`, future ordinary clones, content collections, deployed routes, feeds, indexes, and the timeline. The decision may be revisited if stricter confidentiality requirements arise later.
