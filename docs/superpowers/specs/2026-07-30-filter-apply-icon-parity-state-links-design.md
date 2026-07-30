# Filter apply model, icon parity, and crawlable state links

Date: 2026-07-30

Three independent workstreams. They touch disjoint files and can be implemented and shipped in any order.

| # | Workstream | Files touched |
|---|-----------|---------------|
| 1 | Filter bar: stage-all + always-enabled "Show results" | `src/components/listing/FilterBar.jsx` |
| 2 | Icon parity across nav / homepage / browse | new `src/lib/categoryRegistry.js`, `src/Layout.jsx`, `src/views/DirectoryHub.jsx`, `src/lib/categoryIcon.js` |
| 3 | Crawlable "Top {category} in {state}" homepage section | `app/page.jsx`, `src/views/DirectoryHub.jsx` |

---

## 1. Filter bar — stage all filters, one apply

### Problem

`src/components/listing/FilterBar.jsx` mixes two interaction models:

- **Category** (`navigateToCategory`), **Subcategory** (`navigateToSubcategory`), and every **State** button navigate the instant they are clicked — `window.location.href = target` / `router.push`.
- **Employees** checkboxes only mutate local `pendingEmployeeRanges` state; nothing happens until "Show results" is clicked.

"Show results" is disabled by `disabled={!isDirty}`, where:

```js
const isDirty = !sameSet(pendingStates, activeStates) || !sameSet(pendingEmployeeRanges, activeEmployeeRanges);
```

`pendingStates` is **dead state**. The State dropdown navigates by *path* (`/{category}/{state}`) and explicitly does `params.delete('states')`, so `activeStates` (from the `?states=` query param) is never written by any control in the bar. The first half of `isDirty` can therefore never become true.

Net effect: the button is enabled **only** when the user touches an Employees checkbox. Pick a category, a state, or a subcategory and the button stays grey — even though a filter is clearly applied. That is the reported bug.

### Target behaviour

No dropdown navigates on its own. Every control stages a pending value, each trigger label reflects the pending value, and "Show results" is **always enabled** and performs exactly one navigation applying all four dimensions together.

```
Click Category  > Mechanical Components   -> trigger updates, no reload
Click State     > Texas                   -> trigger updates, no reload
Check Employees > 50-200                  -> no reload
Click Subcat    > Machine Shops           -> trigger updates, no reload

[ Show results ]   (always clickable)
  -> ONE navigation to /mechanical-components/machine-shops/texas?employees=50-200
```

### URL grammar (verified against the routes)

The second path segment is **overloaded** — `app/[category]/[state]/page.jsx` branches on whether it matches `ALL_SUBCATEGORY_SLUGS` (line 180) or a state. The three-segment route is `/{category}/{subcategory}/{state}` — confirmed by `app/[category]/[state]/[subcategory]/page.jsx` line 27, which destructures `{ category, state: subcategory, subcategory: state }`.

So the builder must produce:

| Pending selection | URL |
|---|---|
| category only | `/{cat}` |
| category + state | `/{cat}/{state}` |
| category + subcategory | `/{cat}/{sub}` |
| category + subcategory + state | `/{cat}/{sub}/{state}` |
| any of the above + employees | `…?employees=a,b` |

Path order is **subcategory before state**. Getting this backwards produces a 404.

### Implementation

**State to add** (alongside the existing `pendingEmployeeRanges`):

```js
const [pendingCategory,    setPendingCategory]    = useState(category);
const [pendingSubcategory, setPendingSubcategory] = useState(currentSubcategory ?? null);
const [pendingState,       setPendingState]       = useState(currentState ?? null);
```

Extend the existing prop-sync `useEffect` (line ~150) to reset all four pending values when the props change, so a browser back/forward does not leave stale pending state.

**Delete** `pendingStates` / `setPendingStates` entirely — it is dead. Keep `activeStates` as a **read-only** prop: `parseFilterParams` in `app/[category]/[state]/page.jsx` still reads `?states=` and passes it to `fetchCompaniesByCategoryAndState`, and old inbound URLs may still carry it. The bar simply stops writing it. Preserve any incoming `states` param verbatim when building the target URL.

**Replace** `navigateToCategory`, `navigateToSubcategory`, and both State button `onClick` handlers with plain setters:

```js
function selectCategory(slug) {
  setPendingCategory(slug);
  setPendingSubcategory(null);   // REQUIRED: subcategory slugs belong to one category
  setOpenDropdown(null);
}
```

Clearing the subcategory on category change is not optional — carrying `machine-shops` over to `electrical-components` builds a URL that 404s.

**Single navigation function:**

```js
function handleShowResults() {
  setOpenDropdown(null);
  const params = new URLSearchParams(searchParams.toString());
  params.delete('page');
  if (pendingEmployeeRanges.length) params.set('employees', pendingEmployeeRanges.join(','));
  else params.delete('employees');

  let path = `/${pendingCategory}`;
  if (pendingSubcategory) path += `/${pendingSubcategory}`;
  if (pendingState)       path += `/${pendingState}`;

  const query = params.toString();
  window.location.href = query ? `${path}?${query}` : path;
}
```

Keep `window.location.href`. The existing comment at line ~165 documents that `router.push` silently fails to commit these navigations on this route under Next 15 + React 18. Do not "improve" this to `router.push`.

**Button:** remove `disabled={!isDirty}` and delete `isDirty` and `sameSet`. The button is always enabled.

**Trigger labels** must read from pending state, not props, so the UI reflects what will be applied:

- Category: `CATEGORY_MAP[pendingCategory]?.shortName`
- Subcategory: `subcategories.find(s => s.slug === pendingSubcategory)?.name ?? 'All subcategories'`
- State: `stateCounts.find(s => s.stateSlug === pendingState)?.stateLabel ?? 'State'`
- Employees: unchanged (count badge)

The State dropdown's "All States" entry sets `pendingState = null`; each state button sets `pendingState = s.stateSlug`. Both keep using the existing `OptionButton`; `selected` compares against `pendingState`.

**Clear filters:** reset all four pending values to the *category-only* baseline and navigate to `/{pendingCategory}`. Since the category is itself now a staged value, "clear" should not reset the category — the user is still browsing that category.

### Verification

1. On `/mechanical-components`, click Category > Electrical Components. URL must not change; trigger reads "Electrical Components"; button enabled.
2. Add State > Texas, then Employees > one bucket, then click Show results. Exactly **one** page load; lands on `/electrical-components/texas?employees=<bucket>`.
3. On `/mechanical-components`, pick Subcategory > Machine Shops + State > Wisconsin > Show results → `/mechanical-components/machine-shops/wisconsin`, HTTP 200 (not 404). This is the case the path-order rule protects.
4. Pick Category > Electrical Components while a subcategory is staged → subcategory trigger resets to "All subcategories".
5. Load a URL with `?states=texas,ohio` directly; the listing still filters by those states and the param survives a Show results click.

### Out of scope

Do not migrate the multi-select `?states=` mechanism to the path, or vice versa. Single-state-by-path and multi-state-by-query coexist today; unifying them is a separate decision.

---

## 2. Icon parity — make the All Industries page match the homepage

### Problem

The homepage category cards and the nav "Browse" dropdown **already agree** — same glyphs, same tint families (visually confirmed). The `/browse` All Industries page is the **only** outlier, and it derives both its glyph and its color from different logic entirely.

| Site | Source | Behaviour |
|---|---|---|
| Nav "Browse" dropdown | `src/Layout.jsx` `NAV_CATEGORIES` (lines 16–25) | lucide icons + inline hex `bg`/`border`/`color` per category |
| Homepage cards | `src/views/DirectoryHub.jsx` `CATEGORIES` (line 16+) | lucide icons (plus two local SVGs) + Tailwind classes per category |
| **`/browse` (All Industries)** | `src/lib/categoryIcon.js` `pickCategoryIcon` + `colorFor`, rendered by `src/views/Categories.jsx` | **wrong glyphs** for 6 of 10, and color is a **hash of the slug** from `COLOR_POOL` — unrelated to the category |

Six glyphs differ. `/browse` must adopt the left column:

| Category | Homepage + nav (correct) | `/browse` today (wrong) |
|---|---|---|
| electrical-components | `Zap` | `Zap` ✓ |
| mechanical-components | `Cog` | `Settings` |
| plastics-packaging | `Package` | `Package` ✓ |
| metal-fabrication | `Wrench` | `Hammer` |
| electronics-semiconductor | `Cpu` | `Cpu` ✓ |
| automotive-parts | `Car` | `Car` ✓ |
| textile-apparel | `Shirt` | `Scissors` |
| furniture-woodworking | `Sofa` | `Armchair` |
| food-beverage-processing | `UtensilsCrossed` | `Utensils` |
| medical-devices | `Stethoscope` | `HeartPulse` |

The `Layout.jsx` comment at line 12 claims the palette is "kept in sync with the category cards on the homepage" — a comment is not a mechanism. Extract a registry so it cannot drift again.

### Target

**Nothing about the homepage or the nav dropdown changes visually.** `/browse` changes to match them. One registry keyed by slug becomes the single source of truth for all three.

### New file: `src/lib/categoryRegistry.js`

The three consumers style differently — `Layout.jsx` uses inline hex, `DirectoryHub.jsx` and `Categories.jsx` use Tailwind classes — so each entry carries both representations. That is duplication inside one file, which is the point: it replaces duplication across three.

Copy every value **verbatim** from the current sources. Do not invent colors, do not normalise the gradients to flat tints. The gradients are between adjacent Tailwind shades (`from-amber-50 to-amber-100`), so preserving them is free and keeps the homepage byte-identical:

```js
export const CATEGORY_VISUALS = {
  'electrical-components': {
    icon: Zap,
    hex: { bg: '#fef9ee', border: '#fde68a', color: '#92400e' },   // from Layout.jsx
    tw: {                                                          // from DirectoryHub.jsx
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
  },
  // … nine more
};

export function visualsFor(slug) {
  return CATEGORY_VISUALS[slug] ?? null;
}
```

Full `tw` values to copy, from `src/views/DirectoryHub.jsx` lines 16–98 (`dot` is the 3px top accent bar at line 382, not a dot):

| slug | bg gradient | border | text | dot |
|---|---|---|---|---|
| electrical-components | `from-amber-50 to-amber-100` | `border-amber-200` | `text-amber-700` | `bg-amber-500` |
| mechanical-components | `from-slate-100 to-slate-200` | `border-slate-300` | `text-slate-700` | `bg-slate-500` |
| plastics-packaging | `from-green-50 to-green-100` | `border-green-200` | `text-green-700` | `bg-green-500` |
| metal-fabrication | `from-blue-50 to-blue-100` | `border-blue-200` | `text-blue-700` | `bg-blue-500` |
| electronics-semiconductor | `from-violet-50 to-violet-100` | `border-violet-200` | `text-violet-700` | `bg-indigo-500` |
| automotive-parts | `from-rose-50 to-rose-100` | `border-rose-200` | `text-rose-700` | `bg-red-500` |
| textile-apparel | `from-pink-50 to-pink-100` | `border-pink-200` | `text-pink-700` | `bg-pink-500` |
| furniture-woodworking | `from-orange-50 to-orange-100` | `border-orange-200` | `text-orange-800` | `bg-orange-400` |
| food-beverage-processing | `from-amber-50 to-amber-100` | `border-amber-200` | `text-amber-800` | `bg-amber-600` |
| medical-devices | `from-teal-50 to-teal-100` | `border-teal-200` | `text-teal-700` | `bg-teal-500` |

All `bg` values are prefixed `bg-gradient-to-br `. `hex` values come from `src/Layout.jsx` lines 16–25.

### Consumer changes

**`src/views/Categories.jsx` + `src/lib/categoryIcon.js` — the actual fix.** This is the All Industries page; everything else is refactor.

`pickCategoryIcon` hardcodes the ten slugs with the wrong icons. Replace those ten branches with a registry lookup, keeping the text fallback:

```js
export function pickCategoryIcon(cat) {
  const v = visualsFor(cat?.slug || '');
  if (v) return v.icon;
  return pickIconByText(`${cat?.name || ''} ${cat?.slug || ''}`);
}
```

The `RULES` table and `pickIconByText` **stay**. `/browse` renders **DB-sourced** categories, which include rows outside the canonical ten; those still need text matching.

`colorFor(slug)` returns a hashed `"bg-x border-y text-z"` triple that `Categories.jsx` splits on spaces at three call sites (lines ~187, ~306, and the grid card at ~253). Change it to return the registry's `tw` values for known slugs, falling back to the existing `COLOR_POOL` hash for unknown ones. **Preserve the exact space-separated `"bg-… border-… text-…"` shape** so the three `.split(' ')` sites keep working untouched — note the registry `bg` is now a multi-word gradient string, so a naive `.split(' ')` will break. Either return an object and update the three call sites, or keep the string contract and have the call sites destructure differently. Returning an object `{ bg, border, text }` and updating the three sites is the cleaner of the two.

**`src/Layout.jsx`** — refactor only, zero visual change. `NAV_CATEGORIES` keeps `slug`, `name`, `desc`; drop `icon`/`bg`/`border`/`color` and read `visualsFor(slug).hex` + `.icon` at the two render sites (lines ~386, ~417).

**`src/views/DirectoryHub.jsx`** — refactor only, zero visual change. `CATEGORIES` keeps `slug`, `name`, `shortName`, `desc`; drop `icon`/`iconBg`/`iconBorder`/`iconText`/`dot` and read them from the registry at the card render (lines 375–390).

One small deliberate change here: the homepage uses local inline-SVG `BoltIcon`/`GearIcon` (lines 181–198) where the nav uses lucide `Zap`/`Cog`. They are visually equivalent, so the registry standardises on lucide and **the two local SVG components get deleted**. If a pixel-exact homepage is required instead, move `BoltIcon`/`GearIcon` into the registry file and have the nav use them — but then the nav changes instead. Pick one; do not leave both.

### Verification

Open the nav dropdown, the homepage "Browse by Category" cards, and `/browse` side by side. All ten categories must show the same glyph and the same tint in all three. Specifically check the six that were wrong: mechanical, metal fabrication, textile, furniture, food, medical. Then confirm `/browse` still renders sensible icons for DB categories outside the canonical ten (the `pickIconByText` path), and that both `/browse` view modes — grid and list, toggled top-right — pick up the change.

---

## 3. Crawlable "Top {category} in {state}" homepage section

### Problem

The homepage already has a "Browse by State" section (`src/views/DirectoryHub.jsx` lines 505–592) that links to `/{category}/{state}`. But it is a **client-side picker**: `selectedState` defaults to `'california'` and only the selected state's ten links exist in the DOM (line 566). A crawler sees **10** of the 500 category+state pages. Every other combination is reachable only by clicking.

### Target

A new static section — all links present in the server-rendered HTML, no interaction required — carrying keyword-rich anchor text at the ten categories × their twelve highest-listing states.

```
POPULAR SEARCHES

Electrical Components
  Top Electrical Components Manufacturers in California
  Top Electrical Components Manufacturers in Texas
  Top Electrical Components Manufacturers in New York
  … (12)

Mechanical Components
  Top Mechanical Components Manufacturers in California
  … (12)

(10 blocks, ~120 links)          See all 50 states ->
```

The existing interactive picker **stays** — it serves browsing; the new block serves crawlers and skim-readers.

### Data source — reuse, do not add a query

`fetchStateCountsForCategory(categorySlug)` in `src/db/neonApi.js` (line 221) already returns `[{ stateSlug, stateLabel, count }]` **sorted by count descending**. Ten calls, sliced to 12, gives the whole section:

```js
// app/page.jsx
const topStates = Object.fromEntries(
  await Promise.all(CATEGORY_SLUGS.map(async (slug) => [slug, (await fetchStateCountsForCategory(slug)).slice(0, 12)]))
);
```

Pass `topStates` into `<DirectoryHub />` as a prop. `app/page.jsx` already has `export const revalidate = 300`, so this runs at most once every five minutes — no per-request cost. Note each call internally does `resolveCategoryCompanyIds` plus two selects, so this is ~30 queries per revalidation; acceptable on a 5-minute ISR window, but do not move this to a `dynamic = 'force-dynamic'` page.

Because the counts are real, a category with listings in only 8 states renders 8 links, not 12 links to empty pages. That is the reason for the data-driven approach: linking to thin/empty pages from the homepage works against indexing rather than for it.

### Rendering

`DirectoryHub.jsx` is `'use client'`, but client components are still server-rendered, so the links land in the initial HTML and are crawlable. Requirements:

- Plain `next/link` anchors. No `useState`, no accordion, no "show more" gating any link.
- Anchor text: `Top {cat.shortName} Manufacturers in {stateLabel}`, href `/{cat.slug}/{stateSlug}`.
- Category heading is a non-link `<h3>` (the category itself is already linked from the cards section above).
- Place the section between the existing "Browse by State" picker (ends line 592) and the CTA band (line 595).
- Close with a link to `/states` and one to `/browse` for the long tail.
- Skip any category whose `topStates` array is empty rather than rendering an empty block.
- Reuse `SectionEyebrow` (line 265) and the section shell conventions of the neighbouring sections; `useFadeInOnScroll` is optional here and must not gate link presence in the HTML.

Add a `topStates = {}` default to the `DirectoryHub` props (line 277) so the component still renders if the prop is absent.

### Verification

1. `curl -s localhost:3000 | grep -c 'Manufacturers in'` — must return roughly 120 (JS disabled, links still there).
2. Spot-check five hrefs return HTTP 200 and that the target page's listing count is non-zero.
3. Confirm the existing state picker still works.

### Out of scope

The GoodFirms-style intro paragraph and extra stats tiles from the reference screenshot. Category pages already render a `StatsBand`; adding a generated intro paragraph is a separate task.

---

## Risks

- **Workstream 1** changes how every filter click behaves. Users who expect instant navigation on category click now need the extra "Show results" press. This is the requested trade: one page load instead of three.
- **Workstream 2** visibly changes `/browse` icons and colors. The homepage and nav are refactored to read from the registry but must render identically — verify before and after screenshots match. The only intended homepage change is `BoltIcon`/`GearIcon` → lucide `Zap`/`Cog`.
- **Workstream 3** adds ~120 outbound links to the homepage (10 categories × up to 12 states). The link count itself is unremarkable for a directory. The real risk is the **target pages**, not the links: several category+state pages currently show 0 verified companies and 0.0 ratings with 0 reviews. Linking prominently to thin pages invites "Crawled – currently not indexed" rather than rankings. Using real listing counts (top 12 by count, skip empties) is the mitigation; watch the Search Console Pages report after shipping and cut the per-category state count if a large share lands unindexed.
