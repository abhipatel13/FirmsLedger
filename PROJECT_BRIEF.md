# FirmsLedger

**Category:** B2B directory / SEO lead-generation site (manufacturing industry vertical)

**Live URL:** https://www.firmsledger.com (Verified — referenced throughout code as the canonical production domain, e.g. `next.config.mjs` redirects, `app/layout.jsx` default `BASE_URL`)

**Status:** Live, actively developed (commits through 2026-09-08)

**Stack:** Next.js 15 (App Router), React 18, Tailwind CSS, TanStack Query

**Backend:** Next.js Route Handlers (`app/api/**/route.js`) + Drizzle ORM

**Database:** Neon (serverless Postgres) — primary/current. Supabase Postgres — legacy, partially still wired into several routes (see Known Limitations)

**Deployment:** Vercel (Verified — `vercel.json` defines cron jobs in Vercel's format; `NEXT_PUBLIC_APP_URL`/domain patterns match Vercel conventions)

**Repository:** `abhipatel8675/FirmsLedger` on GitHub, branch `main`

---

## Overview

FirmsLedger is a **US manufacturer directory**: a public, SEO-first website where buyers (procurement managers, engineers, OEMs) browse manufacturers by category and state, and manufacturers get a free profile page that generates inbound leads. It is explicitly scoped to the United States only for the MVP (Documented in `docs/PRD.md`, and enforced in code — no country picker on category/state routes, `robots`/copy avoid "global" language).

The product has been through a significant pivot. Evidence from `docs/sessions/2026-07-16-db-migration.md`, dead files (`entities/*.json`, `src/main.jsx`, `src/Layout.jsx`, `react-router-dom` imports), and the current `app/` tree together show:

- **Origin:** the project was originally scaffolded as a client-rendered React app (Vite-style entry point, React Router, JSON "entity" schema files under `entities/`) themed as a **generic staffing/business-services directory** ("FirmsLedger — Business Directory", categories like staffing/recruiting).
- **Current form:** it was rebuilt on the Next.js App Router as a **manufacturing-only** directory, with an AI blog-generation system and AI matching features (`BlogAutomation`, `AIMatchmaker`, `AIInsights`) built and then **deliberately deleted** on 2026-07-16 as off-topic content from "the old business."
- The `entities/`, `src/main.jsx`, `src/Layout.jsx` files are leftover from the pre-pivot scaffold and are **not part of the live app** (Inferred — no route in `app/` imports `src/Layout.jsx`; `app/` has its own `layout.jsx`).

What makes it different from a generic directory clone: pages are built for programmatic SEO at scale — category × state × subcategory combinations are enumerable, capped, and paginated deliberately (see `docs/scale-remediation-plan.md`) to stay crawlable and index-worthy as the company count grows toward the ~500,000-row target the team is engineering for.

---

## The Problem

Buyers sourcing US manufacturers (metal fabrication, electrical components, medical devices, etc.) currently rely on fragmented directories, trade show contacts, or generic web search. FirmsLedger's bet is a clean, fast, ad-free directory with real per-state, per-category landing pages that rank organically, plus a zero-friction path for manufacturers to list themselves (public "List your company" form, no signup wall) and for the site owner to seed data via an in-house scraping/import pipeline rather than waiting for organic sign-ups.

The current session's PRD is explicit that this is not yet a marketplace: reviews, payments, messaging, and user accounts were called out as **out of scope for MVP** — a fact that is now partially stale (see Feature Breakdown; a reviews table, a users/sessions schema, and Stripe checkout code already exist beyond what the PRD describes).

---

## Who It's For

- **Buyers (anonymous, no account required):** browse by category or state, search, view a company profile, and submit a "Request a Proposal" form or use the company's own contact info/website.
- **Manufacturers (self-serve):** submit a listing via the public form (`/list-your-company`), or via an invite link/email sent by the site owner (`/join?token=...`). Listings are unpublished (`approved = false`) until manually approved.
- **Site owner / admin (single operator, not a team):** logs into `/admin` with credentials from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars — not a multi-role permission system. Reviews and approves submitted agencies/companies, manages categories, sends outbound email campaigns, and (per code, not PRD) reviews an SEO audit dashboard.
- **Public account holders (`users`/`sessions` tables, Verified in schema):** a password-based signup/login exists (`app/api/auth/*`), but it is **not referenced in the PRD** and no UI flow in `app/` visibly consumes it beyond the API routes themselves — likely a foundation for a future "claim your listing" flow (Inferred, ties to `app/api/claim/route.js` and `app/claim-listing/`).

---

## Feature Breakdown

### Directory Browsing (Category / State)
Core product surface. Routes: `/[category]`, `/[category]/[state]`, `/[category]/[state]/[subcategory]`, `/states/[slug]`, `/browse`, `/locations`. Categories and their subcategories are defined in a single source-of-truth config, `src/lib/manufacturingCategories.js` (10 top-level categories, each with slug, display names, SEO long-description copy, accent color, and a list of subcategories with keyword arrays used for classification). Company listings are fetched from Neon via `src/db/neonApi.js`, always filtered to `approved = true` for public routes (Verified in `docs/sessions/2026-07-16-db-migration.md` and current route code). Empty categories/states render a "no companies yet" empty state rather than a 404 or redirect — a hard PRD requirement (`docs/PRD.md` §13, §22).

### Company Profiles
`/company/[slug]`, ISR with `revalidate = 3600`, never build-time prerendered (unbounded route space). Strips internal-only DB columns (`data_source`, `source_url`, `owner_user_id`) before passing data to client components, since RSC props serialize into the browser bundle (Verified, `app/company/[slug]/page.jsx`). A profile is only marked indexable (`robots: index`) if it has both `approved = true` and a non-empty description — thin/stub profiles are noindexed, mirrored in `app/sitemap.js` so the sitemap and per-page robots tag never disagree.

### Search
`/search` plus a `/api/search` route. `src/lib/searchIntent.js` normalizes queries (strips stopwords like "top"/"best"/"find", strips digits) so that "top 10 electrical manufacturers" and "best electrical manufacturers" canonicalize to the same category/state URL rather than creating duplicate indexable pages — a specific, tested SEO safeguard (`src/lib/searchIntent.test.mjs`).

### Company Submission
Two paths: (1) public self-serve form at `/list-your-company` (writes to `companies`/`listing_requests` with `approved = false`); (2) invite-token flow — an admin creates a `company_invites` row with a token and emails `/join?token=...`; the recipient lands on a pre-filled version of the same form, and using it marks the invite used and links it to the created company (Documented in `README.md`, table structure Verified in `src/db/schema.ts`).

### Admin Panel
`/admin/*`, gated by a signed session cookie (see Security section), covers: agency/company approvals (`app/admin/agencies`), category management (`app/admin/categories`), submission review (`app/admin/submissions`), email campaigns (`app/admin/campaigns`), and an SEO audit dashboard (`app/admin/seo-audit`). This is a single-operator back office, not a multi-tenant admin system — there is one admin identity, defined entirely by two env vars.

### Email Campaigns & Outbound Email
`email_campaigns`/`email_logs` tables plus `app/api/admin/campaigns/*`, `app/api/admin/email/route.js`, and `app/api/webhooks/resend/route.js` (open/click tracking). Sends via Resend (`resend` npm package, `RESEND_API_KEY`). **Caveat:** several of these routes still import `@supabase/supabase-js` directly rather than the Neon layer (see Known Limitations) — their current working state cannot be verified from local config alone.

### Marketplace (RFQs / Suppliers)
`marketplace_rfqs`, `marketplace_suppliers`, `marketplace_responses` tables exist in `src/db/schema.ts`, with routes under `app/api/marketplace/*` for posting an RFQ, listing suppliers, and responding to an RFQ/supplier. This is a fully-modeled B2B lead-matching feature **not mentioned anywhere in `docs/PRD.md`**, which explicitly lists "RFQ Marketplace" as future-roadmap, not MVP. Classify as **Inferred to be a newer, undocumented feature** built after the PRD was written — the PRD is stale relative to the schema here.

### Reviews
`reviews` table with multi-dimension ratings (quality/communication/value/timeliness) plus a company-response field, and `/WriteReview` legacy route plus `app/api/reviews/route.js`. Also **listed as "NOT in MVP" in the PRD** but fully modeled in the schema — another PRD/code divergence.

### Payments (Stripe)
`app/api/checkout/route.js` creates a Stripe subscription Checkout Session for `pro`/`featured` plans, gated entirely behind env vars (`STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_FEATURED_PRICE_ID`) that are **not present** in `.env.local` — so this is wired but almost certainly inactive in the current environment (Verified: code path exists; Unknown: whether these are set in the Vercel production environment).

### SEO Automation
`src/lib/automation/seoAuditor.ts` (Supabase-backed) and `app/api/cron/seo-audit`, `app/api/cron/submit-urls` (Bing IndexNow / Google submission, backed by `submission_logs` table which is Neon-backed per the migration notes). Both crons are registered in `vercel.json` (daily, 08:00 and 09:00). The blog-generation cron system that used to exist alongside these was deleted in the 2026-07-16 migration.

### Data Acquisition Pipeline (`pipeline/`)
A **separate, offline** Python + Node toolchain, not part of the running website: Playwright-based Google Maps scraper (`scraper.py`) → website crawler (`crawler.py`) → local SQLite staging DB with fuzzy duplicate detection (domain match, phone match, name+ZIP similarity ≥85%) → a Node.js importer (`import_helper.cjs`) that writes into the production Postgres `companies`/`company_categories` tables. Has its own pytest suite (`pipeline/tests/`). This is how the site's company data is actually seeded, distinct from the public submission form.

---

## User Flow

**Buyer flow (documented in PRD §11, matches route structure):**
1. Homepage → Browse (category or state tab)
2. Category landing page → choose a state
3. Category+state listing page (paginated, sortable)
4. Company profile page
5. Optional: submit "Request a Proposal" (`/RequestProposal`, legacy view — see Known Limitations) or contact the company directly

**Manufacturer self-listing flow:**
1. `/list-your-company` (or arrives via `/join?token=...` pre-filled)
2. Submits business details → row created with `approved = false`
3. Site owner reviews in `/admin/submissions` or `/admin/agencies`
4. Owner flips `approved = true` → listing goes live and becomes indexable/sitemap-eligible

**Admin flow:**
1. `/admin` login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` → signed cookie issued
2. Review pending agencies/submissions, approve/reject
3. Optionally send an email (single or campaign) via Resend
4. Log out — session cookie cleared, admin-only UI (footer links) disappears

---

## Design & UX Decisions

- **Empty states are a hard requirement, not an afterthought:** every category/state combination must render, even with zero companies — no 404s, no redirects (PRD §13, §22; enforced in view components per the scale-remediation notes).
- **No hardcoded default state:** the PRD explicitly calls out removing a "default to California" behavior that previously existed — state must be chosen deliberately.
- **Simplified navbar:** Logo, Browse, Contact, Search, List Your Company — category/state dropdowns were removed from the navbar (moved into the `/browse` page's own tabs) to reduce clutter (PRD §7–8).
- **PascalCase → lowercase URL cleanup:** `next.config.mjs` permanently redirects old PascalCase routes (`/Home`, `/ListYourCompany`, `/Categories`) to their current lowercase equivalents, and old category slugs (e.g. `/electrical-manufacturers/*`) to renamed ones (e.g. `/electrical-components/*`) — evidence of at least one prior category-naming pass beyond the one PRD documents (Electrical Manufacturers → Electrical Equipment Manufacturing).
- **Design language:** Tailwind + shadcn/ui-style Radix primitives (`components.json` present, `src/components/ui/*` implied by the large Radix dependency list), industrial/professional/minimal per PRD §19–20.

---

## Data & Domain Model

Source of truth: `src/db/schema.ts` (Drizzle, Postgres/Neon). Verified relationships:

- **`states`** (50 rows) ← referenced by `companies.hq_state_id`, `listing_requests.hq_state_id`, `state_category_rankings.state_id`.
- **`categories`** — self-referential via `parent_id` (parent/subcategory tree), referenced by `company_categories.category_id`, `state_category_rankings.category_id`.
- **`companies`** — central entity. FK to `states`; `hq_state_label` is a deliberately denormalized copy of the state name to avoid a join on every listing card. Has logo pipeline fields (`logo_status`, `logo_source`, `logo_error`) tied to the R2-backed logo upload system, plus manufacturing-specific fields (`naics_code`, `certifications[]`, `capabilities[]`, `industries_served[]`). `data_source`/`source_url` track whether a row came from the scraping pipeline, manual entry, etc.
- **`company_categories`** — many-to-many join, `companies` ↔ `categories`, unique on `(company_id, category_id)`.
- **`reviews`** — belongs to `companies` (cascade delete). Supports an optional `user_id` (loose coupling to `users`, no FK constraint defined — Verified in schema, no `.references()` on that column).
- **`company_leads`** and **`listing_requests`** — two distinct submission tables. Per the migration notes, `listing_requests` is the canonical table for "list your company" / contact submissions; `company_leads` appears to serve `/RequestProposal`-style buyer inquiries to a specific company. Do not conflate the two.
- **`company_invites`** — token-based invite, optionally resolves to a created `companies.id` once used.
- **`email_campaigns`** → **`email_logs`** (one-to-many) — campaign send tracking (opens/clicks) for the Resend-based admin email system.
- **`submission_logs`** — flat log of URL-indexing cron submissions (Google/Bing), not tied to other entities.
- **`marketplace_rfqs`** and **`marketplace_suppliers`** → **`marketplace_responses`** (each response optionally FKs to one or the other) — an independent buyer/supplier matching system, separate from the main company directory.
- **`state_category_rankings`** — precomputed `(state, category) → company_count` cache table. **Verified empty/unused** (per migration notes) — a deferred optimization, not live functionality yet.
- **`users`** / **`sessions`** — password + opaque-token session auth for public accounts, structurally independent of the admin cookie system.

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 15, App Router, mix of Server Components (data-fetching pages) and Client Components (interactive widgets, forms, dialogs).
- **Rendering model:** ISR is the dominant pattern — `revalidate = 3600` on company profiles and the homepage (tuned specifically around Neon's scale-to-zero billing, see Engineering Decisions). Some listing routes were `force-dynamic` as of the 2026-08-01 remediation plan; whether Task 4 of that plan (switching them to ISR) has since landed was not independently re-verified in this pass — treat `docs/scale-remediation-plan.md`'s "already done" list as the last confirmed state, not necessarily current.
- **State/data fetching:** TanStack Query (`@tanstack/react-query`) client-side, plus direct server-side calls to `src/db/neonApi.js` in Server Components/route handlers.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + `zod` for validation.
- **UI kit:** Radix UI primitives + `class-variance-authority`/`tailwind-merge` (shadcn/ui pattern, `components.json` present), Tailwind CSS, `lucide-react` icons, `framer-motion` for animation, `embla-carousel-react`, `recharts` (admin stats/analytics charts), `react-simple-maps` + `us-atlas` (the homepage US state map).
- **Legacy/dead code:** `src/main.jsx`, `src/Layout.jsx`, `entities/*.json`, and `react-router-dom` usage are remnants of the pre-Next.js prototype and are not part of the live route tree (Inferred from no imports of `Layout.jsx` anywhere under `app/`).

### Backend
- **API architecture:** Next.js Route Handlers under `app/api/**/route.js` (mix of `.js` and `.ts`), REST-ish, one file per resource/action. No separate API framework (no tRPC/GraphQL/Express layer).
- **Business logic:** concentrated in `src/db/neonApi.js` (912 lines — all listing/search/stat query functions) and `src/api/apiClient.js` (a thinner facade used by client components, `api.entities.X.list()`-style).
- **Auth:** two entirely separate systems (see Security section) — an HMAC-signed cookie for the single admin, and a hashed-password + opaque-session-token system for public user accounts. No third-party auth provider (no NextAuth, no Clerk, no Supabase Auth) despite `@supabase/supabase-js` still being a dependency.
- **Background/scheduled jobs:** two Vercel Cron jobs (`vercel.json`): daily SEO audit and daily URL-indexing submission (Bing IndexNow, Google). No queue system (no BullMQ/SQS) — crons call route handlers directly.

### Database
- **Technology:** Neon serverless Postgres, accessed via `@neondatabase/serverless` + Drizzle ORM (`src/db/client.ts`, `src/db/schema.ts`).
- **Migrations:** Drizzle-generated SQL under `drizzle/` (`drizzle-kit generate`/`push`, two migrations present: initial schema, company logo fields), plus a large set of hand-written one-off SQL scripts under `supabase/` (seed data, category seeding, RLS policy fixes) that reflect the **prior** Supabase-backed era and are largely historical rather than actively applied to Neon.
- **Indexing:** as of the 2026-08-01 remediation plan, the schema was **missing indexes** on `company_categories.category_id`, `companies.hq_state_id`, and `companies.approved` — the plan calls these out as a required Task 3; current `schema.ts` (read in this pass) does show `idx_companies_hq_state_id`, a partial index on `approved`, and `idx_companies_avg_rating`, plus `idx_company_categories_category_id` — **Verified these indexes now exist**, consistent with the plan having been executed at some point after being written.
- **RLS:** Supabase-era SQL includes RLS policy files (`supabase/fix-agencies-rls.sql`), but RLS is a Postgres/Supabase-console concept — its relevance to the current Neon-hosted database is Unknown (Neon does not manage Supabase-style RLS policies the same way; these files likely predate the migration).

### Infrastructure
- **Hosting:** Vercel (Inferred from `vercel.json` cron format and Next.js-native deployment conventions).
- **Object storage:** Cloudflare R2 for company logos (`src/lib/r2.js`, AWS S3 SDK against R2's S3-compatible endpoint), server-only, requires `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`/`R2_PUBLIC_URL` (the only variables actually documented in `.env.example`).
- **Email:** Resend (`resend` package), used for invite emails, admin-composed emails, campaign sends, with open/click tracking via `app/api/track/*` and a Resend webhook handler.
- **Analytics:** Google Analytics via `NEXT_PUBLIC_GA_MEASUREMENT_ID` + `src/components/GoogleAnalytics.jsx`.
- **Payments:** Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) — checkout session creation exists; full subscription lifecycle (webhooks, plan enforcement) was not found in this pass and may not exist yet.

---

## Security & Authorization

- **Admin auth (Verified, `src/lib/admin-auth.js`):** single hardcoded identity via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars. Session is a signed cookie: base64url JSON payload `{email, exp}` + HMAC-SHA256 signature, **keyed by `ADMIN_PASSWORD` itself** (i.e., the admin password doubles as the HMAC secret) — `httpOnly`, `sameSite=lax`, `secure` in production, 7-day max age.
- **Public user auth (Verified, `src/lib/user-auth.js`):** passwords hashed with `scrypt` + random 16-byte salt, verified with `crypto.timingSafeEqual` (constant-time compare). Sessions are a random 32-byte token; only its SHA-256 hash is stored server-side (`sessions.token_hash`), so a leaked DB row cannot be replayed as a cookie. 30-day expiry, `httpOnly`/`sameSite=lax`/`secure`-in-prod cookie.
- **Data-level authorization:** enforced in query functions, not at the DB layer — every public-facing `neonApi.js` fetch hardcodes `approved = true`; only admin-only functions (e.g. `fetchCompanyById`) omit that filter (Documented+Verified via migration notes and current schema/index evidence).
- **Bot/scraper blocking (`middleware.js`):** blocks requests with missing/empty `User-Agent` and a hardcoded substring list of known bad bots/scrapers (ahrefsbot, semrushbot, python-requests, curl, headless browsers, etc.) with a 403. Legacy `/directory/*` URLs (pre-pivot staffing-directory routes) are deliberately returned as HTTP 410 Gone rather than 404 or a robots disallow, with an inline comment explaining the SEO reasoning (a disallowed URL can never be recrawled and de-indexed, whereas a crawlable 410 gets acted on).
- **PII/secrets handling:** service-role/secret keys (Stripe secret key, R2 credentials, `ADMIN_PASSWORD`, Supabase service role key where used) are read from server-only env vars; `.env.local` is gitignored (not committed — confirmed absent from tracked file listing despite existing on disk); `.env.example` only documents the R2 variables, meaning the full required env surface (Stripe, Resend, GA, admin creds, `DATABASE_URL`) is **undocumented for a new developer** (Known Limitation).

---

## Integrations & External Services

- **Neon** — primary Postgres database, serverless/scale-to-zero billing model that directly shaped several engineering decisions (see below).
- **Cloudflare R2** — company logo object storage, S3-compatible API.
- **Resend** — transactional + campaign email (invites, admin composer, campaigns, open/click webhooks).
- **Stripe** — subscription checkout for "pro"/"featured" company plans (env-gated, likely inactive without configured price IDs).
- **Google Analytics** — pageview/event tracking via measurement ID.
- **Google Search Console / Bing IndexNow** — automated URL submission via daily cron (`app/api/cron/submit-urls`), logged to `submission_logs`.
- **OpenAI** (`openai` npm package present in dependencies) — usage not located in this pass within `app/`/`src/`; likely a remnant of the deleted blog-generation/AI-matching system (Inferred, given the 2026-07-16 removal notes describe an "AI generation pipeline" and "AI matching/insights" that were deleted but may not have had every dependency pruned).
- **Supabase** — legacy primary database, now largely superseded by Neon; still referenced by several routes and by `src/lib/automation/supabaseClient.ts` (see Known Limitations). `@supabase/supabase-js` remains in `package.json`.

---

## Important Engineering Decisions

- **ISR intervals tuned to database billing, not just freshness.** Commit `7a9eb35` (2026-09-02) is a well-documented cost fix: Neon's Launch-plan compute only scales to zero after 5 idle minutes and refuses shorter idle windows, so a 5-minute homepage ISR revalidate window kept the database permanently "just about to sleep, then woken again" — 98% uptime billing 0.25 CU for 0.02% actual query utilization (~$18.71/month for 3 seconds of real work). Fix: raised cache TTLs from 24h→7d on 12 cached listing/count/stat queries, and homepage ISR from 300s→3600s, so idle gaps exceed 5 minutes and the compute can actually sleep. This is a "make the code cheaper by making it touch the DB less often," not a query-optimization fix.
- **Bounded taxonomy pages vs. unbounded profile pages get opposite rendering strategies** (`docs/scale-remediation-plan.md`): category/state/subcategory combinations are mathematically capped (~4,844 possible pages regardless of company count, since it's `categories × states`), so they're candidates for build-time prerendering of the high-value slice + on-demand ISR for the long tail. Company profile pages scale linearly with company count (targeting ~500,000), so they are deliberately **never** build-time prerendered — only on-demand ISR.
- **Search-query canonicalization to avoid duplicate-content SEO pages** (`src/lib/searchIntent.js`) — stripping "top"/"best"/N from queries before resolving a canonical URL, specifically so "top 10 X" and "best X" don't each mint their own indexable variant.
- **Sitemap deliberately excludes company profile URLs** (per the "already done 2026-08-01" section) — profiles stay crawlable/indexable via internal links but are not pushed through the sitemap, keeping sitemap size small (~500 URLs vs. ~3,500) as company count grows toward hundreds of thousands.
- **`hq_state_label` denormalization** — a conscious tradeoff to avoid a join on every listing-card render, accepting the standard denormalization risk (label can drift from the FK'd state name if not kept in sync on writes).

---

## Difficult Problems / Bugs / Fixes

**Problem → Investigation → Root cause → Solution → Result**, per `docs/scale-remediation-plan.md` (written 2026-08-01, verified against code at that time — current fix status of items below Tasks 1–3 was independently re-confirmed in this pass where noted):

1. **Employee-count filter applied after the row limit, silently wrong today.** `neonApi.js` fetched `LIMIT 500` rows, sorted by rating, then filtered by employee-count bucket *in JavaScript* — meaning any category/state combination with more than 500 companies got employee-filtered results computed from an arbitrary top-500 slice rather than the true matching set. Root cause: filtering logic written to run after the DB round-trip instead of as a SQL predicate. Documented fix: move bucketing into SQL (either a derived/generated column + migration, or a range-predicate `OR` over a cast expression). **Status: plan only — not independently re-verified as fixed in this pass.**
2. **`IN (uuid, uuid, …)` company-ID lists degrading at scale.** `resolveCategoryCompanyIds()` pulled every company ID in a category into Node, deduped with a JS `Set`, and fed the array back into a SQL `inArray()` — fine at ~300 UUIDs (~11 KB query) but projected to ~1.8 MB per query at 500,000 companies, degrading the query planner. Fix: resolve to *category* IDs (bounded, ≤11) and `INNER JOIN` `company_categories`→`companies` instead, replacing the JS dedupe with `selectDistinct`/`GROUP BY`. **Status: plan only.**
3. **Missing indexes on every column the listing queries actually filter by.** Root cause: the only existing constraint (`unique(company_id, category_id)`) has `company_id` as its leading column, so it can't serve `category_id`-first lookups. **Result: now present** — `idx_company_categories_category_id`, `idx_companies_hq_state_id`, a partial index on `approved`, and `idx_companies_avg_rating` are all Verified in the current `src/db/schema.ts`, consistent with this task having been completed after the plan was written.

---

## Performance & Reliability

- **Caching:** in-process query result caching in `neonApi.js` with multi-day TTLs (raised from 24h to 7 days specifically to reduce database wake-ups, see Engineering Decisions).
- **ISR:** used for both the homepage and company profile pages; taxonomy pages were slated to move from `force-dynamic` to ISR with `generateStaticParams` limited to a "top slice" (10 categories + 500 category/state combinations) while leaving `dynamicParams: true` for the long tail — this specific switch's current status was not re-verified in this pass.
- **Prefetching:** the homepage's interactive US state map prefetches the target route on hover so the click-through navigation feels instant rather than waiting on server render (commit `cac1f66`, `src/components/home/USStateMap.jsx`).
- **Rate limiting / retry / backoff:** not found in this pass for the Next.js app itself; the scraping pipeline (`pipeline/crawler.py`) is a separate offline process with its own concerns, not covered here.
- **Deduplication:** implemented in the offline data pipeline (`pipeline/staging.py`) — domain match, phone match, fuzzy name+ZIP match (≥85% similarity) before anything reaches production Postgres. No equivalent live-site deduplication was found (the public submission form has no described duplicate-detection step).

---

## Testing & Verification

- **JavaScript unit tests:** three small `.test.mjs`/`.test.js` files exist (`src/lib/cleanFacets.test.mjs`, `src/lib/employeeCount.test.js`, `src/lib/searchIntent.test.mjs`) — targeted tests of specific utility functions, not a broad suite. No test runner script is defined in `package.json` (no `npm test`), so how these are invoked (`node --test`? manually?) is Unknown from the manifest alone.
- **Python tests:** `pipeline/tests/` contains a pytest suite (`test_content_extractor.py`, `test_crawler.py`, `test_crawl_utils.py`, `test_staging_compat.py`) covering the offline scraping pipeline specifically.
- **Type checking:** `npm run typecheck` runs `tsc -p ./jsconfig.json`; the project is mixed JS/TS (`.jsx`/`.js` alongside a growing set of `.ts`/`.tsx` files, e.g. `app/admin/seo-audit/page.tsx`, `app/api/cron/*.ts`).
- **Linting:** ESLint 9 flat config (`eslint.config.js`), with `eslint-plugin-react`, `-react-hooks`, `-unused-imports`.
- **Build-time verification:** `npm run build` chains `next build` with a custom script `scripts/check-title-suffix.mjs` — a project-specific SEO guard (Inferred purpose from name: likely verifies page `<title>` tags carry the expected site-name suffix) that fails the build if violated.
- **No E2E framework** (no Playwright/Cypress config for the web app itself) was found — Playwright is present only as a dependency of the offline scraping pipeline.
- **No CI config** (no `.github/workflows`) was found in this pass — build/lint/typecheck appear to be run locally/manually or via Vercel's own build step, not a separate CI system.

---

## Notable Implementation Details

- **Internal-only fields stripped before serialization to client components** — `app/company/[slug]/page.jsx` explicitly deletes `data_source`, `source_url`, `owner_user_id` before passing a company row to a `'use client'` component, with a comment explaining that Next.js RSC props get shipped to the browser bundle verbatim.
- **Indexability is data-driven, not just route-based** — a company profile is only marked crawlable if it has `approved = true` *and* a non-empty description; this predicate is deliberately mirrored between the page's `robots` metadata and the SQL used to build the sitemap, with an inline comment warning future editors to keep the two in sync.
- **Case-insensitive redirect matching pitfall documented inline** — `next.config.mjs` has a comment explaining why there is deliberately no `/Contact` → `/contact` redirect rule (Next's redirect matcher is case-insensitive, so a same-word rule creates an infinite redirect loop against the already-lowercase route).
- **`topN()` helper centralizes "Top N" heading logic** — replacing a previously hardcoded `Math.min(count, 10)` so the visible H1/title text and any JSON-LD `ItemList` count can't drift out of sync with each other.

---

## Known Limitations / Technical Debt

- **PRD is stale relative to the codebase.** `docs/PRD.md` lists Reviews, Payments/Premium Listings, and RFQ Marketplace as explicitly out-of-scope future work, yet all three are already modeled in the live schema and have working API routes (`reviews`, Stripe checkout, `marketplace_*` tables). Treat the PRD as a historical snapshot of intent, not a current feature list.
- **README is stale/misleading relative to the codebase.** `README.md` describes a Supabase-optional, mock-data-by-default app ("No environment variables are required... uses in-memory mock data by default") and frames the product as a general business-services directory ("India's trusted platform..."/"verified business service providers and staffing agencies") — none of which matches the current Neon-backed, US-manufacturing-only, non-mock production app. Anyone onboarding from the README alone will form an incorrect picture of the product and its data layer.
- **Partial, unverified Supabase→Neon migration.** Per `docs/sessions/2026-07-16-db-migration.md`, at least 15 files still imported `@supabase/supabase-js` directly as of that session, including the entire marketplace feature, admin campaigns/categories, SEO auditor, click/open tracking, and the Resend webhook handler. A repo-wide check in this pass confirms the same set of files still import Supabase today. Since `.env.local` contains no `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, any of these code paths will throw at runtime in the current local environment; whether production has separate Supabase credentials configured is **Unknown** and should be confirmed before assuming these features work.
- **`@supabase/supabase-js` and `src/api/supabaseApi.js` remain in the codebase** despite being flagged for removal in the migration notes — dead weight, not yet cleaned up.
- **`src/views/RequestProposal.jsx` (mounted at `/RequestProposal`) calls APIs that don't exist** (`api.entities.Lead.create()`, `api.auth.me()`, `api.auth.redirectToLogin()`) — explicitly flagged in the migration notes as broken and undecided (keep+rebuild, redirect, or delete).
- **Legacy pre-pivot scaffold still on disk:** `entities/*.json`, `src/main.jsx`, `src/Layout.jsx`, and other React-Router-era files are dead weight from before the Next.js rewrite and should eventually be removed, though they don't appear to be reachable from any live route.
- **`.env.example` badly undersells the real configuration surface.** It documents only the five R2 variables; a developer following it alone would miss `DATABASE_URL`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`/price IDs, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, and `NEXT_PUBLIC_APP_URL` — all of which are read by code found in this pass.
- **No `npm test` script** and no CI pipeline were found — the handful of unit tests exist but there's no single documented command or automated gate that runs them.
- **`state_category_rankings` table exists but is unused** (confirmed empty per migration notes) — a deferred precomputation that isn't providing value yet.
- **Stripe integration is incomplete** — checkout session creation exists, but no webhook handler for post-payment fulfillment (e.g., flipping a company to `featured`/`pro`) was found in this pass; without price IDs configured it's effectively dormant.
- **`scale-remediation-plan.md` items 1, 2, 4, 5, 6 have unconfirmed completion status** — only item 3 (indexes) was independently re-verified against current schema in this pass. Do not assume the rest have shipped without checking `neonApi.js` and the relevant page files directly.

---

## Project Timeline

| Date | Milestone |
|---|---|
| 2026-02-19 | Initial commit(s); early build/SEO/functionality fixes as a general business directory |
| 2026-02-21 – 2026-03-13 | Blog content system built out (staffing/solar/cruise-line articles — later deleted) |
| 2026-07-16 | Major architecture change: Supabase → Neon/Drizzle migration; AI blog generation and AI matching features deleted entirely as off-topic for the new manufacturing focus |
| 2026-08-01 | Scale + SEO remediation plan written; three of its tasks (sitemap trim, page-size bump, `topN()` helper) applied same day; indexing task later completed (confirmed via current schema) |
| 2026-08-30 | Homepage state-map hover-prefetch performance fix |
| 2026-08-31 | Manufacturing categories/subcategories consolidated into a single config file |
| 2026-09-02 | Neon cost fix: cache TTLs and ISR intervals retuned around scale-to-zero billing |
| 2026-09-08 | Backlink/SEO submission documentation added (most recent commit) |

(Dates reflect commit timestamps in this repository's history and may not exactly match calendar reality if the machine clock was misconfigured at commit time — treated here as-authored.)

---

## Repository Landmarks

- `docs/PRD.md` — original product spec; useful for intent and voice/copy rules, but **stale** on feature scope (see Known Limitations).
- `docs/scale-remediation-plan.md` — the most detailed, code-line-cited engineering document in the repo; read this before touching `neonApi.js` or any category/state page.
- `docs/sessions/2026-07-16-db-migration.md` — explains why two databases (Neon + legacy Supabase) coexist and exactly which files still need migrating.
- `src/db/schema.ts` — single source of truth for the data model; more current than any SQL file under `supabase/`.
- `src/db/neonApi.js` — all production query logic; large file (912 lines), central to performance work.
- `src/lib/manufacturingCategories.js` — single source of truth for categories/subcategories; both frontend copy and pipeline classification should read from here.
- `next.config.mjs` — the canonical list of every historical URL/slug rename; check here before assuming an old link is dead.
- `middleware.js` — bot-blocking and the legacy `/directory/*` 410 handling.
- `pipeline/README.md` and `pipeline/AGENT_MANUAL.md` — how company data actually gets into the database (distinct from the public submission form).
- `.env.example` — incomplete; see Known Limitations for the real variable list.

---

## Current Project State

**Working / production-ready (Verified):** core directory browsing, company profiles, public submission form, admin approval workflow, bot blocking, SEO metadata/sitemap/redirect infrastructure, Neon-backed data layer for the primary directory features, cost-tuned ISR/caching.

**Likely broken or unverifiable without further access (flagged, not confirmed dead):** marketplace RFQ/supplier features, email campaign admin UI, SEO audit dashboard, click/open tracking, Resend webhook — all still coded against `@supabase/supabase-js` with no Supabase credentials present locally.

**Explicitly incomplete/dormant:** Stripe subscription payments (no price IDs configured, no webhook fulfillment found), `state_category_rankings` precomputation, `/RequestProposal` legacy page.

**Documentation debt:** both `README.md` and `docs/PRD.md` describe a materially different (older) version of the product than what's implemented. A new agent or developer should trust `src/db/schema.ts`, `docs/scale-remediation-plan.md`, and `docs/sessions/2026-07-16-db-migration.md` over the README/PRD for anything about data model, current feature scope, or infrastructure.

**Most important things to understand before modifying this codebase:**
1. There are two "eras" of code in this repo (pre-pivot staffing directory vs. current manufacturing directory) — don't assume every file under `src/` or `entities/` is live.
2. There are two databases in play (Neon is current/primary; Supabase is legacy and only partially decommissioned) — check which one a file you're touching actually uses before assuming it works.
3. Performance/caching decisions here are driven by Neon's serverless billing model as much as by user-facing speed — don't "fix" a long cache TTL without understanding the cost math in the Sep 2026 commit.
4. Category/state page counts are architecturally bounded; company profile counts are not — the two page classes are meant to be rendered differently, and conflating them was an active bug the team was fixing as of August 2026.

---

## Summary

FirmsLedger is a US-only, SEO-first manufacturer directory built on Next.js 15 App Router with a Drizzle/Neon Postgres backend, currently mid-migration away from an earlier Supabase-backed, general-purpose "business directory" product (of which dead code and a stale README/PRD remain). It serves anonymous buyers browsing manufacturers by category and state, self-serve manufacturer listings (public form or invite-token), and a single-operator admin back office for approvals and outbound email (Resend). Beyond the core directory, the schema already supports reviews, Stripe-based paid plans, and an RFQ/supplier marketplace — features the project's own PRD still labels as future work, making the schema a more reliable scope indicator than the docs. The most distinctive engineering characteristic is that its caching and rendering strategy (ISR intervals, query TTLs, bounded-vs-unbounded page classes) is explicitly tuned around Neon's scale-to-zero serverless billing model, not just around user-perceived freshness — documented in unusually precise, numbers-backed commit messages and a dedicated remediation plan. A new contributor's first move should be reading `docs/scale-remediation-plan.md` and `src/db/schema.ts`, not the README.
