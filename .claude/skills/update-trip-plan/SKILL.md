---
name: update-trip-plan
description: Update the Athurugiriya → Trincomalee group trip itinerary from a natural-language change request — add/remove/reorder/retime a location, meal, or activity; change dates or group size. The site keeps multiple independent, dropdown-selectable plans (src/data/plans/plan-0N/ + docs/plans/plan-0N.md); by default a change request creates a NEW plan rather than overwriting the current one. Re-validates fixed constraints, opening hours, and travel buffers, keeps each plan's markdown doc and JSON data in sync, and rebuilds the site. Use whenever the user asks to change, adjust, tweak, or update the trip plan/itinerary/schedule.
---

# Update Trip Plan

## The multi-plan structure

This site keeps several independent, complete copies of the itinerary,
selectable via a dropdown in the nav (see `src/components/Nav.astro`):

- `src/data/plans/index.json` — the manifest: `[{slug, label, description}]`,
  in display order. This drives the dropdown and the `[plan].astro` route.
- `src/data/plans/plan-0N/*.json` — one self-contained folder per plan
  (`tripInfo.json`, `locations.json`, `day1.json`, `day2.json`, `route.json`,
  `meals.json`, `weather.json`, `risks.json` — same shapes as before).
- `docs/plans/plan-0N.md` — the human-readable source of truth for that plan
  (same structure as the original single-file doc: feasibility analysis,
  locations table, weather, day-by-day itinerary, travel timeline, meals,
  risk & contingency, final recommendation).
- `src/pages/plans/[plan].astro` — one dynamic route that renders **every**
  plan folder automatically via `import.meta.glob`. Adding a plan folder +
  a manifest entry is enough to get it a working page; no new page file
  needed.
- `src/pages/index.astro` — statically imports whichever plan is "current"
  (the highest-numbered slug, labelled `(current)` in the manifest) and
  renders it at `/`.

**Default behavior: every change request creates a new plan.** Don't edit an
existing `plan-0N` folder/doc in place unless the user explicitly says to fix
or correct that specific plan (e.g. "plan 03 has a typo," "redo plan 02's km
figure"). A request like "change X" or "what about Y instead" means: copy the
current plan to the next slug, edit the copy, leave every earlier plan
byte-for-byte untouched. This is deliberate — the user wants to compare
revisions later, not lose them.

## Step 0 — Create the new plan folder (default path)

1. Find the current highest plan slug in `src/data/plans/index.json` (call it
   `plan-0N`); the new one is `plan-0(N+1)`.
2. Copy `src/data/plans/plan-0N/` → `src/data/plans/plan-0(N+1)/` (all 8
   JSON files) and `docs/plans/plan-0N.md` → `docs/plans/plan-0(N+1).md`.
3. Append an entry to `src/data/plans/index.json` for the new slug. Relabel
   the previous "current" entry to drop `(current)` from its label if it had
   one, and add `(current)` to the new entry's label.
4. Update `src/pages/index.astro`'s imports to point at the new plan folder.
5. Make every edit below against the **new** copy only.

If the user explicitly wants to amend a plan in place instead (rare — only
when they're correcting a mistake in a plan rather than changing the trip),
skip this step and edit that plan's folder/doc directly.

## Step 1 — Understand the request against the fixed points

These points are load-bearing for the whole schedule. Restate them to
yourself before editing, and treat them as constraints to protect unless the
user is explicitly asking to change one of them:

- Depart Athurugiriya: 2:00 AM, 26 Aug 2026 (fixed)
- Arrive Verandas, Trincomalee: ≈6:00 PM, 26 Aug 2026 (fixed — do not push later)
- Dinner 26 Aug: at the accommodation (fixed, unless a plan explicitly moves
  it — some plans no longer return to Verandas on Day 2, so check the plan
  you're basing the new one on before assuming this)
- Breakfast 27 Aug: at the accommodation (fixed)
- 27 Aug: full day for sightseeing/return; dinner must happen before the
  final departure toward Athurugiriya
- Arrival back at Athurugiriya: ≈1:15–1:30 AM, 28 Aug (fixed — do not push later)

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
   driving time; look at the existing legs in the plan's `day1.json`/`day2.json`
   for the realistic buffer ratio already used (roughly base time × 1.2–1.4,
   plus a fixed load/unload tax per stop)
10. Bus parking/accessibility for a large vehicle
11. Time for 16 people to get off/on the bus and in/out of the attraction
12. Realistic duration needed at the attraction itself for a group this size
13. The fixed points from Step 1
14. **Geographic clustering** — check straight-line distance between the
    location and its neighbours before assuming a move is expensive or
    cheap. Velgam Vehera and Kanniya turned out to be only ~7–11 km from
    Nilaveli despite being "Day 1" stops in earlier plans — moving them to
    Day 2 cost almost nothing in extra driving. Don't assume the original
    day assignment is the only sensible one; do the distance math.

Do the arithmetic explicitly before proposing a structural change: sum the
minutes an activity/detour needs (visit time + realistic drive time both
ways) and check it against the actual free time in the day, the same way you
would size a budget. Several past requests in this project turned out to be
infeasible as literally stated once summed (e.g. "move Pigeon Island to Day
1" overran the fixed 6:00 PM arrival by hours) — catching that with numbers,
not intuition, is what let this skill offer a working alternative instead of
just building something that doesn't fit.

If a location doesn't realistically fit, say so explicitly and explain why —
mirror the tone of the "Feasibility Analysis" section already in the plan doc
(e.g. how Girihandu Seya was dropped: too far off the natural loop, too
taxing in the heat, thematically redundant with Velgam Vehera). Do not force
a location in just because the user listed it — flag the tradeoff and let
them decide (use AskUserQuestion if there are genuinely a few reasonable
options and the choice affects a fixed point, a safety consideration, or
which activity gets cut).

For any **new** location, verify its exact coordinates before adding it —
check for ambiguous/duplicate map listings (the Kayaking Kantale entry in
every plan's `locations.json` documents exactly this trap: two near-identical
listings a few hundred metres apart). Use web search to confirm; don't guess
coordinates.

## Step 3 — Apply the change to the new plan's doc first

`docs/plans/plan-0(N+1).md` is the source of truth for the new plan. Edit the
relevant table(s) (feasibility, locations, day-by-day itinerary, travel
timeline, meals, weather, risk & contingency, final recommendation) directly.
Recompute every downstream time in the same table — if activity N's end time
moves, activity N+1's start time, travel time, and end time all move too, for
the rest of that day. Update the "why this time" reasoning if the reason
changed (e.g. an activity that used to dodge peak heat but no longer does
needs new reasoning, not the old sentence left dangling).

If the ripple would blow through a fixed point in Step 1, don't silently let
it — either trim time from elsewhere (use the existing contingency priority
order in the plan's Risk & Contingency section as your guide for what to cut
first), find a genuine offset (as with moving Velgam Vehera/Kanniya to free
up room for a longer kayaking session — the minutes freed almost exactly
matched the minutes needed), or surface the conflict to the user instead of
guessing which fixed point they'd rather relax.

## Step 4 — Propagate the same change into the new plan's `src/data/plans/plan-0(N+1)/*.json`

Map the doc sections to files 1:1 and keep field shapes exactly as they are
(the Astro components in `src/components/` read these fields by name — adding
undeclared fields is harmless but silently renaming one breaks rendering with
no build error):

| Doc section | File | Notes |
|---|---|---|
| Hero-level facts (dates, stats) | `tripInfo.json` | `stats[].value` for stop count / round-trip km must match the new plan |
| Locations table | `locations.json` | `id` is referenced elsewhere — never rename an existing `id` without updating every reference; `order` should reflect first-visit sequence for *this* plan (it can differ between plans) |
| Day 1 itinerary table | `day1.json` | One object per timeline row; set `"meal": true` on meal rows, `"locationId"` when the row corresponds to a `locations.json` entry |
| Day 2 itinerary table + return journey | `day2.json` | Same shape, plus the `returnJourney` object |
| Route order (implicit in itinerary) | `route.json` | `day1`/`day2` arrays of location `id`s in chronological visiting order for *this plan* — this draws the map's route line, so it must be re-derived whenever visiting order changes, including repeat visits (e.g. Nilaveli twice) and locations that only appear on one day now |
| Meals section | `meals.json` | Keep `fitsRoute` reasoning in sync with the actual route |
| Weather & sea conditions | `weather.json` | Only touch if dates changed or new research was requested — don't invent forecast numbers |
| Risk & contingency | `risks.json` | Re-evaluate `vulnerablePoints` and `contingencySteps` if the change made the schedule tighter/looser anywhere — a new tight window is a new risk, a removed one should come out |

The `image` field in `locations.json` must point at a file that actually
exists in `public/images/` — check the extension, don't assume `.svg`/`.jpg`;
all plans share the same image pool, so copy the exact `image` values from
the plan you forked rather than re-typing them.

Validate JSON syntax as you go (no trailing commas — this build has failed on
that before). If you're unsure a field is read by a component, grep
`src/components/` for the field name rather than guessing.

## Step 5 — Wire up the manifest and index page

If you haven't already done Step 0:
- Add the new plan to `src/data/plans/index.json` (slug, label, one-line
  description of what changed from the previous plan — this is what shows
  up in the dropdown, so make it specific).
- Move `(current)` in the label from the old top plan to the new one.
- Update `src/pages/index.astro` to import from the new plan's folder.

## Step 6 — Rebuild and smoke-test

No browser is available in this environment, so verify statically:

```sh
npm run build
```

A failed build almost always means invalid JSON or a `locationId`/`id`
mismatch between a plan's `route.json`/`day1.json`/`day2.json` and its own
`locations.json` — plan folders are independent, so don't cross-reference IDs
between two different plans' files.

Then spot-check the output:

```sh
grep -c "New Activity Name" dist/plans/plan-0(N+1)/index.html   # confirm new content landed
grep -c "New Activity Name" dist/plans/plan-0N/index.html       # confirm the OLD plan is untouched (should be 0, or absent)
grep -o 'data-map="[^"]*"' dist/plans/plan-0(N+1)/index.html | grep -o '"id":"[a-z-]*"'  # confirm map ids
```

If the user is available to look at it themselves, mention they can run
`npm run dev` for a live preview — otherwise the grep checks above are the
verification of record.

## Step 7 — Summarize

Tell the user, briefly: what changed, what times shifted as a result, and
whether anything had to be trimmed/dropped to protect a fixed point. If you
made a judgment call on a tradeoff (e.g. which activity absorbed the lost
time), say what you chose and why, the same way the itinerary explains its
own reasoning. Confirm which plan slug the change landed in and that earlier
plans are unaffected.
