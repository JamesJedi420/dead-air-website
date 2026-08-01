# DA-001 Private Preview Proof

## Purpose

Trigger and document the password-gated deploy preview for **DA-001 — The Building Keeps the Hour** before a separate public-release decision.

## Approved source

- Revision: Final Approved Story v17
- Editorial proof: complete; no required manuscript revision
- Storage: private controlled source outside the public repository
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
- Public release authorized: **No**
- Public publication date: **Unset**
- Final proof result: **Pending deploy-preview checks and visual review**

A separate release pull request is required after this preview passes and receives publication approval.
