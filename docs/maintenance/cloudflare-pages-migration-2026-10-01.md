# Cloudflare Hosting Migration — 2026-10-01 to 2026-10-04

Status: CUTOVER VERIFIED / NETLIFY RETIRED FROM PRODUCTION RESPONSIBILITY

Immutable migration starting point: `main` at `f5ea86f2e96599b97ef0a288e83e9f366b836902`.

## Objective

Migrate the existing Dead Air static Astro site from Netlify hosting to Cloudflare without changing story manuscripts, canon, chronology, publication metadata, approved art, reader-facing release-state semantics, or canonical URLs.

## Final hosting architecture

The implementation ultimately uses Cloudflare Workers Static Assets rather than classic Cloudflare Pages.

- Repository: `JamesJedi420/dead-air-website`
- Production source branch: `main`
- Framework/output: Astro static output
- Build command: `npm run build`
- Build output directory: `dist`
- Node minimum: `>=22.12.0`
- Canonical public site URL: `https://readdeadair.com`
- Production Worker: `dead-air-website`
- No application Worker code, Pages Functions, or generated `_worker.js` is part of the site build.

`public/_redirects` carries path-level legacy redirects. Host-level canonicalization for HTTP→HTTPS and `www`→apex is handled by Cloudflare DNS and Redirect Rules.

`public/_headers` carries the site-wide security headers and immutable cache policy for `/_astro/*` assets.

## Completed release sequence

1. Migration compatibility was developed and reviewed without changing the canonical production host.
2. Repository-native build and post-build validation passed, including the Cloudflare static-hosting validator.
3. Cloudflare deployment proof passed before DNS cutover.
4. `readdeadair.com` registration was moved from Netlify-managed registration to the owner's direct registrar account.
5. Authoritative nameservers were moved to Cloudflare and the zone became active.
6. The apex hostname was attached to the `dead-air-website` Worker as a Custom Domain.
7. Existing Netlify apex DNS records were removed only when required for the Worker Custom Domain.
8. `www` was moved to a proxied Cloudflare placeholder record and canonicalized to the apex with a permanent Redirect Rule.
9. A separate HTTP→HTTPS Redirect Rule was added so all HTTP/HTTPS × apex/www combinations resolve correctly.
10. Fresh production verification passed on `https://readdeadair.com`, including DA-004 Content Warnings/source-note integrity, canonical metadata, legacy story redirects, RSS, sitemap, newsletter integration, HTTPS handling, `www` canonicalization, and path/query preservation.
11. Netlify continuous builds were stopped and the Git repository was unlinked before repository cleanup work proceeded.
12. Netlify Forms was disabled and obsolete Netlify environment configuration was removed.
13. The Contact page was migrated away from Netlify Forms to the approved public contact address `deadaircasefiles@gmail.com`.
14. Cloudflare preview builds for non-production branches were disabled after the retirement PR's repository validation passed; production builds remain tied to `main`.
15. The former Netlify Lighthouse deployment gate was ported into GitHub validation using the same DA-002 audit path and minimum scores: performance 0.80, accessibility 1.00, best practices 0.90, and SEO 1.00.

## Retirement boundary

Netlify is no longer a production routing, DNS, form-processing, Git-deployment, or release-validation dependency for Dead Air. Historical Netlify references in archived release records remain valid as provenance and should not be rewritten merely to normalize old records.

The former `dead-air-website.netlify.app` hostname is legacy infrastructure only and is not a canonical or promotional URL.

Temporary Cloudflare migration hooks and API credentials must be revoked after cutover and must never be stored in repository history or publishing records.

## Canon / manuscript effect

NONE. The hosting migration and retirement change infrastructure and the public Contact interaction only. They do not alter story manuscripts, canon, continuity, chronology, approved art, paranormal claim ceilings, or publication authorization history.
