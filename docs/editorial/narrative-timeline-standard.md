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

DA-001 may remain absent from the public site until its story is publication-ready. DA-002 nevertheless retains `timelineOrder: 2` and an explicit `follows` relationship so later publication of DA-001 cannot reverse the established sequence.

## Adaptation boundaries

The chronology preserves broad causal order rather than reconstructing a minute-by-minute transcript. Stories may compress intervals, combine incidents, alter seasons, withhold dates, or move minor events when the adaptation requires it. Substantial departures from source chronology must be recorded in `chronologyNote` and reviewed deliberately.

The public timeline must never imply that disputed paranormal claims, edited recordings, or retrospective accounts constitute a complete uninterrupted record.

## Enforcement

- `src/content.config.ts` defines the chronology fields and permitted date-precision values.
- `scripts/validate-narrative-timeline.mjs` requires complete chronology metadata for every published story or case assigned a timeline position.
- `src/pages/timeline.astro` orders entries by `timelineOrder`, not by publication date.
- Story-specific release validators may lock important chronology fields when continuity depends on them.
