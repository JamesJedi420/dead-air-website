# Narrative Timeline Standard

## Purpose

The Dead Air Archive maintains a narrative chronology that is separate from publication order and from source recording or release dates. The chronology uses approved in-world calendar placements derived from story continuity, source chronology, seasonal evidence, and explicit adaptation decisions while preserving fictionalization, redaction, and uncertainty boundaries.

## House rule

Dead Air stories are placed in narrative chronology according to the narrowest approved in-world dating supported by the fiction and source record. Source chronology is evidence, not an automatic controlling order: an adaptation may deliberately diverge from source filming order when the divergence is documented and approved. Publication order does not determine narrative order.

## Three distinct orders

1. **Narrative timeline** — when events occur inside Dead Air continuity.
2. **Publication order** — when reader-facing entries become public.
3. **Source chronology** — the approximate order of the underlying investigations, recordings, or transcripts.

The public Timeline page is governed by narrative order. Its primary reader-facing information is the approved approximate date/range, the precision/confidence of that placement, and meaningful elapsed intervals between adjacent cases. Numeric timeline/archive position is implementation metadata and must not be the primary public presentation. RSS and release records remain governed by publication order. Private source records may document source chronology but are never published merely to support the public timeline.

## Required chronology metadata

A published story or case included on the narrative timeline must carry:

- `timelineOrder`: a positive numeric position in continuity;
- `timelineLabel`: a reader-facing relative period or event label;
- `sourceOrder`: the entry's role in the source sequence, such as `Original investigation` or `Follow-up investigation`;
- `datePrecision`: one of `exact`, `approximate`, `seasonal`, or `relative`;
- `chronologyNote`: a concise explanation of uncertainty or adaptation where needed;
- `follows`: explicit archive relationships to earlier entries, including withheld or not-yet-published entries when their relative position is established;
- `precedes`: explicit archive relationships to later entries when known.

Entries without `timelineOrder` remain outside the public narrative timeline. Publication dates must not be substituted for narrative dates or relative chronology.

Every relationship target must resolve to either an existing story or case entry or an explicit entry in `src/data/narrative-timeline-reservations.json`. A `follows` target must have a lower `timelineOrder`; a `precedes` target must have a higher `timelineOrder`. Misspelled, missing, self-referential, and order-contradicting targets fail validation.

## Chronology reservations

A chronology reservation records a continuity position that must remain stable before its story or case is ready for the public content collections. Reservations contain public-safe identity and ordering metadata only. They generate no route, index entry, feed item, or placeholder story.

When the corresponding content entry is created, its collection, slug, and `timelineOrder` must match the reservation. The content entry may then replace the reservation as the resolved relationship target without changing established chronology.

## Date handling

Use the narrowest precision supported by the fiction and source sequence:

- `exact` only when the in-world date is deliberately established;
- `approximate` when a bounded period is supportable but the exact day is not;
- `seasonal` when season or broad time of year is the intended level of certainty;
- `relative` when only before-and-after relationships are secure.

A source upload date, video release date, transcript timestamp, or publication date does not automatically become an in-world event date. The public page translates datePrecision into reader-facing confidence language and may show a bounded elapsed interval between adjacent entries when both approved placements support it. Such intervals are chronology aids only: they do not imply causal contact, shared exposure, or a paranormal relationship.

Interval ranges must cover every permitted placement, including uncertainty at both endpoints. Omit an interval when the approved dating does not support useful bounds. DA-003's seasonal placement and DA-004's approximate placement currently show no numeric elapsed interval. Output validation checks both the expected interval and its absence within each individual case entry.

## Approved calendar sequence

| Narrative order | Entry | Approved placement | Precision | Source sequence |
| --- | --- | --- | --- | --- |
| 1 | DA-001 — *After the Main Fan Stops* | January 2015 | Approximate | Original investigation |
| 2 | DA-002 — *The Name in the Room* | Late February 2015 | Approximate | Follow-up investigation |
| 3 | DA-003 — *The Recorder Kept Running* | Summer 2017 | Seasonal | Independent source investigation |
| 4 | DA-004 — *Close Enough to Recognize* | September 2017 | Approximate | Independent source investigation |

DA-001 → DA-002 is established story continuity. DA-002 → DA-003 → DA-004 is an approved calendar ordering only and does not establish causal contact, shared exposure, shared paranormal mechanism, or character knowledge across those independent cases. DA-002 is also an approved source-to-fiction chronology divergence: preserved research places the source cleansing footage in early January 2015, while the fiction requires the return to occur after DA-001's later corridor coda, inspections, and documentary circulation.

## Adaptation boundaries

The chronology preserves broad causal order rather than reconstructing a minute-by-minute transcript. Stories may compress intervals, combine incidents, alter seasons, withhold dates, or move minor events when the adaptation requires it. Substantial departures from source chronology must be recorded in `chronologyNote` and reviewed deliberately.

The public timeline must never imply that disputed paranormal claims, edited recordings, or retrospective accounts constitute a complete uninterrupted record.

## Enforcement

- `src/content.config.ts` defines the chronology fields and permitted date-precision values.
- `src/data/narrative-timeline-reservations.json` records public-safe positions for established but unpublished entries.
- `scripts/validate-narrative-timeline.mjs` requires complete chronology metadata and validates relationship existence and direction for every published story or case assigned a timeline position.
- `src/pages/timeline.astro` orders entries by `timelineOrder` internally but presents approved dates/ranges, confidence language, and meaningful inter-case intervals to readers rather than archive positions.
- `scripts/validate-narrative-timeline-output.mjs` scopes rendered assertions to the relevant timeline entry rather than rejecting legitimate dates elsewhere on the page.
- Story-specific release validators may lock important chronology fields when continuity depends on them.
