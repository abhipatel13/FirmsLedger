# Ranking & Indexing Remediation

**Date:** 2026-07-31
**Status:** Approved for planning

## Problem

FirmsLedger has 3.32K pages indexed and 126K not indexed in Google Search
Console, and the indexed pages do not rank. Investigation found three
independent causes, one of which is a compliance risk.

All counts below were measured against production Neon on 2026-07-31. The
ingest pipeline is actively running, so absolute numbers will have grown by
implementation time. Ratios and thresholds are what matter.

### Cause 1 — The site publishes fabricated review data

| Fact | Measured value |
|---|---|
| Rows in `reviews` table | 0 |
| `companies.review_count` | 0 for all rows |
| `companies.avg_rating` | 4.50–5.00 on ~938 rows |
| `companies.is_verified` | `false` for all rows |

`avg_rating` was populated by scraping/seeding and is backed by no review.

**This is latent, not live.** Verified on 2026-07-31:
`approved = true AND avg_rating > 0` returns **0 rows** — every rated row sits
in the unapproved pool. The `aggregateRating` block at
`app/company/[slug]/page.jsx:103` is additionally guarded by
`company.review_count > 0`, which is never true, so it does not currently
emit.

Phase 2 is what activates it. Approving ~1,007 companies, most carrying a
fabricated 4.5–5.0, would simultaneously:

- render star ratings on ~938 listing cards (`src/components/AgencyCard.jsx:101`
  renders whenever `rating > 0`), and
- flip `medianRating` from `null` to a number, so every category and
  category/state meta description begins claiming "an average rating of 4.9".

This is the reason Phase 1 must precede Phase 2. `aggregateRating` stays
dormant either way while `review_count` is 0, but the block is removed anyway
so a future `review_count` backfill cannot silently publish invalid markup.

Separately, `src/db/neonApi.js:277` computes
`verifiedCount = rows.filter(r => r.is_verified).length`, which is always
`0`. That value is interpolated into the meta description of every category
and category/state page, so Google currently receives:

> "Browse 0 verified electrical components manufacturers in California. 12
> total listings…"

Because `medianRating` is currently `null`, those same descriptions take the
fallback branch and render "12 total listings with **verified reviews**" —
also false, and live today.

Marketing copy across the site also claims "ranked by real reviews", "real
client reviews", and "verified client reviews — no fake testimonials".

`src/components/AgencyCard.jsx:85` gates its "Verified" badge on
`agency.verified`, but the column is `is_verified`. The badge has never
rendered; it is dead code and is removed rather than fixed.

### Cause 2 — 84% of submitted pages are empty

`app/sitemap.js` publishes all 500 category×state combinations. Distribution
of approved companies across those combinations:

| Companies on page | Pages |
|---|---|
| 0 (empty) | 420 |
| 1 | 42 |
| 2 | 8 |
| 3–4 | 7 |
| 5–9 | 7 |
| 10+ | 16 (holding 351 of 471 companies) |

`MIN_LIVE_COMPANIES = 0` in `app/sitemap.js:12` makes the guard documented
directly above it a no-op (`count < 0` is never true). Empty combinations
also render with HTTP 200 rather than 404.

### Cause 3 — A dead taxonomy generates the 126K

The site was previously a services directory (`allergy-diagnostics`,
`24-hour-bail-bond`, `ai-red-teaming`) across ~190 countries, states and
cities. Google discovered that URL space; the pivot to US manufacturers
removed the pages but not the URLs.

`app/directory/` does not exist, yet the three `app/search/[industry]/...`
routes `permanentRedirect` into it. Verified live:

```
/search/agricultural-films/kenya  → 308 → /directory/agricultural-films?country=Kenya → 404
/directory/allergy-diagnostics                                                        → 404
```

This produces both GSC buckets: the `/search/*` URLs report as **Soft 404**
(redirect resolving to nothing), and the `/directory/*` URLs report as
**Excluded by 'noindex'** because Next.js auto-injects `noindex` on its 404
page. `app/claim-listing/page.jsx:151` also links to `/directory`, a 404.

### Non-goal

Converting the 126K into indexed pages. Those URLs belong to a discontinued
business line and correctly return 404; Google will decay them over months.
Chasing that number would mean manufacturing content that does not exist.
The metric to grow is indexed pages backed by real inventory.

## Approach

Four phases, strictly ordered. Phase 1 gates the rest: approving the backlog
first would publish ~600 additional fabricated ratings, and un-indexing
company pages first would expose the invalid structured data.

### Phase 1 — Remove unsubstantiated claims

Decision: **leave `companies.avg_rating` in the database and stop reading
it.** No backfill migration. Every read path is removed so the column becomes
inert.

1. Delete the `aggregateRating` block from `app/company/[slug]/page.jsx:104-108`.
   Re-introduce when real reviews exist.
2. Remove star ratings and `(N reviews)` from `src/components/AgencyCard.jsx:95-107`.
3. Remove `verifiedCount` and `medianRating` from all metadata:
   - `app/[category]/page.jsx:18`
   - `app/[category]/[state]/page.jsx:120,138`
   - `app/[category]/[state]/[subcategory]/page.jsx:47`
   - `app/states/[slug]/page.jsx:88`

   Replacement pattern, using only counts that are true:
   > `Browse {totalCount} {category} manufacturers in {state}. Compare capabilities, location, and certifications.`

   Where `totalCount` is 0 the page is 404'd by Phase 3 and needs no
   description.
4. Remove "Verified" badges until `is_verified` carries meaning:
   `src/components/AgencyCard.jsx:87`, `app/search/page.jsx:341`,
   `app/[category]/[state]/[subcategory]/page.jsx:208`.
5. Rewrite review claims in copy: `app/layout.jsx:34,55`,
   `src/components/directory/CategorySEOIntro.jsx:30`, `app/page.jsx:12,16,27`,
   `app/states/[slug]/page.jsx:88`.
6. Leave `verifiedCount` / `medianRating` computation in `neonApi.js` intact
   but unreferenced, consistent with the `avg_rating` decision.

Verification: `grep -rn "aggregateRating\|verifiedCount\|medianRating\|real reviews" app src`
returns only `neonApi.js` definitions and no render or metadata call sites.

### Phase 2 — Approve the backlog

Approve unapproved companies that have at least one row in
`company_categories`. As of 2026-07-31 that is ~1,007 of 1,128; the remaining
121 have no category, cannot appear on any category page, and would create
orphaned profiles.

Data quality was verified before deciding this: 0 missing names, 0 missing
slugs, 0 missing states, 0 missing cities, 0 duplicate slugs, 1 duplicate name
pair. 107 lack a website and 330 lack a description; neither blocks a listing
appearing on a category page.

Implementation: a one-off script in `scripts/`, not a migration.

- Write the affected IDs to a timestamped JSON file before updating, so the
  change can be reverted with a single `UPDATE ... WHERE id = ANY(...)`.
- Single statement:
  `UPDATE companies SET approved = true WHERE approved = false AND EXISTS (SELECT 1 FROM company_categories WHERE company_id = companies.id)`
- Print before/after counts.

The 121 uncategorized rows stay `approved = false` and are out of scope.

After running, re-measure the category×state distribution — it determines the
threshold in Phase 3.

### Phase 3 — Fix indexing

1. Set `MIN_LIVE_COMPANIES = 5` in `app/sitemap.js:12`, activating the
   existing guard. Confirm the resulting page count against the post-Phase-2
   distribution; if 5 yields too few pages, lower to 3, but never to 0.
2. Call `notFound()` in `app/[category]/[state]/page.jsx` when the combination
   has zero companies, so empty pages return 404 rather than 200.
3. Delete `app/search/[industry]/[country]/page.jsx`,
   `app/search/[industry]/[country]/[state]/page.jsx`, and
   `app/search/[industry]/[country]/[state]/[city]/page.jsx`. They then 404
   natively, removing the 308→404 hop. Do not add a `/directory` route or
   redirect; these URLs should die.
4. Point `app/claim-listing/page.jsx:151` at `/browse`.

### Phase 4 — Index company profiles

Only after Phases 1–3 are deployed and verified.

1. In `app/company/[slug]/page.jsx:43`, replace the unconditional
   `robots: { index: false }` with a gate: index when the company is
   `approved` **and** has a non-empty description. Everything else stays
   `noindex`. As measured, 278 of 471 approved companies have descriptions;
   the proportion after Phase 2 should be re-checked.
2. Replace `export const dynamic = 'force-dynamic'` (line 1) with
   `export const revalidate = 3600`. Every profile currently re-queries Neon
   per request, which suppresses crawl rate and inflates database cost.
3. Add company profiles meeting the same gate to `app/sitemap.js`, and remove
   the now-obsolete comment block explaining their exclusion.

## Explicitly out of scope

- **City-level pages.** Measured: 377 category+city combinations, 326 of them
  (86%) containing exactly one company. Publishing these would recreate the
  Cause 3 failure with a new taxonomy. Revisit only when a 3-company floor
  yields 200+ pages. Note also that `/{category}/{state}/{city}` is not
  available as a URL shape — the third segment is already the state in
  `/{category}/{subcategory}/{state}` (see the destructuring at
  `app/[category]/[state]/[subcategory]/page.jsx:27`) — so a future
  implementation needs a fourth segment or a marker segment.
- **GSC bulk removal** of the 126K. It is a 6-month cosmetic hide with no
  ranking effect.
- **Scraping / anti-copy protection.** Separate concern, parked.
- **Backfilling real reviews.** The genuine long-term unlock, but a business
  process, not an engineering change.

## Risks

- **Traffic dip after Phase 3.** Removing 420 URLs from the sitemap and
  404-ing empty pages will reduce total indexed count. This is intended;
  concentration is the goal. Track ranking positions and impressions on the
  16+ real pages, not total indexed count.
- **Threshold sensitivity.** `MIN_LIVE_COMPANIES = 5` is chosen against
  current data. Re-derive after Phase 2 rather than assuming it holds.
- **Phase 2 is a bulk publish.** 1,000+ records become publicly visible at
  once. The ID snapshot makes it revertible; take it before the update, not
  after.
- **Ordering is load-bearing.** Phase 1 before Phase 2 before Phase 4. Doing
  Phase 4 first publishes invalid structured data on ~938 profiles.

## Success criteria

1. No `aggregateRating`, `verifiedCount`, `medianRating`, or unsubstantiated
   review claim appears in any rendered page or metadata.
2. Every URL in `sitemap.xml` returns 200 and lists at least
   `MIN_LIVE_COMPANIES` companies.
3. `/search/{industry}/{country}` returns 404 directly, with no redirect hop.
4. Category×state pages with zero companies return 404.
5. Indexed page count in GSC grows from a base of real, non-empty pages;
   Soft 404 and "Excluded by noindex" buckets trend down over 4–8 weeks.
