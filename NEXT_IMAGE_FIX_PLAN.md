# next/image 400 flood — fix plan

## Root cause

`next.config.mjs` `images.remotePatterns` allows only unsplash / supabase / dalle.

Every company logo goes through `getAgencyLogoUrl()` (`src/utils/index.ts:51`), which
returns either an arbitrary `company.logo_url` host or `https://ui-avatars.com/api/?...`.
Neither host is allowlisted → the Next image optimizer answers **400 Bad Request**
for every one of them.

Two amplifiers:

1. `/_next/image` 400s are **not CDN-cached**. Every page view re-fires one origin
   function invocation per logo, forever. No warm cache ever forms.
2. `src/views/AgencyProfile.jsx:470-486` — `<Image>` `onError` writes to
   `failedImages` state and swaps `src` to the ui-avatars URL, which **also** 400s,
   which fires `onError` again. `new Set(prev)` is a fresh object every time, so
   React re-renders on each error. That is the 1076-error console loop in the screenshot.

Scope check: everywhere else (`AgencyCard`, `CompanyCard`, `Search`, `Compare`,
`Directory`, `Home`, `SearchPageLayout`) already uses plain `<img>` and is unaffected.
Only `AgencyProfile.jsx` (2 spots) and `app/claim-listing/page.jsx:203` feed remote
logos into `<Image>`.

> Note: this explains the console flood and the Vercel image/function burn. The Neon
> network-transfer number is a separate line item — confirm it against Neon query
> stats before attributing it to this bug.

## Fix

**1. Kill the remote avatar. `src/utils/index.ts`**

`getAgencyLogoUrl()` returns a local `data:image/svg+xml` initials avatar instead of
a ui-avatars URL. Zero network request, zero optimizer hit, works offline, can't 400.
All three call sites route through this one function.

**2. Stop optimizing company logos. `src/views/AgencyProfile.jsx`**

Company logos are 48–96px from arbitrary third-party hosts — nothing to optimize and
every host would need allowlisting. Replace both `<Image>` uses (lines 245 and 470)
with plain `<img loading="lazy">`, matching every other card component in the repo.

**3. Delete the error loop. `src/views/AgencyProfile.jsx`**

Remove `failedImages` state and the `onError` setState. With step 1 the fallback is a
data URI, so `onError` just needs `e.currentTarget.src = getAgencyLogoUrl({name})` —
no state, no re-render, no loop.

**4. Same treatment for `app/claim-listing/page.jsx:203`** — `<Image>` → `<img>`.

**5. Leave `next.config.mjs` alone.** Adding `ui-avatars.com` to `remotePatterns`
would silence the 400s but keep paying for an optimizer round-trip per card on a
generated SVG. Step 1 removes the request entirely.

## Verify

- `grep -rn "ui-avatars" src app` → no hits.
- Load `/company/pacific-audio-communications-maui`, DevTools Network filtered to
  `_next/image` → zero requests, console clean.
- Vercel image-optimization + function invocation counts drop on next deploy.

Skipped: uploading/self-hosting real logos to a CDN — do that when logo coverage
actually matters for conversion, not to fix a 400.
