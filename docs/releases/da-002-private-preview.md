# DA-002 private-preview record

## Scope

This branch stages **The Name in the Room** for withheld archive integration and release verification. It does not authorize publication.

## Governing sources

- Final approved manuscript: Google Doc `1x6cnnql3BhBg_YJkddcOUDWaeXY1lPNh9qhrjLHKpiU`
- Website edition pre-release source: Google Doc `1Nwf6yHNIOtqg0CjbzA7bcwl8Gl50kjWgIXw0CijX1Sc`
- Post-production package: Google Doc `1r4On4JlFCqa_5ct7-Eb4IuFNWf-nT6Z31LnqZsgfh8M`
- Publishing-assets folder: Google Drive folder `10pybWytAStpmXViLIb2MaNjBTdMpxsWN`

## Publication lock

The DA-002 case, story, characters, location updates, and mystery records use both:

- `draft: true`
- `status: withheld`

The shared archive filter requires an entry to satisfy `!draft && status !== "withheld"`. During this stage, DA-002 must remain absent from public indexes, generated detail routes, search, RSS, sitemap output, timeline views, taxonomy output, and related-entry panels.

The repository story record intentionally contains no manuscript body. This fail-closed source gate prevents an accidental metadata toggle from exposing the approved story before import, comparison, proof, and separate publication approval.

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
- [ ] Import the complete Final Approved Story v12 body from the controlled website-edition source.
- [ ] Compare repository body to the approved source paragraph by paragraph.
- [ ] Confirm the corrected Scene 8 opening: `Abby reached the stairwell landing before Evan touched the lever.`
- [ ] Confirm the custody ending retains two labels, two chains of custody, and no name.
- [ ] Run `npm install` with the repository lockfile.
- [ ] Run `npm run build`.
- [ ] Scan `dist` for `DA-002`, `The Name in the Room`, story excerpts, character names introduced only by DA-002, and the canonical slug.
- [ ] Confirm no DA-002 detail route is generated.
- [ ] Confirm no DA-002 content enters RSS or sitemap output.
- [ ] Create a private Netlify deploy preview after the complete body is staged.
- [ ] Proof desktop and mobile typography, scene headings, isolated lines, quotation marks, and long-form reading behavior.
- [ ] Verify keyboard navigation, heading order, contrast, metadata, content notes, fictionalization note, and image alt text.
- [ ] Verify canonical URL and publication date remain unset.
- [ ] Review and resolve every PR conversation and inline thread.
- [ ] Record separate publication approval before changing either publication field.
- [ ] Merge only after preview proof and publication approval.
- [ ] Verify the public deployment before archive/version freeze.

## Current status

Withheld archive integration prepared. Complete manuscript import, private deploy preview, build verification, accessibility proof, publication approval, merge, public deployment, and release freeze remain pending.
