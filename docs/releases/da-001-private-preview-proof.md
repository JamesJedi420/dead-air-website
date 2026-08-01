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
- `DA001_PRIVATE_SOURCE_CHUNK_COUNT`: **14**
- `DA001_PRIVATE_PREVIEW`: **1**
- GitHub validation: **Passed**
- Private-source materialization: **Passed**
- Astro check and static build: **Passed with zero diagnostics**
- Generated output count: **111 files; below the 500-file Starter-plan limit**
- Secret scanning: **Passed**
- Lighthouse: **Passed** — Performance 100, Accessibility 100, Best Practices 100, SEO 100
- Netlify deployment attempts: **Three reproducible HTTP 500 failures during `PUT /sites/{site_id}/deploys/{deploy_id}` after successful build and upload calculation**
- Netlify public status at escalation: **All systems operational**
- Failure classification: **Netlify platform deploy-API defect; no remaining repository, manuscript, validation, file-count, or environment-variable failure identified**
- Visual proof: **Blocked because Netlify does not finalize the deploy-preview route**
- Public release authorized: **No**
- Public publication date: **Unset**
- Final proof result: **Blocked pending Netlify support or successful platform recovery**

## Support escalation data

- Site ID: `78053981-b72d-428f-9622-1b7177ace21d`
- Repository: `JamesJedi420/dead-air-website`
- Pull request: `#19`
- Preview branch: `agent/da001-private-preview`
- Verified failing commit: `947d264b7a3d69659bbd89175787e9e970c635be`
- Failure stage: deploy finalization after successful Astro build, output validation, secret scan, and file calculation
- Netlify error: `[PUT /sites/{site_id}/deploys/{deploy_id}][500]`

A separate public-release pull request must not be opened until the preview route deploys successfully and receives visual proof.
