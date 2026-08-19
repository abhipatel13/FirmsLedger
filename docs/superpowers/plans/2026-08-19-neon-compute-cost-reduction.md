# Neon Compute-Cost Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut Neon compute from ~214 CU-h/month to under 50 CU-h/month by collapsing the number of distinct database touches from ~200,000/day to ~100/day, so the compute can actually scale to zero between requests.

**Architecture:** Neon bills `active_time × CU size`, not queries or storage. The compute is awake 91% of the time because 9,102 company pages revalidate hourly with *uncached* queries, and 4,750 `(category, state)` listing combinations each hold four `unstable_cache` keys at a 1-hour TTL. The fix is structural, not a TTL tweak: cache the near-static lookups, cache the per-company reads, and replace the 4,750-combination listing cache with **one cached bundle per category (95 keys max, ~470 kB worst case)** from which every state slice, page slice, filter, count, and stat is derived in memory. Then swap time-based revalidation for tag-based on-demand invalidation triggered by admin writes, keeping a 24-hour TTL as a backstop because the `pipeline/` scripts write to Postgres directly and never touch the admin API.

**Tech Stack:** Next.js 15 App Router, `unstable_cache` from `next/cache`, React `cache()`, Drizzle ORM over `@neondatabase/serverless` (neon-http), Neon Postgres 17, Vercel.

## Safety Rules (production application — read before touching anything)

`www.firmsledger.com` is live and serving traffic. These rules are not advisory.

- **This plan performs zero database writes and zero schema changes.** Every `psql` invocation in it is a `SELECT` used to look up a sample slug. There is no `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, or `ALTER` anywhere in it.
- **NEVER run `npm run db:push`, `drizzle-kit push`, `db:generate`, or any migration command while executing this plan.** Nothing here requires a schema change. `drizzle-kit push` can drop columns to reconcile a diff — it is the one command in this repo that could destroy data, and it has no business in a caching change.
- **Do not create, reset, or delete Neon branches.** The plan reads project metrics via `neonctl projects get`, which is read-only. Do not use `neonctl branches create/delete/reset`, and do not run `neon init` again — its onboarding flow can provision resources.
- **Never push straight to `main` for Task 4.** `main` auto-deploys to production. Tasks 2-6 land on a feature branch and go out as a Vercel **preview** deployment that is compared against production before promotion (Task 7).
- **The `try/catch → safe fallback` arms are a production safety feature, not boilerplate.** A transient Neon error must yield an empty list, not a 500. This also defines the failure mode to watch for after deploy: a spike in *empty* listing pages, not a spike in errors.
- **`NEON_LOG_QUERIES` must never be set in Vercel.** When it is unset, `src/db/client.ts` passes the raw `neon()` client straight through untouched, so the production code path is byte-identical to today's. Verify with `npx vercel env ls` before deploying Task 1.
- **Task 4 is the only behaviourally risky change.** It rewrites the data path behind every listing page. Its verification step (comparing rendered company slugs and their order against pre-change output) is mandatory, not optional.
- **Rollback is `git revert` + redeploy.** No data migration means no data to un-migrate. Cache state self-heals: reverting restores the old cache keys and the old TTLs take over within an hour.

---

## Global Constraints

- **No new dependencies.** Everything here uses `next/cache`, `react`, and `drizzle-orm`, all already installed.
- **`src/db/neonApi.js` is JavaScript (JSX-era), not TypeScript.** No type annotations in that file.
- **Every public export in `src/db/neonApi.js` keeps its exact current signature and return shape.** `src/api/apiClient.js`, `app/[category]/page.jsx`, `app/[category]/[state]/page.jsx`, `app/[category]/[state]/[subcategory]/page.jsx`, `app/company/[slug]/page.jsx`, and `app/page.jsx` all call these; none of them may need editing for a signature change.
- **Preserve the `try/catch → safe fallback` pattern** introduced in commit `2112187`. Transient Neon `SocketError`s during background revalidation must degrade to an empty/zero/default value, never throw a 500 into a live request. Every new or modified data function keeps its `catch` arm.
- **Preserve the `cache(unstable_cache(impl, [name], opts))` composition order** already used in this file: React `cache()` on the outside for per-render dedup, `unstable_cache` on the inside for cross-request persistence.
- **Cached values must be JSON-safe.** `companies.avg_rating` is `numeric` and arrives as a **string**; `created_at`/`updated_at` are `timestamp` and do not survive a cache round-trip as `Date` objects. Never call a `Date` method on a value read back out of `unstable_cache`, and always `parseFloat` `avg_rating` before comparing or sorting.
- **Vercel Data Cache entry limit is 2 MB.** The largest per-category bundle measured is `furniture-woodworking` at 1,165 companies ≈ 470 kB with the column projection specified in Task 4. Do not add un-projected columns to the bundle.
- **`PAGE_SIZE` is 25** (`app/[category]/[state]/page.jsx:26`). Ranking offsets depend on it; do not change it.
- **Do not commit `HISTORY.md`** — it is gitignored and local-only.
- Measured baseline to beat, captured 2026-08-19 for consumption period starting 2026-08-05: `active_time_seconds` 1,136,608 (316 h, 91% of wall clock), `compute_time_seconds` 365,604 (101.6 CU-h), `data_transfer_bytes` 26,309,534,324 (26.3 GB), 9,102 approved companies, 95 categories (3 of them parents), 50 states, **0 reviews**.

---

### Task 1: Query-count instrumentation

Without this, every later task's impact is a guess. This adds an opt-in counter that logs one line per SQL round-trip so you can prove a page render went from N queries to 0 on a warm cache.

**Files:**
- Modify: `src/db/client.ts:1-8` (the whole file)
- Create: `scripts/count-queries.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `dbQueryCount(): number` and `resetDbQueryCount(): void` exported from `@/db/client`; the `NEON_LOG_QUERIES=1` environment flag; `node scripts/count-queries.mjs <path> [path...]` which prints a per-URL query count.

- [ ] **Step 1: Replace `src/db/client.ts` with the instrumented version**

```ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const rawSql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : (null as any);

// Opt-in SQL round-trip counter. Off unless NEON_LOG_QUERIES=1, so production
// pays nothing for it. Used by scripts/count-queries.mjs to prove that a warm
// cache render performs zero database touches — the whole point of the caching
// work in docs/superpowers/plans/2026-08-19-neon-compute-cost-reduction.md.
let queryCount = 0;
export const dbQueryCount = () => queryCount;
export const resetDbQueryCount = () => {
  queryCount = 0;
};

const counting =
  rawSql && process.env.NEON_LOG_QUERIES === '1'
    ? Object.assign(
        (...args: any[]) => {
          queryCount += 1;
          console.log(`[neon] query #${queryCount}`);
          return (rawSql as any)(...args);
        },
        rawSql
      )
    : rawSql;

const sql = counting;
export const db = process.env.DATABASE_URL ? drizzle(sql, { schema }) : (null as any);

export type DB = typeof db;
```

- [ ] **Step 2: Create the counting script**

```javascript
// scripts/count-queries.mjs
// Hits each path twice against a locally running dev server and reports how
// many `[neon] query #` lines the server logged for each request. Run the dev
// server with NEON_LOG_QUERIES=1 in a separate terminal, piping to a file:
//   NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1
// then:  node scripts/count-queries.mjs /metal-fabrication/california /company/<slug>
import { readFileSync } from 'node:fs';

const LOG = process.env.DEV_LOG || '/tmp/dev.log';
const BASE = process.env.BASE || 'http://localhost:3000';
const paths = process.argv.slice(2);

if (!paths.length) {
  console.error('usage: node scripts/count-queries.mjs <path> [path...]');
  process.exit(1);
}

const countLines = () => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes('[neon] query #')).length;

for (const p of paths) {
  for (const pass of ['cold', 'warm']) {
    const before = countLines();
    const res = await fetch(`${BASE}${p}`);
    await res.text();
    await new Promise((r) => setTimeout(r, 1500)); // let the server flush its log
    const queries = countLines() - before;
    console.log(`${pass.padEnd(4)} ${String(res.status).padEnd(4)} ${String(queries).padStart(4)} queries  ${p}`);
  }
}
```

- [ ] **Step 3: Verify the counter reports a non-zero cold count**

```bash
NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
sleep 20
node scripts/count-queries.mjs /metal-fabrication/california
```

Expected: two lines, `cold` showing a query count of roughly 4-8 and `warm` showing fewer (the listing functions are already cached). If both are `0`, the counter wrapper is not being reached — check that `NEON_LOG_QUERIES=1` actually made it into the dev server's environment before continuing, because every later verification step depends on this.

- [ ] **Step 4: Record the company-page baseline**

```bash
export $(grep -E '^DATABASE_URL' .env.local | xargs)
SLUG=$(psql "$DATABASE_URL" -t -A -c "select slug from companies where approved and description is not null limit 1")
node scripts/count-queries.mjs "/company/$SLUG"
```

Expected: **both** `cold` and `warm` report roughly 4-5 queries. That warm count staying high is the bug Task 3 fixes — write the number down.

- [ ] **Step 5: Commit**

```bash
git add src/db/client.ts scripts/count-queries.mjs
git commit -m "chore(db): add opt-in SQL round-trip counter for cache verification"
```

---

### Task 2: Cache the four near-static lookups

`fetchCategories`, `fetchStates`, `fetchHomepageStats`, and `fetchApprovedCompanyCount` read data that changes at most a few times a month, and every one of them currently hits Postgres on every render that touches the nav, footer, homepage, or a company page.

**Files:**
- Modify: `src/db/neonApi.js:47-50` (`fetchStates`), `:65-67` (`fetchCategories`), `:115-128` (`fetchApprovedCompanyCount`), `:130-150` (`fetchHomepageStats`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `fetchStates(orderKey?)`, `fetchCategories()`, `fetchApprovedCompanyCount()`, `fetchHomepageStats()` — all four keeping their existing signatures and return shapes, now backed by a 24-hour cache tagged `'companies'`.

- [ ] **Step 1: Add a shared TTL/tag constant next to the other helpers**

Insert immediately after the `orderCol` helper (currently ends at `src/db/neonApi.js:43`):

```javascript
// ── Cache policy ──────────────────────────────────────────────────────────────
// Neon bills active compute time, so the goal is not "fast queries" but "long
// stretches with zero queries" so the compute can scale to zero. Everything
// read-only shares the 'companies' tag; admin writes call revalidateTag to push
// changes out immediately (see Task 6), and the TTL is only a backstop for the
// pipeline/ scripts that write to Postgres directly and never hit the admin API.
const DAY = 86400;
const WEEK = 604800;
const CACHE_TAGS = ['companies'];
```

- [ ] **Step 2: Replace `fetchStates` and `fetchCategories`**

```javascript
const fetchStatesImpl = async (orderKey = 'name') => {
  try {
    return await db.select().from(states).orderBy(asc(states[orderKey] ?? states.name));
  } catch (err) {
    console.error('Error fetching states:', err);
    return [];
  }
};

export const fetchStates = cache(
  unstable_cache(fetchStatesImpl, ['fetchStates'], { revalidate: DAY, tags: CACHE_TAGS })
);
```

```javascript
const fetchCategoriesImpl = async () => {
  try {
    return await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

export const fetchCategories = cache(
  unstable_cache(fetchCategoriesImpl, ['fetchCategories'], { revalidate: DAY, tags: CACHE_TAGS })
);
```

- [ ] **Step 3: Wrap `fetchApprovedCompanyCount` and `fetchHomepageStats`**

Rename each existing `export async function X(...)` to `const XImpl = async (...) => {` (keeping the body, including its existing `try/catch` and hardcoded fallbacks, byte-for-byte), then add:

```javascript
export const fetchApprovedCompanyCount = cache(
  unstable_cache(fetchApprovedCompanyCountImpl, ['fetchApprovedCompanyCount'], { revalidate: DAY, tags: CACHE_TAGS })
);

export const fetchHomepageStats = cache(
  unstable_cache(fetchHomepageStatsImpl, ['fetchHomepageStats'], { revalidate: DAY, tags: CACHE_TAGS })
);
```

- [ ] **Step 4: Verify the build and lint pass**

```bash
npm run lint && npm run build
```

Expected: both exit 0. A failure mentioning "used before defined" means an `Impl` const is declared below its `export const` wrapper — `const` is not hoisted, so the `Impl` must appear first in the file.

- [ ] **Step 5: Verify the homepage warm render stops querying**

```bash
pkill -f "next dev"; NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
sleep 20
node scripts/count-queries.mjs /
```

Expected: `warm` reports **0** queries. If it still reports queries, something on the homepage calls a function this task did not wrap — find it in the dev log and wrap it the same way.

- [ ] **Step 6: Commit**

```bash
git add src/db/neonApi.js
git commit -m "perf(db): cache near-static state/category/stat lookups for 24h"
```

---

### Task 3: Stop the 9,102-page company drip

This is the single largest source of database touches. `fetchCompanyByIdAny` and `fetchCompanyCategories` have only React `cache()`, which dedupes within one render and does nothing across requests, so every crawl of every company page is a fresh set of queries. And `fetchReviews` is queried on all 9,102 pages against a table with **zero rows**.

**Files:**
- Modify: `src/db/neonApi.js:439-461` (`fetchCompanyByIdAny`), `:498-511` (`fetchCompanyCategories`)
- Modify: `app/company/[slug]/page.jsx:9-16` (imports) and `:73-80` (the `Promise.all`)

**Interfaces:**
- Consumes: `DAY`, `WEEK`, `CACHE_TAGS` from Task 2.
- Produces: `fetchCompanyByIdAny(idOrSlug)` and `fetchCompanyCategories(where)` with unchanged signatures, cached for 7 days and 1 day respectively.

- [ ] **Step 1: Wrap `fetchCompanyByIdAny`**

Replace the existing `export const fetchCompanyByIdAny = cache(async function fetchCompanyByIdAny(idOrSlug) { ... });` with:

```javascript
const fetchCompanyByIdAnyImpl = async (idOrSlug) => {
  if (!idOrSlug) return null;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    const match = UUID_REGEX.test(String(idOrSlug))
      ? eq(companies.id, idOrSlug)
      : eq(companies.slug, idOrSlug);

    const [row] = await db
      .select()
      .from(companies)
      .where(and(match, eq(companies.approved, true)))
      .limit(1);
    return row ?? null;
  } catch (err) {
    console.error('Error fetching company by id/slug:', err);
    return null;
  }
};

export const fetchCompanyByIdAny = cache(
  unstable_cache(fetchCompanyByIdAnyImpl, ['fetchCompanyByIdAny'], { revalidate: WEEK, tags: CACHE_TAGS })
);
```

- [ ] **Step 2: Wrap `fetchCompanyCategories`**

Rename the existing `export async function fetchCompanyCategories(where = {}) {` body to `const fetchCompanyCategoriesImpl = async (where = {}) => {`, wrap its body in `try { ... } catch (err) { console.error('Error fetching company categories:', err); return []; }`, and add:

```javascript
export const fetchCompanyCategories = cache(
  unstable_cache(fetchCompanyCategoriesImpl, ['fetchCompanyCategories'], { revalidate: DAY, tags: CACHE_TAGS })
);
```

- [ ] **Step 3: Drop the zero-row reviews query from the company page**

In `app/company/[slug]/page.jsx`, remove `fetchReviews,` from the import block, then replace the `Promise.all` at `:73-80` with:

```javascript
  if (company?.id) {
    // ponytail: the reviews table is empty (0 rows as of 2026-08-19), so
    // querying it on all 9,102 company pages bought nothing but Neon compute
    // time. Restore the fetchReviews call here the moment review collection
    // ships — the AgencyProfile `reviews` prop already handles a populated list.
    companyCategories = await fetchCompanyCategories({ company_id: company.id }).catch(() => []);
```

Leave `let reviews = [];` in place — `AgencyProfile` still receives it.

- [ ] **Step 4: Verify no other caller depends on the removed import**

```bash
grep -rn "fetchReviews" app src
```

Expected: hits in `src/db/neonApi.js` (the definition), `src/api/apiClient.js`, and `app/api/reviews/route.js` if present — but **no** hit in `app/company/[slug]/page.jsx`. The function itself stays exported; only this one call site goes away.

- [ ] **Step 5: Verify the company page warm render drops to zero queries**

```bash
pkill -f "next dev"; NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
sleep 20
export $(grep -E '^DATABASE_URL' .env.local | xargs)
SLUG=$(psql "$DATABASE_URL" -t -A -c "select slug from companies where approved and description is not null limit 1")
node scripts/count-queries.mjs "/company/$SLUG"
```

Expected: `cold` roughly 2-3 queries, `warm` **0**. Compare against the number recorded in Task 1 Step 4 — that delta, multiplied by 9,102 pages, is this task's payoff.

- [ ] **Step 6: Commit**

```bash
git add src/db/neonApi.js "app/company/[slug]/page.jsx"
git commit -m "perf(db): cache company profile reads, drop empty-table reviews query"
```

---

### Task 4: Collapse the 4,750-combination listing cache into 95 per-category bundles

The four listing functions are keyed by `(categorySlug, stateSlug, orderKey, limit, offset, filters)`. Every state, every page number, and every filter permutation mints a separate cache key with its own hourly revalidation. Replacing them with one cached bundle per category — and deriving every slice in memory — takes the cache-key count from unbounded to at most 95, and simultaneously fixes the 26 GB of egress caused by `db.select()` pulling all 40 columns.

**Files:**
- Modify: `src/db/neonApi.js:172-427` (the five `Impl` functions and their four exported wrappers)

**Interfaces:**
- Consumes: `DAY`, `CACHE_TAGS` from Task 2; the existing `resolveCategoryIds(categorySlug)`, `parseEmployeeCount`, and `bucketKeyFor` helpers unchanged.
- Produces:
  - `fetchCategoryBundle(categorySlug)` → `{ companies: Row[], stateCounts: {stateSlug, stateLabel, count}[], stats: {totalCount, verifiedCount, medianRating, statesCovered, topSpecialties} }` where `Row` has exactly the 15 projected fields listed in Step 1.
  - `fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey?, limit?, offset?, filters?)` → `Row[]` — **unchanged signature**.
  - `countCompaniesByCategoryAndState(categorySlug, stateSlug, filters?)` → `number` — **unchanged signature**.
  - `fetchStateCountsForCategory(categorySlug)` → same array shape as today — **unchanged signature**.
  - `fetchCategoryStats(categorySlug, stateSlug?)` → same object shape as today — **unchanged signature**.

- [ ] **Step 1: Add the bundle fetcher above the existing listing functions**

Insert after `resolveCategoryIds` (currently ends at `src/db/neonApi.js:169`):

```javascript
/**
 * One cached read per category, holding everything the listing pages need.
 *
 * Replaces four separately-keyed caches that fanned out across
 * (state x page x filter) — 4,750+ combinations, each revalidating hourly, which
 * kept the Neon compute awake 91% of the month. This is at most 95 cache keys
 * (one per category slug), and every state slice, page slice, filter, count and
 * stat below is derived from it in memory with zero extra queries.
 *
 * Column projection is deliberate and load-bearing: it keeps the largest bundle
 * (furniture-woodworking, 1,165 companies) at roughly 470 kB, well inside
 * Vercel's 2 MB Data Cache entry limit, and it is what cuts the 26 GB/14-day
 * egress. Do not add columns here without re-measuring the worst-case size:
 *   select c.slug, count(*), pg_size_pretty(sum(coalesce(length(co.description),0)+200)::bigint)
 *     from categories c
 *     join company_categories cc on cc.category_id = c.id
 *     join companies co on co.id = cc.company_id
 *    where co.approved group by c.slug order by 2 desc limit 5;
 */
const LISTING_COLUMNS = {
  id: companies.id,
  slug: companies.slug,
  name: companies.name,
  description: companies.description,
  website: companies.website,
  logo_url: companies.logo_url,
  hq_city: companies.hq_city,
  hq_state_id: companies.hq_state_id,
  hq_state_label: companies.hq_state_label,
  employee_count: companies.employee_count,
  certifications: companies.certifications,
  is_verified: companies.is_verified,
  featured: companies.featured,
  review_count: companies.review_count,
  avg_rating: companies.avg_rating,
};

const EMPTY_BUNDLE = {
  companies: [],
  stateCounts: [],
  stats: { verifiedCount: 0, totalCount: 0, medianRating: null, statesCovered: 0, topSpecialties: [] },
};

const fetchCategoryBundleImpl = async (categorySlug) => {
  try {
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (!categoryIds.length) return EMPTY_BUNDLE;

    const subquery = db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    const [rows, stateRows] = await Promise.all([
      db
        .select(LISTING_COLUMNS)
        .from(companies)
        .where(and(eq(companies.approved, true), inArray(companies.id, subquery)))
        // Deterministic tiebreak on id. Without it, equal-rated companies can
        // swap positions between revalidations, which churns the published
        // ranking and the ItemList JSON-LD positions for no reason.
        .orderBy(desc(companies.avg_rating), asc(companies.id)),
      db.select({ id: states.id, slug: states.slug, name: states.name }).from(states),
    ]);

    const idToState = new Map(stateRows.map((s) => [s.id, s]));

    const counts = new Map();
    for (const row of rows) {
      if (!row.hq_state_id || !idToState.has(row.hq_state_id)) continue;
      const key = row.hq_state_id;
      const entry = counts.get(key) || {
        stateSlug: idToState.get(key).slug,
        stateLabel: row.hq_state_label || idToState.get(key).name,
        count: 0,
      };
      entry.count += 1;
      counts.set(key, entry);
    }

    return {
      // stateSlug is denormalised onto each row so every derivation below can
      // filter by state without re-resolving slugs. ~15 bytes/row (17 kB worst case).
      companies: rows.map((r) => ({ ...r, stateSlug: idToState.get(r.hq_state_id)?.slug ?? null })),
      stateCounts: [...counts.values()].sort((a, b) => b.count - a.count),
      stats: computeStats(rows),
    };
  } catch (err) {
    // ponytail: swallow transient Neon errors (dropped fetch during background
    // revalidation) so they degrade to an empty bundle instead of a 500.
    console.error('Error fetching category bundle:', err);
    return EMPTY_BUNDLE;
  }
};

export const fetchCategoryBundle = cache(
  unstable_cache(fetchCategoryBundleImpl, ['fetchCategoryBundle'], { revalidate: DAY, tags: CACHE_TAGS })
);
```

- [ ] **Step 2: Add the in-memory derivation helpers directly above `fetchCategoryBundleImpl`**

```javascript
/** avg_rating is a Postgres numeric — it arrives as a string, always parse it. */
function ratingOf(row) {
  const n = parseFloat(row?.avg_rating);
  return Number.isFinite(n) ? n : 0;
}

function computeStats(rows) {
  const ratings = rows.map(ratingOf).filter((n) => n > 0).sort((a, b) => a - b);
  const mid = Math.floor(ratings.length / 2);
  const medianRating = ratings.length
    ? (ratings.length % 2 ? ratings[mid] : (ratings[mid - 1] + ratings[mid]) / 2)
    : null;

  const certCounts = new Map();
  for (const row of rows) {
    for (const cert of row.certifications || []) {
      certCounts.set(cert, (certCounts.get(cert) || 0) + 1);
    }
  }

  return {
    totalCount: rows.length,
    verifiedCount: rows.filter((r) => r.is_verified === true).length,
    medianRating,
    statesCovered: new Set(rows.map((r) => r.hq_state_id).filter(Boolean)).size,
    topSpecialties: [...certCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cert]) => cert),
  };
}

/**
 * Applies the same predicates the old SQL WHERE clauses applied, in memory.
 * `stateSlug` is the path segment (single state); `filters.stateSlugs` is the
 * multi-select sidebar filter, only ever populated on the nationwide view.
 */
function applyListingFilters(bundleCompanies, stateSlugsFromPath, filters = {}) {
  let rows = bundleCompanies;
  const active = filters || {};

  const wantedStates = stateSlugsFromPath?.length
    ? stateSlugsFromPath
    : (active.stateSlugs?.length ? active.stateSlugs : null);

  if (wantedStates) {
    const wanted = new Set(wantedStates.map((s) => String(s).toLowerCase()));
    rows = rows.filter((r) => wanted.has(String(r.stateSlug || '').toLowerCase()));
  }

  if (active.employeeRanges?.length) {
    const wanted = new Set(active.employeeRanges);
    rows = rows.filter((r) => wanted.has(bucketKeyFor(parseEmployeeCount(r.employee_count))));
  }

  return rows;
}

function sortRows(rows, orderKey = '-avg_rating') {
  if (orderKey === '-avg_rating' || !orderKey) return rows; // already the bundle's order
  const isDesc = orderKey.startsWith('-');
  const key = orderKey.replace(/^-/, '').replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  const valueOf = key === 'avg_rating' ? ratingOf : (r) => r?.[key];
  return [...rows].sort((a, b) => {
    const av = valueOf(a);
    const bv = valueOf(b);
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : 1;
    return isDesc ? -cmp : cmp;
  });
}
```

- [ ] **Step 3: Verify the bundle row shape matches what the helpers read**

```bash
grep -n "stateSlug" src/db/neonApi.js
```

Expected: at least three hits — the `companies: rows.map(...)` denormalisation in `fetchCategoryBundleImpl`, the `stateCounts` entry construction, and the `r.stateSlug` read in `applyListingFilters`. `applyListingFilters` filters on `r.stateSlug`, which is **not** one of the 15 projected columns, so if the `.map()` in Step 1 was dropped every state page silently returns zero companies. This grep is the guard against that.

- [ ] **Step 4: Replace the four exported listing functions with in-memory derivations**

Delete `fetchCompaniesByCategoryAndStateImpl`, `countCompaniesByCategoryAndStateImpl`, `fetchStateCountsForCategoryImpl`, `fetchCategoryStatsImpl` and all four of their `export const ... = cache(unstable_cache(...))` wrappers. Replace with:

```javascript
/**
 * Fetch companies by category slug, with optional state slug filter.
 * Derived from the single cached per-category bundle — performs no query.
 */
export async function fetchCompaniesByCategoryAndState(
  categorySlug,
  stateSlug,
  orderKey = '-avg_rating',
  limit = 200,
  offset = 0,
  filters = {}
) {
  const bundle = await fetchCategoryBundle(categorySlug);
  const rows = applyListingFilters(bundle.companies, stateSlug ? [stateSlug] : null, filters);
  const sorted = sortRows(rows, orderKey);

  // Historical quirk preserved deliberately: the old SQL applied LIMIT/OFFSET
  // only when no employee filter was active, and post-filtered otherwise. Keep
  // that behaviour so pagination and rank offsets do not shift.
  if (filters?.employeeRanges?.length) return sorted;

  const start = Number(offset) || 0;
  return sorted.slice(start, start + (Number(limit) || 200));
}

/** Count of matching companies for a category + state combination. No query. */
export async function countCompaniesByCategoryAndState(categorySlug, stateSlug, filters = {}) {
  const bundle = await fetchCategoryBundle(categorySlug);
  return applyListingFilters(bundle.companies, stateSlug ? [stateSlug] : null, filters).length;
}

/** Per-state result counts for the filter sidebar. Category-scoped. No query. */
export async function fetchStateCountsForCategory(categorySlug) {
  const bundle = await fetchCategoryBundle(categorySlug);
  return bundle.stateCounts;
}

/** Stats for a category (+ optional state) listing page. No query. */
export async function fetchCategoryStats(categorySlug, stateSlug = null) {
  const bundle = await fetchCategoryBundle(categorySlug);
  if (!stateSlug) return bundle.stats;
  return computeStats(applyListingFilters(bundle.companies, [stateSlug], {}));
}
```

Keep `filterCompaniesBySubcategoryKeywords` and the deprecated `fetchCompaniesByCategory` exactly as they are — the latter still delegates correctly.

- [ ] **Step 5: Verify build, lint and typecheck**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all exit 0. `computeStats` is referenced by `fetchCategoryBundleImpl` before its own declaration in file order — that is fine because `function` declarations hoist, but the `const LISTING_COLUMNS` and `EMPTY_BUNDLE` must appear before `fetchCategoryBundleImpl`.

- [ ] **Step 6: Verify listing output is unchanged against the pre-change page**

```bash
pkill -f "next dev"; NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
sleep 20
for p in /metal-fabrication /metal-fabrication/california /metal-fabrication/texas "/metal-fabrication/california?page=2"; do
  curl -s "http://localhost:3000$p" | grep -oE '/company/[a-z0-9-]+' | head -5
  echo "--- $p"
done
node scripts/count-queries.mjs /metal-fabrication /metal-fabrication/texas "/metal-fabrication/california?page=2"
```

Expected: the company slugs and their order match what `git stash && curl` produces on the pre-change code (spot-check at least the California page's first five). The query counts should show `cold` non-zero for the first category and **0** for every subsequent path in the same category — including the `?page=2` URL, which previously minted its own cache key.

- [ ] **Step 7: Commit**

```bash
git add src/db/neonApi.js
git commit -m "perf(db): collapse 4750-key listing cache into one bundle per category"
```

---

### Task 5: Bound crawl-driven key growth

After Task 4 there are no per-parameter cache keys left, so this no longer protects Neon. It still matters: every filter permutation a bot crawls is a Vercel function invocation and wasted crawl budget on a page that should not be indexed.

**Files:**
- Modify: `app/robots.js:8-15` (the `disallow` array)

**Interfaces:**
- Consumes: nothing.
- Produces: no code interface; a changed `/robots.txt` response.

- [ ] **Step 1: Add the query-parameter disallow rules**

```javascript
        disallow: [
          '/admin',
          '/api/',
          // Filter and pagination permutations are crawl-budget sinks: the same
          // companies re-sliced, all canonicalising to the unfiltered URL.
          '/*?page=',
          '/*?states=',
          '/*?employees=',
          '/*&page=',
          '/*&states=',
          '/*&employees=',
        ],
```

- [ ] **Step 2: Verify the generated robots.txt**

```bash
pkill -f "next dev"; npm run dev > /tmp/dev.log 2>&1 &
sleep 20
curl -s http://localhost:3000/robots.txt
```

Expected: the `User-agent: *` block lists all eight `Disallow:` lines, and `Sitemap: https://www.firmsledger.com/sitemap.xml` still appears at the bottom.

- [ ] **Step 3: Confirm the page clamp already exists**

```bash
grep -n "Math.min(Math.max(1, parseInt(pageParam" "app/[category]/[state]/page.jsx"
```

Expected: two hits (the subcategory branch and the state branch). Both already clamp `?page=` to `totalPages`, so `?page=99999` cannot mint work — no change needed. If either hit is missing, add the same `Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages)` expression there.

- [ ] **Step 4: Commit**

```bash
git add app/robots.js
git commit -m "chore(seo): disallow filter and pagination permutations in robots.txt"
```

---

### Task 6: Replace time-based revalidation with tag-based invalidation

With Tasks 2-4 done, the remaining Neon touches are TTL expiries. This task makes admin writes push changes out immediately, so the TTL becomes a pure backstop and the company route stops revalidating on a timer entirely.

**Files:**
- Modify: `app/company/[slug]/page.jsx:1` (`export const revalidate`)
- Modify: `app/api/admin/agencies/route.js` (add `revalidateTag` to the `POST`, `PUT`, and `PATCH` handlers)
- Modify: `app/api/admin/categories/route.js` (same, for category writes)

**Interfaces:**
- Consumes: the `'companies'` cache tag applied in Tasks 2-4.
- Produces: no new exports; admin mutations now invalidate the read cache synchronously.

- [ ] **Step 1: Stop the company route revalidating on a timer**

In `app/company/[slug]/page.jsx`, replace line 1:

```javascript
// No timer-based revalidation: 9,102 pages x hourly revalidation is what kept
// the Neon compute from ever scaling to zero. Admin writes call revalidateTag
// ('companies') instead — see app/api/admin/agencies/route.js. The 7-day TTL on
// fetchCompanyByIdAny is the backstop for pipeline/ scripts that write to
// Postgres directly and never hit the admin API.
export const revalidate = false;
```

- [ ] **Step 2: Invalidate on company writes**

At the top of `app/api/admin/agencies/route.js`, add:

```javascript
import { revalidateTag, revalidatePath } from 'next/cache';
```

Then in each of the `POST`, `PUT`, and `PATCH` handlers, immediately before the successful `return NextResponse.json(...)`, add:

```javascript
    revalidateTag('companies');
    if (updated?.slug || body?.slug) revalidatePath(`/company/${updated?.slug || body.slug}`);
```

For `PATCH`, the handler's `.returning({...})` call at `app/api/admin/agencies/route.js:150` currently selects five fields and does not include `slug`, so `revalidatePath` has nothing to build a path from. Extend it:

```javascript
      .returning({ id: companies.id, name: companies.name, slug: companies.slug, approved: companies.approved, is_verified: companies.is_verified, featured: companies.featured });
```

- [ ] **Step 3: Invalidate on category writes**

Add the same `import { revalidateTag } from 'next/cache';` to `app/api/admin/categories/route.js` and call `revalidateTag('companies');` before each successful mutation response. Category renames and reorders feed `fetchCategories`, which now caches for 24 hours.

- [ ] **Step 4: Verify end-to-end that an admin toggle shows up immediately**

```bash
pkill -f "next dev"; NEON_LOG_QUERIES=1 npm run dev > /tmp/dev.log 2>&1 &
sleep 20
export $(grep -E '^DATABASE_URL' .env.local | xargs)
SLUG=$(psql "$DATABASE_URL" -t -A -c "select slug from companies where approved and description is not null limit 1")
ID=$(psql "$DATABASE_URL" -t -A -c "select id from companies where slug='$SLUG'")
curl -s "http://localhost:3000/company/$SLUG" | grep -c "Verified" || true
```

Log into `/admin`, toggle `is_verified` on that company, reload `/company/$SLUG`, and confirm the badge state flips **without waiting**. Expected: the change is visible on the first reload. If it is not, the `revalidateTag` call is on a code path that returned early — check that it sits after the database write and before the response in the handler you actually exercised.

- [ ] **Step 5: Confirm the pipeline backstop assumption is documented**

```bash
grep -rn "revalidateTag\|revalidatePath" pipeline/ scripts/ | head
```

Expected: no hits. That is correct and intentional — the `pipeline/` scripts write straight to Postgres, so their changes surface via the 24-hour/7-day TTL rather than immediately. This is the reason the TTLs stay in place and must not be set to `false`.

- [ ] **Step 6: Commit**

```bash
git add "app/company/[slug]/page.jsx" app/api/admin/agencies/route.js app/api/admin/categories/route.js
git commit -m "perf(cache): swap timer revalidation for tag invalidation on admin writes"
```

---

### Task 7: Deploy and measure against the baseline

Every projection in this plan is modelled from database-touch counts and the 300-second autosuspend window. This task replaces the model with measurement.

**Files:** none.

**Interfaces:**
- Consumes: the baseline in Global Constraints.
- Produces: a measured before/after in `HISTORY.md`.

- [ ] **Step 1: Record the pre-deploy metric snapshot**

```bash
npx -y neonctl projects get tiny-sky-23867687 --output json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print({k:d[k] for k in ['active_time_seconds','compute_time_seconds','data_transfer_bytes','consumption_period_start']})"
```

Write the four numbers down. Neon's metrics lag roughly an hour, so this snapshot describes the hour *before* now.

- [ ] **Step 2: Deploy to a preview URL first — not to production**

```bash
git status --short          # confirm only the intended files are staged/committed
git checkout -b perf/neon-compute-reduction
git push -u origin perf/neon-compute-reduction
```

Vercel builds a **preview** deployment for the branch. `main` is untouched, so production keeps serving the current code. Wait for `● Ready`:

```bash
npx vercel ls 2>&1 | grep firms-ledger | head -3
```

- [ ] **Step 2b: Compare the preview against production before promoting**

```bash
PREVIEW=$(npx vercel ls 2>&1 | grep firms-ledger | grep Preview | head -1 | grep -oE 'https://[^ ]+')
for p in / /metal-fabrication /metal-fabrication/california /metal-fabrication/texas; do
  echo "### $p"
  diff <(curl -s "https://www.firmsledger.com$p" | grep -oE '/company/[a-z0-9-]+' | head -25) \
       <(curl -s "$PREVIEW$p"                    | grep -oE '/company/[a-z0-9-]+' | head -25) \
    && echo "identical"
done
export $(grep -E '^DATABASE_URL' .env.local | xargs)
SLUG=$(psql "$DATABASE_URL" -t -A -c "select slug from companies where approved and description is not null limit 1")
curl -s -o /dev/null -w "%{http_code}\n" "$PREVIEW/company/$SLUG"
```

Expected: `identical` for all four paths, and `200` for the company page. **A path that returns an empty company list is the Task 4 failure mode — stop and fix before promoting.** Do not proceed on a partial match.

- [ ] **Step 2c: Promote to production only after Step 2b is clean**

```bash
git checkout main && git merge --ff-only perf/neon-compute-reduction && git push origin main
```

- [ ] **Step 3: Confirm no 500s in the first hour**

```bash
DEPLOY=$(npx vercel ls 2>&1 | grep firms-ledger | grep Production | head -1 | grep -oE 'https://[^ ]+')
echo "$DEPLOY"
npx vercel logs "$DEPLOY" --json 2>&1 | grep -i "error\|500" | head -20
```

Expected: no `500` status entries and no `SocketError`. The `try/catch` fallbacks mean a transient Neon failure serves stale or empty data rather than erroring, so a spike in *empty* listing pages is the failure mode to watch for, not a spike in 500s.

- [ ] **Step 3b: Know the rollback before you need it**

If listing pages come back empty, company pages 404, or errors spike:

```bash
git revert --no-edit <the merge or commit sha> && git push origin main
```

Redeploying the previous commit is a complete rollback — this plan changed no data and no schema, so there is nothing to restore. Alternatively use Vercel's instant rollback to the prior production deployment while you diagnose:

```bash
npx vercel rollback 2>&1 | tail -5
```

- [ ] **Step 4: Wait 48 hours, then diff the metrics**

```bash
npx -y neonctl projects get tiny-sky-23867687 --output json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print({k:d[k] for k in ['active_time_seconds','compute_time_seconds','data_transfer_bytes']})"
```

Compute `(active_time_seconds_now - active_time_seconds_step1) / 172800` — that is the new awake fraction. Targets:
- awake fraction below **0.25** → Tasks 2-4 landed.
- awake fraction still above **0.75** → something still touches the database on a sub-5-minute cadence. Find it by checking whether `/company/<slug>` and `/[category]/[state]` warm renders really report 0 queries in production, then look at `app/sitemap.js` (hourly, uncached, and it runs a full grouped scan) and the two `vercel.json` cron jobs as the next suspects.
- `data_transfer_bytes` growth per day should fall well below the baseline's 1.83 GB/day thanks to the Task 4 column projection.

- [ ] **Step 5: Decide the plan tier**

If the projected month lands under 50 CU-h, the Neon Free tier covers it and the Launch subscription can be dropped. If it lands between 50 and 300 CU-h, stay on Launch and consider the follow-up below.

- [ ] **Step 6: Append the measured result to HISTORY.md**

Add a dated entry at the top of `HISTORY.md` with the before/after numbers and which tasks are deployed. Do **not** `git add` it — it is gitignored and local-only.

---

## Deliberately out of scope

- **`app/sitemap.js`** revalidates hourly and runs an uncached grouped scan over all 9,102 companies plus a second query per category. It is one touch per hour, not per page, so it cannot keep the compute awake on its own — but if Task 7 Step 4 shows the awake fraction stuck high, wrap `buildLiveCombos` in `unstable_cache` at 24 hours with the `'companies'` tag as the first follow-up.
- **Static export via `generateStaticParams`** for all 9,102 company pages would take database touches to build-time only (~1 minute of compute per deploy, roughly 0.3 CU-h/month). It is strictly better for Neon cost, and strictly worse for build time and Vercel build minutes. Only worth it if Tasks 2-6 leave you above the free tier.
- **Reviews.** The table is empty; Task 3 removes its query rather than caching it. When review collection ships, restore the call *cached* with the `'companies'` tag — not uncached, or the drip returns.
- **`AgencyCard.jsx`** references `agency.hq_state`, `agency.team_size`, `agency.hq_country`, and `agency.hourly_rate`, none of which exist in the current schema. That component is not on the listing path (`CompanyCard` is), so it is not this plan's problem, but it is dead or broken and worth a separate look.
