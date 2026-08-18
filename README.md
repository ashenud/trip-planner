# Trincomalee Trip Itinerary

A minimal, static, one-page site for the Athurugiriya → Trincomalee group trip
(16 people, Rosa bus, 26–28 August 2026). Built with [Astro](https://astro.build)
in static output mode + Tailwind CSS, with a [Leaflet](https://leafletjs.com)/OpenStreetMap
route map. No backend, no database, no runtime API calls — the built site works
fully offline from any static host.

## Run locally

```sh
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:4321`).

## Build

```sh
npm run build
```

This produces a `dist/` folder containing plain HTML/CSS/JS that can be deployed
as-is to any static host.

```sh
npm run preview   # serve the dist/ build locally to sanity-check it
```

## Deploy

- **Netlify:** connect the repo, set build command `npm run build` and publish
  directory `dist` (or drag-and-drop the `dist/` folder at [app.netlify.com/drop](https://app.netlify.com/drop)).
- **Vercel:** import the repo — Vercel auto-detects Astro; build command
  `npm run build`, output directory `dist`.
- **GitHub Pages:** already wired up via `.github/workflows/deploy.yml` — every
  push to `main` builds the site and deploys it automatically. One-time setup:
  in the repo's **Settings → Pages**, set "Build and deployment" source to
  **GitHub Actions**. The site is served from `https://ashenud.github.io/trip-planner/`,
  so `astro.config.mjs` sets `site`/`base` accordingly — update those two
  values if the repo is ever renamed or moved to a different account.
- **Cloudflare Pages:** connect the repo, build command `npm run build`,
  output directory `dist`.

No environment variables or server config are required for any of the above.

## Multiple plans

The site supports several **named, independent versions of the itinerary** —
a dropdown in the top nav switches between them, and picking an older plan
never affects the others. This exists because trip plans get revised several
times before a trip, and it's useful to keep the history around (and compare)
rather than overwrite each revision.

- `/` and `/plans/plan-03/` — the latest/current plan
- `/plans/plan-01/`, `/plans/plan-02/` — earlier revisions, kept for reference
- `src/data/plans/index.json` — the manifest that drives the dropdown (slug,
  label, one-line description of what changed in that plan)
- `/plans/[plan].astro` — a single dynamic route that renders every plan
  folder under `src/data/plans/` automatically; adding a new plan folder +
  a manifest entry is all a new plan page needs, no new page file required
- `src/pages/index.astro` — statically points at whichever plan folder is
  "current" (currently `plan-03`); update this import when a new plan
  supersedes it

Each plan is a self-contained folder, structured identically:

| File | Contents |
|---|---|
| `src/data/plans/<slug>/tripInfo.json` | Hero title, dates, subtitle, stat tiles |
| `src/data/plans/<slug>/locations.json` | All 8 locations (7 stops + accommodation): coordinates, hours, description, notes |
| `src/data/plans/<slug>/day1.json` | Day 1 timeline items |
| `src/data/plans/<slug>/day2.json` | Day 2 timeline items + return journey |
| `src/data/plans/<slug>/route.json` | Chronological location order used to draw the map's route line |
| `src/data/plans/<slug>/meals.json` | The 4 meal cards |
| `src/data/plans/<slug>/weather.json` | Weather & sea condition summary cards |
| `src/data/plans/<slug>/risks.json` | Risk list + contingency steps |

The human-readable source of truth for each plan is the matching
`docs/plans/plan-0N.md` file — edit that first, then propagate the change
into the JSON folder of the same slug (see
`.claude/skills/update-trip-plan/SKILL.md` for the full process).

**To create a new plan** (e.g. after another round of changes), copy the
current plan's folder (both `src/data/plans/plan-0N/` and
`docs/plans/plan-0N.md`) to the next slug, edit the copy, add an entry to
`src/data/plans/index.json`, and repoint `src/pages/index.astro`'s imports at
the new slug. The old plan folders are untouched, so their pages keep working
exactly as before.

## Trip photos

The locations gallery uses real photos in `public/images/` (originally
seeded with placeholder SVGs, since replaced):

```
public/images/kayaking-kantale.avif
public/images/velgam-vehera.jpg
public/images/kanniya-hot-springs.jpg
public/images/marble-beach.jpg
public/images/koneswaram-temple.jpeg
public/images/nilaveli-beach.jpg
public/images/pigeon-island.jpg
public/images/verandas-accommodation.webp
```

All three plans share this same image pool. To swap a photo:

1. Add your photo to `public/images/`.
2. Update the matching `image` field in **every** `src/data/plans/*/locations.json`
   that references it (each plan has its own copy — see "Multiple plans" above).
3. Rebuild (`npm run build`).

## Out of scope (v1)

No dynamic place search/add, no accounts/comments/RSVPs, no live weather API,
no PDF export, no server or database.
