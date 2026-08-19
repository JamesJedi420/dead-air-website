# Dead Air Standard Website Release Gate

Status: Active implementation control

This repository uses the proven DA-001/DA-002 repository-native release workflow as the default implementation for DA-003 and every future Dead Air case. Do not create a new case-specific release architecture unless the existing pattern cannot satisfy a documented requirement and the user explicitly authorizes the deviation.

## Required sequence

1. Preserve the approved manuscript in ordered repository source fragments or the current equivalent source-controlled form and record the approved-source hash.
2. Use deterministic materialization for website-facing transformations; never rewrite the frozen approved source merely for presentation.
3. Run a withheld-output Deploy Preview first. The complete approved manuscript may exist in controlled repository source, but the new DA must emit no story route, title, slug, excerpt, cover/release asset, public index/search reference, RSS item, sitemap entry, taxonomy output, related-entry output, or other unintended reader-facing artifact.
4. Only after the withheld-output gate passes, stage the reader-facing Deploy Preview using the existing shared story template and the DA-001/DA-002 materializer/release-validator structure.
5. Adapt only legitimate case-specific data: approved source hash, title, website/card subtitle and metadata, section headings/count, body fingerprints, content notes, approved assets/alt text, and bounded case-specific claim-ceiling assertions.
6. Verify the complete rendered story, source/fictionalization note, public section order, metadata, canonical/Open Graph/social metadata, content notes, images/alt text where applicable, internal links, public indexes, RSS exclusion while preview-only, sitemap, responsive long-form typography, keyboard accessibility, mobile and desktop presentation, privacy/provenance boundaries, and absence of internal development material.
7. Record final website proof and pre-publication freeze only after every required check passes.
8. Public publication remains a separate explicit authorization. Do not infer publication permission from preview success, proof completion, freeze, or merge readiness.
9. After publication authorization, the production build must automatically include the story in `/feed.xml` from the same public story metadata used by the website. Feed eligibility requires `draft: false`, non-withheld status, `previewOnly: false`, and a publication date.
10. Post-publication verification must confirm the live `/feed.xml` resolves, contains every eligible public story, includes the newly published DA, and contains no draft, withheld, preview-only, or undated story. RSS failure or leakage blocks release closure.

## RSS implementation rule

`/feed.xml` is the canonical machine-readable publication feed for Dead Air. It is generated from repository-native public story metadata and must not be hand-authored per case. Feed items use the public story title, canonical story URL, publication date, website summary/card copy, and approved public tags. RSS must never expose internal continuity records, PPC/PTW/CPO terminology, hidden-canon material, private provenance controls, or pre-publication content.

The repository build must validate RSS output automatically. The site must advertise the feed with an `application/rss+xml` alternate link. Downstream automation such as IFTTT should prefer this feed as its source when supported, so the canonical website remains authoritative rather than any social platform.

## Architecture restraint

Do not introduce encryption or ciphertext transport, decryption keys, secret build-variable dependencies, custom edge authentication, alternate deploy-context logic, a second materialization system, or an independent case-specific gate stack merely because a story is unpublished. A new mechanism requires both a concrete requirement the current working pattern cannot meet and explicit authorization.

Failed or superseded experiments are removed from active implementation and may be retained only as clearly archived history. They do not become precedent.

## Precedent rule

The successful current DA-001/DA-002 repository-native implementation is controlling precedent. A later workflow may replace it only after a completed case demonstrates a better general method and the governing Dead Air Story Production Protocol and Website & Publishing Protocol are deliberately updated.
