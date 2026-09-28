# Scale + SEO Remediation Plan

**Written:** 2026-08-01 · **Scheduled:** Monday 2026-08-03 · **Branch:** cut `fix/scale-data-layer` off `main`

Goal: make the site correct and cheap at ~5 lakh (500,000) companies. Everything below was verified against the code on 2026-08-01, not assumed.

---

## 0. Context — why this order

Page inventory splits into two classes with opposite growth curves:

| Page class | Today | At 5 lakh companies |
|---|---|---|
| `/[category]` | 10 | **10** |
| `/[category]/[subcategory]` | 84 | **84** |
| `/[category]/[state]` | 500 | **500** |
| `/[category]/[state]/[subcategory]` | 4,200 | **4,200** |
| `/states/[slug]` | 50 | **50** |
| **Taxonomy subtotal** | **~4,844** | **~4,844 (bounded by 10 × 84 × 50)** |
| `/company/[slug]` | ~3,000 | **500,000 (linear)** |

Target architecture:

- **Taxonomy pages** — bounded, high-value, crawled constantly → **ISR**. Prerender the top slice at build (10 categories + 500 category/state), let the ~4,300 long-tail combos generate on demand and cache.
- **Profile pages** — unbounded → **on-demand ISR only**, never build-time. Already correct today (`revalidate = 3600`, no `generateStaticParams`). Do not change.

**Caching comes last.** Tasks 1 and 2 fix a live correctness bug; caching a wrong query just serves stale wrong answers to more people.

---

## Task 1 — Replace the `IN (uuid, …)` list with a JOIN 🔴 blocker

**File:** [`src/db/neonApi.js:150-173`](../src/db/neonApi.js#L150)

`resolveCategoryCompanyIds()` pulls every company ID in a category into Node, dedupes in JS, and returns an array that three callers feed straight back into `inArray(companies.id, companyIds)` — a literal `IN (uuid, uuid, …)`.

```js
const links = await db.select({ company_id: company_categories.company_id })
  .from(company_categories)
  .where(inArray(company_categories.category_id, categoryIds));
return [...new Set(links.map((l) => l.company_id))];
```

Scale math:
- 3,000 companies → ~300 UUIDs → ~11 KB query. Fine.
- 500,000 companies → ~50,000 UUIDs → **~1.8 MB SQL string per request.** Planner degrades, statement-size limits hit.

Combined with `force-dynamic`, this runs on every Googlebot hit across all 4,844 taxonomy pages.

**Callers to migrate** — all three, in one pass:
- `fetchCompaniesByCategoryAndState` — [`neonApi.js:180`](../src/db/neonApi.js#L180)
- `fetchStateCountsForCategory` — [`neonApi.js:222`](../src/db/neonApi.js#L222)
- `fetchCategoryStats` — [`neonApi.js:251`](../src/db/neonApi.js#L251)

**Approach.** Keep a helper, but return *category IDs* (bounded: 1 parent + ≤10 subs) instead of company IDs. Then join.

```js
// Bounded — a category has at most ~11 ids. Safe to keep as an IN list.
async function resolveCategoryIds(categorySlug) {
  const [cat] = await db.select({ id: categories.id, is_parent: categories.is_parent })
    .from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!cat) return [];
  if (!cat.is_parent) return [cat.id];
  const subs = await db.select({ id: categories.id })
    .from(categories).where(eq(categories.parent_id, cat.id));
  return [cat.id, ...subs.map((s) => s.id)];
}
```

Then in each caller:

```js
db.selectDistinct(...)                     // or .groupBy(companies.id)
  .from(companies)
  .innerJoin(company_categories, eq(company_categories.company_id, companies.id))
  .where(and(
    eq(companies.approved, true),
    inArray(company_categories.category_id, categoryIds),
    ...otherConditions,
  ))
```

`selectDistinct` (or `GROUP BY companies.id`) replaces the JS `new Set()` dedupe — a company linked to both a parent and a child category must not appear twice.

**Verify:** listing counts for 3 known category/state combos are byte-identical before and after. Capture the numbers first.

---

## Task 2 — Push pagination and filtering into SQL 🔴 live bug

### 2a. Employee filter runs after the limit — wrong results **today**

**File:** [`src/db/neonApi.js:209-212`](../src/db/neonApi.js#L209)

```js
let rows = await db.select()... .limit(limit);   // 500
if (filters.employeeRanges?.length) {
  rows = rows.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
}
```

The filter is applied to an arbitrary top-500-by-rating slice, not the real result set. Any category/state with >500 companies already returns wrong answers. This is not a future problem.

**Fix:** `employee_count` is text, so bucketing needs a SQL expression. Two options — pick on Monday:
- **(a)** Add a generated/derived integer column `employee_count_num` + a `employee_bucket` column, index it, filter in SQL. Cleanest, needs a migration.
- **(b)** Translate each bucket to a SQL `OR` of range predicates over a cast expression. No migration, uglier.

Recommend **(a)** — it's needed for sorting and faceting later anyway.

### 2b. `limit 500` + `.slice()` caps pagination

**Files:** [`app/[category]/[state]/page.jsx:430`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L430), and `.slice()` at [`:449-451`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L449)

Fetches 500 rows, paginates in JS. At `PAGE_SIZE = 25` that caps at 20 pages — a category/state with thousands of companies leaves most unreachable.

**Fix:** `fetchCompaniesByCategoryAndState` takes `{ limit, offset }` and does SQL `LIMIT/OFFSET`; a sibling `countCompaniesByCategoryAndState` returns the total for the pager and the `Top N` heading. Two cheap queries instead of one fat one.

⚠️ The `Top ${topN(count)}` heading and the `ItemList` JSON-LD both currently use `companies.length`. Once the fetch is paginated, they must switch to the **count** query, or every page will claim "Top 25" regardless of reality.

### 2c. `fetchCategoryStats` aggregates in JS

**File:** [`src/db/neonApi.js:266-280`](../src/db/neonApi.js#L266)

Selects every matching row to compute count, verified count, median rating, states covered. Should be one `COUNT/AVG/percentile_cont` aggregate query. Same fix pass as 2b.

---

## Task 3 — Add the missing indexes 🟠

Checked [`src/db/schema.ts`](../src/db/schema.ts) — there are no indexes on the columns every listing query filters by. The only relevant constraint is `unique().on(company_id, category_id)` at [`schema.ts:87`](../src/db/schema.ts#L87), whose leading column is `company_id`, so it does **not** serve `category_id` lookups.

Needed:
- `company_categories(category_id)` — the join direction actually used
- `companies(hq_state_id)`
- `companies(approved)` — or a partial index `WHERE approved = true`
- `companies(avg_rating DESC)` — the default sort at [`neonApi.js:35-41`](../src/db/neonApi.js#L35)
- consider a composite `companies(approved, hq_state_id, avg_rating DESC)`

Drizzle migration + verify with `EXPLAIN ANALYZE` on the largest category/state combo.

---

## Task 4 — Switch listing routes to ISR 🟢 do only after 1-3

Remove `export const dynamic = 'force-dynamic'`, add `export const revalidate = 21600` (6h) to:
- [`app/[category]/page.jsx:9`](../app/%5Bcategory%5D/page.jsx#L9)
- [`app/[category]/[state]/page.jsx:15`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L15)
- [`app/[category]/[state]/[subcategory]/page.jsx:11`](../app/%5Bcategory%5D/%5Bstate%5D/%5Bsubcategory%5D/page.jsx#L11)

Notes:
- All three already have a `generateStaticParams` that `force-dynamic` currently neutralizes — verified via `.next/prerender-manifest.json`, which contains **zero** paths for these routes despite the build printing the `●` SSG marker. Removing `force-dynamic` activates them.
- Trim `generateStaticParams` to the top slice (10 categories + 500 category/state). Leave `dynamicParams` at its default `true` so the ~4,300 long-tail combos render on demand and cache. Do **not** prerender all 4,844 at build.
- `?states=` / `?employees=` / `?page=` still work: accessing `searchParams` makes *those* requests dynamic automatically, while the clean crawlable URL stays cached.
- Leave `/company/[slug]` exactly as it is.

**Verify:** after build, `.next/prerender-manifest.json` contains the expected prerendered paths, and filtered URLs still return correct results.

---

## Task 5 — Sitemap aggregation + sharding 🟠

**File:** [`app/sitemap.js:30-63`](../app/sitemap.js#L30)

`buildLiveCombos()` selects every approved company × category row and counts them in a JS `Map`. At 5 lakh companies that's millions of rows into serverless memory, hourly.

**Fix:** one `GROUP BY category_slug, state_slug` returning ~4,800 rows, with the parent-category rollup ([`sitemap.js:44-61`](../app/sitemap.js#L44)) done in SQL or over the already-small aggregate.

**Also:** sitemaps cap at 50,000 URLs / 50 MB. Current output is ~500 URLs so it's fine — but if company profiles are ever re-added, this needs a sitemap index with shards. Note it, don't build it now (YAGNI).

---

## Task 6 — Unique copy on state pages 🟡 independent, SEO not scale

**File:** [`app/[category]/[state]/page.jsx:762`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L762)

```js
{!stateName && cat?.longDescription && (
```

The 10 hand-written ~90-word `longDescription` blocks only render on the 10 nationwide `/[category]` pages. The ~490 `/[category]/[state]` pages — the ones meant to rank — have **zero** unique prose. Their only differentiation is the H1 and the company list.

Also byte-identical across all ~500 pages:
- Subtitle "Grouped by category and location. Updated monthly." — [`:546`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L546)
- StatsBand "How this list is built:" boilerplate — [`src/components/StatsBand.jsx:54-57`](../src/components/StatsBand.jsx#L54)

**Fix:** surface `longDescription` on state pages with state framing, plus a generated per-state paragraph from real data (company count, top specialties, largest metros, verified share). Data-derived copy is genuinely unique per page and doesn't need 490 hand-written blurbs.

This is orthogonal to rendering mode — it is a content problem, not a caching problem.

---

## Already done 2026-08-01 (uncommitted on `main`)

1. [`app/sitemap.js`](../app/sitemap.js) — removed the `/company/{slug}` block. Sitemap went from ~3,500 URLs to ~500. Profiles stay indexable and link-crawlable, just not sitemap-pushed. Dropped now-unused `and` / `isNotNull` imports.
2. [`app/[category]/[state]/page.jsx:20`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L20) — `PAGE_SIZE` 10 → 25, so one indexable page satisfies "top 9/10/11/20/25" instead of pushing #11+ onto a noindexed `?page=2`. Exported `topN()`.
3. [`app/[category]/page.jsx:16`](../app/%5Bcategory%5D/page.jsx#L16) — replaced hardcoded `Math.min(count, 10)` with shared `topN()` so title and H1 can't desync.

`npm run build` passes. **Commit these selectively on Monday** — the working tree also carries unrelated `pipeline/*` and `src/db/schema.ts` changes that should not be swept in.

---

## Non-issues — checked, no action needed

- **"top 9 / top 10 / top 11" creating duplicate pages.** Does not happen. [`src/lib/searchIntent.js`](../src/lib/searchIntent.js) treats `top`/`best`/`find` as stopwords and strips digits in `normalize()`; `canonicalPathFor({categorySlug, subcategorySlug, stateSlug})` takes no N. All variants resolve to the same URL.
- **`?page=N` duplicates.** Already `robots: { index: false, follow: true }` with a self-canonical — [`page.jsx:156`](../app/%5Bcategory%5D/%5Bstate%5D/page.jsx#L156).
- **Static rendering meaning one shared page.** It doesn't. `generateStaticParams` emits one separate HTML file per URL, each with its own content — same as `/states/[slug]` does today for all 50 states.
- **`src/components/SearchPageLayout.jsx`** — imported by nothing. Dead file, safe to delete whenever.

---

## Suggested Monday order

1. Commit the three files from 2026-08-01 (selectively).
2. Capture baseline counts for 3 category/state combos.
3. Task 1 (JOIN) → verify counts unchanged.
4. Task 3 (indexes) → `EXPLAIN ANALYZE`.
5. Task 2 (SQL pagination + filter + stats aggregate) → verify the `Top N` heading and JSON-LD read from the count query.
6. Task 4 (ISR) → verify prerender manifest.
7. Task 5 (sitemap `GROUP BY`).
8. Task 6 (state-page copy) — separate branch, separate PR.

Tasks 1-5 decide whether lakhs is viable. Task 6 decides whether the pages rank once they are.
