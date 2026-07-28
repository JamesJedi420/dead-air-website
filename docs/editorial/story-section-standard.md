# Published Story Section Standard

Status: approved

Effective date: July 27, 2026

## Public convention

Published story divisions use semantic level-two headings in this form:

```markdown
## 1. Terms of Return
```

The convention is:

- Arabic numerals.
- A period after the numeral.
- One space before the section title.
- Sequential numbering beginning with `1`.
- Descriptive titles that function as reading and accessibility landmarks.

Literal labels such as `Scene 1 —`, `Chapter 1 —`, or Roman-numeral divisions are not part of the public house style.

A deliberately continuous short work may omit section headings. When a story uses public divisions, every level-two narrative heading must follow the numbered convention.

## Production convention

Internal outlines, drafts, and editorial discussions may continue to call structural units scenes. Publication transforms remove that production terminology before rendering the reader-facing story.

## Enforcement

`scripts/validate-story-section-headings.mjs` checks every published story Markdown entry before development, preview, and production builds. It rejects nonsequential or nonconforming level-two headings.

Story-specific exceptions require deliberate editorial approval and a corresponding validation change before publication.
