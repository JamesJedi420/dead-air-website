# DA-001 Release Preparation

## Current state

DA-001 — *The Building Keeps the Hour* remains a withheld draft. This preparation record adds integrity, chronology, continuity, and non-leak controls without changing the manuscript or authorizing publication.

The controlled source remains:

- `src/manuscripts/da-001/source.md`
- outside Astro’s public content collection;
- `status: withheld`;
- `draft: true`;
- no publication date;
- Git blob SHA-1 `784b2bbc7cd634a143845b4b293de73aeb3c5720`.

The source was relocated with the existing Git blob rather than copied or rewritten. Its byte content and Git blob SHA remain unchanged. No DA-001 story entry exists under `src/content/stories/` during preparation.

`scripts/validate-da001-preparation.mjs` reconstructs the Git blob hash during every development, preview, and production build. Any prose, frontmatter, whitespace, or line-ending change requires deliberate renewal of the preparation record.

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

The source manuscript retains internal scene labels. A future approved publication transform will render these semantic level-two headings:

| Source heading | Public heading |
| --- | --- |
| Scene 1 — Three-Thirty | 1. Three-Thirty |
| Scene 2 — Permission Slips | 2. Permission Slips |
| Scene 3 — The Quiet Test | 3. The Quiet Test |
| Scene 4 — Come Here, I Have a Joke | 4. Come Here, I Have a Joke |
| Scene 5 — Teaching the Building | 5. Teaching the Building |
| Scene 6 — Wayne’s Route | 6. Wayne’s Route |
| Scene 7 — The Cut | 7. The Cut |
| Scene 8 — The Glassless Window | 8. The Glassless Window |
| Scene 9 — The Key That Is Not Hers | 9. The Key That Is Not Hers |
| Scene 10 — Source Track | 10. Source Track |

The preparation validator generates this candidate in memory, reverses every approved transformation, and requires exact recovery of the controlled source. No publication file is written.

## Continuity audit

The DA-001 controlled source and DA-002 content record share the following established public continuity anchors:

- Bellweather High School;
- Diane Madsen;
- Evan Kruse;
- Abby Larson;
- the unidentified wet brass key;
- the unresolved relationship among the recorded phenomena at Bellweather High.

DA-001 establishes the original investigation, the building’s shutdown rhythm, the former work route associated with Wayne, the disputed recordings and images, the auditorium and lighting-booth geography, the wet-key custody problem, and the archive’s evidence-discipline conflict.

DA-002 follows as a return to Bellweather for a cleansing and renewed investigation. Its chronology metadata explicitly follows DA-001. The preparation validator checks the shared entity identifiers and that successor relationship after DA-002 materialization.

This audit preserves broad causal order. It makes no claim that either story reconstructs a complete transcript, an uninterrupted recording, or a verified paranormal event.

## Publication blockers

DA-001 remains unavailable to public indexes until all of the following occur:

1. A final line-level editorial and continuity proof receives approval.
2. A publication date is chosen deliberately.
3. A release materializer reads the controlled manuscript and writes a content entry using only the approved metadata and heading transformations recorded in `src/data/da-001-release-preparation.json`.
4. A private deploy preview passes desktop and mobile proofing.
5. The published route, canonical metadata, source note, accessibility landmarks, internal links, RSS, sitemap, indexes, and timeline position pass DA-001-specific release validation.
6. Separate publication approval authorizes `status: active` and `draft: false`.

Changing status or draft directly remains prohibited. The preparation manifest contains no publication date and supplies no automatic release path.

## Build enforcement

- `scripts/validate-da001-preparation.mjs` locks the source, section transform, chronology, and shared continuity.
- `scripts/validate-da001-output.mjs` confirms that the controlled source remains outside the content collection and that the withheld story remains absent from routes, indexes, RSS, sitemap, excerpts, and the public timeline.
- `src/data/da-001-release-preparation.json` is the machine-readable preparation record.
- `src/data/narrative-timeline-reservations.json` retains archive position 1 until publication.
