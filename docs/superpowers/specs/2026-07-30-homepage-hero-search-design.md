# Homepage hero search band

Date: 2026-07-30

A GoodFirms-style search band on the homepage: search field + "Find Firms" button, Category and State dropdowns, popular-subcategory chips, and the four existing stat numbers — all on a dark band that reuses the **footer's** palette.

Single workstream. Touches `src/views/DirectoryHub.jsx` (hero section, lines 260–318) and adds one new component. **No backend or API changes.**

## Decisions taken

| Question | Decision |
|---|---|
| Cities dropdown | **Excluded.** Category + State only. |
| Dark treatment | **A dark band below the light hero**, not a dark hero. Palette taken from the existing footer. |
| Light hero | Becomes a **centered single column** — badge, headline, paragraph, trust chips. |
| Stat numbers | **Move** out of the white cards in the hero's right column into the dark band, values unchanged — including the hardcoded `100% Verified listings`. |
| Band seam | **Flush, full-width.** No inset card, no negative margin. |
| "Cited as a source by ChatGPT/Claude/…" logo band | **Excluded.** |

Putting the dark treatment *below* the hero rather than replacing it removes the navbar-seam problem entirely — the white navbar still meets a white hero.

## Palette — reuse the footer's tokens verbatim

`src/Layout.jsx` line 475 onward already defines a complete dark ramp. Use these exact values; do not introduce new navy or gray shades.

| Token | Value | Use in the band |
|---|---|---|
| background | `linear-gradient(160deg, #0F172A, #070D18)` | the band itself |
| heading | `#F9FAFB` | stat numbers, "Popular" label |
| body | `#9CA3AF` | stat labels, chip text |
| muted | `#6B7280` | helper text |
| accent | `#D4A017` | chip hover, focus rings, emphasis |
| divider | `rgba(255,255,255,0.08)` | rule above the stats row |

The bottom CTA band (`DirectoryHub.jsx` line ~595) already uses that identical gradient, so the page becomes light → dark → light → dark by design rather than by accident. The gold submit button uses `#D4A017` with `#0F172A` text, matching the navbar's "List Your Company" button (`Layout.jsx` lines 309–310) — that pairing is already proven on this site.

## What already exists (reuse, do not rebuild)

- **`/search` page** (`app/search/page.jsx`) — client page reading `?q=`, `?category=`, `?state=` from the URL.
- **`GET /api/search`** (`app/api/search/route.js`) — accepts exactly `q`, `category`, `state`. Returns `[]` unless `q.length >= 2` **or** one filter is set. The hero submits into this contract; it needs no changes.
- **`MANUFACTURING_CATEGORIES`** / `CATEGORY_MAP` (`src/lib/manufacturingCategories.js`) — the 10 category slugs + their `subcategories`.
- **`ALL_US_STATES`** (`src/lib/usStates.js`) — state slugs and names. Note `DirectoryHub` also has a local `US_STATES` array (line 99) used by the state picker; the hero should use the same local array for consistency within the file.
- **`AnimatedCounter`** (`DirectoryHub.jsx` line 223) and **`getHomepageStats`** (line 156) — the stat values and count-up animation already work. Reuse both; only restyle for the dark background.

### Why Cities is excluded

`hq_city` is a free-text column (`src/db/schema.ts:52`) that is only ever *displayed* — on `CompanyCard`, `AgencyCard`, and review forms. It is never queried, aggregated, or slugified. `/api/search` has no city parameter. The route `app/search/[industry]/[country]/[state]/[city]/page.jsx` looks like city support but is a 14-line redirect stub that **discards the city segment** and forwards to `/directory/{industry}`. A Cities dropdown would therefore be either non-functional or built on unnormalised free text. Out of scope by decision; revisit as its own project after the column is cleaned.

## Target

```
┌─ LIGHT HERO — white, centered, max-w ~760px ─────────────────────┐
│                                                                  │
│                  ● USA MANUFACTURER DIRECTORY                    │
│                                                                  │
│                   Find top manufacturers                         │
│                       across the USA                             │
│                                                                  │
│            Browse verified manufacturers across every            │
│            USA state by category. Ranked by real reviews.        │
│                                                                  │
│     ✓ 100% verified   ⛨ Zero paid rankings                       │
│     ★ All 50 USA states   ▣ Free to list                         │
└──────────────────────────────────────────────────────────────────┘
┌─ DARK BAND — footer gradient, flush, full width ─────────────────┐
│                                                                  │
│      ┌──────────────────────────────┬──────────────┐             │
│      │ Try "CNC machining"          │ Find Firms → │             │
│      └──────────────────────────────┴──────────────┘             │
│      [ All Categories ▾ ]   [ All States ▾ ]                     │
│                                                                  │
│      Popular   CNC Machining   Injection Molding                 │
│                Sheet Metal   PCB Assembly   Wire Harnesses       │
│      ─────────────────────────────────────────────────           │
│        15            50            1,011         100%            │
│        Categories    States        Companies     Verified        │
│                                    covered      listed          │
└──────────────────────────────────────────────────────────────────┘
┌─ category cards — white, unchanged ──────────────────────────────┐
```

No browser-mockup image. There is no such asset, and a faked screenshot is not worth building; the centered hero reads closer to the reference without it.

## Design-system note

The project deliberately removed dark/clay surfaces in favour of clean white/gray. This band is a **deliberate exception** — but a contained one: it reuses the footer's existing gradient and text ramp, so it introduces no new tokens, and it does not touch the navbar or the hero. The page already has a dark band at the bottom (the CTA); this makes the dark treatment a repeated, intentional rhythm rather than a one-off.

Reuse the `grid-texture` class the CTA band uses for the same subtle texture.

## Implementation

### 1. New component: `src/components/home/HeroSearch.jsx`

`'use client'`. Owns the search form only — the band's copy, stats, and chips stay in `DirectoryHub` so the hero remains readable in one place.

```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch({ categories, states }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (state) params.set('state', state);
    router.push(params.toString() ? `/search?${params}` : '/search');
  }
  // <form onSubmit={handleSubmit}> … </form>
}
```

Requirements:

- **Real `<form>` with `onSubmit`** — Enter must submit. Do not wire a click handler to a `<div>`.
- **Native `<select>`** for both dropdowns. The two Radix `Select`s in `FilterBar` caused a documented scroll-lock/page-shift bug ([2026-07-30 filter spec](./2026-07-30-filter-apply-icon-parity-state-links-design.md), Workstream 1); native selects have neither problem and give free mobile pickers. Style them like the `selectStyle` object in `app/search/page.jsx` (line 21) but inverted for the dark band: `rgba(255,255,255,0.06)` fill, `rgba(255,255,255,0.14)` border, `#F9FAFB` text.
- **`<option>` needs explicit colors.** Set `color: '#F9FAFB'` **and** `backgroundColor: '#0F172A'` on the options. Options inherit OS-level colors, not the select's — light text on a default white popup is invisible, and this is the single most likely visual bug in this component. Check on both Chrome and Firefox; their option rendering differs.
- **Empty-string values mean "all"** — first `<option value="">All Categories</option>` / `All States`. Omit empty params from the URL entirely.
- `router.push` is correct here (a path change to `/search`, not a search-param-only navigation on the same route — that is the case the `FilterBar` comment warns about).
- Submitting with nothing filled goes to bare `/search`, which renders its empty state. Acceptable; do not disable the button.
- Placeholder: `Try "CNC machining"` — a real subcategory, not "Web developer".
- Label both selects with `aria-label`; the search input needs a visually-hidden `<label>` or `aria-label`. Focus rings must be visible against navy — use `#D4A017`, not the browser default. The gold button (`#D4A017` bg, `#0F172A` text) is the same pairing as the navbar CTA and already passes contrast.

### 2. Hero section in `src/views/DirectoryHub.jsx` (lines 260–318)

Two changes, both structural rather than a restyle.

**a. Light hero → centered single column.** The hero keeps its white background, `grid-texture-dark` overlay, and both radial glows. Remove the `lg:grid-cols-[1.1fr_0.9fr]` grid (line 266) and the entire right-hand stats column (lines 301–314, including the gold blur `absolute -inset-8` div). The left column becomes one centered column: add `text-center`, `mx-auto`, `max-w-[760px]`, and drop the `max-w-lg` / `max-w-md` constraints on the `<h1>` and paragraph (lines 278, 282) since the container now bounds them. Centre the trust-chip row with `justify-center`. Colors, sizes, and copy are unchanged — this hero stays light.

**b. New dark band immediately after the hero's closing `</section>` (line 318).** Full width, flush, no gap. Structure inside a `max-w-[1280px] mx-auto px-6 lg:px-8` container:

1. `<HeroSearch categories={CATEGORIES} states={US_STATES} />` — centered, `max-w-[720px] mx-auto`.
2. Popular chips row (see section 3).
3. A `1px` divider in `rgba(255,255,255,0.08)`.
4. The stats row: `grid grid-cols-2 sm:grid-cols-4`, no cards. Numbers in `#F9FAFB` at ~`text-3xl font-bold tabular-nums` wrapped in the existing `AnimatedCounter`; labels in `#9CA3AF` at `text-xs`.

`getHomepageStats().stats` already returns **exactly the four** entries needed — `Categories`, `States covered`, `Companies listed`, `100% Verified listings`. Use it as-is; no slicing, and do not touch `trustStats`, which the trust section below still consumes.

`AnimatedCounter` (line ~223) handles the `'100%'` string as well as numerics — it is already doing so in the current hero, so it needs no change.

Wire the band to a `useFadeInOnScroll()` ref for consistency with the other sections **only if** the fade does not delay the search field becoming usable. If in doubt, leave the band un-animated — the primary action should not wait on an IntersectionObserver.

### 3. Popular chips

Six to eight chips linking to **subcategory hub pages** — `/{category}/{subcategory}`, which is a real route (`app/[category]/[state]/page.jsx`, subcategory branch at line 180). Real `next/link` anchors, server-rendered, so they add internal links as well as UI.

Pick the slugs by hand from `MANUFACTURING_CATEGORIES[].subcategories`. There is no per-subcategory count in the DB to sort by — `app/[category]/[state]/page.jsx` line 189 documents that no subcategory tagging exists yet, so subcategory pages currently show the *parent category's* companies. Two consequences: (a) the chip list is a hardcoded editorial choice, and (b) a chip labelled "CNC Machining" lands on a page listing all Mechanical Components firms. Acceptable for now, but do not add a "🔥 trending" flame to imply data that does not exist.

Define the list as a module-level `const POPULAR_SUBCATEGORIES = [{ label, href }]` next to `CATEGORIES` so it is editable in one place. Verify every slug resolves to HTTP 200 before shipping — a typo'd subcategory slug renders a 404, not a fallback.

Chip styling on the dark band: `rgba(255,255,255,0.06)` fill, `rgba(255,255,255,0.12)` border, `#9CA3AF` text, `border-radius: 8px`. On hover, text → `#D4A017` and border → `rgba(212,160,23,0.4)` — the same gold hover the footer links use, so the interaction language matches. The "Popular" label sits inline before the chips in `#6B7280` uppercase `text-[11px]`.

### 4. Do not build

- The AI-citation logo band.
- Any "80,000 verified firms / 1.2M reviews / 130 countries" figures from the reference. Use `getHomepageStats`, which reads real counts. The site has ~1,011 companies and 0 verified; inflated numbers on the homepage next to listings showing "0.0 · 0 reviews" is a credibility problem, not a design one.
- A Cities dropdown, per the decision above.

## Verification

1. Enter "CNC" only → `/search?q=CNC`, results render.
2. Pick Category = Mechanical Components only, no text → `/search?category=mechanical-components`, results render (the API accepts a filter with no `q`).
3. Pick Category + State → `/search?category=…&state=…`.
4. Press Enter in the text field → submits (does not reload the homepage).
5. Submit empty → `/search`, empty state, no crash.
6. Every popular chip returns HTTP 200.
7. `curl -s localhost:3000 | grep -c 'Try "CNC machining"'` → confirms the band is server-rendered, not client-only.
8. **Open both dropdowns in Chrome and Firefox** and confirm the option list is readable — this is the most likely defect (see the `<option>` note above).
9. Confirm the dark band's gradient is byte-identical to the footer's and the bottom CTA's: `linear-gradient(160deg, #0F172A, #070D18)`.
10. Confirm the four stat numbers appear **once** on the page — they must be gone from the hero's right column, not duplicated.
11. At 375px: the search field, both selects, and the button stack full-width; the stats row falls to `2×2`; nothing overflows horizontally.

## Risks

- **Design-system exception.** A dark surface on a page the project deliberately made white/gray. Contained: no new tokens, reuses the footer ramp, does not touch the navbar. The earlier risk of a hard navbar/hero seam no longer applies now that the band sits below the light hero.
- **Subcategory chips overpromise.** They link to pages that list the parent category's companies because subcategory tagging does not exist in the DB. Real subcategory filtering is a separate data workstream.
- **Two search entry points.** The homepage band and the `/browse` search box now both exist with different behaviour (`/search` vs client-side filtering of the industries list). Worth unifying later; not in this plan.
- **"100% Verified listings" stays hardcoded — decided.** The stat is a hardcoded `'100%'` in `getHomepageStats`. Carry it into the dark band unchanged. Do not make it dynamic, do not relabel it, do not drop it from the row.
