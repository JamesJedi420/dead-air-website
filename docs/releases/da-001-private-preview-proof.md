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
- GitHub validation: **Passed**
- Source-chunk import failure: **Resolved**
- Lighthouse: **Passed** — Performance 100, Accessibility 100, Best Practices 100, SEO 100
- Netlify deploy result: **Failed after build** — exit code 4
- Visual proof: **Blocked because no deploy-preview route was published**
- Public release authorized: **No**
- Public publication date: **Unset**
- Final proof result: **Failed release gate; deployment-stage diagnosis required**

A separate public-release pull request must not be opened until the preview route deploys successfully and receives visual proof.
