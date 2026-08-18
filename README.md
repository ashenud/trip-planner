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
- **GitHub Pages:** run `npm run build`, then publish the contents of `dist/`
  to the `gh-pages` branch (e.g. via the `peaceiris/actions-gh-pages` GitHub
  Action, or `npx gh-pages -d dist`). If the site is served from a subpath
  (`username.github.io/repo-name`), set `base: '/repo-name'` in `astro.config.mjs`.
- **Cloudflare Pages:** connect the repo, build command `npm run build`,
  output directory `dist`.

No environment variables or server config are required for any of the above.

## Editing the itinerary

All trip content lives in `src/data/*.json`, not hardcoded in the page markup —
edit these directly and rebuild:

| File | Contents |
|---|---|
| `src/data/tripInfo.json` | Hero title, dates, subtitle, stat tiles |
| `src/data/locations.json` | All 8 locations (7 stops + accommodation): coordinates, hours, description, notes |
| `src/data/day1.json` | Day 1 timeline items |
| `src/data/day2.json` | Day 2 timeline items + return journey |
| `src/data/route.json` | Chronological location order used to draw the map's route line |
| `src/data/meals.json` | The 4 meal cards |
| `src/data/weather.json` | Weather & sea condition summary cards |
| `src/data/risks.json` | Risk list + contingency steps |

Source of truth for all of the above is `docs/trip-itinerary.md`.

## Adding real trip photos

The locations gallery currently uses clearly-labelled placeholder images
(generated SVGs) at:

```
public/images/kayaking-kantale.svg
public/images/velgam-vehera.svg
public/images/kanniya-hot-springs.svg
public/images/marble-beach.svg
public/images/koneswaram-temple.svg
public/images/nilaveli-beach.svg
public/images/pigeon-island.svg
public/images/verandas-accommodation.svg
```

To drop in real photos after the trip:

1. Add your photo to `public/images/`, e.g. `marble-beach.jpg`.
2. Update the matching `image` field in `src/data/locations.json` to point at
   the new file (e.g. `"/images/marble-beach.jpg"`).
3. Rebuild (`npm run build`).

## Out of scope (v1)

No dynamic place search/add, no accounts/comments/RSVPs, no live weather API,
no PDF export, no server or database.
