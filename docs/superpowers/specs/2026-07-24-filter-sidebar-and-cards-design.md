# Filter Sidebar + Enlarged Company Cards — Design Spec

**Date:** 2026-07-24
**Branch:** `feature/filter-sidebar-and-cards`
**File touched primarily:** `app/[category]/[state]/page.jsx` (both branches: subcategory-hub and state-listing/nationwide)

## Context

Competitive analysis against ensun.io identified the biggest functional gap for FirmsLedger's category listing pages: no filter sidebar (only static nav links) and thin, compact company cards missing employee-count and full descriptions. This spec covers the highest-priority fix: a real filter sidebar (state + employee count) and enlarged, richer company cards — built with real data only (no AI summaries, reference logos, or bookmarking, since we have neither the data nor backend for those).

## Goals

1. Let users filter the nationwide category listing (`/[category]`) by **state** (multi-select, with result counts) and **employee count** (range buckets), on both the nationwide and state-specific (`/[category]/[state]`) pages.
2. Enlarge the company card and add an employee-count field, matching ensun's card density more closely, using only fields that exist in our schema.
3. Keep filter state in the URL (shareable, crawlable, works without client JS for the initial render) and composable with existing `?page=` pagination.
4. Do this using shadcn/ui + Tailwind for the new pieces, following this repo's `.agents/skills/shadcn`, `.agents/skills/vercel-react-best-practices`, and `.agents/skills/web-design-guidelines` conventions — without rewriting the rest of the (currently inline-styled) page in this pass.

## Non-goals (explicitly out of scope for this spec)

- Full-page rewrite of `app/[category]/[state]/page.jsx` from inline styles to Tailwind — only the new `CompanyCard` and `FilterSidebar` pieces get built with Tailwind/shadcn; the header, breadcrumb, pagination, and other existing sidebar widgets are untouched.
- Sub-category filtering (DB tagging for subcategories isn't populated yet — see HISTORY.md session notes).
- Fixing the `avg_rating`/`review_count` showing 0.0 issue — separate, already-flagged bug, not part of this work.
- AI-generated summaries, reference/client logos, bookmarking, "find employees," "similar companies" — no backing data or backend.
- Live facet recount (employee-range counts adjusting based on selected states, or vice versa) — v1 counts are scoped to category only.

## URL scheme

Filters are query params on both the nationwide (`/[category]`) and state (`/[category]/[state]`) routes:

```
/[category]?states=california,texas&employees=1-10,51-200
/[category]/[state]?employees=51-200
```

- `states`: comma-separated state slugs. **Only present/usable on the nationwide page** — on a state-specific page, state is already fixed by the route segment, so this param is not read there.
- `employees`: comma-separated bucket keys from the fixed set `1-10`, `11-50`, `51-200`, `200+`.
- Composes with the existing `?page=` param. Pagination links must preserve active filter params; filter toggle links must preserve the current page *unless* the filter set changes, in which case page resets to 1 (changing filters while on page 3 with only 1 page of filtered results would otherwise render an empty page).
- Unknown state slugs or bucket keys are silently dropped rather than erroring — matches the existing "unknown state → []" tolerance pattern already in `fetchCompaniesByCategoryAndState`.

## Data layer (`src/db/neonApi.js`)

### `fetchCompaniesByCategoryAndState` — extended signature

```
fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey = '-avg_rating', limit = 200, filters = {})
```

New optional 5th param: `filters = { stateSlugs?: string[], employeeRanges?: string[] }`.

- `stateSlugs` (nationwide page only): when present, adds `inArray(companies.hq_state_id, resolvedStateIds)` to the SQL query conditions, resolved the same way `resolveStateId` already resolves the singular `stateSlug`. If `stateSlug` (singular, route-based) is also passed, both apply (defensive — in practice the state route and `stateSlugs` param are mutually exclusive per the URL scheme above).
- `employeeRanges`: **cannot** be pushed into SQL — `companies.employee_count` is free text (`'11-50'`, `'1,276'`, `'1,569-5,000'`, `'1000+'`), not numeric. Applied entirely inside `fetchCompaniesByCategoryAndState`, as a JS `.filter()` step run on the SQL query's results (already limited to `limit` rows) before the function returns. The page component receives an already-fully-filtered array and just slices it for pagination, same as today — no filtering logic in the page itself. See "Employee bucket parsing" below.

### `parseEmployeeCount(text)` helper (new, in `neonApi.js` or a shared `src/lib/` util)

Extracts the first integer found in the string (stripping commas), returns `null` if no digits found:

- `'11-50'` → `11`
- `'1,276'` → `1276`
- `'1,569-5,000'` → `1569`
- `'1000+'` → `1000`
- `''` / `null` → `null` (company excluded from any employee-range filter match, but still shown when no employee filter is active)

### `bucketFor(n)` helper

Maps the parsed number to one of the 4 buckets using inclusive lower bounds: `1-10` → `[1,10]`, `11-50` → `[11,50]`, `51-200` → `[51,200]`, `200+` → `[201, Infinity)`.

### `fetchStateCountsForCategory(categorySlug)` — new function

Resolves the category's matching company IDs (factor the existing category/subcategory-resolution + `company_categories` join logic out of `fetchCompaniesByCategoryAndState` into a small shared internal helper, reused by both), then groups by `hq_state_id` and counts. Returns `[{ stateSlug, stateLabel, count }]` sorted by count descending. Counts are **not** re-scoped by currently-active filters (category-only) — a documented v1 simplification, not a bug.

## Card design (`src/components/listing/CompanyCard.jsx`, new)

Server-renderable (no `"use client"`), takes `{ company, rank }`, wraps the whole card in `next/link` to `/company/[slug]`, styled with Tailwind + shadcn `Card`/`CardContent`/`Badge`/`Separator`:

- Logo: 64px (up from 52px), same fallback-to-initial pattern as today.
- Rank badge: same top-3 navy/gold treatment, same size.
- Name: `text-lg font-semibold` (up from 15px).
- Verified badge: shadcn `Badge variant="secondary"` with a `CheckCircle` icon (`data-icon="inline-start"` per shadcn icon rule) — replaces the current raw green inline-style span.
- Rating row: existing `StarRow` + numeric rating + review count, unchanged logic, restyled with Tailwind.
- **New: employee-count row** — `Users` icon (lucide) + text, e.g. "11–50 Employees", built from `parseEmployeeCount`/bucket logic so a messy raw value like `'1,569-5,000'` still renders as a clean bucket label ("1,000+ Employees") rather than the raw DB string. Only rendered when `employee_count` is present.
- Location row: unchanged (`MapPin` + city/state).
- Description: increase from 2-line to 3-line clamp (still clamped, not full text — full text at 500 rows deep would blow out card height inconsistently).
- Padding: `p-7` (28px, up from 20px). Gap between logo/rank/details: `gap-5` (up from 16px).
- Hover state: keep existing border/shadow lift, translated to Tailwind (`hover:border-slate-400 hover:shadow-md transition`).

Used identically by both branches of `page.jsx` (subcategory-hub and state-listing), replacing the two near-duplicate inline card blocks.

## Filter sidebar (`src/components/listing/FilterSidebar.jsx`, new)

Client component (`"use client"` — needs `useRouter`/`useSearchParams` to rewrite the URL on checkbox toggle). Props: `{ basePath, activeStates, activeEmployeeRanges, stateCounts, showStateFilter }`.

- Uses shadcn `Checkbox` + a newly-added `Field`/`FieldSet`/`FieldLegend` (via `npx shadcn add field`) — one `FieldSet` per filter group ("Filter by State", "Employees"), replacing the "div with a heading" pattern the rest of the page currently uses, per the shadcn composition rule.
- `showStateFilter` is `true` only on the nationwide page. When true, renders the state `FieldSet` (checkbox + label + count per state, e.g. "California (42)") and **replaces** the current static "Top States" pill widget in that branch (redundant otherwise — the new widget does everything the old one did, plus filtering). When `false` (state-specific page), the existing "Top States" widget is left completely untouched.
- Employees `FieldSet` (4 checkboxes: "1–10", "11–50", "51–200", "200+") renders on **both** pages.
- On toggle: compute the new query string (add/remove the clicked value from its param's list), reset `page` to 1, `router.push(newUrl)` wrapped in `startTransition` (per `rerender-transitions` best practice) so the checkbox visually updates immediately while the server re-render streams in.
- "Other Categories" and the CTA block in the existing sidebar are untouched, just reordered so the new filter widget(s) sit above them.

## Page component changes (`app/[category]/[state]/page.jsx`)

- Both branches: fetch companies and state-counts in parallel via `Promise.all` (nationwide branch only needs `fetchStateCountsForCategory`; state-specific branch doesn't call it) — independent queries, per `async-parallel`.
- Parse `?states=` and `?employees=` from `searchParams`, pass into `fetchCompaniesByCategoryAndState`'s new `filters` param.
- Replace the inline card-rendering block (both branches) with `<CompanyCard company={c} rank={rankOffset + i} />`.
- Insert `<FilterSidebar ... />` into the sidebar `<aside>` in both branches (nationwide: full widget incl. state filter; state-specific: employees-only).
- Empty state: when filters are active and zero results, swap the current "Be the first ... to get listed" copy (misleading when companies exist but are filtered out) for "No companies match these filters" + a "Clear filters" link back to `basePath` with no query params. When no filters are active and zero results, keep the existing copy.
- Pagination links updated to preserve active filter query params when changing page.

## Testing plan

- `npx next lint` — 0 errors (matches existing project convention from prior sessions).
- Manual verification via dev server + Playwright screenshot at `/electrical-components` (nationwide) and `/electrical-components/california` (state-specific): confirm filter checkboxes render, toggling a state/employee filter changes the URL and the result set, counts look sane, empty-filter-result state renders correctly, pagination composes with active filters.
- Verify `parseEmployeeCount`/`bucketFor` against the actual messy values seen in `scripts/data/*.json` and `scripts/seed-companies.js` (`'1,276'`, `'1,569-5,000'`, `'1000+'`, `'10-49'`, `'1-9'`, etc.) with a quick throwaway script or inline test — no existing test framework in this repo to wire into, so this is manual/spot-check verification, not an automated suite.
