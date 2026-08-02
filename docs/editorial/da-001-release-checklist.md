# DA-001 Release Checklist

- [x] Final Approved Story v17 selected as authoritative publication source.
- [x] Source divided into twelve ordered repository fragments.
- [x] Fragment assembly protected by approved SHA-256.
- [x] Secret-chunk preview materializer removed.
- [x] Password-gated preview edge function removed.
- [x] Public release manifest activated for 2026-08-01.
- [x] DA-001 assigned archive position 1 before DA-002.
- [x] GitHub validation passes.
- [x] Netlify normal deploy succeeds.
- [x] Published route visually verified.

## Release evidence

- Approved source SHA-256: `175680113c552fe71b8aea3cdc553755e06909202928cf6675c1a0ab41228aba`.
- Production merge commit: `0722ade15611db4d186ef2c6f05269e325dc45f9`.
- Successful production deploy: Netlify deploy `6a6e66d83ecd5a000811fa16`, published 2026-08-01.
- Live route: `/stories/da-001-the-building-keeps-the-hour/`.
- GitHub visual-proof validation: workflow run `30731408776` on commit `e59b3b92b04eca6506027803dc95ad5280419335`.
- Visual-proof artifact: `da001-visual-proof`, artifact ID `8828096115`, SHA-256 `3c041b66ec3e373ae74cacf6f0af41b3da5bb281ebde16651decd193c2d67aa7`.
- Desktop viewport proof: 1440 × 1200 at the page top, Section 5, Section 10, and footer.
- Mobile viewport proof: Playwright iPhone 13 profile at the page top, Section 5, Section 10, and footer.
- Visual review confirmed readable typography, stable spacing, intact metadata, visible source note, correct numbered-section transitions, content notes, footer, and no horizontal overflow.
- Navigation verification confirmed the story page links to Stories and Timeline, the Stories index links to DA-001, and the timeline places DA-001 at archive position 1 before DA-002 at position 2.
