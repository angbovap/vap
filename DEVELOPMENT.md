# VAP website — developer notes

Static rebuild of valueadvisory.co. Eleventy, no framework. VAP has
no in-house developer, so this stays dependency-light and as much
content as possible lives in plain JSON/markdown rather than in
template code. For a plain-English guide to editing content, see
CONTENT-GUIDE.md.

## Colour

Client requires the existing turquoise. Palette is single-hue,
all derived from the logo colour. Tokens in src/styles/tokens.css.

- `--brand-50` (#DEF4F7) is the page canvas
- `--brand-500` is buttons, links, rules, chart fills only
- Headings are `--ink` (#323232), never turquoise
  (turquoise on brand-50 is ~2.5:1 and fails WCAG)

## Content rules

- All copy comes from real source material supplied by VAP. Never
  invent stats, client names, project names, bios or numbers —
  use a placeholder (e.g. "[no desc]") and flag it instead.
- Contact details and nav live in `src/_data/site.json`.

## Known content issues (raised with client, still open)

- Homepage shows 3 focus areas; What We Do has 4 (the 4th is
  "Digital Decision Support Tools") — not yet resolved.

## Conventions

- Sentence case in nav and headings, not ALL CAPS
- `aria-current` for active nav state, not a filled block
- Mobile nav required
- Prefer data-driven loops (JSON in `src/_data/`, or frontmatter
  arrays like the `blocks:`/`sections:` pattern used on What We Do
  and case-study pages) over hardcoding repeated content directly
  in template markup — it's what lets non-technical editors change
  copy without touching HTML.
- Windows is case-insensitive for filenames, Netlify's Linux build
  host is not — always use lowercase image filenames matching
  exactly what templates reference.
