# Goodfirms-Style Listing Page Redesign — Design Spec

**Date:** 2026-07-27
**Branch:** `feature/goodfirms-style-listing-redesign` (create from `main`)
**Files touched primarily:** `app/[category]/[state]/page.jsx`, `src/components/listing/CompanyCard.jsx`, `src/components/listing/FilterSidebar.jsx` (replaced by new top filter bar), `src/db/neonApi.js`, `src/Layout.jsx`

## Context

Competitive reference: goodfirms.co. The user wants FirmsLedger's category/state listing pages (`/[category]` and `/[category]/[state]`) to adopt several Goodfirms UX patterns, using **only real FirmsLedger data** — no AI-fabricated stats, no external "trusted source" copy we can't back up. This spec supersedes/extends the existing `2026-07-24-filter-sidebar-and-cards-design.md` work (which shipped the current right-side `FilterSidebar` + `CompanyCard`) with a further redesign pass.

## Goals

1. Fix a janky/stuck mobile scroll bug on the listing page.
2. Introduce a dark navy stats/intro strip (reusing the existing `#0B0F17`/`#0F172A` + gold `#D4A017` palette already used in the footer — no new colors invented).
3. Rework the footer for tighter alignment with the rest of the page, matching Goodfirms' cleaner column alignment.
4. Add a dynamic, per-category(+state) intro paragraph and stat tiles computed live from FirmsLedger's own Neon database (verified count, rating, coverage) — explicitly **no** median-hourly-rate stat (no such field exists; not fabricated).
5. Build a bigger, more spacious, reusable `CompanyCard` component (usable elsewhere on the site later) with a "Visit Website" button that opens the company's real external site.
6. Add a real "Why Trust FirmsLedger" section with honest, defensible differentiators (no invented numbers).
7. Replace the right-side vertical filter sidebar with a horizontal filter bar above the results, Goodfirms-style.
8. Fix page-level content alignment (footer vs. page container width mismatch).
9. Make SEO `<title>`/`<meta description>` per category+state page fully dynamic from real data (extends the already-dynamic `generateMetadata`, doesn't replace it).

## Non-goals

- Migrating `app/Directory/[[...slug]]/page.jsx` (legacy Supabase page) — out of scope, separate migration effort.
- Any hourly-rate/pricing stat — we have no pricing data field; skip entirely rather than fabricate.
- AI-generated marketing copy for the "Why Trust" section — copy must describe real, verifiable platform behavior only.
- Rebuilding pagination logic (`paginationRange` in `page.jsx`) — only the metadata driven by page number is affected, not the pagination UI/logic itself.
- Rewriting `Directory.jsx`/`AgencyCard.jsx` to use the new `CompanyCard` — this spec makes `CompanyCard` reusable (generic props, no page-specific coupling) but does not perform that migration now.

## 1. Mobile scroll bug

**Root cause investigation (do this first, before any visual change):** `src/Layout.jsx` header is `position: sticky` with `backdropFilter` and toggles `browseOpen`/`scrolled` state on a passive `scroll` listener that calls `setBrowseOpen(false)` + `setScrolled(...)` on *every* scroll event — this re-renders the header on every scroll tick. Combined with `<main style={{ overflowX: 'hidden' }}>`, a wide inner element (e.g. the horizontal-scrolling stats/pagination row, or the current fixed `width: 264` sidebar) can force reflow on that same re-render cycle, producing jank on lower-end mobile devices.

**Fix approach:**
- Throttle/debounce the scroll handler (e.g. only call `setScrolled` when the boolean actually changes — it already does via `window.scrollY > 8` comparison, but confirm `setBrowseOpen(false)` isn't firing a state update every tick when already `false`; guard with `if (browseOpen) setBrowseOpen(false)`).
- Audit `app/[category]/[state]/page.jsx` for any element wider than viewport on mobile (the `width: 264` sidebar under the `.listing-sidebar { width: 100% !important }` mobile override, and the new horizontal filter bar from section 7 — must use `overflow-x: auto` with `-webkit-overflow-scrolling: touch` if its content can't wrap, not a fixed width that clips).
- Verify via actual mobile-width (375px) browser testing (Chrome DevTools device toolbar) that scroll is smooth before/after — this is a perf/jank bug, not something a unit test catches.

## 2. Color palette

No new palette. Reuse:
- `#0B0F17` — darkest navy (existing footer background) for the new stats strip and "Why Trust" band.
- `#0F172A` — secondary navy (existing rank-badge/nav-active color).
- `#D4A017` — existing gold accent, used for stat numbers (IBM Plex Mono, matching homepage stats band convention already in memory) and CTA elements.
- White/slate text scale already used in `Layout.jsx` footer (`#F9FAFB` headings, `#9CA3AF` body, `#6B7280` muted).

## 3. Footer alignment fix

Audit `src/Layout.jsx` footer container (`maxWidth: 'var(--max-width)'`, `padding: '72px 24px 48px'`) against the page content wrapper in `app/[category]/[state]/page.jsx` (find its `maxWidth`/padding values). If they differ (e.g. page uses a different `--max-width` override or extra horizontal padding), align both to the same `--max-width` CSS variable and horizontal padding so the footer's left/right edges line up with the page content above it, page after page. Fix in place — no new variables invented, reuse the existing `--max-width` custom property.

## 4. Dynamic stats + intro (data layer)

### `fetchCategoryStats(categorySlug, stateSlug?)` — new function in `src/db/neonApi.js`

Returns, computed live from real rows (reusing the existing category/state resolution helper already factored out for `fetchCompaniesByCategoryAndState`/`fetchStateCountsForCategory`):

```js
{
  verifiedCount: number,       // count(*) where is_verified = true, scoped to category (+state if given)
  totalCount: number,          // count(*) scoped to category (+state if given)
  medianRating: number | null, // median of avg_rating across scoped companies with avg_rating > 0; null if none
  statesCovered: number,       // distinct hq_state_id count, scoped to category (nationwide only; omit/skip on state pages — state is fixed)
  topSpecialties: string[],    // up to 3 most-common values from certifications[] across scoped companies; [] if none present
}
```

- No hourly-rate field — deliberately absent from this return shape (goal 4/non-goal 2).
- `medianRating`: compute in JS (sort scoped ratings, take middle value) — same pattern as `parseEmployeeCount`'s in-JS post-processing already established in the prior filter spec; not pushed into SQL.
- If `totalCount === 0`, the intro/stats block renders a neutral "Be the first to get listed" state (reusing existing empty-state copy pattern) rather than a stats strip with zeros.

### Intro paragraph

Server-rendered string built from the above (category name, `totalCount`, `verifiedCount`, `statesCovered` on nationwide pages, `topSpecialties` when non-empty) — template text, not fabricated numbers. Same string (or a metadata-appropriate trim of it) feeds `generateMetadata`'s `description` (see section 9).

## 5. `CompanyCard` — enlarged, reusable

Extend the existing `src/components/listing/CompanyCard.jsx` (already at `p-7`, 64px logo, 3-line clamp per the prior spec) rather than rewriting from scratch:

- **Props stay generic** — `{ company, rank }` unchanged, so the component has no page-specific coupling and can be dropped into another listing page later without modification (reusability goal, no actual migration in this pass).
- **New: "Visit Website" button** — rendered only when `company.website` is present. Separate `<a>` (not the outer `Link`), `href={company.website}`, `target="_blank"`, `rel="noopener noreferrer"`, `onClick={(e) => e.stopPropagation()}` so it doesn't also trigger the card's internal `/company/[slug]` navigation. Styled as a filled dark-navy button (`bg-[#0F172A] text-white`), matching Goodfirms' black "Visit Website" button, positioned top-right of the card like the reference screenshots.
- **New: specialty/why-choose-them row** — up to 3 short bullet-style tags rendered only when `company.certifications` (or equivalent existing real field) is non-empty; omitted entirely otherwise (no placeholder/fabricated bullets).
- Card overall padding/spacing increases slightly further for Goodfirms density (target ~`p-8`, logo up to 72px) — exact pixel tuning done during implementation against the screenshots, not prescribed to the pixel here.
- Everything else (rank badge, verified badge, rating row, location row, description clamp) unchanged from the existing component.

## 6. "Why Trust FirmsLedger" section

New section (new component, e.g. `src/components/listing/WhyTrustSection.jsx`), dark navy band (`#0B0F17`) placed after the results list (mirrors Goodfirms' placement after pagination). Static copy — real, verifiable claims only, e.g.:

- "Verified Company Badges" — companies marked `is_verified` in our own system (real field, not a claim about external vetting we don't do).
- "No Pay-for-Rank" — sponsored/ranking policy statement (verify this is actually true of FirmsLedger's current ranking logic before writing it — if `orderKey` ranking can be influenced by any paid flag today, this claim must be adjusted or dropped).
- "All 50 States Covered" / " growing directory" — phrase using the live `statesCovered`/`totalCount` figures from section 4 rather than a hardcoded number, so it can't drift out of date.

Exact wording finalized during implementation, but every claim must map to something checkable in the current codebase/DB — no goodfirms-style "80,000 verified firms" style numbers we don't have.

## 7. Filter bar (top, horizontal)

Replace the right-side `<aside><FilterSidebar/></aside>` block in both branches of `app/[category]/[state]/page.jsx` with a horizontal bar rendered above the results grid.

- New component `src/components/listing/FilterBar.jsx` (client component, `'use client'`), replacing `FilterSidebar.jsx`'s render surface but **reusing its existing state/query logic** (`parseFilterParams`, `buildFilterQueryString`, the toggle/navigate functions, `EMPLOYEE_BUCKETS`) — only the layout shell changes, not the underlying filter mechanics or URL scheme (`?states=`, `?employees=` params unchanged, still composable with `?page=`).
- Layout: row of dropdowns — "State" (nationwide pages only, checkbox multi-select popover, reusing `stateCounts`), "Employees" (checkbox multi-select popover, reusing `EMPLOYEE_BUCKETS`), "Subcategory" (existing `Select`, moved from sidebar), plus an "Apply"/"Show results" button (reusing existing `handleShowResults` pending-state pattern) and a "Clear filters" text link when active.
- Responsive: on mobile, bar becomes horizontally scrollable (`overflow-x: auto`) rather than wrapping into a tall stack — ties into the section 1 scroll-jank fix; must not itself introduce new horizontal page overflow.
- Once the filter bar ships, the `<aside>` wrapper is removed from `page.jsx` and the results column becomes full-width, giving the enlarged `CompanyCard` more room (supports goal 5).
- Existing "Other Categories" list and CTA block that lived in the old sidebar move to below the results (or a compact rail) — not deleted, just relocated since the sidebar itself goes away.

## 8. SEO metadata — dynamic per category+state

Extend the existing `generateMetadata` in `app/[category]/[state]/page.jsx` (already dynamic for subcategory-hub vs. state-listing vs. pagination) to pull the real numbers from `fetchCategoryStats` (section 4) into the `description` field, e.g.:

> "Browse {verifiedCount} verified {categoryName} manufacturers in {stateName}. Compare ratings, reviews, and company details on FirmsLedger."

Falls back to the current static-template description when `fetchCategoryStats` returns `totalCount === 0` (avoids a metadata description claiming "0 verified companies" reads oddly — use the existing neutral phrasing already in the function for that case).

## Testing plan

- `npx next lint` — 0 errors (existing project convention).
- Manual mobile-width (375px) scroll test before/after the section 1 fix — confirm no stutter/jank on `/electrical-components` and `/electrical-components/california`.
- Manual Playwright/browser screenshot pass comparing new layout against the goodfirms reference screenshots at both breakpoints (desktop ~1280px, mobile 375px): filter bar renders top, cards enlarged with working "Visit Website" (opens correct external URL, doesn't trigger internal navigation), stats strip shows real (non-zero, or correctly-empty) numbers, "Why Trust" band renders, footer aligns with page content edges.
- Spot-check `fetchCategoryStats` against a category with zero companies and one with several, confirming `medianRating`/`topSpecialties` degrade gracefully (no `NaN`/`undefined` rendered).
- Confirm existing filter URL params (`?states=`, `?employees=`, `?page=`) still compose correctly through the new `FilterBar` (manually toggle a filter, verify URL and result set update, same as the prior spec's testing plan).
