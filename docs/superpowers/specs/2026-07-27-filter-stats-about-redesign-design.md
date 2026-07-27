# Filter rebuild + stats/about redesign

Date: 2026-07-27

## Problem

On category/state listing pages (`app/[category]/page.jsx`, `app/[category]/[state]/page.jsx`):

1. **FilterBar** (`src/components/listing/FilterBar.jsx`) — the State/Employees dropdowns already use `createPortal(document.body)` with `position: fixed`, but never read the trigger button's actual screen position. The panel renders at a default flow position instead of anchored to its button, so it visually appears "stuck inside" the filter row/other containers instead of floating free. Only the subcategory `<Select>` (a separate, correctly-built component) works as expected.
2. **Stats band** — dark navy gradient strip with 4 numbers in a row, feels heavy and disconnected from the Goodfirms-style reference the user wants to match.
3. **Bottom "Why Trust FirmsLedger" section** (`src/components/listing/WhyTrustSection.jsx`) — duplicates trust messaging that will now live in a compact box near the stats.
4. **"About [Category]" section** — plain heading + paragraph on a flat gray background, no card treatment, reads as a stray afterthought at the bottom of the page.

## Scope

Applies to both render branches in `app/[category]/[state]/page.jsx` (nationwide category view and state-filtered view) and the redirect-only `app/[category]/page.jsx` (no visual changes needed there — it just forwards).

## Design

### 1. FilterBar — anchored popover

- `FilterDropdown` gets a `useLayoutEffect`-driven position calc: on open, read `triggerRef.current.getBoundingClientRect()`, compute `{ top: rect.bottom + 6, left: rect.left }` (clamped so the panel doesn't overflow the viewport right edge), store in state.
- Recompute on `scroll` (capture phase, since the trigger sits inside a horizontally-scrollable row) and `resize` while open; close on unmount/route change.
- Panel still portals to `document.body`, `position: fixed`, using the computed coordinates instead of default flow.
- Outside-click-to-close and existing checkbox/Show-results/Clear-filters logic unchanged — that part isn't broken.
- No new dependencies; plain React state + rect math.

### 2. Stats section — light tile row

- Replace the dark gradient strip with a light section (`background: #F8FAFC` or similar existing light token, bordered top/bottom like the rest of the page).
- 4 stat tiles (existing data — no fabricated 5th metric): Verified Companies, Total Listings, Avg Rating (when `medianRating !== null`), States Covered. Each tile: white card, subtle border, gold (`#D4A017`) number in IBM Plex Mono, dark label.
- Directly below the tile row: a compact "How this list is built" box — light gold-tinted background (`rgba(212,160,23,0.08)`-ish), one short paragraph covering verification + no-pay-to-rank, replacing the current dynamic sentence paragraph.

### 3. Remove bottom trust section

- Delete the `<WhyTrustSection ... />` render call in both branches of `app/[category]/[state]/page.jsx`.
- Delete `src/components/listing/WhyTrustSection.jsx` (unused after removal — no other importers).

### 4. "About [Category]" card

- Wrap existing heading+paragraph in a white card: `background: #fff`, `border: 1px solid #e2e8f0`, `borderRadius: 12`, `padding`, subtle `boxShadow`, sitting on the existing light gray section background.
- Add a small icon (lucide, matching the gold accent already used elsewhere, e.g. `Info` or category-appropriate icon) next to the "About {shortName}" heading.
- No layout/column changes — same section, same trigger condition (`!stateName && cat?.longDescription`).

## Out of scope

- No new stat metrics requiring data we don't have (e.g. hourly rate).
- No tabs (Ranked List / Leader Matrix / etc.) — only "Ranked List" exists.
- No changes to `app/[category]/page.jsx` beyond confirming it doesn't independently render its own copy of these sections.

## Verification

- Manually exercise State + Employees dropdowns on a category page with many states (scroll the trigger row, resize window) — panel stays anchored, doesn't clip/hide.
- Visual check via Playwright screenshot on `/electrical-components` and a state sub-page, both light/no-dark stats band, About card renders, no orphaned `WhyTrustSection` import errors.
- `npm run build` passes.
