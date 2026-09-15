# Dead Air homepage archive-threshold visual — v1.0

## Asset record

- Asset ID: `dead-air-site__homepage-hero__archive-threshold__16x9__brand__v1.0__20260915`
- Story/page: Dead Air homepage
- Role: project-wide landing visual / interface art
- Creator: OpenAI ChatGPT with repository-owner direction
- Creation method: AI-assisted deterministic SVG/CSS authored directly in the website source
- Source/reference provenance: Dead Air Visual Art Production Protocol v1.0; Dead Air Website & Publishing Protocol v1.13; existing Dead Air ink/brass/red identity and threshold framing established by the site identity layer
- External source assets: none
- Human edits: repository-owner direction established the visual objective and prohibited generic horror/occult imagery
- Creation date: 2026-09-15
- Rights basis: original project-specific vector/interface composition; no third-party imagery or living-artist imitation
- Permitted uses: canonical Dead Air website and derivative project-owned interface/publishing uses
- Credit text: none required on the reader-facing homepage
- Source/master: `src/components/HomepageArchiveVisual.astro`
- Responsive behavior: scalable 16:9 inline SVG; desktop right-hand hero field; mobile art-directed stacking with the Recommended Start card partially overlapping the lower field
- Alt text: none; the visual is decorative and marked `aria-hidden="true"`
- Focal point: institutional threshold at approximately 76% x / 55% y
- Text-safe zone: live headline/deck remains outside the artwork on desktop; no text is baked into the SVG
- Spoiler level: project-level / none
- Canon status: non-canon visual identity; establishes no case fact, entity, mechanism, symbol, or cross-case relationship
- Approval state: implementation requested by repository owner; subject to normal rendered QA before merge

## Visual brief

Narrative function: make the homepage immediately recognizable as Dead Air before a reader reaches case-specific art. The image should feel like an archival/institutional threshold rather than a horror-poster illustration.

Reader knowledge point / spoiler ceiling: project-level public identity only. No case-specific hidden information, unresolved identity, or paranormal explanation may be depicted.

Primary visual idea: an empty institutional corridor resolved into a deep threshold, rendered as restrained architectural linework beneath contact-sheet registration marks, scan lines, and a faint archive grid.

Approved motifs: threshold framing; practical fluorescent light; architectural perspective; registration/crop marks; restrained scan/grid texture; the established ink, brass, dim red, and paper-white palette.

What must remain absent: entities, apparitions, people, occult/religious symbols, invented labels, readable fake evidence, case identifiers, story objects, gore, supernatural proof, and cross-case connective imagery.

Composition: asymmetrical 16:9 field with the deepest architectural pressure on the right, quieter negative space to the left, and one red registration line as a controlled accent. The ordinary corridor geometry is established before the threshold is emphasized.

Accessibility/performance: decorative only, no semantic information depends on it, no motion, no flashing, no external image request, no raster LCP penalty, and live HTML retains all reader-facing text and controls.

## QA requirements

Before merge, verify desktop and mobile hierarchy, legibility, no horizontal overflow, keyboard/focus behavior, WCAG contrast for live text and controls, no generated/readable text inside the visual, no case-specific implication, and no regression to build, Lighthouse, sitemap, RSS, structured identity, or public-surface-copy validation.
