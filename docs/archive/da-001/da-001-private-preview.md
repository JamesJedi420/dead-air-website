# Archived — DA-001 private preview materializer

> **Status:** Superseded on August 1, 2026. DA-001 was published through the repository-native twelve-fragment materializer. The secret-chunk materializer, preview password gate, edge function, and Netlify variables described below were removed. This record is retained only as historical deployment documentation and must not be used as an active release procedure.

**Historical context:** DA-001 remained withheld and unpublished while this preview system operated. The private preview path existed only to proof the approved Final Approved Story v17 without committing its manuscript to the active repository tree.

## Activation boundary

The materializer runs only when all the following are true:

- `DA001_PRIVATE_PREVIEW=1`;
- Netlify `CONTEXT=deploy-preview`;
- Netlify `HEAD` exactly matches `agent/da001-private-preview`;
- every declared source chunk is present;
- the reassembled raw export matches SHA-256 `eaba2ab84b2949382e99f4eef29afffffbe5cf8d7491b47cb680e6272967a518`;
- `google-doc-text-v1` produces canonical SHA-256 `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415` and 23,621 words.

Without activation, the materializer deletes any ignored generated DA-001 content entry and exits successfully. Production therefore retains the existing withheld-output boundary.

## Secret input format

The UTF-8 Google Docs text export is gzip-compressed, base64-encoded, and divided into ordered build-only variables:

- `DA001_PRIVATE_SOURCE_CHUNK_COUNT`;
- `DA001_PRIVATE_SOURCE_GZIP_B64_000` through the final declared chunk.

The materializer rejects a missing chunk, an extra chunk immediately after the declared range, invalid base64/gzip data, a raw digest mismatch, a canonical digest mismatch, a word-count mismatch, a source-heading mismatch, or a private scene label remaining after transformation.

## Generated entry

During an authorized preview build, `scripts/materialize-da001-preview.mjs` creates the ignored temporary entry `src/content/stories/da-001-the-building-keeps-the-hour.md`. It uses only approved release metadata, chronology position 1, continuity relations, and the ten approved public section headings. It leaves the public release manifest withheld, draft-only, and without a publication date.

The post-build validator requires the preview route, all ten public headings, the standard source note, RSS entry, sitemap entry, search entry, and DA-001 → DA-002 timeline order. Normal builds continue to require complete DA-001 absence.

## Access control

`netlify/edge-functions/da001-preview-auth.ts` applies HTTP Basic authentication only when the preview flag, deploy-preview context, and exact authorized branch all match. The username is `preview`; the password comes from the runtime-only secret `DA001_PREVIEW_PASSWORD` and must contain at least 32 characters. Authorized and unauthorized responses receive private no-store caching and `X-Robots-Tag: noindex, nofollow, noarchive` headers.

The source chunks and password must remain scoped only to Netlify deploy previews. Activating the flag before all source chunks and the password are configured is expected to fail closed.
