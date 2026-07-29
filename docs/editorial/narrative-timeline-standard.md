# Narrative Timeline Standard

## Purpose

The Dead Air Archive maintains a narrative chronology that is separate from publication order and from the dates of the source material. The chronology follows the approximate sequence of the reported investigations and transcripts that informed the fiction while preserving the archive's fictionalization, redaction, and uncertainty boundaries.

## House rule

Dead Air stories are placed in narrative chronology according to the approximate order of their source investigations. Exact dates may be fictionalized, withheld, seasonal, or left unresolved, but follow-up investigations, returns to prior locations, and consequences of earlier cases must retain their relative order. Publication order does not determine narrative order.

## Three distinct orders

1. **Narrative timeline** — when events occur inside Dead Air continuity.
2. **Publication order** — when reader-facing entries become public.
3. **Source chronology** — the approximate order of the underlying investigations, recordings, or transcripts.

The public Timeline page is governed by narrative order. RSS and release records remain governed by publication order. Private source records may document source chronology but are never published merely to support the public timeline.

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

A source upload date, video release date, transcript timestamp, or publication date does not automatically become an in-world event date.

## Initial locked sequence

| Narrative order | Entry | Timeline label | Source sequence |
| --- | --- | --- | --- |
| 1 | DA-001 — *The Building Keeps the Hour* | Initial Bellweather investigation | Original investigation |
| 2 | DA-002 — *The Name in the Room* | Return investigation and attempted cleansing | Follow-up investigation |

DA-001 may remain absent from the public site until its story is publication-ready. Its public-safe chronology reservation makes it a resolvable position-1 target without publishing a placeholder. DA-002 retains `timelineOrder: 2` and an explicit `follows` relationship so later publication of DA-001 cannot reverse the established sequence.

## Adaptation boundaries

The chronology preserves broad causal order rather than reconstructing a minute-by-minute transcript. Stories may compress intervals, combine incidents, alter seasons, withhold dates, or move minor events when the adaptation requires it. Substantial departures from source chronology must be recorded in `chronologyNote` and reviewed deliberately.

The public timeline must never imply that disputed paranormal claims, edited recordings, or retrospective accounts constitute a complete uninterrupted record.

## Enforcement

- `src/content.config.ts` defines the chronology fields and permitted date-precision values.
- `src/data/narrative-timeline-reservations.json` records public-safe positions for established but unpublished entries.
- `scripts/validate-narrative-timeline.mjs` requires complete chronology metadata and validates relationship existence and direction for every published story or case assigned a timeline position.
- `src/pages/timeline.astro` orders entries by `timelineOrder`, not by publication date.
- `scripts/validate-narrative-timeline-output.mjs` scopes rendered assertions to the relevant timeline entry rather than rejecting legitimate dates elsewhere on the page.
- Story-specific release validators may lock important chronology fields when continuity depends on them.
