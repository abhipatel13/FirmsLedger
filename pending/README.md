# Pending — what's blocking pages from reaching Google

Generated 2026-07-31 from live Neon data. Refresh with:

```bash
node pending/build-pending-lists.cjs
```

Baseline that day: **3,150 companies, 1,090 in the sitemap (35%).**

| File | Rows | What it is | Unblocks |
|---|---|---|---|
| `01-approved-missing-description.csv` | 531 | Approved, but `description IS NULL` | Company page sets `noindex` without a description, so these are live but uncrawlable. Backfill the text. |
| `02-not-approved.csv` | 1,529 | `approved = false` | Excluded from every listing page *and* the sitemap. Biggest single block. `has_description` column tells you which are ready to approve as-is. |
| `03-category-state-below-sitemap-floor.csv` | 64 | `/{category}/{state}` combos with 1–4 approved companies | Under `MIN_LIVE_COMPANIES = 5` in `app/sitemap.js`, so omitted. `needed_for_sitemap` and `needed_for_top_10` say how many more each needs. |
| `04-missing-state.csv` | 0 | No `hq_state_id` | Clean — nothing to do. |
| `05-missing-category.csv` | 123 | In no category at all | Orphaned from the category tree; can't appear on any listing page regardless of approval. |

## Order of work

1. **`02`** — approving these moves the most URLs at once. Rows where `has_description = true` need no extra work.
2. **`01`** — descriptions unlock the `noindex` on already-approved pages.
3. **`05`** — categorise, then they flow into listings.
4. **`03`** — data gaps; fills itself as 1 and 2 land.

Clearing 1–3 takes the sitemap from ~1,090 to ~3,100 URLs with no code change.

## Not covered by these lists

- Subcategory pages `/{category}/{state}/{subcategory}` are emitted by **no** sitemap. That's a code gap in `app/sitemap.js`, not a data gap.
- City pages don't exist as a route yet. Only 19 city+state combos have 10+ companies, so there's little to build against today.
