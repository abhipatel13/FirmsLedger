# Title Template Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop every non-root page from rendering `<title>… | FirmsLedger | FirmsLedger</title>` by making the root layout's `title.template` the single source of the brand suffix.

**Architecture:** `app/layout.jsx` declares `title: { default, template: '%s | FirmsLedger' }`. Next.js applies that template to the `title` of every route segment *below* the root segment. Fifteen page/layout files also append `| ${SITE_NAME}` (or a literal `| FirmsLedger`) by hand, so the suffix lands twice. The fix removes the hand-written suffix from those files and leaves the template untouched. `openGraph.title` is **not** templated by Next.js, so every OG title keeps whatever suffix it has today — this plan must not change a single OG string.

**Tech Stack:** Next.js 15 App Router, JavaScript (JSX), Metadata API.

## Global Constraints

- The root layout's `title.template` (`app/layout.jsx:53`) must NOT be modified. It is the fix.
- `openGraph.title` values must be byte-identical before and after. OG is not templated; changing it would silently alter social previews.
- Do not touch `app/page.jsx`, `app/auth/layout.jsx`, `app/company/[slug]/page.jsx`, or `app/layout.jsx`. Verified correct — see "Files deliberately unchanged" below.
- When a file's last `SITE_NAME` reference is removed, drop `SITE_NAME` from that file's `@/lib/seo` import. Leaving it triggers an unused-import lint warning. The affected files are named explicitly per task.
- Brand suffix is exactly `| FirmsLedger` (one space, pipe, one space). Never `—`, never `-`.

## Files deliberately unchanged (do not "fix" these)

| File | Current title | Why it is already correct |
|---|---|---|
| `app/page.jsx:11` | `Top Manufacturers by State — US Manufacturer Directory \| ${SITE_NAME}` | The root **page** sits in the same segment as the layout that declares the template, so Next.js does **not** apply the template to it. Verified: `.next/server/app/index.html` renders exactly one suffix. It needs the manual suffix and does **not** need `title: { absolute: … }`. |
| `app/auth/layout.jsx:2` | `Sign In` | No manual suffix. Renders `Sign In \| FirmsLedger`. |
| `app/company/[slug]/page.jsx:48` | `companyName` | No manual suffix. Renders `Acme Corp \| FirmsLedger`. Its `openGraph.title` at line 53 keeps its suffix — leave it. |
| `app/layout.jsx` | — | Owns the template. |

---

### Task 1: Strip the suffix from the eleven static-metadata files

**Files:**
- Modify: `app/browse/page.jsx:7`
- Modify: `app/search/layout.jsx:1,6`
- Modify: `app/contact/page.jsx:2,7`
- Modify: `app/list-your-company/page.jsx:7`
- Modify: `app/claim-listing/layout.jsx:6`
- Modify: `app/terms/page.jsx:6`
- Modify: `app/privacy/page.jsx:6`
- Modify: `app/WriteReview/page.jsx:5`
- Modify: `app/RequestProposal/page.jsx:5`
- Modify: `app/join/layout.jsx:2`
- Modify: `app/admin/layout.jsx:5`
- Test: prerendered HTML under `.next/server/app/*.html` (no test file — see Step 1)

**Interfaces:**
- Consumes: `SITE_NAME` from `@/lib/seo` (value `'FirmsLedger'`).
- Produces: nothing importable. Task 3's verification script asserts over the output of this task and Task 2 together.

- [ ] **Step 1: Capture the failing baseline**

The prerendered HTML is the test. Build, then dump every static title:

```bash
npm run build
grep -ho '<title>[^<]*</title>' .next/server/app/*.html | sort -u
```

Expected output right now — note the doubled suffix on nine of these:

```
<title>Admin — FirmsLedger | FirmsLedger</title>
<title>Browse All Industries | FirmsLedger | FirmsLedger</title>
<title>Claim Your Company Listing | FirmsLedger | FirmsLedger</title>
<title>Contact Us | FirmsLedger | FirmsLedger</title>
<title>FirmsLedger – US Manufacturer Directory | Find Manufacturers by State</title>
<title>Join FirmsLedger | FirmsLedger</title>
<title>List Your Company | FirmsLedger | FirmsLedger</title>
<title>Privacy Policy | FirmsLedger | FirmsLedger</title>
<title>Request a Proposal | FirmsLedger | FirmsLedger</title>
<title>Search Manufacturers &amp; Suppliers | FirmsLedger | FirmsLedger</title>
<title>Sign In | FirmsLedger</title>
<title>Terms of Service | FirmsLedger | FirmsLedger</title>
<title>Top Manufacturers by State — US Manufacturer Directory | FirmsLedger</title>
<title>Write a Review | FirmsLedger | FirmsLedger</title>
```

The two lines with a single suffix (`Sign In`, `Top Manufacturers by State`) and the `_not-found` default line must still look identical at the end of this task.

- [ ] **Step 2: Edit `app/browse/page.jsx`**

Line 7 only. Line 11 is `openGraph.title` — leave it alone. `SITE_NAME` stays imported because line 11 still uses it.

```jsx
export const metadata = {
  title: 'Browse All Industries',
  description: `Explore all manufacturing industries on FirmsLedger — electrical, mechanical, plastics, metals, automotive, textile, furniture, food, and medical device manufacturers across the US.`,
  alternates: { canonical: `${_BASE}/browse` },
  openGraph: {
    title: `Browse All Industries | ${SITE_NAME}`,
```

- [ ] **Step 3: Edit `app/search/layout.jsx`**

This file's only `SITE_NAME` use is the title, so the import must shed it.

```jsx
import { BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Search Manufacturers & Suppliers',
  description: 'Search US manufacturers and suppliers by category and state on FirmsLedger.',
```

- [ ] **Step 4: Edit `app/contact/page.jsx`**

Line 11's OG title is the literal `'Contact FirmsLedger'` (no `SITE_NAME`), so after line 7 changes the import must shed `SITE_NAME`.

```jsx
import { BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with FirmsLedger. Send a message or email us for questions, feedback, or partnership inquiries.',
  alternates: { canonical: `${_BASE}/contact` },
  openGraph: {
    title: 'Contact FirmsLedger',
```

- [ ] **Step 5: Edit `app/list-your-company/page.jsx`**

Line 7 only. Line 11 (OG) keeps the suffix, so the import is unchanged.

```jsx
export const metadata = {
  title: 'List Your Company',
  description: 'Get your manufacturing company listed on FirmsLedger. Free to start, no credit card required. Reach buyers actively searching across all 50 states.',
  alternates: { canonical: `${_BASE}/list-your-company` },
  openGraph: {
    title: `List Your Company | ${SITE_NAME}`,
```

- [ ] **Step 6: Edit `app/claim-listing/layout.jsx`**

Line 6 only. Line 10 (OG) keeps the suffix; import unchanged.

```jsx
export const metadata = {
  title: 'Claim Your Company Listing',
  description: 'Claim and verify your company listing on FirmsLedger to manage your profile, respond to reviews, and unlock premium features.',
  alternates: { canonical: `${_BASE}/claim-listing` },
  openGraph: {
    title: `Claim Your Company Listing | ${SITE_NAME}`,
```

- [ ] **Step 7: Edit `app/terms/page.jsx`**

Line 6 only. `SITE_NAME` is used at lines 11, 21, 25, 37, 45 — import unchanged.

```jsx
export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FirmsLedger, the US manufacturer and supplier directory.',
  alternates: { canonical: `${_BASE}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
```

- [ ] **Step 8: Edit `app/privacy/page.jsx`**

Line 6 only. `SITE_NAME` is used at lines 11 and 25 — import unchanged.

```jsx
export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FirmsLedger — how we collect, use, and protect your information.',
  alternates: { canonical: `${_BASE}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
```

- [ ] **Step 9: Edit `app/WriteReview/page.jsx`**

Literal suffix, no import involved.

```jsx
export const metadata = {
  title: 'Write a Review',
  robots: { index: false, follow: false },
};
```

- [ ] **Step 10: Edit `app/RequestProposal/page.jsx`**

```jsx
export const metadata = {
  title: 'Request a Proposal',
  robots: { index: false, follow: false },
};
```

- [ ] **Step 11: Edit `app/join/layout.jsx`**

`'Join FirmsLedger'` becomes `'Join'`, which the template renders as `Join | FirmsLedger`.

```jsx
export const metadata = {
  title: 'Join',
  robots: { index: false, follow: false },
};
```

- [ ] **Step 12: Edit `app/admin/layout.jsx`**

The suffix here uses an em dash rather than a pipe, but it is still a hand-written duplicate.

```jsx
export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};
```

- [ ] **Step 13: Rebuild and assert every static title carries exactly one suffix**

```bash
npm run build
grep -ho '<title>[^<]*</title>' .next/server/app/*.html | sort -u
```

Expected — every doubled suffix gone, and the three previously-correct lines byte-identical to Step 1:

```
<title>Admin | FirmsLedger</title>
<title>Browse All Industries | FirmsLedger</title>
<title>Claim Your Company Listing | FirmsLedger</title>
<title>Contact Us | FirmsLedger</title>
<title>FirmsLedger – US Manufacturer Directory | Find Manufacturers by State</title>
<title>Join | FirmsLedger</title>
<title>List Your Company | FirmsLedger</title>
<title>Privacy Policy | FirmsLedger</title>
<title>Request a Proposal | FirmsLedger</title>
<title>Search Manufacturers &amp; Suppliers | FirmsLedger</title>
<title>Sign In | FirmsLedger</title>
<title>Terms of Service | FirmsLedger</title>
<title>Top Manufacturers by State — US Manufacturer Directory | FirmsLedger</title>
<title>Write a Review | FirmsLedger</title>
```

- [ ] **Step 14: Confirm no OG title changed**

```bash
git diff -U0 -- app/ | grep -E '^[+-]' | grep -i 'openGraph' 
```

Expected: no output. (The OG object spans multiple lines, so also eyeball `git diff -- app/` and confirm every `+`/`-` pair sits on a `title:` line that is a direct child of `metadata`, never of `openGraph`.)

- [ ] **Step 15: Lint**

```bash
npm run lint
```

Expected: no new unused-variable errors for `SITE_NAME` in `app/search/layout.jsx` or `app/contact/page.jsx`.

- [ ] **Step 16: Commit**

```bash
git add app/browse/page.jsx app/search/layout.jsx app/contact/page.jsx \
        app/list-your-company/page.jsx app/claim-listing/layout.jsx \
        app/terms/page.jsx app/privacy/page.jsx app/WriteReview/page.jsx \
        app/RequestProposal/page.jsx app/join/layout.jsx app/admin/layout.jsx
git commit -m "fix(seo): stop double-appending the brand suffix on static pages

The root layout already applies title.template '%s | FirmsLedger' to every
child segment. These eleven pages appended it a second time by hand, so
every title rendered as 'X | FirmsLedger | FirmsLedger' in the SERP and in
GA4's page-title report. openGraph.title is untouched — it is not templated.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Strip the suffix from the four `generateMetadata` routes

**Files:**
- Modify: `app/[category]/page.jsx:3,14,22`
- Modify: `app/[category]/[state]/page.jsx:4,118,135,156`
- Modify: `app/[category]/[state]/[subcategory]/page.jsx:4,41,51`
- Modify: `app/states/[slug]/page.jsx:85,87,95`
- Test: live HTTP request against `npm start` (these routes are `force-dynamic` or DB-backed, so they produce no prerendered HTML to grep — except `/states/[slug]`, which is SSG)

**Interfaces:**
- Consumes: `topN()` exported from `app/[category]/[state]/page.jsx` (already exported as of commit `fcf1feb`) — used by `app/[category]/page.jsx:16`. Do not change its signature.
- Produces: nothing importable.

- [ ] **Step 1: Capture the failing baseline for the SSG state hub**

`/states/[slug]` is prerendered, so it can be asserted from disk:

```bash
grep -ho '<title>[^<]*</title>' .next/server/app/states/alabama.html
```

Expected right now:

```
<title>Manufacturers in Alabama | FirmsLedger | FirmsLedger</title>
```

- [ ] **Step 2: Edit `app/[category]/page.jsx`**

Two title sites (lines 14 and 22). After both, `SITE_NAME` has no remaining use in this file, so drop it from the line-3 import. `openGraph.title` on line 25 already passes the bare `title` — leave that line exactly as is.

```jsx
import { BASE_URL } from '@/lib/seo';
```

```jsx
export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: 'Category' };
  const stats = await fetchCategoryStats(slug);
  const title = `Top ${topN(stats.totalCount)} ${cat.name} in the US`;
  const description = stats.totalCount > 0
    ? `Browse ${stats.totalCount} ${cat.noun} across all 50 US states. Compare capabilities, location, and company size. No paid placements.`
    : `Browse ${cat.noun} across all 50 US states on FirmsLedger. Compare capabilities, location, and company size. No paid placements.`;
  const canonical = `${_BASE}/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}
```

- [ ] **Step 3: Edit `app/[category]/[state]/page.jsx`**

Three title sites (lines 118, 135, 156). `SITE_NAME` has no other use in this file — drop it from the line-4 import.

```jsx
import { BASE_URL } from '@/lib/seo';
```

Line 118 — the not-found early return:

```jsx
  if (!VALID_CATEGORIES.has(category)) return { title: 'Not Found' };
```

Line 135 — the subcategory-hub return. Only the `title:` line changes; every other key stays as written:

```jsx
    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: false, follow: true },
      openGraph: { title, description, type: 'website', url: canonical },
    };
```

Line 156 — the state-listing return:

```jsx
  return {
    title,
    description,
    alternates: { canonical },
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: { title, description, type: 'website', url: canonical },
  };
```

- [ ] **Step 4: Edit `app/[category]/[state]/[subcategory]/page.jsx`**

Two title sites (lines 41 and 51). `SITE_NAME` has no other use — drop it from the line-4 import.

```jsx
import { BASE_URL } from '@/lib/seo';
```

```jsx
  const cat = CATEGORY_MAP[category];
  if (!cat) return { title: 'Not Found' };
```

```jsx
  return {
    title,
    description,
    alternates: { canonical },
    // Ignores the subcategory param when querying companies (no per-
    // subcategory tagging in the DB yet), so this renders the same list as
    // the plain /{category}/{state} page — noindex to avoid duplicate content.
    robots: { index: false, follow: true },
    openGraph: { title, description, type: 'website', url: canonical },
  };
```

- [ ] **Step 5: Edit `app/states/[slug]/page.jsx`**

This file is the one place where the same `title` const feeds both the metadata title *and* `openGraph.title`. Removing the suffix from the const would silently change the OG output, which Global Constraints forbid — so give OG its own suffixed string. `SITE_NAME` stays imported (line 111 uses it in the JSON-LD `provider`).

```jsx
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) return { title: 'State' };

  const title       = `Manufacturers in ${state.name}`;
  const description = `Find manufacturers in ${state.name}. Browse electrical components, mechanical components, automotive, electronics, and more.`;
  const canonical   = `${_BASE}/states/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image' },
  };
}
```

- [ ] **Step 6: Rebuild and assert the SSG state hub**

```bash
npm run build
grep -ho '<title>[^<]*</title>' .next/server/app/states/alabama.html
```

Expected:

```
<title>Manufacturers in Alabama | FirmsLedger</title>
```

- [ ] **Step 7: Assert the dynamic routes over HTTP**

These need a running server and a reachable database (`.env.local` must be populated).

```bash
npm start &
sleep 8
for path in / /electrical-components /electrical-components/texas /company/$(echo SLUG); do
  printf '%-45s ' "$path"
  curl -s "http://localhost:3000$path" | grep -o '<title>[^<]*</title>' | head -1
done
```

Replace the `/company/$(echo SLUG)` entry with any real approved company slug from the DB. Expected: every line shows exactly one ` | FirmsLedger`, e.g.

```
/                                             <title>Top Manufacturers by State — US Manufacturer Directory | FirmsLedger</title>
/electrical-components                        <title>Top 25 Electrical Components in the US | FirmsLedger</title>
/electrical-components/texas                  <title>Top 25 Electrical Components in Texas | FirmsLedger</title>
```

Stop the server when done:

```bash
kill %1
```

- [ ] **Step 8: Lint**

```bash
npm run lint
```

Expected: no unused-variable errors for `SITE_NAME` in the three files whose import was trimmed.

- [ ] **Step 9: Commit**

```bash
git add 'app/[category]/page.jsx' 'app/[category]/[state]/page.jsx' \
        'app/[category]/[state]/[subcategory]/page.jsx' 'app/states/[slug]/page.jsx'
git commit -m "fix(seo): stop double-appending the brand suffix on dynamic routes

Same duplication as the static pages, in the four generateMetadata routes:
category hubs, category+state listings, subcategory listings, and state hubs.

/states/[slug] fed one suffixed const to both title and openGraph.title, so
OG gets its own explicitly-suffixed string to keep social previews unchanged.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Add a regression guard so the suffix cannot come back

**Files:**
- Create: `scripts/check-title-suffix.mjs`
- Modify: `package.json` (add the `check:titles` script)
- Test: the script is the test — it exits non-zero on a doubled suffix

**Interfaces:**
- Consumes: the prerendered HTML under `.next/server/app/`, so it must run *after* `npm run build`.
- Produces: `npm run check:titles`, exit code 0 (clean) or 1 (duplicate found).

- [ ] **Step 1: Write the failing check**

Create `scripts/check-title-suffix.mjs`:

```js
// Guards against the '| FirmsLedger | FirmsLedger' regression: the root layout
// in app/layout.jsx applies title.template to every child segment, so no page
// may append the brand suffix by hand. Run after `npm run build`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '.next/server/app';
const SUFFIX = ' | FirmsLedger';
const failures = [];

const files = readdirSync(ROOT, { recursive: true })
  .filter((f) => String(f).endsWith('.html'))
  .map((f) => join(ROOT, String(f)));

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const match = html.match(/<title>([^<]*)<\/title>/);
  if (!match) continue;
  const title = match[1];
  const count = title.split(SUFFIX).length - 1;
  if (count > 1) failures.push(`${file}: ${title}`);
}

if (failures.length) {
  console.error(`Duplicate brand suffix in ${failures.length} title(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('Titles OK — no duplicate brand suffix.');
```

- [ ] **Step 2: Run it against a deliberately broken build to verify it fails**

Temporarily re-break one page, build, and confirm the guard catches it:

```bash
sed -i "s/  title: 'Browse All Industries',/  title: \`Browse All Industries | \${SITE_NAME}\`,/" app/browse/page.jsx
npm run build
node scripts/check-title-suffix.mjs
```

Expected: exit code 1 and

```
Duplicate brand suffix in 1 title(s):
  .next/server/app/browse.html: Browse All Industries | FirmsLedger | FirmsLedger
```

- [ ] **Step 3: Restore the page and verify the guard passes**

```bash
git checkout app/browse/page.jsx
npm run build
node scripts/check-title-suffix.mjs
```

Expected: exit code 0 and

```
Titles OK — no duplicate brand suffix.
```

- [ ] **Step 4: Wire it into package.json**

Add one entry to the `scripts` block (note the file uses 4-space indentation), leaving the existing entries alone:

```json
        "lint": "eslint . --quiet",
        "lint:fix": "eslint . --fix",
        "check:titles": "node scripts/check-title-suffix.mjs",
        "typecheck": "tsc -p ./jsconfig.json",
```

Requires Node ≥ 18.17 for `readdirSync(..., { recursive: true })`. The repo runs Node v22.22.2 — verified.

- [ ] **Step 5: Verify the npm script**

```bash
npm run check:titles
```

Expected: `Titles OK — no duplicate brand suffix.`

- [ ] **Step 6: Commit**

```bash
git add scripts/check-title-suffix.mjs package.json
git commit -m "test(seo): guard against the duplicate brand suffix returning

Post-build check over the prerendered HTML. Fails if any <title> contains
' | FirmsLedger' more than once. Covers the static and SSG routes; the
force-dynamic listing routes are not prerendered and remain manual-check.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Post-merge follow-up (not part of this plan's tasks)

Google will keep serving the old doubled titles until it recrawls. After deploy, submit `https://www.firmsledger.com/sitemap.xml` in Search Console and spot-check a handful of URLs with the URL Inspection tool. No action needed beyond that — titles are re-read on every crawl.

## Coverage check

Every file from the diagnosis is accounted for:

| File | Task |
|---|---|
| `app/browse/page.jsx` | 1 |
| `app/search/layout.jsx` | 1 |
| `app/contact/page.jsx` | 1 |
| `app/list-your-company/page.jsx` | 1 |
| `app/claim-listing/layout.jsx` | 1 |
| `app/terms/page.jsx` | 1 |
| `app/privacy/page.jsx` | 1 |
| `app/WriteReview/page.jsx` | 1 |
| `app/RequestProposal/page.jsx` | 1 |
| `app/join/layout.jsx` | 1 |
| `app/admin/layout.jsx` | 1 |
| `app/[category]/page.jsx` | 2 |
| `app/[category]/[state]/page.jsx` | 2 |
| `app/[category]/[state]/[subcategory]/page.jsx` | 2 |
| `app/states/[slug]/page.jsx` | 2 |
| `app/page.jsx` | none — verified already correct |
| `app/auth/layout.jsx` | none — no manual suffix |
| `app/company/[slug]/page.jsx` | none — no manual suffix |
| `app/layout.jsx` | none — owns the template |
