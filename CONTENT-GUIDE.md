# Editing this website

This site is built so that almost everything you'll ever want to
change — team bios, case studies, contact details, page text — lives
in plain files you can open and edit directly, without touching any
code. This guide points you to the right file for each job.

**The golden rule:** only change the *text* between quote marks or
after a colon. Never delete or rearrange the punctuation around it
(quote marks `"`, colons `:`, commas `,`, curly braces `{ }`, square
brackets `[ ]`, dashes `-`). If a file stops working after an edit,
it's almost always a missing or extra character like that — undo
your change and try again more carefully, or ask a developer.

All the files below live under the `src` folder. Open them in any
plain text editor (Notepad, VS Code, etc.) — not Word, which adds
formatting that breaks these files.

## Quick reference: where things live

| What you want to change | File |
| --- | --- |
| Phone, email, office address, footer, nav menu | `src/_data/site.json` |
| Core team members (photos, bios, qualifications) | `src/_data/team.json` |
| Associates | `src/_data/associates.json` |
| Publications page and the Resilience page's publications carousel | `src/_data/publications.json` |
| Collaboration partners | `src/_data/partners.json` |
| Client testimonials (homepage quote carousel) | `src/_data/testimonials.json` |
| Homepage client logos ("Trusted by...") | `src/_data/trustedLogos.json` |
| Homepage "What we do" section: the three area rows, their text and photos | `src/_data/focusAreas.json` |
| "Our services" section: services list (homepage and What we do page), clients list and the "Underpinned by..." line (homepage) | `src/_data/capabilities.json` |
| Homepage "Our values" four tiles | `src/_data/values.json` |
| Client logos shown per region on the homepage map | `src/_data/areaClients.json` |
| Map pins and project counts per region | `src/_data/projectMap.json` — each region's `totalCount` sets the number shown on its pin and in the sidebar list; the `projects` array underneath is only the named selection shown in that list, so the two numbers don't have to match |
| Case studies (Our Work pages) | `src/our-work/*.md`, one file per project |
| What We Do pages (Resilience, Precincts, Infrastructure) | `src/what-we-do/*.njk` |
| Team member's individual bio page layout | `src/our-team/profile.njk` (layout only — the actual bio text comes from `team.json`) |

## JSON files (the `src/_data/*.json` ones)

These hold structured lists — team members, associates, logos, and
so on. Each entry is wrapped in `{ }` and separated by commas. A
typical team member entry looks like this:

```json
{
  "slug": "jane-smith",
  "name": "Jane Smith",
  "role": "Director",
  "phone": "+61 400 000 000",
  "email": "jane.smith@valueadvisory.co",
  "qualifications": ["Bachelor of Commerce"],
  "expertise": ["Stakeholder Engagement", "Business Case Development"],
  "image": "/assets/img/team/jane.avif"
}
```

To edit an existing person: change the text after the field name and
colon (e.g. change `"role": "Director"` to `"role": "Senior Director"`).
To add a new person: copy an existing `{ ... }` block, paste it as a
new entry, and edit the copy — just make sure every entry except the
last one ends with a comma `,` before the next `{`.

**Adding a photo:** put the image file in `src/assets/img/team/`
(lowercase filename, no spaces — use hyphens, e.g. `jane-smith.jpg`),
then set `"image"` to `/assets/img/team/jane-smith.jpg`. If you leave
`"image"` out entirely, the site shows a plain circle with the
person's first initial instead — that's fine as a placeholder.

**Associates without a bio yet:** in `associates.json`, leave
`"description": ""` empty. The site automatically shows just their
name in the list until you fill it in — no other changes needed.

**Associate tenure:** the `"experience"` field is meant to show how long
that person has worked with VAP specifically (not general industry
experience). It's currently set to a placeholder, `"X years working
with VAP"`, for everyone — shown on the site in italic teal so it's
obviously not real yet. Replace the `X` with the real number for each
person as you get it; the placeholder styling drops away automatically
once the text no longer contains "X years".

**Associate service offerings:** an associate entry can also have a
`"services"` list, shown as a grouped "Services" section under their
bio (see Rob Zeidaks for an example — each group has a `"title"` and a
list of `"items"`). This is optional; leave it out for anyone without
one.

**Associate expertise tags:** deliberately kept to VAP's own service
list — the same 16 items as `"whatWeDo"` in `capabilities.json` (the
"Our services" section on the homepage and What We Do page), e.g.
`"Enabling Resilience Investment"` or `"Precinct Planning and Growth
Assessments"` — so an associate's tags read as VAP's own services, not
a separate set of skills. Use one or two of those exact strings per
person in the `"expertise"` list. Note: an associate's `"org"` name and
`"url"` are still stored in the data but are not shown on the card, so
the page reads as VAP's own specialists rather than pointing to a
separate business.

**Publications (`src/_data/publications.json`):** each entry needs a
`"type"` (`"presentation"` or `"report"`), a `"year"` (a number, e.g.
`2025`), and a `"sortDate"` in `YYYY-MM-DD` form — the site uses these
to group entries by year and order them newest first. Add
`"featured": true` to exactly one entry to make it the large spotlight
card at the top of the Publications page. The rest of the fields
(title, date, links and so on) follow the existing entries.

**Book a meeting (blue button in the top navbar, every page):** out of the
box, the button opens a Google Calendar invite with the person named under
`"bookingHost"` in `src/_data/site.json` (currently John Marinopoulos)
already added as a guest — this only lets a visitor propose a time, it
can't show whether that time is actually free. To have the button open a
real booking page showing John's live availability instead, create an
"appointment schedule" in Google Calendar (under John's own account),
copy its booking page link, and paste it into `"bookingEmbedUrl"` in
`src/_data/site.json`. Leave it as `""` to keep the simple invite button.

## Case studies (`src/our-work/*.md`)

Each case study is one file, e.g.
`src/our-work/gawler-river-flood-management.md`. At the top, between
two `---` lines, is a block of fields (client name, summary, image,
etc.) — edit those directly. Below the second `---` there's usually
one short technical line that inserts an image; leave that alone.

**To add a brand new case study:** copy an existing `.md` file,
rename it (the filename becomes the page's web address, so use
lowercase words separated by hyphens), and edit the fields at the
top. Give it a unique `order:` number — the site uses this to decide
which order case studies appear in, and the homepage's "Selected
work" section automatically shows the 4 lowest `order` numbers, so
you don't need to update the homepage separately.

**Case studies with photos only:** a case study doesn't need written sections. The
Cockatoo Island and 12 Apostles pages show only a short summary and a
photo gallery — copy either file as a starting point, and add `client:`,
`lifecycle:`, `duration:`, `scope:` and `sections:` whenever the details are
ready (see the older case studies for how).

**Homepage "Selected work":** it shows up to three regional projects on the
left and three city projects on the right, paired row by row in
`order` sequence. Each case study needs a `setting:` field near the top,
either `setting: regional` or `setting: city`, to say which column it
belongs in.

## What We Do pages (`src/what-we-do/*.njk`)

These pages are built from a list of content "blocks" (hero image,
stats, benefits, publications, etc.) at the top of the file. You can
edit the text inside each block directly. Don't change the `type:`
line on a block — that tells the site which layout to use — but
everything else (headings, body text, figures, links) is safe to
edit.

## What NOT to touch

- Anything under `src/_includes/`, `src/styles/`, or `src/scripts/`
  — this is the site's code and design system, not content.
- The short `{% ... %}` snippets that occasionally appear in content
  files — these pull in images or shared page elements.
- `src/our-work/our-work.json` — this is a settings file, not a
  case study (despite living in the same folder).

If you're ever unsure whether something is safe to edit, ask a
developer before changing it — most content mistakes are easy to
fix, but it's much faster to check first.

## Content rules to keep in mind

- Only use real information — never invent client names, figures,
  project details or bios. If something isn't ready yet, leave the
  field blank or write a short placeholder rather than guessing.
- Write headings and navigation labels in sentence case ("Our
  approach"), not ALL CAPS.
