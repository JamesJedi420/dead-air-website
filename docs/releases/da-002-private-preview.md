# DA-002 private-preview record

## Scope

This branch stages **The Name in the Room** for withheld archive integration and release verification. The complete approved manuscript is stored as ordered source fragments and deterministically materialized into the Astro story entry before development, preview, and production builds. Both publication locks remain active until the release checks below are complete.

## Governing sources

- Final approved manuscript: Google Doc `1x6cnnql3BhBg_YJkddcOUDWaeXY1lPNh9qhrjLHKpiU`
- Website edition pre-release source: Google Doc `1Nwf6yHNIOtqg0CjbzA7bcwl8Gl50kjWgIXw0CijX1Sc`
- Post-production package: Google Doc `1r4On4JlFCqa_5ct7-Eb4IuFNWf-nT6Z31LnqZsgfh8M`
- Publishing-assets folder: Google Drive folder `10pybWytAStpmXViLIb2MaNjBTdMpxsWN`

## Manuscript integrity

- Final Approved Story v12 and the website-edition story body match exactly across 135,577 characters and 1,717 nonblank paragraphs.
- Approved source SHA-256: `55ff97c09fe98795ed863b7d3a7db8dcb050b901859571f5449b29f8033ea81e`
- Materialized Markdown SHA-256: `104c25b43c709d30b0aa8c20bd7cb13410073fd67a763e7e9229640973b20964`
- `scripts/materialize-da002.mjs` refuses to build if the ordered fragments do not reproduce the approved materialized hash.
- The corrected Scene 8 opening is retained: `Abby reached the stairwell landing before Evan touched the lever.`
- The custody ending retains two labels, two chains of custody, and no name.

## Publication lock

The DA-002 case, story, characters, location updates, and mystery records currently use both:

- `draft: true`
- `status: withheld`

The shared archive filter requires an entry to satisfy `!draft && status !== "withheld"`. While these locks remain active, DA-002 must stay absent from public indexes, generated detail routes, search, RSS, sitemap output, timeline views, taxonomy output, and related-entry panels.

## Publication approval

Repository owner **JamesJedi420** separately authorized publication on July 27, 2026, after requesting completion of the manuscript import, comparison, withheld-output scan, desktop/mobile/long-form proof, metadata and link checks, and approval record. This approval is conditional on successful completion and documentation of every remaining release gate; it does not waive a failed check or authorize an unverified deployment.

## Canon boundaries

- Preserve the fire-door movement as unresolved under incomplete coverage.
- Preserve both DA-002 audio events without a speaker or official transcription.
- Treat the ritual as an attributed practice followed by reported relief and changed participant conduct.
- Preserve the auditorium identity as a group-built sequence rather than a verified historical person.
- Keep the wet brass key and auditorium recorder under separate chains of custody.
- Establish no entity, paranormal law, faction, hidden truth, cleansing result, attachment, verified identity, or common cross-case cause.

## Private-preview checklist

- [x] Create withheld DA-002 case record.
- [x] Create fail-closed withheld story record.
- [x] Add Ron Meier and Miriam Vale character records.
- [x] Extend Diane Madsen, Evan Kruse, Abby Larson, and Bellweather High records through DA-002.
- [x] Add the approved DA-002 open-mystery records.
- [x] Extend the Bellweather cross-case mystery without promoting a common cause.
- [x] Import the complete Final Approved Story v12 body from the controlled website-edition source.
- [x] Compare repository source to the approved source paragraph by paragraph.
- [x] Confirm the corrected Scene 8 opening: `Abby reached the stairwell landing before Evan touched the lever.`
- [x] Confirm the custody ending retains two labels, two chains of custody, and no name.
- [ ] Run `npm install` with the repository lockfile.
- [ ] Run `npm run build`.
- [ ] Scan `dist` for `DA-002`, `The Name in the Room`, story excerpts, character names introduced only by DA-002, and the canonical slug while withheld.
- [ ] Confirm no DA-002 detail route is generated while withheld.
- [ ] Confirm no DA-002 content enters RSS or sitemap output while withheld.
- [ ] Create and verify a Netlify deploy preview after the complete body is staged.
- [ ] Proof desktop and mobile typography, scene headings, isolated lines, quotation marks, and long-form reading behavior.
- [ ] Verify keyboard navigation, heading order, contrast, metadata, content notes, fictionalization note, and image-alt-text applicability.
- [ ] Resolve the website-edition slug against the repository route and canonical URL behavior.
- [ ] Verify publication date remains unset until the publication build is intentionally staged.
- [ ] Review and resolve every PR conversation and inline thread.
- [x] Record separate publication approval before changing either publication field.
- [ ] Change publication fields only after the withheld preview passes.
- [ ] Merge only after publication preview proof and all release checks pass.
- [ ] Verify the public deployment before archive/version freeze.

## Current status

Final Approved Story v12 is imported and integrity-locked. Source comparison and separate publication approval are complete. The withheld build, leakage scan, preview proof, metadata/link checks, publication-field change, publication preview, merge, public deployment verification, and release freeze remain pending.
