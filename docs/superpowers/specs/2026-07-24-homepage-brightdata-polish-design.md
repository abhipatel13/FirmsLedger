# Homepage Bright Data-Inspired Polish — Design Spec

**Date:** 2026-07-24
**Scope:** `src/views/DirectoryHub.jsx` only (homepage, rendered via `app/page.jsx`). No other pages touched.

## Context

User asked for design inspiration from brightdata.com and a plan to make the FirmsLedger homepage more "aesthetic," refining the existing color system rather than replacing it. Current homepage already carries navy `#1A2E4A` / gold `#F5A623` / cream `#FAF7F1` / charcoal `#211F1C` from an earlier session's redesign — this spec builds on that foundation, it does not start over.

Two of the originally-proposed Bright Data patterns turned out to already exist in the current code and are excluded from this spec as new work:
- Hero trust-bullet row (3 items already present at `DirectoryHub.jsx:252-263`) — gets one addition, not a rebuild.
- Dual-CTA footer band (`List Your Company` + `Contact Us` already present at `DirectoryHub.jsx:532-546`) — untouched.

An announcement bar was proposed and explicitly rejected by the user — **not part of this spec.**

## Goals

1. Add one new section: a full-bleed dark "Bold Statement" section ("Zero Paid Rankings.") between the Trust section and How It Works.
2. Densify the existing Trust section from a 2×2 card grid with long descriptions into a single-row, 5–6 item compact stat strip.
3. Densify the existing Category grid from 3-per-row rich cards (icon + description + 3 state pills + link) to 4-per-row lighter cards (icon + 1-line description + link only).
4. Add a 4th hero trust-bullet ("Free to list") to the existing 3-item row.
5. Cross-cutting polish: extend the existing soft-glow-blur visual signature (currently only in the hero and CTA band) to the new Bold Statement section; add a subtle two-stop gradient to category icon boxes instead of flat pastel fill.
6. No new colors — everything stays within the existing 4-color palette (navy/gold/cream/charcoal). No font changes (no serif — that part of an earlier spec was never implemented and stays out of scope here).

## Non-goals

- No changes to any other page (listing pages, company profile, list-your-company, etc.) — homepage only, per explicit scope decision.
- No announcement bar.
- No new testimonial/customer-spotlight section (would need a real quote, which isn't available yet).
- No dark-theme shift for the whole page — only the one new Bold Statement section is dark; everything else stays on the light cream/white palette.

## Section-by-section design

### 1. Hero (`DirectoryHub.jsx:233-283`) — minor edit
Add a 4th entry to the existing trust-bullet array (`DirectoryHub.jsx:253-262`): `{ icon: Package, text: 'Free to list' }`. `Package` is already imported at the top of the file (used by the Plastics & Packaging category icon) — reuse it here rather than adding a new `lucide-react` import, and it's visually distinct from the other 3 bullets' icons (`CheckCircle`, `Shield`, `Star`). Same rendering pattern as the existing 3 — no new markup structure, just one more array item.

### 2. Trust section (`DirectoryHub.jsx:362-396`) — restructure
Replace the `TRUST_TILES` array (currently 4 items with `number`, `label`, `desc`, `icon`, `iconBg/iconBorder/iconText`) with a shorter `TRUST_STATS` array of 5 items, each just `{ value, label, icon }` — no description text:

```js
const TRUST_STATS = [
  { value: '100%', label: 'Listings reviewed', icon: Shield },
  { value: '0', label: 'Paid rankings — ever', icon: CheckCircle },
  { value: '50', label: 'States covered', icon: Star },
  { value: '10', label: 'Categories', icon: Wrench },
  { value: '67', label: 'Companies listed', icon: Package },
];
```
Render as a single-row `grid grid-cols-2 sm:grid-cols-5 gap-4` (was `grid-cols-1 sm:grid-cols-2 gap-4` inside a 2-column section split) — this also means the left-column intro text (`SectionEyebrow` + h2 + supporting paragraph, currently in a `lg:grid-cols-[0.8fr_1.2fr]` split) moves to sit **above** the stat row as a centered block, matching the centered-heading pattern already used by the Category and How It Works sections, rather than keeping the current side-by-side split. This makes the section visually consistent with the rest of the page's heading pattern and gives the stat row full width to breathe as 5 columns.

Each stat block: small icon (reuse the existing `w-9 h-9 rounded-lg border` icon-box style from the current tiles, same `iconBg/iconBorder/iconText` per-item coloring already established, reusing the same 4 color combinations plus one more for the 5th item — e.g. violet, matching a hue not yet used in `TRUST_TILES`), value in `text-2xl font-bold text-[#211F1C] tabular-nums`, label in `text-xs text-slate-500 font-medium`.

### 3. Bold Statement section (new)
Inserted between the Trust section and the "How It Works" section (i.e. after `DirectoryHub.jsx:396`, before `DirectoryHub.jsx:398`'s `{/* ══ HOW IT WORKS ══ */}`).

```jsx
{/* ══ BOLD STATEMENT ═══════════════════════════════════════════ */}
<section className="bg-[#211F1C] py-20 sm:py-24 lg:py-28 relative overflow-hidden">
  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#F5A623]/10 blur-[120px] pointer-events-none" />
  <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
    <h2 className="text-[36px] sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5A623] leading-[1.05]">
      Zero Paid Rankings.
    </h2>
    <p className="mt-5 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
      Every company on this list earned its spot through real reviews — nothing else.
    </p>
  </div>
</section>
```
Background `#211F1C` (existing charcoal token, not a new color). Single centered radial glow using the existing gold accent at low opacity, matching the blur-glow technique already used in the hero (`DirectoryHub.jsx:268`) and CTA band (`DirectoryHub.jsx:513-514`) — this is the "extend the existing soft-glow signature" cross-cutting polish item, applied here as the section's own distinct visual identity marker (centered single blob, vs. the hero's off-center blob and the CTA band's two-blob asymmetric pair — each section's glow placement stays visually distinct so they don't read as identical copy-pasted decoration).

### 4. Category grid (`DirectoryHub.jsx:285-360`) — density change
- Grid: `sm:grid-cols-2 lg:grid-cols-3` → `sm:grid-cols-2 lg:grid-cols-4`.
- Remove the 3-state-pill-link block (`DirectoryHub.jsx:318-332`) entirely.
- Description (`DirectoryHub.jsx:314-316`): add `line-clamp-1` to the existing `<p>` instead of showing the full 2-line description, since cards are now narrower (4-per-row) and don't have room for 2 full lines alongside everything else.
- Icon box (`DirectoryHub.jsx:306-308`): change `cat.iconBg` (currently a flat Tailwind pastel class like `bg-amber-50`) to a two-stop gradient using the same hue — e.g. `bg-gradient-to-br from-amber-50 to-amber-100` — for each category's existing color, not introducing new hues, just adding the gradient direction. This touches the `CATEGORIES` array's `iconBg` values (10 entries), swapping each flat class for its two-stop gradient equivalent in the same hue family.
- `CATEGORIES_PREVIEW_COUNT` (currently `3`, i.e. one row at the old 3-column width) becomes `4` to still show exactly one row before "View more" at the new 4-column width.
- Keep: top accent bar, icon, title, "View all states" link — unchanged.

## Testing plan

- `npx next lint` — 0 errors.
- `npm run build` — production build succeeds.
- Manual verification via dev server + screenshot at homepage: confirm all 5 sections render in order (hero → categories → trust stat row → bold statement → how it works → states panel → CTA band), confirm no layout breakage at mobile/tablet/desktop widths (this file already has responsive breakpoints throughout — verify the new/changed sections follow the same `sm:`/`lg:` pattern), confirm the "View more categories" toggle still works correctly with the new preview count of 4.
