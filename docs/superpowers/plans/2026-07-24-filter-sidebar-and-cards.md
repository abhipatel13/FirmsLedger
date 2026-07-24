# Filter Sidebar + Enlarged Company Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real filter sidebar (state multi-select + employee-count range) to the category listing pages, and enlarge/enrich the company card, using shadcn/Tailwind for the new pieces only.

**Architecture:** URL-query-param-driven server-rendered filtering on `app/[category]/[state]/page.jsx` (both branches). `neonApi.js` gains a `filters` param on `fetchCompaniesByCategoryAndState` (SQL `inArray` for state, JS post-filter for the free-text `employee_count` column) plus a new `fetchStateCountsForCategory`. Two new shared components (`CompanyCard`, `FilterSidebar`) replace the duplicated inline card/state-widget markup in both page branches.

**Tech Stack:** Next.js 15 App Router (server components + one client component for the interactive filter widget), Drizzle ORM / Neon, Tailwind v3, shadcn/ui (`Checkbox`, `Card`, `Badge`, `Separator`, new `Field`/`FieldSet`/`FieldLegend`), lucide-react icons, Node's built-in `node:test` for the one pure-function unit (no test framework is installed in this repo — everything else is verified manually via `npx next lint` + dev server).

## Global Constraints

- `employee_count` is free text (e.g. `'11-50'`, `'1,276'`, `'1,569-5,000'`, `'1000+'`) — never write a SQL `gte`/`lte` against it; bucket it in JS.
- `states` query param only applies on the nationwide page (`state` route segment absent); state-specific pages ignore it — state is already fixed by the route.
- Filter state lives entirely in the URL (`?states=...&employees=...`), composable with the existing `?page=` param. Changing filters resets `page` to 1.
- Do not rewrite the rest of `app/[category]/[state]/page.jsx` (header, breadcrumb, pagination, "Other Categories" widget, CTA block) to Tailwind — only `CompanyCard` and `FilterSidebar` are new Tailwind/shadcn pieces, per the approved spec's scope decision.
- No AI summaries, reference logos, bookmarking, "find employees," or "similar companies" — out of scope, no backing data.
- `avg_rating`/`review_count` showing `0.0` everywhere is a known, separate bug — do not fix it as part of this work.
- Reference spec: `docs/superpowers/specs/2026-07-24-filter-sidebar-and-cards-design.md`.

---

## File Structure

- **Create:** `src/lib/employeeCount.js` — pure parsing/bucketing helpers, no DB dependency.
- **Create:** `src/lib/employeeCount.test.js` — `node:test` unit tests for the above.
- **Modify:** `src/db/neonApi.js` — factor out category→company-ID resolution, extend `fetchCompaniesByCategoryAndState` with a `filters` param, add `fetchStateCountsForCategory`.
- **Create:** `src/components/listing/CompanyCard.jsx` — server-renderable enlarged card.
- **Create:** `src/components/listing/FilterSidebar.jsx` — client component, state + employee checkboxes.
- **Create:** `src/components/ui/field.jsx` (+ siblings) — via `npx shadcn add field`.
- **Modify:** `app/[category]/[state]/page.jsx` — wire filters into both branches, swap in the new components.

---

### Task 1: Employee-count parsing/bucketing utility

**Files:**
- Create: `src/lib/employeeCount.js`
- Test: `src/lib/employeeCount.test.js`

**Interfaces:**
- Produces: `EMPLOYEE_BUCKETS` (array of `{ key, label, min, max }`, `max: Infinity` for the open-ended bucket), `parseEmployeeCount(text) → number | null`, `bucketKeyFor(n) → string | null`, `formatEmployeeLabel(text) → string | null` (returns the bucket's label, e.g. `'1,569-5,000'` → `'1,000+ Employees'`, or `null` if `text` is empty/unparseable).

- [ ] **Step 1: Write the failing tests**

```javascript
// src/lib/employeeCount.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEmployeeCount, bucketKeyFor, formatEmployeeLabel, EMPLOYEE_BUCKETS } from './employeeCount.js';

test('parseEmployeeCount extracts the first number, stripping commas', () => {
  assert.equal(parseEmployeeCount('11-50'), 11);
  assert.equal(parseEmployeeCount('1,276'), 1276);
  assert.equal(parseEmployeeCount('1,569-5,000'), 1569);
  assert.equal(parseEmployeeCount('1000+'), 1000);
  assert.equal(parseEmployeeCount('10-49'), 10);
  assert.equal(parseEmployeeCount(''), null);
  assert.equal(parseEmployeeCount(null), null);
  assert.equal(parseEmployeeCount('n/a'), null);
});

test('bucketKeyFor maps numbers to the correct inclusive bucket', () => {
  assert.equal(bucketKeyFor(1), '1-10');
  assert.equal(bucketKeyFor(10), '1-10');
  assert.equal(bucketKeyFor(11), '11-50');
  assert.equal(bucketKeyFor(50), '11-50');
  assert.equal(bucketKeyFor(51), '51-200');
  assert.equal(bucketKeyFor(200), '51-200');
  assert.equal(bucketKeyFor(201), '200+');
  assert.equal(bucketKeyFor(50000), '200+');
  assert.equal(bucketKeyFor(null), null);
});

test('formatEmployeeLabel renders a clean bucket label from messy raw text', () => {
  assert.equal(formatEmployeeLabel('1,569-5,000'), '200+ Employees');
  assert.equal(formatEmployeeLabel('11-50'), '11-50 Employees');
  assert.equal(formatEmployeeLabel(''), null);
  assert.equal(formatEmployeeLabel(null), null);
});

test('EMPLOYEE_BUCKETS has exactly the 4 expected buckets in order', () => {
  assert.deepEqual(EMPLOYEE_BUCKETS.map((b) => b.key), ['1-10', '11-50', '51-200', '200+']);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/lib/employeeCount.test.js`
Expected: FAIL — `Cannot find module './employeeCount.js'`

- [ ] **Step 3: Write the implementation**

```javascript
// src/lib/employeeCount.js

export const EMPLOYEE_BUCKETS = [
  { key: '1-10',   label: '1-10 Employees',   min: 1,   max: 10 },
  { key: '11-50',  label: '11-50 Employees',  min: 11,  max: 50 },
  { key: '51-200', label: '51-200 Employees', min: 51,  max: 200 },
  { key: '200+',   label: '200+ Employees',   min: 201, max: Infinity },
];

/** Extracts the first integer found in a free-text employee_count value. */
export function parseEmployeeCount(text) {
  if (!text) return null;
  const match = String(text).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/** Maps a parsed number to its bucket key, or null if out of range/unparseable. */
export function bucketKeyFor(n) {
  if (n == null || Number.isNaN(n)) return null;
  const bucket = EMPLOYEE_BUCKETS.find((b) => n >= b.min && n <= b.max);
  return bucket ? bucket.key : null;
}

/** Renders a clean "N-M Employees" label from a raw (possibly messy) employee_count string. */
export function formatEmployeeLabel(text) {
  const n = parseEmployeeCount(text);
  if (n == null) return null;
  const key = bucketKeyFor(n);
  const bucket = EMPLOYEE_BUCKETS.find((b) => b.key === key);
  return bucket ? bucket.label : null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/lib/employeeCount.test.js`
Expected: PASS — all 4 tests green (13 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/employeeCount.js src/lib/employeeCount.test.js
git commit -m "feat: add employee-count parsing and bucketing utility"
```

---

### Task 2: Extend `neonApi.js` with filters and state counts

**Files:**
- Modify: `src/db/neonApi.js:112-159` (the `fetchCompaniesByCategoryAndState` function and the region around it)

**Interfaces:**
- Consumes: `parseEmployeeCount`, `bucketKeyFor` from `src/lib/employeeCount.js` (Task 1).
- Produces: `fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey = '-avg_rating', limit = 200, filters = {})` where `filters = { stateSlugs?: string[], employeeRanges?: string[] }` — used by Task 6. `fetchStateCountsForCategory(categorySlug) → Promise<{ stateSlug, stateLabel, count }[]>` — used by Task 6.

- [ ] **Step 1: Factor out the category→company-ID resolution into a shared helper**

Replace lines 116-138 of `src/db/neonApi.js` (the start of `fetchCompaniesByCategoryAndState` through `if (!links.length) return [];`) with a new internal helper plus the trimmed function start:

```javascript
/** Resolves a category slug (including its subcategories, if it's a parent) to the set of matching, approved company IDs. Returns [] if the category or no linked companies exist. */
async function resolveCategoryCompanyIds(categorySlug) {
  const [cat] = await db
    .select({ id: categories.id, is_parent: categories.is_parent })
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat) return [];

  let categoryIds = [cat.id];
  if (cat.is_parent) {
    const subs = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parent_id, cat.id));
    categoryIds.push(...subs.map((s) => s.id));
  }

  const links = await db
    .select({ company_id: company_categories.company_id })
    .from(company_categories)
    .where(inArray(company_categories.category_id, categoryIds));

  return [...new Set(links.map((l) => l.company_id))];
}

/**
 * Fetch companies by category slug, with optional state slug filter.
 * Used by /top/[category]/[state] page.
 */
export async function fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey = '-avg_rating', limit = 200, filters = {}) {
  const companyIds = await resolveCategoryCompanyIds(categorySlug);
  if (!companyIds.length) return [];

  const conditions = [
    eq(companies.approved, true),
    inArray(companies.id, companyIds),
  ];

  if (stateSlug) {
    const stateId = await resolveStateId(String(stateSlug).toLowerCase());
    if (!stateId) return []; // unknown state
    conditions.push(eq(companies.hq_state_id, stateId));
  }

  if (filters.stateSlugs?.length) {
    const resolvedIds = (
      await Promise.all(filters.stateSlugs.map((s) => resolveStateId(String(s).toLowerCase())))
    ).filter(Boolean);
    if (!resolvedIds.length) return []; // none of the requested states matched
    conditions.push(inArray(companies.hq_state_id, resolvedIds));
  }

  let rows = await db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(orderCol(companies, orderKey))
    .limit(limit);

  if (filters.employeeRanges?.length) {
    const wanted = new Set(filters.employeeRanges);
    rows = rows.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
  }

  return rows;
}
```

- [ ] **Step 2: Add the import for the new utility**

At the top of `src/db/neonApi.js`, after the existing `import { eq, ... } from 'drizzle-orm';` line, add:

```javascript
import { parseEmployeeCount, bucketKeyFor } from '@/lib/employeeCount';
```

- [ ] **Step 3: Add `fetchStateCountsForCategory`**

Add directly after the `fetchCompaniesByCategoryAndState` function (before the `@deprecated fetchCompaniesByCategory` block):

```javascript
/**
 * Returns per-state result counts for a category, for the filter sidebar.
 * Scoped to the category only — not re-scoped by other active filters (v1 simplification).
 */
export async function fetchStateCountsForCategory(categorySlug) {
  const companyIds = await resolveCategoryCompanyIds(categorySlug);
  if (!companyIds.length) return [];

  const rows = await db
    .select({ hq_state_id: companies.hq_state_id, hq_state_label: companies.hq_state_label })
    .from(companies)
    .where(and(eq(companies.approved, true), inArray(companies.id, companyIds)));

  const stateRows = await db.select().from(states);
  const idToSlug = new Map(stateRows.map((s) => [s.id, s.slug]));

  const counts = new Map(); // stateSlug -> { stateSlug, stateLabel, count }
  for (const row of rows) {
    if (!row.hq_state_id) continue;
    const stateSlug = idToSlug.get(row.hq_state_id);
    if (!stateSlug) continue;
    const existing = counts.get(stateSlug);
    if (existing) existing.count += 1;
    else counts.set(stateSlug, { stateSlug, stateLabel: row.hq_state_label, count: 1 });
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}
```

- [ ] **Step 4: Verify with a manual script**

Run (adjust a real category slug from `src/lib/manufacturingCategories.js` if `electrical-components` doesn't exist):

```bash
node -e "
import('./src/db/neonApi.js').then(async (api) => {
  const counts = await api.fetchStateCountsForCategory('electrical-components');
  console.log('state counts:', counts.slice(0, 5));
  const filtered = await api.fetchCompaniesByCategoryAndState('electrical-components', null, '-avg_rating', 500, { employeeRanges: ['200+'] });
  console.log('200+ employee companies:', filtered.length);
  process.exit(0);
});
"
```

Expected: prints a non-empty array of `{ stateSlug, stateLabel, count }` objects and a count of companies whose `employee_count` parses into the `200+` bucket, with no thrown errors.

- [ ] **Step 5: Commit**

```bash
git add src/db/neonApi.js
git commit -m "feat: add state/employee-count filtering and state counts to neonApi"
```

---

### Task 3: Add the shadcn `field` component

**Files:**
- Create: `src/components/ui/field.jsx` (and any sibling files the CLI generates)

- [ ] **Step 1: Run the shadcn CLI**

```bash
npx shadcn@latest add field
```

- [ ] **Step 2: Review the generated file**

Read `src/components/ui/field.jsx`. Confirm it exports `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldLabel` (exact export names may vary slightly by version — note the actual exported names, Task 5 will import whatever this step confirms). Confirm imports use the `@/lib/utils` alias (matching this project's `components.json` aliases) and there are no `lucide-react` icon references that need swapping (this project already uses `lucide-react`, so no swap needed either way).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/field.jsx
git commit -m "chore: add shadcn field component"
```

---

### Task 4: `CompanyCard` component

**Files:**
- Create: `src/components/listing/CompanyCard.jsx`

**Interfaces:**
- Consumes: `formatEmployeeLabel` from `src/lib/employeeCount.js` (Task 1); shadcn `Card`, `CardContent`, `Badge` (already installed).
- Produces: `export default function CompanyCard({ company, rank })` — `company` is a row shape from `fetchCompaniesByCategoryAndState` (has `slug`, `name`, `logo_url`, `is_verified`, `avg_rating`, `review_count`, `hq_city`, `hq_state_label`, `employee_count`, `description`), `rank` is the 0-indexed overall rank (already offset by page, matching the existing `rankOffset + i` call sites in `app/[category]/[state]/page.jsx`). Used by Task 6.

- [ ] **Step 1: Write the component**

```jsx
// src/components/listing/CompanyCard.jsx
import Link from 'next/link';
import { CheckCircle, MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEmployeeLabel } from '@/lib/employeeCount';

function StarRow({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          fill={n <= Math.round(rating) ? '#F5A623' : '#e2e8f0'}
          color={n <= Math.round(rating) ? '#F5A623' : '#e2e8f0'}
        />
      ))}
    </span>
  );
}

export default function CompanyCard({ company, rank }) {
  const employeeLabel = formatEmployeeLabel(company.employee_count);
  const rankBg =
    rank === 0 ? 'bg-[#1A2E4A] text-white' : rank === 1 ? 'bg-[#243B58] text-white' : rank === 2 ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-500';

  return (
    <Link href={`/company/${company.slug}`} className="block no-underline group">
      <Card className="transition-colors group-hover:border-slate-400 group-hover:shadow-md">
        <CardContent className="flex items-start gap-5 p-7">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${rankBg}`}>
            #{rank + 1}
          </div>

          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="size-16 shrink-0 rounded-xl border border-slate-200 bg-white object-contain"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
              <span className="text-2xl font-bold text-slate-400">{company.name.charAt(0)}</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
              {company.is_verified ? (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <CheckCircle data-icon="inline-start" className="size-2.5" />
                  Verified
                </Badge>
              ) : null}
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <StarRow rating={parseFloat(company.avg_rating) || 0} />
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {(parseFloat(company.avg_rating) || 0).toFixed(1)}
                </span>
              </span>
              <span className="tabular-nums">{company.review_count || 0} reviews</span>
              {employeeLabel ? (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {employeeLabel}
                </span>
              ) : null}
              {company.hq_city || company.hq_state_label ? (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                </span>
              ) : null}
            </div>

            {company.description ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{company.description}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center">
            <ArrowRight className="size-4 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx next lint`
Expected: 0 errors (this file isn't referenced anywhere yet, so lint just checks syntax/import validity — it will run against the new file since ESLint scans the whole project).

- [ ] **Step 3: Commit**

```bash
git add src/components/listing/CompanyCard.jsx
git commit -m "feat: add enlarged CompanyCard component with employee-count field"
```

---

### Task 5: `FilterSidebar` component

**Files:**
- Create: `src/components/listing/FilterSidebar.jsx`

**Interfaces:**
- Consumes: `EMPLOYEE_BUCKETS` from `src/lib/employeeCount.js` (Task 1); shadcn `Checkbox` (installed), `Field`/`FieldSet`/`FieldLegend`/`FieldLabel` (Task 3 — use the exact export names confirmed in Task 3 Step 2).
- Produces: `export default function FilterSidebar({ basePath, activeStates, activeEmployeeRanges, stateCounts, showStateFilter })` — `basePath` is the route without query string (e.g. `/electrical-components`), `activeStates`/`activeEmployeeRanges` are `string[]` parsed from the current URL, `stateCounts` is the array from `fetchStateCountsForCategory` (only meaningful when `showStateFilter` is true), `showStateFilter` is `boolean`. Used by Task 6.

- [ ] **Step 1: Write the component**

```jsx
// src/components/listing/FilterSidebar.jsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldSet, FieldLegend, FieldLabel } from '@/components/ui/field';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterSidebar({ basePath, activeStates, activeEmployeeRanges, stateCounts, showStateFilter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(nextStates, nextEmployeeRanges) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStates.length) params.set('states', nextStates.join(',')); else params.delete('states');
    if (nextEmployeeRanges.length) params.set('employees', nextEmployeeRanges.join(',')); else params.delete('employees');
    params.delete('page');
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {showStateFilter ? (
        <FieldSet>
          <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Filter by State</FieldLegend>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {stateCounts.map((s) => (
              <Field key={s.stateSlug} orientation="horizontal" className="gap-2">
                <Checkbox
                  id={`state-${s.stateSlug}`}
                  checked={activeStates.includes(s.stateSlug)}
                  onCheckedChange={() => navigate(toggle(activeStates, s.stateSlug), activeEmployeeRanges)}
                />
                <FieldLabel htmlFor={`state-${s.stateSlug}`} className="flex-1 text-sm font-normal">
                  {s.stateLabel} <span className="text-slate-400">({s.count})</span>
                </FieldLabel>
              </Field>
            ))}
          </div>
        </FieldSet>
      ) : null}

      <FieldSet>
        <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Employees</FieldLegend>
        <div className="flex flex-col gap-1">
          {EMPLOYEE_BUCKETS.map((b) => (
            <Field key={b.key} orientation="horizontal" className="gap-2">
              <Checkbox
                id={`emp-${b.key}`}
                checked={activeEmployeeRanges.includes(b.key)}
                onCheckedChange={() => navigate(activeStates, toggle(activeEmployeeRanges, b.key))}
              />
              <FieldLabel htmlFor={`emp-${b.key}`} className="text-sm font-normal">
                {b.label}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </FieldSet>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx next lint`
Expected: 0 errors. If `Field`/`FieldSet`/`FieldLegend`/`FieldLabel` export names differ from what Task 3 confirmed, fix the import line to match.

- [ ] **Step 3: Commit**

```bash
git add src/components/listing/FilterSidebar.jsx
git commit -m "feat: add FilterSidebar component for state and employee-count filtering"
```

---

### Task 6: Wire filters and new components into the listing page

**Files:**
- Modify: `app/[category]/[state]/page.jsx`

**Interfaces:**
- Consumes: `fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey, limit, filters)`, `fetchStateCountsForCategory(categorySlug)` (Task 2); `CompanyCard` (Task 4); `FilterSidebar` (Task 5).

- [ ] **Step 1: Update imports**

At the top of `app/[category]/[state]/page.jsx`, change:

```javascript
import { fetchCompaniesByCategoryAndState } from '@/db/neonApi';
```

to:

```javascript
import { fetchCompaniesByCategoryAndState, fetchStateCountsForCategory } from '@/db/neonApi';
import CompanyCard from '@/components/listing/CompanyCard';
import FilterSidebar from '@/components/listing/FilterSidebar';
```

- [ ] **Step 2: Add a shared query-param parser**

After the existing `toTitleCase` helper function (around line 88), add:

```javascript
function parseFilterParams(searchParams) {
  const statesParam = searchParams?.states;
  const employeesParam = searchParams?.employees;
  const activeStates = statesParam ? String(statesParam).split(',').filter(Boolean) : [];
  const activeEmployeeRanges = employeesParam ? String(employeesParam).split(',').filter(Boolean) : [];
  return { activeStates, activeEmployeeRanges };
}

function buildFilterQueryString(activeStates, activeEmployeeRanges, page) {
  const params = new URLSearchParams();
  if (activeStates.length) params.set('states', activeStates.join(','));
  if (activeEmployeeRanges.length) params.set('employees', activeEmployeeRanges.join(','));
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}
```

- [ ] **Step 3: Thread `searchParams` through to the subcategory-hub branch**

The subcategory-hub branch (`renderCategoryPage`, called from `CategoryStatePage`) currently only receives `pageParam`. Update the top-level page component and `renderCategoryPage` signature:

```javascript
export default async function CategoryStatePage({ params, searchParams }) {
  const { category, state } = await params;
  const sp = await searchParams;
  return renderCategoryPage({ category, state, pageParam: sp.page, searchParams: sp });
}

export async function renderCategoryPage({ category, state, pageParam, searchParams = {} }) {
```

(This is a signature change to the exported `renderCategoryPage` — check for other callers with `grep -rn "renderCategoryPage" app/ src/` before editing, and update any other call site the same way, passing its own `searchParams`.)

- [ ] **Step 4: Apply filters in the subcategory-hub branch**

In the subcategory-hub branch, this line:

```javascript
const companies = await fetchCompaniesByCategoryAndState(category, null, '-avg_rating', 500);
```

becomes:

```javascript
const { activeStates, activeEmployeeRanges } = parseFilterParams(searchParams);
const [companies, stateCounts] = await Promise.all([
  fetchCompaniesByCategoryAndState(category, null, '-avg_rating', 500, { stateSlugs: activeStates, employeeRanges: activeEmployeeRanges }),
  fetchStateCountsForCategory(category),
]);
```

(Subcategory-hub pages are nationwide-only per the existing code, so `showStateFilter` is always `true` here.)

- [ ] **Step 5: Apply filters in the state-listing/nationwide branch**

Find this line further down (state-listing branch):

```javascript
const companies    = await fetchCompaniesByCategoryAndState(category, state || null, '-avg_rating', 500);
```

Replace with:

```javascript
const { activeStates, activeEmployeeRanges } = parseFilterParams(searchParams);
const showStateFilter = !state; // nationwide only
const [companies, stateCounts] = await Promise.all([
  fetchCompaniesByCategoryAndState(category, state || null, '-avg_rating', 500, {
    stateSlugs: showStateFilter ? activeStates : [],
    employeeRanges: activeEmployeeRanges,
  }),
  showStateFilter ? fetchStateCountsForCategory(category) : Promise.resolve([]),
]);
```

- [ ] **Step 6: Replace the card-rendering block in both branches**

In each branch, replace the inline `<Link key={company.slug} ... className="company-card">...</Link>` block (the one rendering rank badge, logo, name, verified badge, stars, description) with:

```jsx
{pageCompanies.map((company, i) => (
  <CompanyCard key={company.slug} company={company} rank={rankOffset + i} />
))}
```

- [ ] **Step 7: Insert `FilterSidebar` into both branches' `<aside>`**

In the subcategory-hub branch's sidebar (replacing the "Top States" widget isn't applicable there — it has no such widget; just insert before "Other Categories" or the CTA — check the actual sidebar order and insert `FilterSidebar` as the first child of `<aside>`):

```jsx
<FilterSidebar
  basePath={basePath}
  activeStates={activeStates}
  activeEmployeeRanges={activeEmployeeRanges}
  stateCounts={stateCounts}
  showStateFilter={true}
/>
```

In the state-listing branch's sidebar, **remove** the entire "Top states" widget block (the one rendering `TOP_STATES.map(...)` pills) when `showStateFilter` is true, and insert `FilterSidebar` in its place:

```jsx
{showStateFilter ? (
  <FilterSidebar
    basePath={basePath}
    activeStates={activeStates}
    activeEmployeeRanges={activeEmployeeRanges}
    stateCounts={stateCounts}
    showStateFilter={true}
  />
) : (
  <>
    {/* existing "Top states" pill widget, unchanged, for state-specific pages */}
    <FilterSidebar
      basePath={basePath}
      activeStates={[]}
      activeEmployeeRanges={activeEmployeeRanges}
      stateCounts={[]}
      showStateFilter={false}
    />
  </>
)}
```

- [ ] **Step 8: Fix the empty-results copy to be filter-aware**

In both branches, the empty state currently reads "Be the first ... to get listed." Change the condition so that when filters are active, it instead shows a "no matches" message with a clear-filters link. In the state-listing branch:

```jsx
{companies.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '64px 24px', color: '#64748b' }}>
    {(activeStates.length || activeEmployeeRanges.length) ? (
      <>
        <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No companies match these filters</p>
        <Link href={basePath} style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          Clear filters
        </Link>
      </>
    ) : (
      <>
        <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No listings yet</p>
        <p style={{ fontSize: 14 }}>Be the first {categoryName}{stateName ? ` in ${stateName}` : ' in the US'} to get listed.</p>
        <Link href="/list-your-company" style={{ display: 'inline-flex', marginTop: 16, backgroundColor: '#0f172a', color: '#ffffff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
          List Your Company
        </Link>
      </>
    )}
  </div>
) : ( /* existing card list */
```

Apply the same pattern to the subcategory-hub branch's empty state.

- [ ] **Step 9: Preserve filter params in pagination links**

In both branches, the pagination `<Link href={...}>` calls currently build query strings with only `?page=N`. Replace each `href` expression — e.g.:

```javascript
href={`${basePath}${currentPage - 1 > 1 ? `?page=${currentPage - 1}` : ''}`}
```

becomes:

```javascript
href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage - 1)}`}
```

and similarly for the page-number links (`buildFilterQueryString(activeStates, activeEmployeeRanges, n)`) and the "Next" link (`buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage + 1)`). Do this in both branches.

- [ ] **Step 10: Lint**

Run: `npx next lint`
Expected: 0 errors.

- [ ] **Step 11: Manual verification with the dev server**

```bash
npm run dev
```

Then in a browser (or via `curl`/Playwright):
- Visit `/electrical-components` — confirm the state filter (with counts) and employee filter render, larger cards show employee count when available.
- Check a state checkbox — confirm URL updates to `?states=<slug>` and results narrow to that state.
- Check an employee-range checkbox — confirm URL updates to `?employees=<key>` and results narrow accordingly.
- Combine both — confirm both conditions apply (AND, not OR, across dimensions).
- Visit `/electrical-components/california` — confirm only the employee filter renders (no state checkboxes), "Top States" widget is untouched.
- Trigger a filter combination with zero results — confirm the "No companies match these filters" + "Clear filters" copy renders and the link clears back to the unfiltered page.
- Go to page 2 of an unfiltered list, then apply a filter — confirm it resets to page 1. Apply a filter, then paginate — confirm `page` composes with `states`/`employees` in the URL.

Fix any issues found before proceeding.

- [ ] **Step 12: Commit**

```bash
git add "app/[category]/[state]/page.jsx"
git commit -m "feat: wire filter sidebar and enlarged cards into category listing pages"
```

---

## Self-Review Notes

- **Spec coverage:** URL scheme (Task 6 Steps 2, 9) ✓; state SQL filter + employee JS filter (Task 2) ✓; `fetchStateCountsForCategory` (Task 2 Step 3) ✓; `CompanyCard` enlargement + employee row (Task 4) ✓; `FilterSidebar` with shadcn `Checkbox`/`Field` (Task 5) ✓; nationwide-only state filter, employees-only on state pages (Task 6 Steps 4/5/7) ✓; empty-state copy fix (Task 6 Step 8) ✓; pagination composing with filters (Task 6 Step 9) ✓; `Promise.all` parallel fetching (Task 6 Steps 4/5) ✓; `startTransition` on navigation (Task 5) ✓.
- **Type consistency:** `filters.stateSlugs`/`filters.employeeRanges` (Task 2) match `activeStates`/`activeEmployeeRanges` naming used in Tasks 5-6 exactly as the values passed through, no renaming drift. `formatEmployeeLabel`/`bucketKeyFor`/`parseEmployeeCount`/`EMPLOYEE_BUCKETS` names are identical across Tasks 1, 2, 4, 5.
- **Known risk flagged for the implementer:** Task 6 Step 3 changes the exported `renderCategoryPage` signature — must grep for other call sites before editing, since this function is exported and could be imported elsewhere (e.g. a sitemap generator or test harness).
