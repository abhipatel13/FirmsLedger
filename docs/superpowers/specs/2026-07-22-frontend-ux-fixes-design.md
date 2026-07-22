# Frontend UX Fixes & Auth Implementation — Design

Date: 2026-07-22

## Context

User reviewed the live site (via WhatsApp screenshots) and flagged 8 issues across category/state browsing, styling, and account features. This spec covers all 8, grouped into 5 independent workstreams so they can be implemented in parallel by separate agents.

## A. Category + State picker simplification

**File:** `app/[category]/CategoryLandingClient.jsx`

**Problem:** The current UI dumps all 50 states as pill buttons grouped by region (Northeast/Midwest/South/West) under an optional subcategory filter row — visually noisy and slow to scan.

**Fix:** Replace the state-pill-grid section with two `<select>` dropdowns side by side:
- **Category** dropdown — pre-populated from `MANUFACTURING_CATEGORIES`, defaults to the current page's category.
- **State** dropdown — flat alphabetical list of all 50 states (reuse the existing `US_STATES_BY_REGION` data, flattened).

A "View Companies" button navigates to `/[category]/[state]` (respecting the selected subcategory filter, same as `stateHref()` today). Keep the subcategory pill row above it unchanged — that part isn't in scope.

If category changes in the dropdown, the state dropdown selection is preserved; the button computes the href from current dropdown state rather than needing per-state links.

## B. Font mismatch on hero CTA band

**File:** `src/views/ListYourCompany.jsx` ("Get your business in front of buyers" section)

**Problem:** This section renders in a different font than the rest of the site (which uses Inter).

**Fix:** Locate the styling on this section (likely a stray `font-serif` Tailwind class or inline `style={{ fontFamily: ... }}`) and remove it so text inherits the global Inter font stack, matching every other page.

## C. Industries browse page — bigger cards + icons

**File:** `src/views/Categories.jsx` (rendered at `/browse`)

**Problem:** Cards are small; icons don't show for manufacturing categories because `CAT_ICONS` only has entries for old staffing/service-directory slugs (`staffing-companies`, `seo`, etc.), not the manufacturing slugs currently seeded in the DB (`electrical-components`, `mechanical-components`, etc.) — so they fall through to the generic emoji.

**Fix:**
1. Add `CAT_ICONS` entries for all current `MANUFACTURING_CATEGORIES` slugs (electrical, mechanical, plastics-packaging, metal-fabrication, electronics-semiconductor, automotive-parts, textile-apparel, furniture-woodworking, food-beverage-processing, medical-device).
2. Increase card min-height/padding and icon box size in both the parent-card grid and standalone-category grid so cards read as larger, more prominent tiles (bump icon box from `w-11 h-11`/`w-9 h-9` to `w-14 h-14`/`w-12 h-12`, increase card padding, and bump grid gap).

## D. State-hub page — match Categories page style

**File:** `app/states/[slug]/page.jsx` (e.g. "Manufacturers in Texas")

**Problem:** Currently a plain link-list; should look like the improved industries grid from (C), just scoped to categories available in that state.

**Fix:** Extract the improved category-card visual (icon box + name + description, from C) into a small shared presentational component (e.g. `src/components/CategoryCard.jsx`) used by both `Categories.jsx` and this page, so styling stays in sync. This page keeps its own data (state name, filtered category list) — only the card markup is shared.

## E. Auth, claim-listing, and search filters

### E1. Real user auth (blocks E2)

**Problem:** `app/auth/page.jsx` calls `src/lib/auth.js`, which wraps `src/lib/supabase.js` — a dead stub (`export const supabase = null`) left from the Neon migration. Every signup/login call throws or no-ops; `useSession()` always returns no user.

**Fix — minimal custom auth, matching the existing `src/lib/admin-auth.js` pattern (signed cookie, no new runtime deps beyond a password hasher):**

- **New Drizzle tables** in `src/db/schema.ts`:
  - `users`: `id` (uuid pk), `email` (unique), `password_hash`, `full_name`, `created_at`.
  - `sessions`: `id` (uuid pk), `user_id` (fk → users), `token_hash`, `expires_at`, `created_at`.
- **Password hashing:** use Node's built-in `crypto.scrypt` (no new dependency), stored as `salt:hash` in `password_hash`.
- **New API routes:**
  - `POST /app/api/auth/signup/route.js` — validate input, hash password, insert user, create session, set `fl_session` httpOnly cookie.
  - `POST /app/api/auth/login/route.js` — verify password, create session, set cookie.
  - `POST /app/api/auth/logout/route.js` — delete session row, clear cookie.
  - `GET /app/api/auth/session/route.js` — look up session by cookie, return `{ user }` or `{ user: null }`.
- **Rewrite `src/lib/auth.js`** to call these routes via `fetch` instead of `supabase.auth.*`; `useSession()` becomes a small hook that calls `GET /api/auth/session` on mount (React Query, consistent with rest of app).
- **Delete** `src/lib/supabase.js` (dead stub) once nothing imports it.

### E2. Claim-listing (depends on E1)

**File:** `app/claim-listing/page.jsx`, `app/api/claim/route.js` (already functional)

Once `useSession()` returns real data, the existing gate (`redirect to /auth?reason=claim` when no session) and submit flow should work unchanged — verify end-to-end (signup → redirected back to claim → submit → row appears in `listing_requests`) rather than rewriting logic.

### E3. Search filters

**File:** `app/search/page.jsx`

**Problem:** Only a free-text search box; user wants structured filtering.

**Fix:** Add two dropdowns above/alongside the search input:
- **Category** — populated from categories list (same source as Categories.jsx).
- **City/State** — populated from distinct `hq_state_label` values (or city, if available) already in the companies data.

Filters combine with existing text search (AND logic) against the same `fetchCompanies`-style query in `neonApi.js` — extend the `where` builder to accept optional `categorySlug` and `stateSlug`/`city` params.

## Rollout

Each workstream (A, B, C+D, E) is independent enough to implement as a separate parallel task:
- **Task 1:** A (category/state picker)
- **Task 2:** B (font fix) — trivial, can be folded into Task 1 or done standalone
- **Task 3:** C + D (industries grid + shared card + state-hub restyle) — grouped since D depends on the card component from C
- **Task 4:** E1 + E2 (auth + claim) — sequential within the task since E2 depends on E1
- **Task 5:** E3 (search filters) — independent, touches `app/search/page.jsx` + `neonApi.js`

No shared files are touched by more than one task except `src/db/schema.ts` (Task 4 only) and `neonApi.js` (Task 5 only), so tasks can run in parallel without merge conflicts.

## Testing

- A, C, D, E3: manual browser check (dev server) of the affected pages — dropdown behavior, card rendering, filter results.
- E1/E2: manual end-to-end flow (signup, login, logout, claim submission) against local dev DB; confirm rows in `users`/`sessions`/`listing_requests`.
- No new automated test suite exists in this repo; rely on `npm run lint` + `npm run build` passing, plus manual verification per the project's "test UI in browser" convention.
