---
name: update-trip-plan
description: Update the Athurugiriya → Trincomalee group trip itinerary (docs/trip-itinerary.md and src/data/*.json) from a natural-language change request — add/remove/reorder/retime a location, meal, or activity; change dates or group size. Re-validates fixed constraints, opening hours, and travel buffers, keeps the markdown doc and JSON data files in sync, and rebuilds the site. Use whenever the user asks to change, adjust, tweak, or update the trip plan/itinerary/schedule.
---

# Update Trip Plan

This project renders `docs/trip-itinerary.md` into a static site via
`src/data/*.json`. Both the doc and the JSON are hand-maintained, human-facing
artifacts — not a build output of each other — so **every plan change must be
applied to both, consistently**, or they will silently drift apart.

The itinerary was originally produced against a strict planning brief (see
"Original planning criteria" below). Treat every edit request — even a small
one like "push lunch back 30 minutes" — as a mini re-run of that brief for the
part of the plan it touches, not a blind find-and-replace. A time change on
one line moves every line after it.

## Step 1 — Understand the request against the fixed points

These points are load-bearing for the whole schedule. Restate them to
yourself before editing, and treat them as constraints to protect unless the
user is explicitly asking to change one of them:

- Depart Athurugiriya: 2:00 AM, 26 Aug 2026 (fixed)
- Arrive Verandas, Trincomalee: ≈6:00 PM, 26 Aug 2026 (fixed — do not push later)
- Dinner 26 Aug: at the accommodation (fixed)
- Breakfast 27 Aug: at the accommodation (fixed)
- 27 Aug: full day for sightseeing, dinner must happen before departure
- Depart Verandas for the return leg: 27 Aug evening, sized so that arrival
  back at Athurugiriya is ≈1:30 AM, 28 Aug (fixed — do not push later)

If the requested change is small and local (e.g. retime one activity, tweak
one duration, edit one note), you don't need to re-litigate the whole day —
but you must still ripple the change forward (Step 3) and re-check it doesn't
break a fixed point above.

If the request adds, removes, or reorders a location, or changes a date/group
size, re-run the full feasibility judgment in Step 2.

## Step 2 — Re-run feasibility for structural changes

Only needed when adding/removing/reordering a location, changing the date, or
changing group size — skip straight to Step 3 for pure retiming edits.

Original optimization criteria (apply these, don't just slot the location in
at the first free gap):

1. Opening/closing hours of the place itself
2. Sunrise/sunset — Trincomalee in late Aug: sunrise ≈5:56–5:58 AM, sunset
   ≈6:14–6:21 PM (re-check via web search if the date changes)
3. Best time of day for that specific activity (e.g. kayaking and Pigeon
   Island want the cool, calm morning window; beaches want softer
   afternoon/evening light, not peak midday heat)
4. Sea/tide conditions for any beach or boat activity (season window,
   May–Sept calm stretch for the east coast, re-verify if the date changes)
5. Weather forecast for the actual trip dates (re-search if dates change —
   the current forecast in `weather.json` was researched for 26–28 Aug 2026
   specifically and goes stale for other dates)
6. Typical crowd levels at that time of day
7. Photography/scenery lighting
8. Heat and outdoor comfort (Trincomalee highs ~34–35°C in Aug)
9. Rosa-bus travel time for 16 people — always padded above raw Google Maps
   driving time; look at the existing legs in `day1.json`/`day2.json` for the
   realistic buffer ratio already used (roughly base time × 1.2–1.4, plus a
   fixed load/unload tax per stop)
10. Bus parking/accessibility for a large vehicle
11. Time for 16 people to get off/on the bus and in/out of the attraction
12. Realistic duration needed at the attraction itself for a group this size
13. The fixed points from Step 1

If a location doesn't realistically fit, say so explicitly and explain why —
mirror the tone of the "Feasibility Analysis" section already in
`docs/trip-itinerary.md` (e.g. how Girihandu Seya was dropped: too far off
the natural loop, too taxing in the heat, thematically redundant with Velgam
Vehera). Do not force a location in just because the user listed it — flag
the tradeoff and let them decide.

For any **new** location, verify its exact coordinates before adding it —
check for ambiguous/duplicate map listings (the existing Kayaking Kantale
entry in `locations.json` documents exactly this trap: two near-identical
listings a few hundred metres apart). Use web search to confirm; don't guess
coordinates.

## Step 3 — Apply the change to `docs/trip-itinerary.md` first

This file is the single source of truth. Edit the relevant table(s)
(feasibility, locations, day-by-day itinerary, travel timeline, meals,
weather, risk & contingency, final recommendation) directly. Recompute every
downstream time in the same table — if activity N's end time moves, activity
N+1's start time, travel time, and end time all move too, for the rest of
that day. Update the "why this time" reasoning if the reason changed (e.g. an
activity that used to dodge peak heat but no longer does needs new reasoning,
not the old sentence left dangling).

If the ripple would blow through a fixed point in Step 1, don't silently let
it — either trim time from elsewhere (use the existing contingency priority
order in the Risk & Contingency section as your guide for what to cut first:
Kanniya first, then Marble Beach, protecting Koneswaram's close time and the
6:00 PM arrival above both; on Day 2, protect the 6:00 PM departure above the
afternoon rest block), or surface the conflict to the user instead of
guessing which fixed point they'd rather relax.

## Step 4 — Propagate the same change into `src/data/*.json`

Map the doc sections to files 1:1 and keep field shapes exactly as they are
(the Astro components in `src/components/` read these fields by name — adding
undeclared fields is harmless but silently renaming one breaks rendering with
no build error):

| Doc section | File | Notes |
|---|---|---|
| Hero-level facts (dates, stats) | `tripInfo.json` | `stats[].value` for stop count / round-trip km must match the new plan |
| Locations table | `locations.json` | `id` is referenced elsewhere — never rename an existing `id` without updating every reference; `order` should reflect first-visit sequence |
| Day 1 itinerary table | `day1.json` | One object per timeline row; set `"meal": true` on meal rows, `"locationId"` when the row corresponds to a `locations.json` entry |
| Day 2 itinerary table + return journey | `day2.json` | Same shape, plus the `returnJourney` object |
| Route order (implicit in itinerary) | `route.json` | `day1`/`day2` arrays of location `id`s in chronological visiting order — this draws the map's route line, so it must be re-derived whenever visiting order changes, including repeat visits (e.g. Nilaveli twice) |
| Meals section | `meals.json` | Keep `fitsRoute` reasoning in sync with the actual route |
| Weather & sea conditions | `weather.json` | Only touch if dates changed or new research was requested — don't invent forecast numbers |
| Risk & contingency | `risks.json` | Re-evaluate `vulnerablePoints` and `contingencySteps` if the change made the schedule tighter/looser anywhere — a new tight window is a new risk, a removed one should come out |

Validate JSON syntax as you go (no trailing commas — this build has failed on
that before). If you're unsure a field is read by a component, grep
`src/components/` for the field name rather than guessing.

## Step 5 — Rebuild and smoke-test

No browser is available in this environment, so verify statically:

```sh
npm run build
```

A failed build almost always means invalid JSON or a `locationId`/`id`
mismatch between `route.json`/`day1.json`/`day2.json` and `locations.json`.

Then spot-check the output:

```sh
grep -c "New Activity Name" dist/index.html   # confirm new content landed
grep -o 'data-map="[^"]*"' dist/index.html | grep -o '"id":"[a-z-]*"'  # confirm map ids
```

If the user is available to look at it themselves, mention they can run
`npm run dev` for a live preview — otherwise the grep checks above are the
verification of record.

## Step 6 — Summarize

Tell the user, briefly: what changed, what times shifted as a result, and
whether anything had to be trimmed/dropped to protect a fixed point. If you
made a judgment call on a tradeoff (e.g. which activity absorbed the lost
time), say what you chose and why, the same way the original itinerary
explains its own reasoning.
