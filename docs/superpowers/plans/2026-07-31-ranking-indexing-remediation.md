# Ranking & Indexing Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every unsubstantiated review/verification claim from the site, approve the categorised company backlog, and stop submitting empty and dead URLs to Google — so the pages that hold real inventory can rank.

**Architecture:** Four strictly ordered phases. Phase 1 strips false claims from render and metadata paths (leaving `avg_rating` in the database but unread). Phase 2 bulk-approves companies that have at least one category, with a revert snapshot. Phase 3 activates the existing sitemap floor, 404s empty pages, and deletes the dead legacy routes. Phase 4 opens company profiles to indexing behind a content gate, on ISR instead of per-request rendering.

**Tech Stack:** Next.js 15 App Router, React 18, Drizzle ORM, Neon (serverless Postgres), Tailwind.

## Global Constraints

- **Phase order is load-bearing.** Phase 1 → 2 → 3 → 4. Phase 2 before Phase 1 publishes ~938 fabricated ratings; Phase 4 before Phase 1 risks invalid structured data.
- **Do not modify `companies.avg_rating` data.** Decision on record: leave the column, remove every read. No backfill, no migration.
- **Do not add a `/directory` route or redirect.** Those URLs are from a discontinued business line and must stay 404.
- **`MIN_LIVE_COMPANIES` must never return to `0`.**
- **No new dependencies.** This repo has no test framework; verification uses `npm run lint`, `npm run build`, `node` scripts, and `curl`.
- **Copy rule:** no rendered text or metadata may claim reviews, ratings, or verification while `reviews` is empty and `is_verified` is false for all rows. Permitted claims: company counts, location, capabilities, "no paid placements".
- New scripts go in `scripts/` using the existing `.cjs` convention.
- Counts in this plan were measured 2026-07-31 against production Neon. The ingest pipeline is running; re-measure rather than assuming.

---

### Task 1: Remove `aggregateRating` from company structured data

The block is currently dormant (`review_count` is 0 for all rows, and the block is guarded on `review_count > 0`). It is removed so that a future `review_count` backfill cannot silently publish ratings unbacked by review text.

**Files:**
- Modify: `app/company/[slug]/page.jsx:103-110`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: nothing consumed by later tasks. Task 9 edits a different region of this same file (lines 1 and 43).

- [ ] **Step 1: Confirm the block is present and dormant**

Run:
```bash
cd FirmsLedger && grep -n "aggregateRating" "app/company/[slug]/page.jsx"
```
Expected: one hit at line 104.

Run:
```bash
cd FirmsLedger && node -e "
const u=require('fs').readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
sql\`select count(*)::int n from companies where review_count > 0\`.then(r=>console.log('rows with review_count>0:',r[0].n));
"
```
Expected: `rows with review_count>0: 0` — confirming removal changes no rendered output today.

- [ ] **Step 2: Delete the block**

In `app/company/[slug]/page.jsx`, remove these eight lines:

```jsx
        ...(company.avg_rating && company.review_count > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: company.avg_rating,
            reviewCount: company.review_count,
            bestRating: 5,
            worstRating: 1,
          },
        }),
```

The preceding `address` spread and the closing `}` of the object literal stay exactly as they are.

- [ ] **Step 3: Verify no rating markup remains**

Run:
```bash
cd FirmsLedger && grep -rn "aggregateRating\|ratingValue\|reviewCount\|bestRating" app src --include="*.jsx" --include="*.js" --include="*.tsx"
```
Expected: **no output.**

- [ ] **Step 4: Lint**

Run: `cd FirmsLedger && npm run lint`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd FirmsLedger
git add "app/company/[slug]/page.jsx"
git commit -m "fix(seo): drop aggregateRating from company JSON-LD

No reviews exist; the block was dormant behind a review_count guard.
Removing it so a future review_count backfill cannot publish ratings
that no review text supports."
```

---

### Task 2: Remove rating and verification UI from listing cards

`AgencyCard` renders stars whenever `rating > 0`. No approved company currently has a rating, so nothing renders today — but Task 5 approves ~938 companies that carry a fabricated 4.5–5.0. This must land first.

Also removes the "Verified" badge, which reads `agency.verified` while the column is `is_verified`. It has never rendered.

**Files:**
- Modify: `src/components/AgencyCard.jsx:24-25, 85-90, 95-99, 101-112`

**Interfaces:**
- Consumes: nothing.
- Produces: `AgencyCard` no longer references `avg_rating`, `review_count`, or `verified`. Task 3 relies on no other component reading those fields.

- [ ] **Step 1: Capture current behaviour**

Run:
```bash
cd FirmsLedger && grep -n "rating\|reviewCount\|verified\|StarRow\|Star" src/components/AgencyCard.jsx
```
Record the line numbers. Expected hits include `const rating` (24), `const reviewCount` (25), `agency.verified` (85), `Top Rated` (95-99), and the rating row (101-112).

- [ ] **Step 2: Remove the two derived constants**

Delete from `src/components/AgencyCard.jsx`:

```jsx
  const rating = Number(agency.avg_rating || 0);
  const reviewCount = Number(agency.review_count || 0);
```

- [ ] **Step 3: Remove the dead Verified badge**

Delete:

```jsx
                {agency.verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
```

- [ ] **Step 4: Remove the Top Rated badge**

Delete:

```jsx
                {rating >= 4.5 && reviewCount >= 3 && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Top Rated
                  </span>
                )}
```

- [ ] **Step 5: Remove the star rating row**

Delete:

```jsx
              {(rating > 0 || reviewCount > 0) && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-900 text-sm font-mono">{rating.toFixed(1)}</span>
                  <StarRow rating={rating} />
                  {reviewCount > 0 && (
                    <Link href={profileUrl} className="text-xs text-slate-500 hover:text-slate-700 font-mono">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </Link>
                  )}
                </div>
              )}
```

The `agency.featured` / `Crown` badge stays — `featured` is a real editorial flag, not a review claim.

- [ ] **Step 6: Remove now-unused imports**

Check which of `Star`, `CheckCircle`, and `StarRow` are still referenced:

```bash
cd FirmsLedger && grep -n "Star\b\|StarRow\|CheckCircle" src/components/AgencyCard.jsx
```

Remove any that now have only their import line remaining. Leave `Crown` and any icon still used by the featured badge or `pickAgencyIcon`.

- [ ] **Step 7: Verify and lint**

Run:
```bash
cd FirmsLedger && grep -n "avg_rating\|review_count\|agency.verified" src/components/AgencyCard.jsx
```
Expected: **no output.**

Run: `cd FirmsLedger && npm run lint`
Expected: 0 errors, and no "defined but never used" warnings for the icon imports.

- [ ] **Step 8: Commit**

```bash
cd FirmsLedger
git add src/components/AgencyCard.jsx
git commit -m "fix(seo): remove rating and verified UI from listing cards

Stars rendered on any avg_rating > 0, which the pending bulk approval
would have switched on for ~938 companies holding scraped ratings with
zero backing reviews. The Verified badge read agency.verified while the
column is is_verified, so it was dead code."
```

---

### Task 3: Remove `verifiedCount` and `medianRating` from all metadata

`verifiedCount` is always `0` (`is_verified` is false for all 1,494 rows), so every category and category/state page currently ships a meta description beginning "Browse 0 verified…". `medianRating` is currently `null`, so those descriptions take the fallback branch and claim "verified reviews" on pages with none.

**Files:**
- Modify: `app/[category]/page.jsx:17-19`
- Modify: `app/[category]/[state]/page.jsx:119-121, 137-139`
- Modify: `app/[category]/[state]/[subcategory]/page.jsx:47`
- Modify: `app/states/[slug]/page.jsx:88`

**Interfaces:**
- Consumes: nothing.
- Produces: no metadata call site references `stats.verifiedCount` or `stats.medianRating`. `fetchCategoryStats` keeps returning both fields (they stay computed but unread, matching the `avg_rating` decision); `stats.totalCount` remains the only field used in copy.

- [ ] **Step 1: Enumerate every call site**

Run:
```bash
cd FirmsLedger && grep -rn "verifiedCount\|medianRating" app src --include="*.jsx" --include="*.js"
```
Expected: 4 definition/computation lines in `src/db/neonApi.js` (253, 277, 285-288, 311) plus 5 consumption sites across the four page files above. Only the consumption sites change.

- [ ] **Step 2: Rewrite `app/[category]/page.jsx`**

Replace:
```jsx
  const description = stats.totalCount > 0
    ? `Browse ${stats.verifiedCount} verified ${cat.noun} across all 50 US states. ${stats.totalCount} total listings with ${stats.medianRating ? `an average rating of ${stats.medianRating.toFixed(1)}` : 'verified reviews'}. Find top-rated ${cat.noun} ranked by real customer reviews, not paid placements.`
    : `Browse verified ${cat.noun} across all 50 US states on FirmsLedger. Find top-rated ${cat.noun} ranked by real customer reviews, not paid placements.`;
```

With:
```jsx
  const description = stats.totalCount > 0
    ? `Browse ${stats.totalCount} ${cat.noun} across all 50 US states. Compare capabilities, location, and company size. No paid placements.`
    : `Browse ${cat.noun} across all 50 US states on FirmsLedger. Compare capabilities, location, and company size. No paid placements.`;
```

- [ ] **Step 3: Rewrite the subcategory hub branch in `app/[category]/[state]/page.jsx`**

Replace:
```jsx
    const description = stats.totalCount > 0
      ? `Browse ${stats.verifiedCount} verified ${subName.toLowerCase()} manufacturers across the US. ${stats.totalCount} total listings with ${stats.medianRating ? `an average rating of ${stats.medianRating.toFixed(1)}` : 'verified reviews'}. Part of the ${cat?.name} directory on FirmsLedger.`
      : `Find verified ${subName.toLowerCase()} manufacturers across all 50 US states. Browse by state or compare top-rated companies. Part of the ${cat?.name} directory on FirmsLedger.`;
```

With:
```jsx
    const description = stats.totalCount > 0
      ? `Browse ${stats.totalCount} ${subName.toLowerCase()} manufacturers across the US. Compare capabilities, location, and company size. Part of the ${cat?.name} directory on FirmsLedger.`
      : `Find ${subName.toLowerCase()} manufacturers across all 50 US states. Browse by state or compare companies. Part of the ${cat?.name} directory on FirmsLedger.`;
```

- [ ] **Step 4: Rewrite the state listing branch in `app/[category]/[state]/page.jsx`**

Replace:
```jsx
  const description  = stats.totalCount > 0
    ? `Browse ${stats.verifiedCount} verified ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. ${stats.totalCount} total listings with ${stats.medianRating ? `an average rating of ${stats.medianRating.toFixed(1)}` : 'verified reviews'}. No paid placements.`
    : `Find verified ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. Compare companies by rating, reviews, and specialization. No paid placements.`;
```

With:
```jsx
  const description  = stats.totalCount > 0
    ? `Browse ${stats.totalCount} ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. Compare capabilities, location, and company size. No paid placements.`
    : `Find ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. Compare companies by location, size, and specialization. No paid placements.`;
```

- [ ] **Step 5: Rewrite `app/[category]/[state]/[subcategory]/page.jsx:47`**

Replace:
```jsx
  const description = `Find verified ${subName.toLowerCase()} manufacturers in ${stateName}. Part of the ${cat.name} directory. Ranked by real reviews, no paid placements.`;
```

With:
```jsx
  const description = `Find ${subName.toLowerCase()} manufacturers in ${stateName}. Part of the ${cat.name} directory. No paid placements.`;
```

- [ ] **Step 6: Rewrite `app/states/[slug]/page.jsx:88`**

Replace:
```jsx
  const description = `Find verified manufacturers in ${state.name}. Browse electrical components, mechanical components, automotive, electronics, and more — ranked by real customer reviews.`;
```

With:
```jsx
  const description = `Find manufacturers in ${state.name}. Browse electrical components, mechanical components, automotive, electronics, and more.`;
```

Also on line 109 of the same file, replace `Browse verified manufacturers across all categories in ${state.name}.` with `Browse manufacturers across all categories in ${state.name}.`

- [ ] **Step 7: Verify no metadata reads the removed stats**

Run:
```bash
cd FirmsLedger && grep -rn "verifiedCount\|medianRating" app
```
Expected: **no output** (hits remain only in `src/db/neonApi.js`, which is intentional).

- [ ] **Step 8: Lint and commit**

Run: `cd FirmsLedger && npm run lint`
Expected: 0 errors.

```bash
cd FirmsLedger
git add "app/[category]/page.jsx" "app/[category]/[state]/page.jsx" "app/[category]/[state]/[subcategory]/page.jsx" "app/states/[slug]/page.jsx"
git commit -m "fix(seo): remove verifiedCount and medianRating from metadata

is_verified is false for every row, so every category page shipped a
description starting 'Browse 0 verified...'. medianRating is null, so the
fallback claimed 'verified reviews' on pages with zero reviews. Copy now
uses only totalCount, which is true."
```

---

### Task 4: Remove review and verification claims from marketing copy

**Files:**
- Modify: `app/layout.jsx:34, 55`
- Modify: `app/page.jsx:12, 16, 27`
- Modify: `app/search/layout.jsx:7`
- Modify: `app/browse/page.jsx:12`
- Modify: `src/components/directory/CategorySEOIntro.jsx:30`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing. This is the last Phase 1 task; after it, the copy-rule grep in Step 5 is the phase gate.

Note: several of these strings also name "bike" as a category. `bike-manufacturers` was removed from the taxonomy and redirects to `/` (see `next.config.mjs:45`). Drop the word wherever it appears in these edits.

- [ ] **Step 1: Rewrite `app/layout.jsx`**

Line 34 — replace:
```jsx
    description: 'The trusted US manufacturer directory. Find verified manufacturers across all 50 states — bike, electrical, mechanical, metal fabrication, electronics, automotive, and more. Ranked by real reviews.',
```
With:
```jsx
    description: 'The US manufacturer directory. Find manufacturers across all 50 states — electrical, mechanical, metal fabrication, electronics, automotive, and more. No paid placements.',
```

Line 55 — replace:
```jsx
  description: 'Find the top US manufacturers by category and state. Verified listings, real client reviews, zero paid rankings. Browse bike, electrical, mechanical, automotive, and 11 more manufacturing categories across all 50 states.',
```
With:
```jsx
  description: 'Find US manufacturers by category and state. Zero paid rankings. Browse electrical, mechanical, automotive, and more manufacturing categories across all 50 states.',
```

- [ ] **Step 2: Rewrite `app/page.jsx`**

Line 12 — replace `'Find the top verified manufacturers in your state. Browse bike, electrical, mechanical, and more by category and location.'`
With `'Find manufacturers in your state. Browse electrical, mechanical, and more by category and location.'`

Line 16 — replace `'Browse verified manufacturers by category and state. Find the best in your area.'`
With `'Browse manufacturers by category and state. Find companies in your area.'`

Line 27 — replace `'US manufacturer directory. Find top verified manufacturers by category and state.'`
With `'US manufacturer directory. Find manufacturers by category and state.'`

- [ ] **Step 3: Rewrite the remaining two metadata strings**

`app/search/layout.jsx:7` — replace `'Search verified US manufacturers and suppliers by category and state on FirmsLedger.'`
With `'Search US manufacturers and suppliers by category and state on FirmsLedger.'`

`app/browse/page.jsx:12` — replace `` `Find verified manufacturers across 10 industries and 84+ subcategories across the US.` ``
With `` `Find manufacturers across 10 industries and 84+ subcategories across the US.` ``

- [ ] **Step 4: Rewrite the category intro fallback**

`src/components/directory/CategorySEOIntro.jsx:30` — replace:
```jsx
            {category.description || `Selecting the right ${lower} partner is a decisive factor for success in today's market. The companies featured here have been vetted for quality, transparency, and verified client reviews — no pay-to-rank, no fake testimonials.`}
```
With:
```jsx
            {category.description || `Selecting the right ${lower} partner is a decisive factor for success in today's market. The companies listed here are organised by location and capability — no pay-to-rank placements.`}
```

- [ ] **Step 5: Phase 1 gate — verify no false claims remain**

Run:
```bash
cd FirmsLedger && grep -rniE "verified (manufacturer|listing|client|review)|real (customer |client )?review|ranked by real|top-rated|fake testimonial|100% verified" app src --include="*.jsx" --include="*.js" --include="*.tsx" | grep -v "app/admin/"
```
Expected: **no output.** Admin pages are excluded — they expose a real `is_verified` toggle for internal use, which is legitimate.

- [ ] **Step 6: Build**

Run: `cd FirmsLedger && npm run lint && npm run build`
Expected: lint 0 errors, build succeeds.

- [ ] **Step 7: Commit**

```bash
cd FirmsLedger
git add app/layout.jsx app/page.jsx app/search/layout.jsx app/browse/page.jsx src/components/directory/CategorySEOIntro.jsx
git commit -m "fix(seo): remove review and verification claims from copy

The reviews table is empty and is_verified is false for every row, so
claims of 'verified listings' and 'real client reviews' were unsupported.
Also drops references to the removed bike category."
```

---

### Task 5: Approve the categorised backlog

Bulk-approves unapproved companies that have at least one `company_categories` row. Companies with no category cannot appear on any category page and would become orphaned profiles, so they stay pending.

Data quality was verified on 2026-07-31 across the then-1,128 unapproved rows: 0 missing names, 0 missing slugs, 0 missing states, 0 missing cities, 0 duplicate slugs, 1 duplicate name pair. 107 lack a website and 330 lack a description; neither blocks a listing appearing on a category page.

**Files:**
- Create: `scripts/approve-categorized-backlog.cjs`
- Create (at runtime): `scripts/data/approved-backlog-<ISO timestamp>.json`

**Interfaces:**
- Consumes: Phase 1 complete — no render path reads `avg_rating`.
- Produces: a revert file at `scripts/data/approved-backlog-*.json` containing `{ "ids": [...] }`. Task 6 depends on the post-approval company distribution this creates.

- [ ] **Step 1: Write the script**

Create `scripts/approve-categorized-backlog.cjs`:

```js
/**
 * Bulk-approve unapproved companies that have at least one category.
 *
 * Companies with no category cannot appear on any category page, so they
 * stay pending — approving them would create orphaned profile pages.
 *
 * Writes the affected IDs to scripts/data/ before updating so the change
 * can be reverted with a single UPDATE.
 *
 * Usage:
 *   node scripts/approve-categorized-backlog.cjs --dry-run
 *   node scripts/approve-categorized-backlog.cjs
 */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const DRY_RUN = process.argv.includes('--dry-run');

function databaseUrl() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const match = fs.readFileSync(envPath, 'utf8').match(/DATABASE_URL=(.*)/);
  if (!match) throw new Error('DATABASE_URL not found in .env.local');
  return match[1].trim().replace(/^["']|["']$/g, '');
}

async function main() {
  const sql = neon(databaseUrl());

  const before = await sql`
    select approved, count(*)::int n from companies group by approved order by approved
  `;
  console.log('Before:', JSON.stringify(before));

  const targets = await sql`
    select c.id
    from companies c
    where c.approved = false
      and exists (select 1 from company_categories cc where cc.company_id = c.id)
  `;
  const ids = targets.map((r) => r.id);

  const skipped = await sql`
    select count(*)::int n
    from companies c
    where c.approved = false
      and not exists (select 1 from company_categories cc where cc.company_id = c.id)
  `;

  console.log(`Will approve: ${ids.length}`);
  console.log(`Skipped (no category, stays pending): ${skipped[0].n}`);

  if (DRY_RUN) {
    console.log('Dry run — nothing written.');
    return;
  }
  if (ids.length === 0) {
    console.log('Nothing to approve.');
    return;
  }

  const dir = path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const snapshot = path.join(dir, `approved-backlog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(snapshot, JSON.stringify({ ids }, null, 2));
  console.log(`Revert snapshot: ${snapshot}`);

  await sql`update companies set approved = true where id = any(${ids})`;

  const after = await sql`
    select approved, count(*)::int n from companies group by approved order by approved
  `;
  console.log('After:', JSON.stringify(after));
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
```

- [ ] **Step 2: Dry run**

Run: `cd FirmsLedger && node scripts/approve-categorized-backlog.cjs --dry-run`

Expected output shape:
```
Before: [{"approved":false,"n":<N>},{"approved":true,"n":<M>}]
Will approve: <N minus uncategorised>
Skipped (no category, stays pending): <count>
Dry run — nothing written.
```

Confirm "Will approve" plus "Skipped" equals the `approved:false` count. If it does not, stop and investigate before proceeding.

- [ ] **Step 3: Verify Phase 1 actually landed**

This is the gate. Run:
```bash
cd FirmsLedger && git log --oneline -4 && grep -rn "avg_rating\|review_count" src/components/AgencyCard.jsx
```
Expected: the four Phase 1 commits present, and **no output** from the grep. Do not run the approval until both hold.

- [ ] **Step 4: Run for real**

Run: `cd FirmsLedger && node scripts/approve-categorized-backlog.cjs`

Expected: a `Revert snapshot:` path is printed, and the `After:` line shows `approved:true` increased by exactly the "Will approve" number.

- [ ] **Step 5: Re-measure the distribution**

This number sets the threshold in Task 6. Run:

```bash
cd FirmsLedger && node -e "
const fs=require('fs');
const u=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
(async()=>{
 for (const t of [3,5,10]) {
   const r=await sql\`select count(*)::int pages from (
     select cc.category_id, c.hq_state_id, count(*)::int cnt
     from companies c join company_categories cc on cc.company_id=c.id
     where c.approved=true group by 1,2) x where cnt >= \${t}\`;
   console.log('threshold', t, '=>', r[0].pages, 'pages');
 }
})();
"
```

Record all three numbers — Task 6 Step 2 uses them.

- [ ] **Step 6: Commit the script**

```bash
cd FirmsLedger
git add scripts/approve-categorized-backlog.cjs
git commit -m "feat(data): script to approve the categorised company backlog

Approves unapproved companies holding at least one category; those with
none stay pending rather than becoming orphaned profiles. Writes an ID
snapshot to scripts/data/ before updating so the change is revertible."
```

Do **not** commit the snapshot JSON — add `scripts/data/approved-backlog-*.json` to `.gitignore` if `scripts/data/` is tracked.

**Revert procedure**, if the approval needs undoing:
```bash
cd FirmsLedger && node -e "
const fs=require('fs');
const ids=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).ids;
const u=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
sql\`update companies set approved=false where id = any(\${ids})\`.then(()=>console.log('Reverted',ids.length));
" scripts/data/approved-backlog-<timestamp>.json
```

---

### Task 6: Activate the sitemap inventory floor

`MIN_LIVE_COMPANIES = 0` makes the guard documented directly above it a no-op, because `count < 0` is never true. Before Phase 2 this meant 420 of 500 submitted category×state URLs were empty pages.

**Files:**
- Modify: `app/sitemap.js:12`

**Interfaces:**
- Consumes: the threshold measurements from Task 5 Step 5.
- Produces: a sitemap containing only combinations meeting the floor. Task 7 makes the excluded ones return 404.

- [ ] **Step 1: Read the current constant**

Run: `cd FirmsLedger && sed -n '9,14p' app/sitemap.js`
Expected: the comment block ending in `const MIN_LIVE_COMPANIES = 0;`

- [ ] **Step 2: Choose the threshold**

Using the Task 5 Step 5 numbers: use `5` if it yields **at least 40 pages**. If it yields fewer, use `3`. Never `0`, and never below `3`.

- [ ] **Step 3: Apply**

In `app/sitemap.js`, replace:
```js
const MIN_LIVE_COMPANIES = 0;
```
With (assuming 5 was chosen):
```js
const MIN_LIVE_COMPANIES = 5;
```

- [ ] **Step 4: Verify the generated sitemap shrank and contains no empty pages**

Run: `cd FirmsLedger && npm run build && npm run start &` then, once the server is listening:

```bash
sleep 5 && curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"
```
Expected: substantially fewer than 570, and matching (core pages + category hubs + state hubs + the threshold page count from Task 5).

Stop the server when done: `kill %1`

- [ ] **Step 5: Commit**

```bash
cd FirmsLedger
git add app/sitemap.js
git commit -m "fix(seo): activate the sitemap inventory floor

MIN_LIVE_COMPANIES was 0, so 'count < MIN_LIVE_COMPANIES' never fired and
every category x state combination shipped — 420 of 500 with zero
companies on them."
```

---

### Task 7: Return 404 for empty category/state pages

Removing empty combinations from the sitemap stops advertising them; this stops Google indexing the ones already discovered. Applies only to the state listing branch — a nationwide category page with no companies is still a legitimate hub.

**Files:**
- Modify: `app/[category]/[state]/page.jsx:419-425`

**Interfaces:**
- Consumes: `notFound` from `next/navigation`, already imported in this file (used at lines 175 and 182).
- Produces: nothing consumed later.

- [ ] **Step 1: Confirm `notFound` is already imported**

Run: `cd FirmsLedger && grep -n "notFound" "app/[category]/[state]/page.jsx" | head -3`
Expected: an import line plus existing uses at 175 and 182. Do not add a duplicate import.

- [ ] **Step 2: Add the guard**

In `renderCategoryPage`, immediately after the `Promise.all` destructuring that assigns `companies`, `stateCounts`, and `stats`, insert:

```jsx
  // A category/state combination with no approved companies is a thin page.
  // 404 it rather than serving an empty 200 that Google files as a soft 404.
  // Nationwide (`state` absent) is exempt — it is a hub, not a listing.
  if (state && companies.length === 0) notFound();
```

- [ ] **Step 3: Verify against a known-empty combination**

Pick a combination with zero companies:

```bash
cd FirmsLedger && node -e "
const fs=require('fs');
const u=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
sql\`select cat.slug c, s.slug st from categories cat cross join states s
 where not exists (select 1 from companies co
   join company_categories cc on cc.company_id=co.id
   where cc.category_id=cat.id and co.hq_state_id=s.id and co.approved=true)
 limit 1\`.then(r=>console.log('empty combo:', '/'+r[0].c+'/'+r[0].st));
"
```

Start the dev server (`npm run dev`), then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/<empty combo path>"
```
Expected: `404`

Then confirm a populated page still works:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/electrical-components/california
```
Expected: `200`

- [ ] **Step 4: Commit**

```bash
cd FirmsLedger
git add "app/[category]/[state]/page.jsx"
git commit -m "fix(seo): 404 category/state pages with no companies

Empty combinations previously rendered an empty page with HTTP 200, which
Google files as a soft 404. Nationwide hubs are exempt."
```

---

### Task 8: Delete the dead legacy routes

`app/directory/` does not exist, yet three `search/[industry]` routes `permanentRedirect` into it, producing a 308 → 404 chain across ~126K discovered URLs. Deleting the routes makes them 404 directly in one hop.

**Files:**
- Delete: `app/search/[industry]/[country]/page.jsx`
- Delete: `app/search/[industry]/[country]/[state]/page.jsx`
- Delete: `app/search/[industry]/[country]/[state]/[city]/page.jsx`
- Modify: `app/claim-listing/page.jsx:151`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing. `app/search/page.jsx` is a different route and must not be touched.

- [ ] **Step 1: Confirm the current chain**

Run:
```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "https://www.firmsledger.com/search/agricultural-films/kenya"
```
Expected: `308 -> https://www.firmsledger.com/directory/agricultural-films?country=Kenya`

- [ ] **Step 2: Confirm nothing else imports these routes**

Run:
```bash
cd FirmsLedger && grep -rn "programmaticSeo\|countrySlugToName" app src --include="*.jsx" --include="*.js" | grep -v node_modules
```
If `src/lib/programmaticSeo.js` is referenced **only** by the three files being deleted, delete it too. If anything else uses it, leave it.

- [ ] **Step 3: Delete the routes**

```bash
cd FirmsLedger && rm -rf "app/search/[industry]"
```

Verify `app/search/page.jsx` and `app/search/layout.jsx` still exist:
```bash
cd FirmsLedger && ls app/search
```
Expected: `layout.jsx  page.jsx`

- [ ] **Step 4: Fix the broken internal link**

In `app/claim-listing/page.jsx:151`, replace:
```jsx
            <Link href="/directory">
```
With:
```jsx
            <Link href="/browse">
```

- [ ] **Step 5: Verify no internal link points at `/directory`**

Run:
```bash
cd FirmsLedger && grep -rn 'href="/directory' app src --include="*.jsx" --include="*.js"
```
Expected: **no output.**

- [ ] **Step 6: Build and check locally**

Run: `cd FirmsLedger && npm run build && npm run dev`

Then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/search/agricultural-films/kenya"
```
Expected: `404` — with no redirect hop.

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/search?q=cnc"
```
Expected: `200` — the real search page is unaffected.

- [ ] **Step 7: Commit**

```bash
cd FirmsLedger
git add -A "app/search" app/claim-listing/page.jsx
git commit -m "fix(seo): delete legacy search routes that redirect into a 404

The three search/[industry] routes permanentRedirect to /directory/*,
which has never existed — a 308 into a 404 across ~126K discovered URLs.
Deleting them makes those URLs 404 in one hop. Also repoints the
claim-listing link from /directory to /browse."
```

---

### Task 9: Index company profiles behind a content gate

Company profiles are the largest untapped indexable surface, but only those with real content should be indexed. Also replaces per-request rendering with ISR — every profile currently re-queries Neon on every request, which suppresses crawl rate and inflates database cost.

**Files:**
- Modify: `app/company/[slug]/page.jsx:1, 43`
- Modify: `app/sitemap.js` (add the company section, remove the obsolete comment)

**Interfaces:**
- Consumes: Tasks 1–8 complete and deployed.
- Produces: `isIndexable(company)` — a local helper in `app/company/[slug]/page.jsx` returning `boolean`, true when `company.approved === true` and `company.description` is a non-empty string. The same predicate is expressed as a SQL `WHERE` clause in `app/sitemap.js`; the two must stay in agreement.

- [ ] **Step 1: Measure how many profiles qualify**

Run:
```bash
cd FirmsLedger && node -e "
const fs=require('fs');
const u=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
sql\`select count(*)::int n from companies where approved=true and coalesce(trim(description),'') <> ''\`
  .then(r=>console.log('indexable profiles:', r[0].n));
"
```
Record the number. Step 6 checks the sitemap against it.

- [ ] **Step 2: Switch to ISR**

In `app/company/[slug]/page.jsx`, replace line 1:
```jsx
export const dynamic = 'force-dynamic';
```
With:
```jsx
export const revalidate = 3600;
```

- [ ] **Step 3: Add the gate helper**

Immediately after the `INTERNAL_FIELDS` / `stripInternalFields` block, add:

```jsx
// Only profiles with real content are indexable. A name-and-address stub adds
// no value in search results and dilutes site-wide quality signals.
function isIndexable(company) {
  return Boolean(company?.approved) && typeof company?.description === 'string' && company.description.trim() !== '';
}
```

- [ ] **Step 4: Apply the gate to metadata**

In `generateMetadata`, replace:
```jsx
    robots: { index: false, follow: true },
```
With:
```jsx
    robots: isIndexable(company) ? undefined : { index: false, follow: true },
```

- [ ] **Step 5: Add qualifying profiles to the sitemap**

In `app/sitemap.js`, delete the obsolete comment:
```js
  // NOTE: /company/{slug} pages are intentionally excluded — they are
  // noindex'd (see app/company/[slug]/page.jsx), so they should not appear
  // in the sitemap as canonical entry points.
```

And in its place add:
```js
  // ── Company profiles: /company/{slug} ───────────────────────────────────
  // Mirrors isIndexable() in app/company/[slug]/page.jsx — approved and
  // carrying a real description. Keep the two predicates in agreement.
  try {
    const profiles = await db
      .select({ slug: companies.slug })
      .from(companies)
      .where(and(eq(companies.approved, true), isNotNull(companies.description)));

    for (const p of profiles) {
      if (!p.slug) continue;
      urls.push({ url: `${BASE_URL}/company/${p.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
    }
  } catch {
    // DB unavailable at build time — omit profiles rather than fail the sitemap.
  }
```

Add `isNotNull` to the existing drizzle import on line 3:
```js
import { eq, and, isNotNull } from 'drizzle-orm';
```

Note: `isNotNull` admits empty-string descriptions that `isIndexable` rejects. If Step 1 showed a meaningful gap between `description IS NOT NULL` and `trim(description) <> ''`, use `and(eq(companies.approved, true), ne(companies.description, ''), isNotNull(companies.description))` and import `ne` as well.

- [ ] **Step 6: Verify the gate on both sides**

Build and start: `cd FirmsLedger && npm run build && npm run dev`

Count profile URLs in the sitemap:
```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "/company/"
```
Expected: matches the Step 1 number.

Find a company **with** a description and confirm it is indexable:
```bash
cd FirmsLedger && node -e "
const fs=require('fs');
const u=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const {neon}=require('@neondatabase/serverless');const sql=neon(u);
(async()=>{
 const w=await sql\`select slug from companies where approved=true and coalesce(trim(description),'')<>'' limit 1\`;
 const wo=await sql\`select slug from companies where approved=true and coalesce(trim(description),'')='' limit 1\`;
 console.log('with description:', w[0]?.slug); console.log('without:', wo[0]?.slug);
})();
"
```

For the **with-description** slug:
```bash
curl -s "http://localhost:3000/company/<slug>" | grep -c 'name="robots"'
```
Expected: `0` — no noindex tag.

For the **without-description** slug:
```bash
curl -s "http://localhost:3000/company/<slug>" | grep -o 'content="noindex[^"]*"'
```
Expected: a `noindex` match.

- [ ] **Step 7: Confirm no rating markup came back**

Run:
```bash
cd FirmsLedger && curl -s "http://localhost:3000/company/<with-description slug>" | grep -ci "aggregateRating\|ratingValue"
```
Expected: `0`

- [ ] **Step 8: Commit**

```bash
cd FirmsLedger
git add "app/company/[slug]/page.jsx" app/sitemap.js
git commit -m "feat(seo): index company profiles that have real content

Profiles were unconditionally noindex and excluded from the sitemap,
capping the indexable surface at ~570 URLs. Now indexed when approved and
carrying a description; stubs stay noindex. Also replaces force-dynamic
with hourly ISR — every profile re-queried Neon per request, which
throttles crawl rate and inflates DB cost."
```

---

## Post-Implementation Verification

Run after all tasks are deployed to production.

- [ ] **Every sitemap URL returns 200**

```bash
curl -s https://www.firmsledger.com/sitemap.xml \
  | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | shuf -n 40 \
  | while read -r u; do printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done \
  | grep -v '^200' || echo "ALL 200 OK"
```
Expected: `ALL 200 OK`

- [ ] **Legacy URLs 404 in one hop**

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://www.firmsledger.com/search/agricultural-films/kenya"
```
Expected: `404` with an empty redirect URL.

- [ ] **No false claims in production HTML**

```bash
curl -s https://www.firmsledger.com/electrical-components/california \
  | grep -ioE "0 verified|verified reviews|ranked by real|aggregateRating" || echo "CLEAN"
```
Expected: `CLEAN`

- [ ] **Resubmit the sitemap in Google Search Console** and record the baseline indexed count.

- [ ] **Track for 4–8 weeks:** impressions and average position on the category×state pages that survived the floor. Total indexed count will dip first as the empty pages drop out — that is the intended outcome, not a regression. Soft 404 and "Excluded by noindex" buckets should trend down over the same window.

## Deferred

- **City-level pages.** 377 category+city combinations exist, 326 of them (86%) holding exactly one company. Revisit only when a 3-company floor yields 200+ pages. Note that `/{category}/{state}/{city}` is unavailable as a URL shape — segment 3 is already the state in `/{category}/{subcategory}/{state}` (see the destructuring at `app/[category]/[state]/[subcategory]/page.jsx:27`) — so any future implementation needs a fourth segment or a marker segment.
- **The 121 uncategorised companies.** Assign categories, then re-run Task 5's script; it picks them up automatically.
- **Real reviews.** The genuine long-term unlock and the precondition for restoring `aggregateRating`, star ratings, and any "verified" badge. A business process, not an engineering change.
- **Scraping / anti-copy protection.** The original question in this session, parked in favour of ranking work.
