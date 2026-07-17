# The Dead Air Archive

Production foundation for a static Astro site serving a literary paranormal horror archive.

## Local Development

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:4321` by default.

## Build

```bash
npm run build
```

The static production output is written to `dist/`.

## Netlify Deployment

This repository is configured for the existing Netlify project named `dead-air-website`.

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

If the site is not linked locally yet:

```bash
netlify link --name dead-air-website
```

Then deploy through Netlify's Git integration or with:

```bash
netlify deploy --build
```

## Architecture

- Astro with TypeScript and static output
- Reusable site layout, metadata, navigation, footer, and archive-card components
- Content collections for stories, cases, characters, locations, objects, and mysteries
- RSS feed at `/rss.xml`
- Sitemap generated during build
- Robots policy at `/robots.txt`
- Canonical and Open Graph metadata in the shared layout

## Public Repository Boundaries

Do not commit internal development records, raw transcripts, real participant identities, hidden canon, unpublished continuity data, private research notes, or source interview material to this repository.

The `.gitignore` includes common private-material folder names as a guardrail, but the main protection is editorial discipline: only publish deliberate, public-facing archive text.
