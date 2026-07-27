# DA-002 release record

## Scope

This release publishes **The Name in the Room** as the DA-002 story while keeping the DA-002 case, character additions, location updates, object relationship, and mystery records withheld. The complete approved manuscript is stored as ordered source fragments and deterministically materialized into the Astro story entry before development, preview, and production builds.

## Governing sources

- Final approved manuscript: Google Doc `1x6cnnql3BhBg_YJkddcOUDWaeXY1lPNh9qhrjLHKpiU`
- Website edition pre-release source: Google Doc `1Nwf6yHNIOtqg0CjbzA7bcwl8Gl50kjWgIXw0CijX1Sc`
- Post-production package: Google Doc `1r4On4JlFCqa_5ct7-Eb4IuFNWf-nT6Z31LnqZsgfh8M`
- Publishing-assets folder: Google Drive folder `10pybWytAStpmXViLIb2MaNjBTdMpxsWN`

## Manuscript integrity

- Final Approved Story v12 and the website-edition story body match exactly across 135,577 characters and 1,717 nonblank paragraphs.
- Approved website-edition source SHA-256: `55ff97c09fe98795ed863b7d3a7db8dcb050b901859571f5449b29f8033ea81e`
- Ordered approved Markdown source SHA-256: `104c25b43c709d30b0aa8c20bd7cb13410073fd67a763e7e9229640973b20964`
- Publication Markdown SHA-256: `5b738e848ba0a18914196c5999f3cada1c75bf676545bc214151c634e7fb9eaa`
- `scripts/materialize-da002.mjs` refuses to build unless both the approved source and publication output reproduce their recorded hashes.
- The corrected Scene 8 opening is retained: `Abby reached the stairwell landing before Evan touched the lever.`
- The custody ending retains two labels, two chains of custody, and no name.

## Publication boundary

The story is intentionally materialized with:

- `status: active`
- `draft: false`
- `publicationDate: 2026-07-27`

The DA-002 case, character additions, Bellweather location update, object relationship, and mystery records retain `draft: true` and `status: withheld`. They remain absent from public detail routes, indexes, search, RSS, sitemap output, timeline views, taxonomies, and related-entry panels.

## Publication approval

Repository owner **JamesJedi420** separately authorized publication on July 27, 2026, after requesting completion of the manuscript import, comparison, withheld-output scan, desktop/mobile/long-form proof, metadata and link checks, and approval record. Every requested pre-merge release gate passed before merge.

## Canon boundaries

- Preserve the fire-door movement as unresolved under incomplete coverage.
- Preserve both DA-002 audio events without a speaker or official transcription.
- Treat the ritual as an attributed practice followed by reported relief and changed participant conduct.
- Preserve the auditorium identity as a group-built sequence rather than a verified historical person.
- Keep the wet brass key and auditorium recorder under separate chains of custody.
- Establish no entity, paranormal law, faction, hidden truth, cleansing result, attachment, verified identity, or common cross-case cause.

## Validation results

- The withheld preview built successfully with the full manuscript present in source while generating no DA-002 route, title, slug, excerpt, index entry, RSS item, sitemap entry, taxonomy output, or related-entry leak.
- The publication preview generated `/stories/da-002-the-name-in-the-room/`, public index references, RSS and sitemap entries, article metadata, content notes, the fictionalization/source note, all nine scene headings, and the complete long-form body.
- The canonical URL is `https://dead-air-website.netlify.app/stories/da-002-the-name-in-the-room/`.
- Both forms of `/dead-air-da-002-the-name-in-the-room` permanently redirect to the canonical story route.
- Internal links resolve against generated output. No controlled Google Drive identifier appears in the rendered story.
- The story contains no images, so image-alt-text review is not applicable.
- Mobile Lighthouse audit: performance 100, accessibility 100, best practices 100, SEO 100.
- Desktop Lighthouse audit: performance 100, accessibility 100, best practices 100, SEO 100.
- Responsive presentation uses an 18px desktop root size, 16px mobile root size, 1.65 line height, a 42rem reading width, visible keyboard focus, a mobile breakpoint, ordered headings, and one page-level H1.

## Production verification

- PR #3 was squash-merged into `main` as commit `ea3823f65e0de466c97f15e969e81db1416b435e`.
- Netlify production deploy `6a675109c3adb80009c7f28e` completed successfully on July 27, 2026.
- Production context: `main`.
- Public site alias: `https://dead-air-website.netlify.app`.
- Public story URL: `https://dead-air-website.netlify.app/stories/da-002-the-name-in-the-room/`.
- Production validation and desktop Lighthouse audit passed with performance 100, accessibility 100, best practices 100, and SEO 100.
- Two permanent redirect rules and two security-header rules were processed successfully.

## Release checklist

- [x] Create withheld DA-002 case and relationship records.
- [x] Import the complete Final Approved Story v12 body.
- [x] Compare the approved manuscript and website edition exactly.
- [x] Confirm the corrected Scene 8 opening.
- [x] Confirm the two-label, two-chain custody ending.
- [x] Install dependencies from the repository lockfile in Netlify.
- [x] Run Astro and TypeScript validation and production builds.
- [x] Scan the withheld build for route, index, RSS, sitemap, taxonomy, title, slug, excerpt, and character leakage.
- [x] Verify no DA-002 detail route or feed entry exists while withheld.
- [x] Create and verify a withheld Netlify deploy preview.
- [x] Record separate publication approval.
- [x] Stage only the story publication fields after the withheld preview passed.
- [x] Verify the publication route, canonical metadata, publication date, Open Graph article metadata, Twitter metadata, content notes, fictionalization note, scene order, and long-form body.
- [x] Verify generated internal links, public indexes, RSS, sitemap, and legacy redirects.
- [x] Proof mobile presentation with a page-specific Lighthouse audit.
- [x] Proof desktop presentation with a page-specific Lighthouse audit.
- [x] Review all PR conversations and confirm no unresolved inline threads.
- [x] Confirm all pre-merge release gates pass.
- [x] Squash-merge PR #3.
- [x] Verify the production deployment and public URL.
- [x] Freeze the release record after production verification.

## Current status

Final Approved Story v12 is imported, integrity-locked, publication-approved, merged, and live. The production deployment and public route have been verified. The release record is frozen.
