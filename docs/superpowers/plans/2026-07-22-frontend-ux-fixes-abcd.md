# Frontend UX Fixes (A, B, C, D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four frontend UX issues on FirmsLedger: (A) simplify the category+state picker into two dropdowns, (B) fix a font-flash bug on the "List Your Company" hero, (C) enlarge industry cards on `/browse` and fix missing icons, (D) restyle the per-state category hub page to match the improved `/browse` card style via a shared component.

**Architecture:** All four are presentational/data-plumbing changes to existing Next.js App Router pages — no new routes, no schema changes, no new dependencies except Next's built-in `next/font/google`. Task C introduces one new shared presentational component (`CategoryCard`) that Task D also consumes, so C must land before D.

**Tech Stack:** Next.js 15 App Router, React 18 client components, Tailwind CSS, `next/font/google`, `lucide-react` icons.

## Global Constraints

- No new npm dependencies (`next/font/google` ships with Next.js already installed).
- Preserve all existing routes/URLs — only visual/markup changes, no URL structure changes.
- Follow existing code style in each file (inline `style={{}}` objects in the `[category]`/`states` pages vs Tailwind classes in `Categories.jsx` — do not convert one style to the other).
- Manufacturing category canonical data lives in `src/lib/manufacturingCategories.js` (`MANUFACTURING_CATEGORIES`, `CATEGORY_MAP`) — the 10 slugs are: `electrical-components`, `mechanical-components`, `plastics-packaging`, `metal-fabrication`, `electronics-semiconductor`, `automotive-parts`, `textile-apparel`, `furniture-woodworking`, `food-beverage-processing`, `medical-devices`. These match the DB `categories.slug` values (confirmed via `scripts/migrate-categories-align-frontend-2026-07-22.cjs`).
- No automated test suite exists in this repo. Verification is `npm run lint`, `npm run build`, and manual browser check via `npm run dev`.

---

### Task 1: Category + state dropdown picker (Item A)

**Files:**
- Modify: `app/[category]/CategoryLandingClient.jsx` (full file currently at `app/[category]/CategoryLandingClient.jsx:1-249`)

**Interfaces:**
- Consumes: `MANUFACTURING_CATEGORIES`, `CATEGORY_MAP` from `@/lib/manufacturingCategories` (not currently imported in this file — needs adding).
- Produces: no exported interface change — component signature `CategoryLandingClient({ cat, slug, otherCategories })` stays identical, since `app/[category]/page.jsx` renders it unchanged.

This task replaces the "── State grid ──" block (current lines 165-208, the `Object.entries(US_STATES_BY_REGION).map(...)` region-grouped pill wall) with two `<select>` dropdowns + a button. The subcategory filter row above it (lines 112-163) and the "Other categories" section below (lines 211-245) are unchanged.

- [ ] **Step 1: Add category/state dropdown state and flattened state list**

At the top of `app/[category]/CategoryLandingClient.jsx`, add the import and derive a flat, alphabetically sorted state list from the existing `US_STATES_BY_REGION` object (keep that object — it's still used to label regions elsewhere isn't needed anymore for rendering, but keep the data source single so nothing else breaks). Add this right after the `US_STATES_BY_REGION` and `REGION_ACCENTS` consts (after line 73), before the component:

```jsx
const ALL_STATES_FLAT = Object.values(US_STATES_BY_REGION)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name));
```

Add the import at the top of the file (after the existing `lucide-react` import on line 5):

```jsx
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';
```

Inside the component, change the state hooks (currently just `const [selectedSubcat, setSelectedSubcat] = useState(null);` on line 76) to also track the dropdown selections, defaulting category to the current page's `slug` and state to the first entry:

```jsx
export default function CategoryLandingClient({ cat, slug, otherCategories }) {
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [pickedCategory, setPickedCategory] = useState(slug);
  const [pickedState, setPickedState] = useState(ALL_STATES_FLAT[0].slug);
```

- [ ] **Step 2: Replace the state-grid JSX with two dropdowns and a button**

Replace the entire block from the `{/* ── State grid ── */}` comment through the closing of the `Object.entries(...).map(...)` (current lines 165-208) with:

```jsx
        {/* ── State picker ── */}
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 16 }}>
          Browse by category &amp; state
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <select
            value={pickedCategory}
            onChange={(e) => setPickedCategory(e.target.value)}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              minWidth: 240,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {MANUFACTURING_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={pickedState}
            onChange={(e) => setPickedState(e.target.value)}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              minWidth: 200,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {ALL_STATES_FLAT.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <Link
            href={
              selectedSubcat
                ? `/${pickedCategory}/${selectedSubcat}/${pickedState}`
                : `/${pickedCategory}/${pickedState}`
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: 10,
              padding: '11px 20px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Companies <ArrowRight size={14} />
          </Link>
        </div>
```

Note: `selectedSubcat` only makes sense for the category the page was loaded with (`slug`); if the user picks a *different* category in the dropdown, the subcategory won't exist on that category. Guard this in the href by only applying `selectedSubcat` when `pickedCategory === slug`:

Replace the `href` above with:

```jsx
            href={
              selectedSubcat && pickedCategory === slug
                ? `/${pickedCategory}/${selectedSubcat}/${pickedState}`
                : `/${pickedCategory}/${pickedState}`
            }
```

- [ ] **Step 3: Remove now-unused `stateHref` helper if nothing else calls it**

Search the file for other usages of `stateHref` (defined at lines 78-82). If Step 2's replacement removed its only call site, delete the function:

```bash
grep -n "stateHref" "app/[category]/CategoryLandingClient.jsx"
```

If the only remaining match is the function definition itself, delete it.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Visit `http://localhost:3000/electrical-components`. Confirm:
- Two dropdowns render (Category pre-selected to "Electrical Components Manufacturers", State pre-selected to first alphabetical state).
- Changing State dropdown and clicking "View Companies" navigates to `/electrical-components/<state-slug>`.
- Changing Category dropdown to a different category, then clicking "View Companies", navigates to `/<new-category-slug>/<state-slug>`.
- Selecting a subcategory pill, then clicking "View Companies" (with category dropdown left on the original), navigates to `/<category>/<subcategory>/<state-slug>`.

- [ ] **Step 5: Commit**

```bash
git add "app/[category]/CategoryLandingClient.jsx"
git commit -m "feat: replace state-pill grid with category+state dropdown picker"
```

---

### Task 2: Fix Inter font-load flash on ListYourCompany hero (Item B)

**Files:**
- Modify: `app/layout.jsx`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a CSS variable `--font-inter` applied globally via `<html>` className; no component-level API changes, so this task cannot break other tasks' work.

**Root cause:** `src/index.css:1` loads Inter via `@import url('https://fonts.googleapis.com/css2?...')` inside the bundled CSS. CSS `@import` is render-blocking and resolves *after* the browser has already started laying out text with the fallback (`system-ui`), causing a visible flash of the fallback font (FOUT) on first paint — most visible on above-the-fold hero text like the "Get your business in front of buyers" heading. The fix is to load Inter via `next/font/google`, which self-hosts the font files and injects them with zero network round-trip and no FOUT.

- [ ] **Step 1: Load Inter via next/font/google in the root layout**

In `app/layout.jsx`, add the import at the top (after existing imports, before the `BASE_URL` const):

```jsx
import { Inter } from 'next/font/google';
```

Configure it right after the imports, before `const BASE_URL = ...`:

```jsx
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});
```

- [ ] **Step 2: Apply the font variable to the `<html>` element**

In `app/layout.jsx`, change line 85 from:

```jsx
    <html lang="en">
```

to:

```jsx
    <html lang="en" className={inter.variable}>
```

- [ ] **Step 3: Remove the Google Fonts `@import` and preconnect hints for it**

In `src/index.css`, delete line 1:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
```

In `app/layout.jsx`, the `<head>` currently has (lines 88-90):

```jsx
        {/* Google Fonts — preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

Remove these three lines — `next/font/google` self-hosts the font at build time, so no runtime connection to Google's font CDN happens at all.

- [ ] **Step 4: Point the font-family declarations at the CSS variable**

In `src/index.css`, change the `body` rule (around line 92) from:

```css
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

to:

```css
    font-family: var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

In `tailwind.config.js`, change the three `Inter`-referencing font families (lines 10-12) from:

```js
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
```

to:

```js
        sans:    ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
```

- [ ] **Step 5: Manual verification**

```bash
npm run build && npm run start
```

Open `http://localhost:3000/list-your-company` in a browser with network throttled to "Slow 3G" (Chrome DevTools > Network tab) and hard-reload. Confirm the "Get your business in front of buyers" heading renders in Inter immediately on first paint with no visible font swap. Also spot-check the homepage and `/browse` to confirm Inter still renders everywhere (no regression from the `var(--font-inter)` change).

- [ ] **Step 6: Commit**

```bash
git add app/layout.jsx tailwind.config.js src/index.css
git commit -m "fix: load Inter via next/font/google to eliminate font-flash on hero text"
```

---

### Task 3: Bigger cards + working icons on `/browse` industries page (Item C)

**Files:**
- Modify: `src/views/Categories.jsx`

**Interfaces:**
- Consumes: nothing new — still uses `api.entities.Category.list()` and `MANUFACTURING_CATEGORIES` as before.
- Produces: exports a `CATEGORY_ICON_BOX_SIZES` convention is NOT needed — Task 4 (D) does not import anything from this file; it gets its own copy of the icon map per Task 4's design (see Task 4 notes). No shared export required here.

**Root cause of missing icons:** `CAT_ICONS` (lines 11-55) only has keys for the old staffing/service-directory slugs (`staffing-companies`, `seo`, `web-development`, etc.). The DB's `categories.slug` values were migrated to the 10 manufacturing slugs (confirmed via `scripts/migrate-categories-align-frontend-2026-07-22.cjs`: `electrical-components`, `mechanical-components`, `plastics-packaging`, `metal-fabrication`, `electronics-semiconductor`, `automotive-parts`, `textile-apparel`, `furniture-woodworking`, `food-beverage-processing`, `medical-devices`), none of which exist in `CAT_ICONS`, so every card falls through to the generic `🏢`/`🏷️` fallback.

- [ ] **Step 1: Add manufacturing slugs to CAT_ICONS**

In `src/views/Categories.jsx`, add these 10 entries to the `CAT_ICONS` object (lines 11-55), anywhere inside the object literal — e.g. right after the opening brace on line 11:

```js
const CAT_ICONS = {
  'electrical-components':     '⚡',
  'mechanical-components':     '⚙️',
  'plastics-packaging':        '📦',
  'metal-fabrication':         '🔧',
  'electronics-semiconductor': '🖥️',
  'automotive-parts':          '🚗',
  'textile-apparel':           '🧵',
  'furniture-woodworking':     '🪵',
  'food-beverage-processing':  '🍽️',
  'medical-devices':           '🩺',
  'staffing-companies': '👥',
  // ...(rest of existing entries unchanged)
```

Keep every existing key/value pair below it untouched — only add the 10 new entries.

- [ ] **Step 2: Enlarge the parent-category card icon box and padding (grid view)**

In the grid-view card header (around line 309-325), change:

```jsx
                        <div className={`${color.bg} px-6 py-5 border-b ${color.border}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/80 border border-white flex items-center justify-center text-xl shadow-sm">
                              {icon}
                            </div>
```

to:

```jsx
                        <div className={`${color.bg} px-7 py-6 border-b ${color.border}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/80 border border-white flex items-center justify-center text-2xl shadow-sm">
                              {icon}
                            </div>
```

And change the heading text size right below it from `text-base` to `text-lg`:

```jsx
                              <h2 className="font-bold text-[#0D1B2A] text-lg hover:text-orange-600 transition-colors leading-snug">
```

- [ ] **Step 3: Enlarge the grid gap for the parent-category grid**

Change the grid container className (around line 234-238) from:

```jsx
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12'
                    : 'flex flex-col gap-4 mb-12'
                }>
```

to:

```jsx
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-12'
                    : 'flex flex-col gap-4 mb-12'
                }>
```

- [ ] **Step 4: Enlarge the standalone-category card icon box (grid view)**

Around line 393-415, change:

```jsx
                          className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:shadow-sm ${color.hoverBorder} transition-all group`}
                        >
                          <div className={`w-9 h-9 rounded-lg ${color.bg} ${color.border} border flex items-center justify-center text-base flex-shrink-0`}>
```

to:

```jsx
                          className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-sm ${color.hoverBorder} transition-all group`}
                        >
                          <div className={`w-12 h-12 rounded-lg ${color.bg} ${color.border} border flex items-center justify-center text-xl flex-shrink-0`}>
```

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

Visit `http://localhost:3000/browse`. Confirm:
- Every top-level manufacturing category card shows a real emoji icon (⚡, ⚙️, 📦, etc.), not a generic 🏢.
- Cards visibly larger than before (bigger icon boxes, more padding, wider gaps).
- List view toggle still works and is unaffected (Step 2-4 only touched grid-view classes).

- [ ] **Step 6: Commit**

```bash
git add src/views/Categories.jsx
git commit -m "fix: add manufacturing category icons and enlarge /browse cards"
```

---

### Task 4: Restyle state-hub category cards to match `/browse` (Item D)

**Depends on:** Task 3 (reuses the same icon mapping and visual language established there — implement Task 3 first).

**Files:**
- Create: `src/components/CategoryCard.jsx`
- Modify: `app/states/[slug]/page.jsx`

**Interfaces:**
- Produces: `CategoryCard` component with props `{ href, icon, name, description, colorIndex }` — a client-agnostic (server-renderable, no hooks) presentational component.
- Consumes (in `app/states/[slug]/page.jsx`): the new `CategoryCard` component, plus the same `CAT_ICONS`-style mapping duplicated locally (see Step 1 — this file already has its own local `CATEGORIES` array with slugs/descriptions, so no import from `Categories.jsx` is needed, avoiding a client/server component boundary issue since `app/states/[slug]/page.jsx` is a Server Component and `Categories.jsx` is `'use client'`).

**Design note:** `Categories.jsx` is a client component (`'use client'` at the top, uses hooks). `app/states/[slug]/page.jsx` is an async Server Component. Do not import `Categories.jsx` or its `CAT_ICONS` map directly into the server component. Instead, `CategoryCard.jsx` is a plain presentational component with no `'use client'` directive and no hooks, so it can be rendered from either a Server or Client Component — this is what lets Task 3's page and Task 4's page share visuals without a client/server conflict.

- [ ] **Step 1: Create the shared CategoryCard component**

Create `src/components/CategoryCard.jsx`:

```jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CARD_COLORS = [
  { bg: 'bg-orange-50', border: 'border-orange-100' },
  { bg: 'bg-blue-50', border: 'border-blue-100' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { bg: 'bg-violet-50', border: 'border-violet-100' },
  { bg: 'bg-rose-50', border: 'border-rose-100' },
  { bg: 'bg-amber-50', border: 'border-amber-100' },
  { bg: 'bg-cyan-50', border: 'border-cyan-100' },
  { bg: 'bg-pink-50', border: 'border-pink-100' },
];

export default function CategoryCard({ href, icon, name, description, colorIndex = 0 }) {
  const color = CARD_COLORS[colorIndex % CARD_COLORS.length];

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-sm hover:border-slate-300 transition-all group`}
    >
      <div className={`w-14 h-14 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[#0D1B2A] text-base group-hover:text-orange-600 transition-colors leading-snug">
          {name}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
    </Link>
  );
}
```

- [ ] **Step 2: Add icons to the local CATEGORIES array in the state-hub page**

In `app/states/[slug]/page.jsx`, the `CATEGORIES` array (lines 62-73) currently has `slug`, `name`, `shortDesc`, `dot` per entry. Add an `icon` field to each, using the same emoji as Task 3's `CAT_ICONS` for consistency:

```js
const CATEGORIES = [
  { slug: 'electrical-components',     name: 'Electrical Components Manufacturers',          shortDesc: 'Wiring, switchgear & components',          dot: '#eab308', icon: '⚡' },
  { slug: 'mechanical-components',     name: 'Mechanical Components Manufacturers',          shortDesc: 'CNC machining & precision parts',           dot: '#64748b', icon: '⚙️' },
  { slug: 'plastics-packaging',        name: 'Plastics & Packaging Manufacturers',           shortDesc: 'Injection molding & packaging',             dot: '#22c55e', icon: '📦' },
  { slug: 'metal-fabrication',         name: 'Metal Fabrication & Machining',                shortDesc: 'Sheet metal, welding & stamping',           dot: '#3b82f6', icon: '🔧' },
  { slug: 'electronics-semiconductor', name: 'Electronics & Semiconductor Manufacturers',    shortDesc: 'PCBs, chips & assemblies',                  dot: '#6366f1', icon: '🖥️' },
  { slug: 'automotive-parts',          name: 'Automotive Parts Manufacturers',               shortDesc: 'OEM & aftermarket components',              dot: '#ef4444', icon: '🚗' },
  { slug: 'textile-apparel',           name: 'Textile & Apparel Manufacturers',              shortDesc: 'Fabric & garment manufacturing',            dot: '#ec4899', icon: '🧵' },
  { slug: 'furniture-woodworking',     name: 'Furniture & Woodworking Manufacturers',        shortDesc: 'Custom furniture & cabinetry',              dot: '#f59e0b', icon: '🪵' },
  { slug: 'food-beverage-processing',  name: 'Food & Beverage Processing Equipment Manufacturers', shortDesc: 'Processing & packaging lines',         dot: '#84cc16', icon: '🍽️' },
  { slug: 'medical-devices',           name: 'Medical Device Manufacturers',                 shortDesc: 'Diagnostic & surgical equipment',           dot: '#14b8a6', icon: '🩺' },
];
```

- [ ] **Step 3: Import CategoryCard and replace the category-card grid**

Add the import near the top of `app/states/[slug]/page.jsx` (after the existing `lucide-react` import on line 5):

```jsx
import CategoryCard from '@/components/CategoryCard';
```

Replace the `{/* ── Category cards ── */}` block's inner grid (current lines 176-205, the `<div style={{ display: 'grid', ... }}>...CATEGORIES.map...</div>`) with:

```jsx
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => (
              <CategoryCard
                key={cat.slug}
                href={`/${cat.slug}/${slug}`}
                icon={cat.icon}
                name={cat.name}
                description={`${cat.shortDesc} in ${state.name}`}
                colorIndex={idx}
              />
            ))}
          </div>
```

- [ ] **Step 4: Remove now-unused imports and inline CSS if no longer referenced**

The `ArrowRight` import (line 5) and the `.state-cat-card:hover` rule in the inline `<style>` block (line 118) were only used by the replaced markup. Check remaining usages:

```bash
grep -n "ArrowRight\|state-cat-card" "app/states/[slug]/page.jsx"
```

`ArrowRight` is still used in the "All 50 states" pill link near the bottom of the file (in the "Other states" section) — keep the import. Remove only the now-dead `.state-cat-card:hover { ... }` CSS rule from the `<style>` block, since `CategoryCard` uses Tailwind's `hover:` classes instead of that global class selector. Also remove the unused `Package, Wrench, Cpu, Car, Shirt, Sofa, UtensilsCrossed, Stethoscope` icon imports from `lucide-react` (line 5) if `grep` shows they were never used in this file (they aren't referenced anywhere in the current file — confirmed by inspection, they were leftover/unused imports).

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

Visit `http://localhost:3000/states/texas`. Confirm:
- Category cards now show icon boxes matching the `/browse` page's visual style (colored box + emoji + bold name + description + chevron), noticeably bigger than the old dot-only cards.
- Clicking a card still navigates to `/<category-slug>/texas` correctly.
- "Other states" pill list below is unaffected.

- [ ] **Step 6: Commit**

```bash
git add src/components/CategoryCard.jsx "app/states/[slug]/page.jsx"
git commit -m "feat: share CategoryCard component between /browse and state-hub pages"
```

---

## Self-Review Notes

- **Spec coverage:** Task 1 = Item A, Task 2 = Item B, Task 3 = Item C, Task 4 = Item D. All four items from the spec are covered; Items E1-E3 are explicitly out of scope per user request.
- **Dependency ordering:** Task 4 depends on Task 3's icon/visual conventions (shares emoji choices) but not on any code Task 3 writes — `CategoryCard.jsx` is new and standalone, so Tasks 1-4 could technically run in parallel, but running Task 3 before Task 4 keeps the icon emoji choices visibly consistent if a reviewer compares them side by side.
- **No shared files across tasks** — Task 1 touches only `CategoryLandingClient.jsx`; Task 2 touches `layout.jsx`/`tailwind.config.js`/`index.css`; Task 3 touches only `Categories.jsx`; Task 4 touches only new `CategoryCard.jsx` + `states/[slug]/page.jsx`. Safe to dispatch as 4 parallel subagents.
