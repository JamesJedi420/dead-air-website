# Cloudflare Pages Migration — 2026-10-01

Status: PRE-CUTOVER / NETLIFY REMAINS AUTHORITATIVE

Immutable starting point: `main` at `f5ea86f2e96599b97ef0a288e83e9f366b836902`.

## Objective

Migrate the existing Dead Air static Astro site from Netlify hosting to Cloudflare Pages without changing story manuscripts, canon, chronology, publication metadata, approved art, reader-facing copy, or release-state semantics. Netlify remains live and authoritative until the Cloudflare production copy passes the full Dead Air website release gate and the custom-domain cutover is explicitly completed.

## Cloudflare Pages build contract

- Repository: `JamesJedi420/dead-air-website`
- Migration branch for first proof: `migration/cloudflare-pages-f5ea`
- Initial source baseline: `f5ea86f2e96599b97ef0a288e83e9f366b836902`
- Framework/output: Astro static output
- Build command: `npm run build`
- Build output directory: `dist`
- Node major version: `22` (repository `.nvmrc`); minimum application engine remains `>=22.12.0`
- Canonical public site URL: `https://readdeadair.com`
- No Pages Functions or `_worker.js` are authorized for this migration.

## Netlify parity translated for Pages

`public/_redirects` carries only the existing path-level legacy redirects. Netlify-hostname redirects remain on Netlify during migration because Cloudflare Pages `_redirects` does not provide equivalent domain-level redirect handling.

`public/_headers` carries the existing site-wide security headers and immutable cache policy for `/_astro/*` assets.

`netlify.toml` remains untouched while Netlify is the live production host. It is not removed or weakened during pre-cutover work.

## Release sequence

1. Keep `main` at the immutable starting point while migration compatibility is developed on `migration/cloudflare-pages-f5ea`.
2. Run the repository-native build and all existing post-build validators, including the Cloudflare static-migration validator.
3. Open a draft migration PR so the normal GitHub release validation runs without changing `main`.
4. Create a Cloudflare Pages project from the same GitHub repository. For the first proof, deploy the migration branch without attaching `readdeadair.com`.
5. Verify the generated `*.pages.dev` deployment against the full Dead Air website release gate: complete rendered stories, section order, source/fictionalization notes, content warnings, metadata, canonical/Open Graph/social metadata, images/alt text, links, public indexes, `/feed.xml`, sitemap, responsive desktop/mobile presentation, keyboard accessibility, privacy/provenance boundaries, and absence of internal production material.
6. DA-004 must additionally show exactly these warnings on the Cloudflare copy: `Family conflict involving a childhood deception`; `Anxiety and acute investigation stress`; `Nausea and bodily unease`. Its source/fictionalization note must appear separately, and no reader-facing `Revision` label or internal manuscript revision string may appear.
7. Do not change DNS, detach the custom domain from Netlify, disable Netlify builds, or retire Netlify until the Cloudflare copy passes the complete gate.
8. After proof passes, merge only the reviewed host-compatibility changes into `main`, configure Cloudflare Pages production to follow `main`, obtain a final production Pages proof, and then perform the explicit DNS/custom-domain cutover.
9. Verify `https://readdeadair.com`, all public stories, redirects, security headers, `/feed.xml`, sitemap, and DA-004 again after DNS propagation. Netlify retirement occurs only after successful live verification.

## Cutover blockers

Any build failure, validator failure, mismatch in public story content, warning metadata, source-note placement, canonical metadata, redirect behavior, security headers, RSS/sitemap output, responsive rendering, accessibility, or privacy/provenance handling blocks cutover. A successful Cloudflare build alone is not release closure.
