# DA-001 Private Preview Proof

## Purpose

Trigger and document the password-gated deploy preview for **DA-001 — The Building Keeps the Hour** before a separate public-release decision.

## Approved source

- Revision: Final Approved Story v17
- Editorial proof: complete; no required manuscript revision
- Storage: private controlled source outside the public repository
- Raw private-export SHA-256: `eaba2ab84b2949382e99f4eef29afffffbe5cf8d7491b47cb680e6272967a518`
- Canonical source SHA-256: `e219318d0d395d601daa32f4778b207a99c7ba05301f9834631f539eb4a9b415`
- Approved word count: 23,621

## Preview requirements

The deploy preview must:

1. Import the private Google Drive export from the configured Netlify secret chunks.
2. Verify the raw export and canonical manuscript digests before materialization.
3. Publish the story only inside the password-gated deploy preview.
4. Render ten sequentially numbered public sections.
5. Include the standard source and fictionalization note.
6. Preserve DA-001 at narrative position 1 and DA-002 at position 2.
7. Include DA-001 in preview RSS, sitemap, search, and timeline output.
8. Keep the manuscript absent from the active Git repository tree.
9. Pass DA-002 regression validation and the configured Lighthouse thresholds.

## Proof record

- Preview branch: `agent/da001-private-preview`
- Private source environment: configured for deploy-preview builds
- Secret source sequence: rebuilt on 2026-08-01 from one verified plain-text Drive export
- Active source chunk count: **14**
- Source variables `DA001_PRIVATE_SOURCE_GZIP_B64_000`–`013`: **Restored with explicit values**
- Obsolete source chunks `014`–`023`: **Removed from Netlify configuration**
- Active manuscript chunk scopes: **Deploy-preview / build-only**
- `DA001_PRIVATE_SOURCE_CHUNK_COUNT`: **14**
- `DA001_PRIVATE_PREVIEW`: **1**
- GitHub validation: **Passed**
- Previous missing-environment-variable failure: **Corrected**
- Lighthouse: **Passed** — Performance 100, Accessibility 100, Best Practices 100, SEO 100
- Netlify deploy result: **Retest triggered after full environment restoration**
- Visual proof: **Pending successful deploy-preview route**
- Public release authorized: **No**
- Public publication date: **Unset**
- Final proof result: **Pending corrected deployment retest**

A separate public-release pull request must not be opened until the preview route deploys successfully and receives visual proof.
