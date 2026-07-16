# Supabase → Neon Migration (Session Summary)

**Date:** 2026-07-16
**Scope:** Full database layer migration + blog/AI feature removal

---

## What changed

### Removed: Blog automation system
Deleted entirely — AI generation pipeline, cron jobs, admin UI, and all previously-generated article pages under `src/views/blog/` and `app/blog/`. These were auto-generated SEO content covering unrelated topics (staffing agencies, solar panels, cruise lines, etc.) from the old business, not real manufacturer data worth preserving.

Deleted files include:
- `src/lib/automation/blogGenerator.ts`, `topicsManager.ts`
- `app/api/cron/daily-blog/route.js`, `app/api/cron/generate-blog/route.ts`
- `app/api/admin/blog-posts/`, `blog-topics/`, `generate-blog/`, `index-url/`
- `app/api/blog-posts/route.js`
- `src/views/Blog.jsx`, `BlogPost.jsx`, `BlogAutomation.jsx`, `src/views/blog/` (dir)
- `app/blog/`, `app/BlogAutomation/`, `app/BlogPost/` (dirs)
- `app/admin/blogs/page.jsx`
- `vercel.json` crons: removed `daily-blog` (0 6) and `generate-blog` (0 7); kept `seo-audit` and `submit-urls`

### Removed: AI matching/insights features
- `app/api/match/route.js`, `app/api/insights/route.js`
- `src/components/AIMatchmaker.jsx`, `AISearchBar.jsx`, `AIInsights.jsx`, `DynamicBlogRenderer.jsx`
- `src/views/AIMatch.jsx`
- `app/ai-match/` (dir)
- Removed usages from `AgencyProfile.jsx`, `Home.jsx`
- Removed from `sitemap.js` (`/ai-match`, `/blog`, `BLOG_SLUGS`)
- Deferred — may revisit AI features later

### Added: Drizzle ORM + Neon schema

**14 tables created and live in Neon:**

| Table | Notes |
|-------|-------|
| `states` | 50 rows seeded with name, slug, region |
| `categories` | Existing table, unchanged |
| `companies` | `hq_state` text → `hq_state_id` uuid FK → `states.id`; `hq_state_label` kept as denormalized display |
| `company_categories` | Existing, unchanged |
| `reviews` | Existing, unchanged |
| `listing_requests` | Added `hq_state_id` FK + `hq_state_label` columns |
| `company_invites` | Existing, unchanged |
| `email_campaigns` | New — powers Resend campaign system |
| `email_logs` | New — per-recipient tracking |
| `submission_logs` | New — URL indexing cron (`getUnsubmittedUrls` now live) |
| `marketplace_rfqs` | New |
| `marketplace_suppliers` | New |
| `marketplace_responses` | New |
| `state_category_rankings` | New — precomputed ranking cache, empty/unused (deferred) |

**Key files:**
- `src/db/schema.ts` — Drizzle table definitions (source of truth)
- `src/db/client.ts` — Neon serverless connection via `@neondatabase/serverless`
- `src/db/neonApi.js` — All query functions (mirrors old supabaseApi interface)
- `drizzle/0000_silky_amazoness.sql` — Generated migration (applied manually via psql)
- `drizzle.config.ts` — Points to `src/db/schema.ts`, `DATABASE_URL` from `.env.local`

### Schema decisions
- `companies.hq_state_id` is the FK source of truth; `hq_state_label` is denormalized for render convenience (avoids extra join on every listing card)
- `listing_requests` is the canonical table name for contact/list-your-company form submissions. NOT `leads` — that was an earlier miscommunication, corrected and confirmed.
- `state_category_rankings` exists but is empty — precomputed ranking cache, deferred since current company count doesn't justify it yet

### Updated: `src/lib/supabase.js`
Replaced with a no-op stub: `supabase = null`, `hasSupabase = () => false`. No `@supabase/supabase-js` import. Prevents crashes for any file that still imports it.

### Updated: `src/api/apiClient.js`
- Added `api.entities.State` — `list()` and `bySlug()`
- `Company.filter` default where: `{ approved: true }` → `{}` (approval enforcement lives in `neonApi.js` query functions, not in callers — confirmed safe)
- `Company.filterByCategory` now calls `fetchCompaniesByCategoryAndState(slug, null, ...)`
- `Company.filterByCategoryAndState` added — primary call site for `/top/[category]/[state]`
- `api.appLogs` no-op stub added (NavigationTracker calls this silently)

### `approved=true` enforcement — confirmed
Every public-facing query in `neonApi.js` hardcodes `eq(companies.approved, true)` as the first condition:
- `fetchCompanies` — line 84
- `fetchCompaniesByCategoryAndState` — line 138
- `fetchCompanyByIdAny` — lines 175, 183

`fetchCompanyById` (no approved filter) is only used by admin routes.

---

## Known issues / open items

- **Runtime error:** `"Event handlers cannot be passed to Client Component props"` on `/states/[slug]` pages — event handler passed from a Server Component. Needs `'use client'` boundary fix. [Update once fixed.]

- **`src/views/RequestProposal.jsx`** (mounted at `/RequestProposal`) — legacy staffing-agency hire-request form. Calls `api.entities.Lead.create()` and `api.auth.me()` / `api.auth.redirectToLogin()` — none of these exist. Will throw at runtime. Decision deferred: keep (needs new `hire_requests` table + auth), redirect, or delete.

- **Step 5 in progress:** Migrating remaining 14 Supabase-importing route files to Drizzle/Neon, in order: marketplace → campaigns/email → admin → directory.

- **`@supabase/supabase-js` not yet removed** from `package.json` — pending Step 6, after confirming zero remaining imports.

- **`src/api/supabaseApi.js`** — dead code (zero importers), still on disk. Delete in Step 6 alongside package removal.

---

## Files still using `@supabase/supabase-js` (Step 5 targets)

```
app/Directory/[[...slug]]/page.jsx
app/Directory/staffing/[category]/page.jsx
app/api/admin/campaigns/[id]/route.js
app/api/admin/campaigns/route.js
app/api/admin/categories/[id]/route.js
app/api/admin/seo-audit/route.ts
app/api/admin/submissions/route.js
app/api/marketplace/respond/route.js
app/api/marketplace/rfqs/[id]/route.js
app/api/marketplace/rfqs/route.js
app/api/marketplace/suppliers/[id]/route.js
app/api/marketplace/suppliers/route.js
app/api/track/click/route.js
app/api/track/open/route.js
app/api/webhooks/resend/route.js
src/lib/automation/supabaseClient.ts
```
