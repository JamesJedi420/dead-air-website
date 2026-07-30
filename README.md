# The Dead Air Archive

Production foundation for a static Astro site serving a literary paranormal horror archive.

## Local Development

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:4321` by default.

## Build

```bash
npm run build
```

The static production output is written to `dist/`.

## Netlify Deployment

This repository is configured for the existing Netlify project named `dead-air-website`.

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22.12.0` or newer

If the site is not linked locally yet:

```bash
netlify link --name dead-air-website
```

Then deploy through Netlify's Git integration or with:

```bash
netlify deploy --build
```

## Architecture

- Astro with TypeScript and static output
- Reusable site layout, metadata, navigation, footer, and archive-card components
- Content collections for stories, cases, characters, locations, objects, and mysteries
- RSS feed at `/rss.xml`
- Sitemap generated during build
- Robots policy at `/robots.txt`
- Canonical and Open Graph metadata in the shared layout

## Standard Story Source Note

Every story detail page renders this shared note through `src/components/StorySourceNote.astro`:

> Based on reported paranormal-investigation accounts. Some events, characters, and identifying details have been fictionalized.

Story manuscripts should not add a separate fictionalization or source-note heading. Any story-specific disclosure beyond the standard note requires deliberate editorial review before publication.

## Published Story Section Standard

Public story divisions use semantic level-two headings with sequential Arabic numerals:

```markdown
## 1. Terms of Return
```

Internal outlines and approved source manuscripts may retain scene terminology, but published pages do not display literal `Scene 1 —` labels. A continuous story may omit section headings; when divisions are used, each level-two heading must follow the numbered convention beginning with `1`.

The approved policy is recorded in `docs/editorial/story-section-standard.md`. `scripts/validate-story-section-headings.mjs` enforces it before development, preview, and production builds.

## Narrative Timeline Standard

Narrative order follows the approximate sequence of the source investigations and transcripts, not publication order. Exact in-world dates may remain relative, seasonal, approximate, or withheld when the source record does not support greater precision.

Published stories or cases assigned a timeline position must record `timelineOrder`, `timelineLabel`, `sourceOrder`, `datePrecision`, `chronologyNote`, `follows`, and `precedes`. The public Timeline page sorts by narrative position and does not substitute release dates for event dates.

The approved policy and initial DA-001 → DA-002 sequence are recorded in `docs/editorial/narrative-timeline-standard.md`. `scripts/validate-narrative-timeline.mjs` enforces metadata completeness before development, preview, and production builds; `scripts/validate-narrative-timeline-output.mjs` verifies the generated public chronology.

## DA-001 Release Preparation

DA-001 remains withheld and requires separate publication approval. Its manuscript is stored privately outside this repository. The public repository retains only the former source digest, ten-section transformation map, chronology reservation, continuity identifiers, and release-boundary controls.

`scripts/validate-da001-preparation.mjs` rejects any DA-001 manuscript or public story entry in the repository and validates the remaining preparation metadata. `scripts/validate-da001-output.mjs` confirms that no DA-001 route, title, slug, RSS item, sitemap entry, search/index reference, asset path, or timeline entry reaches deployed output.

The machine-readable preparation record is `src/data/da-001-release-preparation.json`. The private-source boundary, editorial audit, history-cleanup limitation, and remaining release blockers are recorded in `docs/editorial/da-001-release-preparation.md`.

## Public Repository Boundaries

Do not commit internal development records, raw transcripts, real participant identities, hidden canon, unpublished manuscripts, unpublished continuity data, private research notes, or source interview material to this repository.

The `.gitignore` blocks common private-material paths, including `src/manuscripts/`, as a guardrail. The primary protection remains editorial discipline: only deliberate public-facing archive text belongs in this repository.
