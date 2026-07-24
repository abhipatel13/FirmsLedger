# Remove AuthGate SSR-Blocking Spinner — Design Spec

**Date:** 2026-07-24
**Scope:** `app/providers.jsx`, `src/lib/NavigationTracker.jsx`, and deletion of 4 confirmed-dead legacy files.

## Problem

Every page on the site is wrapped (via `app/layout.jsx` → `Providers` → `AuthGate`) in a client-side gate that renders **only a loading spinner** until `AuthContext`'s `isLoadingAuth`/`isLoadingPublicSettings` flags flip from their initial `true` to `false`. Those flags can only change inside a `useEffect`, which never runs during server-side rendering. Result: the server-rendered HTML for every single page — including this session's SEO work on `/terms`, `/privacy`, the category listing pages, and the homepage — is just a spinner `<div>`. Real content only appears after client JS hydrates and an internal "auth check" resolves.

That auth check (`api.auth.me` in `src/api/apiClient.js:162`) is an explicit stub: `// Auth stub — this is a public directory with no user auth`. It always resolves successfully and gates nothing. `redirectToLogin` is a no-op. The whole `AuthContext`/`AuthGate` system is leftover scaffolding from an unused Vite/react-router template (`src/App.jsx`, confirmed dead — no other file imports it) that was mechanically carried into the Next.js App Router without being adapted or removed.

A separate, real auth system already exists and is unaffected by this change: `src/lib/auth.js` (`useSession()`, backed by real `/api/auth/*` routes), used independently by `/claim-listing` and `/auth`, each with their own client-side session check and redirect. This spec does not touch that system.

## Goal

Remove the SSR-blocking gate so every page's real content is present in the initial server-rendered HTML (fixing SEO/crawlability and eliminating the flash-of-spinner on every load), and delete the now-fully-dead legacy scaffold it depended on, per the user's "full cleanup" scope choice.

## Confirmed dead files (delete)

- `src/App.jsx` — unused Vite/react-router entry point; grep confirms no other file imports it.
- `src/pages.config.js` — only ever imported by `src/App.jsx`; orphaned once that's deleted.
- `src/lib/AuthContext.jsx` — the stub `AuthProvider`/`useAuth`; only consumers after this change are `app/providers.jsx` (being changed) and `src/lib/NavigationTracker.jsx` (being changed).
- `src/components/UserNotRegistedError.jsx` — only reachable from `AuthGate`'s `authError.type === 'user_not_registered'` branch, which can never fire (the stub `api.auth.me` never rejects).

## Confirmed still-live, not touched

- `src/lib/PageNotFound.jsx` — used by the real `app/not-found.jsx`; also imported by `src/App.jsx` but that's irrelevant since `App.jsx` is being deleted, not this file.
- `src/lib/auth.js`, `src/components/AuthHashHandler.jsx` — the real, separate session/auth system and its Supabase-style email-link error handler. Both keep working exactly as today.

## Changes

### `app/providers.jsx`
Remove `AuthGate`, the `AuthProvider` import/wrapper, and the `UserNotRegisteredError` import. Render `Layout` directly and unconditionally:

```jsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import AuthHashHandler from '@/components/AuthHashHandler';
import Layout from '@/Layout';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <NavigationTracker />
      <AuthHashHandler />
      <Layout>{children}</Layout>
      <Toaster />
    </QueryClientProvider>
  );
}
```

### `src/lib/NavigationTracker.jsx`
Currently imports `useAuth` from the file being deleted, and only logs a pageview when `isAuthenticated` is true. Since the stub's `isAuthenticated` always eventually became `true` after mount anyway (the "gate" was never meaningfully selective — see Problem section), removing the check preserves today's effective behavior while dropping the dead dependency:

```jsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/api/apiClient';

const PAGE_KEYS = ['Home', 'AdminDashboard', 'AgencyDashboard', 'AgencyProfile', 'Categories', 'CategoryPage', 'Compare', 'CountryPage', 'Directory', 'RequestProposal', 'TopRankings', 'WriteReview'];
const mainPageKey = 'Home';

export default function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const pathSegment = pathname.replace(/^\//, '').split('/')[0] || '';
    const pageName = pathSegment === '' ? mainPageKey : PAGE_KEYS.find(k => k.toLowerCase() === pathSegment.toLowerCase()) || null;
    if (pageName) {
      api.appLogs.logUserInApp(pageName).catch(() => {});
    }
  }, [pathname]);

  return null;
}
```

### Delete
- `src/App.jsx`
- `src/pages.config.js`
- `src/lib/AuthContext.jsx`
- `src/components/UserNotRegistedError.jsx`

## Non-goals

- Not touching `src/lib/auth.js`, `useSession()`, `/api/auth/*`, `/claim-listing`, or `/auth` — the real auth system is untouched.
- Not adding any new auth/gating logic — this site has no real user-auth concept today (per the stub's own comment), so there is nothing to preserve or replace.
- Not addressing admin auth (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, cookie-based, handled server-side in `app/api/admin/*`) — unrelated system, unaffected either way.

## Risk

Low. `AuthGate`'s effective behavior today, after the always-successful stub resolves, is identical to rendering `Layout` immediately — this change just removes the artificial delay and the SSR-blocking initial state, not any real gating logic (there was none). The only behavioral difference is that pages render instantly instead of after one client-side round trip, which is the entire point of the fix.

## Testing plan

- `npx next lint` — 0 errors.
- `npm run build` — production build succeeds.
- Manual verification: `curl` the homepage and a category page after this change and confirm actual page text (e.g. "Zero Paid Rankings", category names) appears directly in the server-rendered HTML — this is the first real way to confirm SSR content in this session, since every prior `curl` check this session was silently defeated by this exact bug.
- Confirm `/claim-listing` and `/auth` still function (their own `useSession()`-based logic is untouched, but worth a smoke check since they're the pages nearest this change).
