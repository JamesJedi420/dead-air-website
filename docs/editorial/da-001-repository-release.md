# DA-001 Repository Release

DA-001 — *The Building Keeps the Hour* is released from the approved Final Approved Story v17 source through the same repository-native materialization model used by DA-002.

## Source integrity

- Source storage: `src/manuscripts/da-001/part-01.mdfrag` through `part-12.mdfrag`
- Approved UTF-8 Markdown SHA-256: `175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba`
- Materializer: `scripts/materialize-da001.mjs`
- Approved revision: Final Approved Story v17
- Public chronology: archive position 1, preceding DA-002

The materializer restores the approved split boundary, verifies the complete source digest before transforming any text, removes production-only title wrappers, converts the ten scene headings to numbered public sections, and creates the public story entry from the release manifest.

## Release change

The password-gated Netlify secret-chunk preview path has been removed. DA-001 now uses repository fragments, deterministic assembly, a fixed integrity hash, and the normal GitHub/Netlify build and deployment path.

## Required validation

- Approved-source SHA-256 must match before materialization.
- Astro check and static build must pass.
- All ten numbered sections must appear without production scene labels.
- The standard source note must render.
- The story must appear in RSS, search, sitemap, and narrative timeline output.
- DA-002 must remain archive position 2 and retain its existing release validation.
