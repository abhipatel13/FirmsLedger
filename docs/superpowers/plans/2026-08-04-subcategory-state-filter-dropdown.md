# State Filter Dropdown on Subcategory+State Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the `/{category}/{subcategory}/{state}` listing page, let a user jump straight to a different state from a dropdown, instead of having to navigate back to the subcategory hub (`/{category}/{subcategory}`) and re-pick a state from there.

**Architecture:** `app/[category]/[state]/[subcategory]/page.jsx` (URL order is actually `/category/subcategory/state` — the folder names `[state]`/`[subcategory]` are swapped on purpose, see the `params` destructuring at line 27/81) currently renders no filter UI at all — just a static sidebar of subcategory links and a page-count badge. The two sibling routes (`app/[category]/page.jsx`, `app/[category]/[state]/page.jsx`) already solve this exact problem with `FilterBar`'s "State" dropdown, which lists every state for the category via `fetchStateCountsForCategory()` and lets the user pick one. This plan (1) exports the reusable dropdown shell `FilterDropdown` out of `FilterBar.jsx` so its look is guaranteed identical everywhere, (2) wraps it in a small standalone `StateFilterDropdown` component that navigates via `<Link>` on click (this page has no other filters to batch with, so there's no need for `FilterBar`'s "pending + Show results" flow), and (3) wires it into the subcategory+state page, fetching `stateCounts` the same way the subcategory hub page already does.

**Tech Stack:** Next.js 15 App Router, React Server Components + one small Client Component, existing `fetchStateCountsForCategory` from `@/db/neonApi`.

## Global Constraints

- Zero behavior change to the two routes that already use `FilterBar` (`app/[category]/page.jsx`, `app/[category]/[state]/page.jsx`). Task 1 only adds an `export` keyword — no logic changes.
- Reuse `fetchStateCountsForCategory(categorySlug)` exactly as the subcategory hub branch already does at `app/[category]/[state]/page.jsx:206` — same function, same "not actually subcategory-scoped, category-wide approximation" caveat (there is no subcategory tagging in the DB; this is already the codebase's accepted simplification, called out in that file's existing comments).
- "All States" must link to `/{category}/{subcategory}` (the nationwide subcategory hub route), never to a 404.
- Visual language (colors, radii, hover states, dropdown positioning) must come from the existing `FilterDropdown` shell, not be re-implemented — that's what "just like other pages have it" means here.
- This page has no employee-count or pagination-preserving query params to carry across a state switch (`fetchCompaniesByCategoryAndState` here takes no filter object, unlike the sibling routes) — the dropdown is a plain navigation link, not a form.

---

### Task 1: Export `FilterDropdown` from `FilterBar.jsx`

**Files:**
- Modify: `src/components/listing/FilterBar.jsx:28`

**Interfaces:**
- Produces: `export function FilterDropdown({ label, activeCount, isOpen, onToggle, onClose, children })` — a positioned trigger button + portal-rendered dropdown panel. Same signature as today, now importable.

- [ ] **Step 1: Change the function declaration to an export**

In `src/components/listing/FilterBar.jsx`, line 28:

```jsx
export function FilterDropdown({ label, activeCount, isOpen, onToggle, onClose, children }) {
```

(Was `function FilterDropdown(...)`. Nothing else in the function body changes.)

- [ ] **Step 2: Verify the default export and existing usage still work**

```bash
npm run build
```

Expected: build succeeds, no new warnings about `FilterBar`. The component still has its default export (`export default function FilterBar(...)` at the bottom of the file) — a named export and a default export coexist without conflict.

- [ ] **Step 3: Commit**

```bash
git add src/components/listing/FilterBar.jsx
git commit -m "refactor(seo): export FilterDropdown so other pages can reuse the same UI

No behavior change — FilterBar's own usage is untouched. This lets the
subcategory+state page render an identical-looking state dropdown instead
of re-implementing the trigger/panel/positioning logic.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Build `StateFilterDropdown`

**Files:**
- Create: `src/components/listing/StateFilterDropdown.jsx`

**Interfaces:**
- Consumes: `FilterDropdown` from `./FilterBar` (Task 1).
- Produces: `export default function StateFilterDropdown({ stateCounts, currentState, buildHref })` where:
  - `stateCounts`: `{ stateSlug: string, stateLabel: string, count: number }[]` — exact shape returned by `fetchStateCountsForCategory`.
  - `currentState`: `string` — the state slug currently in the URL.
  - `buildHref`: `(stateSlugOrNull: string | null) => string` — the caller decides the target URL; this component never constructs paths itself.

- [ ] **Step 1: Write the component**

```jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilterDropdown } from './FilterBar';

export default function StateFilterDropdown({ stateCounts, currentState, buildHref }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = stateCounts.find((s) => s.stateSlug === currentState)?.stateLabel ?? 'State';

  return (
    <FilterDropdown
      label={currentLabel}
      activeCount={currentState ? 1 : 0}
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      onClose={() => setIsOpen(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 0' }}>
        <Link
          href={buildHref(null)}
          onClick={() => setIsOpen(false)}
          style={{
            display: 'block',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: !currentState ? 600 : 400,
            color: !currentState ? '#0f172a' : '#475569',
            backgroundColor: !currentState ? '#f1f5f9' : 'transparent',
            textDecoration: 'none',
            marginBottom: 4,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          All States
        </Link>
        {stateCounts.map((s) => {
          const isSelected = s.stateSlug === currentState;
          return (
            <Link
              key={s.stateSlug}
              href={buildHref(s.stateSlug)}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#0f172a' : '#475569',
                backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span>{s.stateLabel}</span>
              <span className="text-xs text-slate-400">({s.count})</span>
            </Link>
          );
        })}
      </div>
    </FilterDropdown>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/listing/StateFilterDropdown.jsx
git commit -m "feat(seo): add StateFilterDropdown for direct-navigation state pickers

Wraps the existing FilterDropdown shell with a plain <Link>-based state
list. Unlike FilterBar's state dropdown (which batches with category/
subcategory/employee filters behind a 'Show results' button), this one
navigates on click — for pages with no other filters to batch with.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Wire it into the subcategory+state page

**Files:**
- Modify: `app/[category]/[state]/[subcategory]/page.jsx`

**Interfaces:**
- Consumes: `fetchStateCountsForCategory(categorySlug)` from `@/db/neonApi` (already exists, used identically at `app/[category]/[state]/page.jsx:206`), `StateFilterDropdown` from `@/components/listing/StateFilterDropdown` (Task 2).

- [ ] **Step 1: Add the import for the fetcher and the new component**

Line 6 currently reads:

```jsx
import { fetchCompaniesByCategoryAndState } from '@/db/neonApi';
```

Change to:

```jsx
import { fetchCompaniesByCategoryAndState, fetchStateCountsForCategory } from '@/db/neonApi';
```

Add a new import after line 9 (`import { getCompanyDescription } from '@/utils';`):

```jsx
import StateFilterDropdown from '@/components/listing/StateFilterDropdown';
```

- [ ] **Step 2: Fetch `stateCounts` alongside `companies`**

Line 105 currently reads:

```jsx
  // Fetch companies — pass both category and subcategory for filtering
  const companies = await fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 500);
```

Change to:

```jsx
  // Fetch companies — pass both category and subcategory for filtering
  const [companies, stateCounts] = await Promise.all([
    fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 500),
    fetchStateCountsForCategory(category),
  ]);
```

- [ ] **Step 3: Render the dropdown in the header, next to the listings badge**

Find this block (around line 150-163):

```jsx
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                  {pageTitle}
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Grouped by category and location. Updated monthly.
                </p>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 24px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{companies.length}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>total listings</p>
              </div>
            </div>
```

Replace it with the same block plus a filter row underneath (matching `FilterBar`'s own `margin: '16px 0 28px 0'` spacing convention):

```jsx
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                  {pageTitle}
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Grouped by category and location. Updated monthly.
                </p>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 24px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{companies.length}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>total listings</p>
              </div>
            </div>

            <div style={{ margin: '20px 0 0 0' }}>
              <StateFilterDropdown
                stateCounts={stateCounts}
                currentState={state}
                buildHref={(s) => (s ? `/${category}/${subcategory}/${s}` : `/${category}/${subcategory}`)}
              />
            </div>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: build succeeds, no new warnings.

- [ ] **Step 5: Manual check against a live route**

This route needs a reachable DB (`.env.local` populated) and a category/subcategory/state combo with approved companies. `mechanical-components` has a `cnc-machining` subcategory (see `src/lib/manufacturingCategories.js`); pick any state known to have mechanical-components listings — `california` is confirmed live from the screenshot that motivated this plan.

```bash
npm start &
sleep 6
curl -s "http://localhost:3000/mechanical-components/cnc-machining/california" | grep -o 'State</button>\|>[A-Za-z ]*</span>'  | head -5
```

If that combo 404s (no companies for that exact subcategory+state — remember this page ignores the subcategory param when querying, per the comment at line 104, so it 404s only when the *category+state* has zero companies), fall back to opening `http://localhost:3000/mechanical-components/cnc-machining/california` in a browser and confirm:
- A "State" (or current state name) dropdown chip appears below the total-listings badge.
- Opening it lists every state with a company count, with the current state highlighted.
- Clicking a different state navigates to `/mechanical-components/cnc-machining/{that-state}` and the page reloads with that state's listings.
- Clicking "All States" navigates to `/mechanical-components/cnc-machining` (the nationwide subcategory hub).

```bash
kill %1
```

- [ ] **Step 6: Lint**

```bash
npm run lint
```

Expected: no new errors in the three files touched by this plan.

- [ ] **Step 7: Commit**

```bash
git add 'app/[category]/[state]/[subcategory]/page.jsx'
git commit -m "feat(seo): let users switch states directly on the subcategory listing page

/{category}/{subcategory}/{state} had no way to change state short of
navigating back to the subcategory hub and picking again. Adds the same
state dropdown the hub page already shows, backed by the same
fetchStateCountsForCategory() the rest of the codebase uses for this.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Coverage check

| File | Task |
|---|---|
| `src/components/listing/FilterBar.jsx` | 1 (export only, no behavior change) |
| `src/components/listing/StateFilterDropdown.jsx` | 2 (new) |
| `app/[category]/[state]/[subcategory]/page.jsx` | 3 |
| `app/[category]/page.jsx` | none — already has the state dropdown (nationwide branch) |
| `app/[category]/[state]/page.jsx` | none — already has the state dropdown when nationwide; deliberately hides it when a state is already selected (that's a separate, narrower gap — see Follow-up below) |

## Follow-up (not part of this plan)

`app/[category]/[state]/page.jsx` (the 2-segment `/{category}/{state}` page — the one in the original screenshot) also hides its state dropdown once a state is selected (`showStateFilter = !state` at line 431), for the same underlying reason: no way to reselect state without going back. If that page should get the same treatment, it's a near-identical change (always fetch `stateCounts`, always pass `showStateFilter={true}` with `currentState={state}` into the existing `FilterBar`) — but it reuses `FilterBar`'s existing batched "Show results" flow rather than needing a new component, so it's a smaller, separate change. Flagging it here rather than silently bundling it into this plan, since the user's wording ("category < subcategory < state page") named the 3-segment route specifically.
