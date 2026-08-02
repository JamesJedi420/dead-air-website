# Archived — DA-001 release preparation

> **Status:** Superseded by publication on August 1, 2026. This file records the former withheld-release state and is not an active release procedure.

The original release-preparation record described DA-001 as a withheld draft whose approved manuscript remained outside the repository. It documented:

- approved-source alignment for Final Approved Story v17;
- the former Google Docs canonicalization process;
- editorial and continuity proof completed July 30, 2026;
- active-tree and public-output exclusion controls;
- archive position 1 before DA-002;
- the ten private-to-public section-heading mappings;
- the private-preview approval gates;
- the accepted historical Git-disclosure decision.

That process was replaced by the repository-native publication implemented and merged through PR #20. The approved v17 manuscript is now assembled from twelve ordered repository fragments, protected by SHA-256 `175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba`, and published through `scripts/materialize-da001.mjs`.

The completed release state is recorded in `docs/editorial/da-001-release-checklist.md`. The former full preparation record remains available in Git history at commit `ddbc7c790dd2ecdc6ae5c6eb4836e8ed08423645` under `docs/editorial/da-001-release-preparation.md`.

Do not restore the withheld-state manifest, private-source verifier, secret-chunk preview system, or old publication blockers without a new explicit release decision.
