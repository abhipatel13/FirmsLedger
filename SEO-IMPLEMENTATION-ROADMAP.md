# FirmsLedger SEO Implementation Roadmap

Source: `FirmsLedger-SEO-Audit-2026-08-06.pdf` (10-section audit, 26 findings: F1–F6 already coded-but-uncommitted, #1–#20 ranked issues). This document turns those findings into an executable plan. No new investigation — audit findings only.

Goal: maximize organic traffic for minimum engineering effort, using the audit's own severity ranking as the spine.

---

## How to read each entry

Each issue has: **Why it hurts rankings** → **Googlebot effect** → **Ranking impact** → **Crawl-budget impact** → **Priority** → **Difficulty** → **Files** → **Functions/components** → **Proposed change** → **Risks** → **Estimated improvement**.

---

## F1–F6 — Already implemented, sitting in `git diff` (uncommitted)

These aren't new work — they're the six fixes from this session's earlier pass. Treat as **Phase 0**, gated on user review, not re-implementation.

| # | Issue | File | Priority | Status |
|---|---|---|---|---|
| F1 | Canonical/OG defaulted to non-www, which itself 308-redirects — self-contradicting canonical on ~9,000 pages | `src/lib/seo.js:10` | Critical | Coded, uncommitted |
| F2 | Noindexed `/search` still listed in sitemap | `app/sitemap.js` | Medium | Coded, uncommitted |
| F3 | Indexable subcategory+state pages missing from sitemap | `app/sitemap.js` | Critical | Coded, uncommitted |
| F4 | Breadcrumb JSON-LD: two rungs pointed at identical URL | `app/[category]/[state]/[subcategory]/page.jsx` | Low | Coded, uncommitted |
| F5 | Duplicate sitewide `WebSite` schema targeting dead `/Directory` URL | `app/layout.jsx` | Medium | Coded, uncommitted |
| F6 | Homepage `SearchAction` targeted a redirect-only URL | `app/page.jsx` | Low | Coded, uncommitted |

**Why F1 matters most**: a self-contradicting canonical (page says "canonical is X," X 308s elsewhere) forces Google to resolve the conflict itself per-URL, at scale, across the entire indexed set — it's the single highest-leverage fix in this whole audit because it touches all ~9,000 pages simultaneously.

**Action**: `git diff` the 5 files, review, then `git add -A && git commit`. Zero new engineering — this is a review-and-ship task, not a build task. **Do this before anything below**; several later fixes (esp. #1, #3, #5) build on a correct sitemap/canonical baseline.

---

## Phase 1 — Highest ROI (today, impact within weeks)

Fast, mechanical, high-leverage. All are Easy or Medium difficulty, all touch either link topology or a one-line config bug.

### #5 — Category+state pages never link to their own state hub (dead code exists)
- **Why it hurts rankings**: PageRank/link-equity never flows between the category-hub tree and the state-hub tree — they're topologically two disconnected forests. State hubs stay under-linked internally despite being real, useful pages.
- **Googlebot effect**: Googlebot discovers state hubs mainly via sitemap, not contextual crawl — sitemap-only discovery pages get crawled less frequently and are weighted as lower-priority in Google's internal link-graph model.
- **Ranking impact**: Medium-high for state hub pages specifically; state hubs currently under-rank for `"[category] companies in [state]"` head terms that a well-linked hub should compete for.
- **Crawl-budget impact**: Neutral to positive — this is a link addition, not new pages, so no crawl-budget cost, only better distribution of existing budget.
- **Priority**: High
- **Difficulty**: Easy (<30 min) — the code already exists, just hardcoded off.
- **Files**: `app/[category]/[state]/page.jsx:431,702`
- **Functions/components**: the `showStateFilter` gate wrapping the sidebar state-hub link block.
- **Proposed change**: flip `showStateFilter` (or delete the conditional) so the existing sidebar block renders unconditionally. Verify it doesn't break layout on category hubs with no state context.
- **Risks**: sidebar may have been hidden for a UX reason lost to history — spot-check rendered layout before shipping, don't just delete blind.
- **Estimated SEO improvement**: Medium — measurable in state-hub impression/ranking movement in Search Console within 2-4 weeks of re-crawl.

### #9 — `force-dynamic` overrides a real `generateStaticParams` on category hubs
- **Why it hurts rankings**: not a direct ranking factor, but the 10 category hub pages are the most-linked, most-cacheable pages in the site and are needlessly SSR'd on every single request — slower TTFB is a Core Web Vitals input, and CWV is a (soft) ranking factor.
- **Googlebot effect**: Googlebot's rendering budget is finite per crawl; slower TTFB on high-traffic pages increases the cost Google pays to render them, which can throttle re-crawl frequency over time.
- **Ranking impact**: Low-medium direct; primarily a CWV/UX improvement that compounds with other fixes.
- **Crawl-budget impact**: Positive — static generation means these 10 pages stop consuming per-request render budget entirely.
- **Priority**: Medium
- **Difficulty**: Easy (<30 min) — delete one line.
- **Files**: `app/[category]/page.jsx:9`
- **Functions/components**: the `export const dynamic = 'force-dynamic'` declaration.
- **Proposed change**: remove the `force-dynamic` export; confirm `generateStaticParams` covers all 10 categories and the page still gets fresh data on the cadence you need (ISR revalidate if data changes often).
- **Risks**: if category data changes intraday (e.g. company counts), static generation without a revalidate window will show stale counts — pair with `revalidate` if needed.
- **Estimated SEO improvement**: Low-medium, mostly CWV.

### #16 — robots.txt disallows dead pre-migration paths
- **Why it hurts rankings**: no direct ranking harm, but it's a correctness/hygiene signal and a wasted disallow rule.
- **Googlebot effect**: negligible — Googlebot simply never encounters these paths since they 404 anyway. Cleanup, not fix.
- **Ranking impact**: None measurable.
- **Crawl-budget impact**: None.
- **Priority**: Low
- **Difficulty**: Easy (<30 min)
- **Files**: `app/robots.js`
- **Functions/components**: the `disallow` array.
- **Proposed change**: remove `/AdminDashboard`, `/AgencyProfile`, `/InviteAgency`, `/join` entries.
- **Risks**: none.
- **Estimated SEO improvement**: None (hygiene only) — bundle into Phase 1 because it's free.

### #17 — 404 page ships two conflicting robots meta tags
- **Why it hurts rankings**: shipping both `index,follow` (default) and a `noindex` override is invalid HTML-semantics for robots directives; `noindex` wins today but it's fragile — any refactor of the default layout metadata risks flipping the resolved directive.
- **Googlebot effect**: Google currently resolves to the stricter `noindex`, so no live harm, but it's undefined behavior across other crawlers/tools.
- **Ranking impact**: None today; latent risk.
- **Crawl-budget impact**: None.
- **Priority**: Low
- **Difficulty**: Easy (<30 min)
- **Files**: `app/layout.jsx` (default metadata) / not-found page
- **Functions/components**: root metadata export vs. `not-found.jsx`'s own metadata.
- **Proposed change**: set the not-found page's own explicit `robots: { index: false, follow: false }` and don't rely on override-by-precedence.
- **Risks**: none.
- **Estimated SEO improvement**: None (defensive fix).

### #18 — `?page=99` returns 200 with mismatched title
- **Why it hurts rankings**: a low-value edge case (out-of-range pagination), but a 200 response with a title claiming content that isn't there is a soft-content-mismatch signal if ever crawled.
- **Googlebot effect**: unlinked, so low crawl probability, but if crawled it's a wasted, low-quality URL added to the index.
- **Ranking impact**: Negligible — no internal links point here.
- **Crawl-budget impact**: Low positive if fixed (prevents a class of junk URLs from being indexable).
- **Priority**: Low
- **Difficulty**: Easy (<30 min)
- **Files**: `app/[category]/[state]/page.jsx`
- **Functions/components**: the page-param parsing / metadata title builder.
- **Proposed change**: clamp `pageParam` to `[1, totalPages]` before building the title, or `notFound()` when `pageParam > totalPages`.
- **Risks**: pick clamp vs. 404 deliberately — clamp is friendlier UX, 404 is cleaner SEO signal. Recommend clamp (redirect-free) unless you want the strict crawl signal.
- **Estimated SEO improvement**: Negligible, cheap correctness fix.

### #15 — Titles run 63–72 chars, over ~60-char SERP display limit
- **Why it hurts rankings**: not a ranking factor, but truncated titles in SERPs hurt CTR, and CTR is a real-world signal Google's ranking systems do observe over time.
- **Googlebot effect**: none — full title is still indexed and used for relevance matching regardless of display truncation.
- **Ranking impact**: Indirect, via CTR.
- **Crawl-budget impact**: None.
- **Priority**: Low
- **Difficulty**: Easy (<30 min) per template, few templates total.
- **Files**: listing metadata templates (`app/[category]/[state]/page.jsx`, `app/[category]/[state]/[subcategory]/page.jsx`, `app/states/[slug]/page.jsx`)
- **Functions/components**: each `generateMetadata` title string builder.
- **Proposed change**: shorten title template (drop redundant words like "Companies" when category name already implies it, or truncate the trailing qualifier) to consistently land ≤60 chars across sampled category/state combos.
- **Risks**: shorter titles must still carry the target keyword — don't strip category/state name, strip filler words instead.
- **Estimated SEO improvement**: Low-medium CTR lift, compounds across thousands of pages.

### #12 — State hub has no `BreadcrumbList` schema
- **Why it hurts rankings**: not a hard ranking factor, but breadcrumb rich results improve SERP real estate and implicit site-hierarchy signal to Google.
- **Googlebot effect**: without it, Google infers hierarchy purely from URL structure and internal links — works, but is a weaker signal than explicit markup.
- **Ranking impact**: Low direct, some SERP-appearance upside (breadcrumb rich snippet).
- **Crawl-budget impact**: None.
- **Priority**: Medium
- **Difficulty**: Easy (<30 min) — copy the pattern already used elsewhere in the codebase.
- **Files**: `app/states/[slug]/page.jsx`
- **Functions/components**: JSON-LD block (mirror the `BreadcrumbList` builder from `app/[category]/[state]/page.jsx`).
- **Proposed change**: add a 2-level `BreadcrumbList` (Home → State) matching the existing pattern's shape.
- **Risks**: none — additive, no existing schema to conflict with.
- **Estimated SEO improvement**: Low-medium.

### #11 — Company profile breadcrumb JSON-LD only 2 levels deep
- **Why it hurts rankings**: skips category/state context (Home → Company instead of Home → Category → State → Company), understating the page's place in the site hierarchy to Google — a missed internal-linking/context signal on the deepest, most numerous template in the site.
- **Googlebot effect**: weaker hierarchy signal; doesn't block indexing but is a missed opportunity on ~10,000 pages.
- **Ranking impact**: Low-medium, cumulative across the largest page set in the site.
- **Crawl-budget impact**: None.
- **Priority**: Medium
- **Difficulty**: Easy (<30 min)
- **Files**: `app/company/[slug]/page.jsx:113-122`
- **Functions/components**: the `BreadcrumbList` JSON-LD builder.
- **Proposed change**: extend to 4 rungs: Home → Category → State → Company, using the company's own category/state data already fetched for the page.
- **Risks**: company can belong to multiple categories — pick the primary/first category consistently, don't nondeterministically vary between requests (would look like schema instability to Google).
- **Estimated SEO improvement**: Low-medium, high page-count leverage.

### #8 — Duplicate DB queries per page load (metadata vs. body)
- **Why it hurts rankings**: not a direct ranking factor, but doubles TTFB-relevant DB round-trips on the two highest-traffic template types, worsening Core Web Vitals (a ranking input) and general server load.
- **Googlebot effect**: slower response times increase the render-cost Google pays per URL, which can reduce crawl frequency/depth over time at scale (~9,000 pages).
- **Ranking impact**: Low-medium via CWV.
- **Crawl-budget impact**: Positive — halves DB load per request, indirectly supports crawling more pages per unit of server capacity.
- **Priority**: Medium
- **Difficulty**: Medium (1–3 hours) — touches shared data-fetch functions used by both `generateMetadata` and the page body.
- **Files**: `app/[category]/[state]/page.jsx`, `app/company/[slug]/page.jsx`, `src/db/neonApi.js`
- **Functions/components**: whichever `neonApi.js` fetch functions back both `generateMetadata` and the page component for these two routes (e.g. `fetchCompaniesByCategoryAndState`, `fetchCompanyByIdAny`).
- **Proposed change**: wrap the duplicated fetch calls in React's `cache()` (`import { cache } from 'react'`) so Next.js request-memoizes identical calls within a single request — both `generateMetadata` and the page body then hit one DB round-trip instead of two.
- **Risks**: `cache()` dedupes by argument identity within a single request only — verify call sites pass identical primitive args, not fresh object references, or memoization silently won't dedupe.
- **Estimated SEO improvement**: Low-medium, CWV + crawl-headroom.

**Phase 1 checklist**: F1–F6 review/commit → #5 → #9 → #16 → #17 → #18 → #15 → #12 → #11 → #8. All shippable same day; #8 is the only one likely to spill past an hour.

---

## Phase 2 — Architectural Improvements

Bigger diffs, real design decisions, still code-only (no content authoring).

### #1 + #6 — Subcategory+state pages have zero internal link path; facets are 100% JS
- Treated together per the audit's own bucketing — they're the same underlying gap: **there is no crawlable HTML path into the subcategory layer**, whether via facet UI or plain links.
- **Why it hurts rankings**: thousands of indexable, sitemap-only URLs get materially less crawl priority and internal-link-equity than URLs reachable via normal browsing — Google's own guidance and observed behavior both treat sitemap-only discovery as a secondary signal, not equivalent to contextual crawl.
- **Googlebot effect**: pages are indexed via sitemap (now, post-F3) but starved of PageRank since nothing links to them; likely to sit un-ranked or rank far below their content quality would justify.
- **Ranking impact**: High — this is the single largest page count in the site (thousands of URLs) sitting at a structural disadvantage.
- **Crawl-budget impact**: High positive once fixed — real internal links let Google prioritize these pages proportionate to their actual site position instead of treating them as low-priority sitemap filler.
- **Priority**: High
- **Difficulty**: Medium (1–3 hours) for a first version (static links), Hard if done as full crawlable facet URLs.
- **Files**: `app/[category]/[state]/page.jsx`, `src/components/listing/FilterBar.jsx`, `OtherCategoriesCard.jsx`
- **Functions/components**: the category+state listing page's sidebar/related-links area; `FilterBar`'s subcategory selector (currently `onClick` + `window.location.href`).
- **Proposed change** (lazy version, recommended first pass): on each category+state page, render a static, server-rendered list of `<Link>`s to that category's subcategories within the same state (data already available via the category taxonomy) — a simple "Browse by type" block, no JS required to reach it. This alone gives every subcategory+state page a real internal-link path. Leave the `FilterBar` facet UI as client-side UX for filtering within a page (facet URLs as real crawlable pages is a separate, much larger project — don't build it unless subcategory link-through data shows it's still under-crawled after the simple fix).
- **Risks**: if a category has many subcategories, this list must not become a wall of links (link-dilution SEO smell) — cap or paginate if a category exceeds ~15-20 subcategories.
- **Estimated SEO improvement**: High — this is the audit's #1-ranked critical issue by page count affected.

### #3 — Company profiles never link to their own category+state page or state hub
- **Why it hurts rankings**: company pages are leaf nodes with real content but currently only link up/sideways — their link equity never flows back down into the category+state and state-hub layers that most need it (per #1/#5 above), and users/crawlers can't navigate from a company back to "other companies like this."
- **Googlebot effect**: missed contextual-crawl path from ~10,000 company pages back into the mid-tier hub structure.
- **Ranking impact**: Medium-high — compounds directly with #1 and #5; this is one of three legs of the same link-topology fix.
- **Crawl-budget impact**: Positive.
- **Priority**: High
- **Difficulty**: Easy-Medium (30 min–2 hours) — the category/state data is already loaded on this page.
- **Files**: `src/views/AgencyProfile.jsx`
- **Functions/components**: wherever the page renders category/breadcrumb-adjacent UI; add a link block near the existing category link.
- **Proposed change**: add two links using data already fetched for the page — one to the company's category+state page, one to its state hub — placed near existing "back to category" navigation.
- **Risks**: none significant; purely additive.
- **Estimated SEO improvement**: Medium-high, same page-count leverage as #1.

### #4 — Header nav + `/browse` contribute ~0 crawlable links in raw HTML
- **Why it hurts rankings**: the site's primary navigation — the highest-authority link source on every page — is invisible to Googlebot's initial HTML parse; `/browse` itself has zero SSR content.
- **Googlebot effect**: Google does execute JS on a second-wave render pass, but that pass is slower, rate-limited, and less reliable than first-wave HTML parsing — depending entirely on it for primary nav is a real risk, not a theoretical one.
- **Ranking impact**: High — this is sitewide, present on literally every page load.
- **Crawl-budget impact**: High — a working SSR nav would give Google a reliable, repeated path to every category/state hub from every single page.
- **Priority**: High
- **Difficulty**: Medium (1–3 hours)
- **Files**: `src/Layout.jsx`, `src/views/Categories.jsx`
- **Functions/components**: the mega-menu/mobile-menu components currently gated behind client `useState`; `/browse`'s page component (currently a client-only shell).
- **Proposed change**: render the full category/state link list unconditionally in the DOM (visually hidden or `display:none`-until-hover via CSS, not JS-gated mount) so raw HTML contains the links regardless of open/closed UI state; for `/browse`, server-render the initial category/state grid and hydrate interactivity on top rather than shipping an empty shell.
- **Risks**: CSS-only hide/show for a "closed" menu is fine for SEO (content present, just visually hidden) — don't confuse this with cloaking, which requires showing different content to bots vs. users; here it's identical content, different initial visual state.
- **Estimated SEO improvement**: High — sitewide nav fix, likely the second-highest-leverage item in Phase 2 after #1.

### #10 — No `next/image` anywhere despite half-configured infra
- **Why it hurts rankings**: not a direct ranking factor by itself, but unoptimized/unsized images are a top cause of poor CLS and LCP, both CWV ranking inputs.
- **Googlebot effect**: none directly on crawl/index; affects the CWV report Google uses as a ranking signal.
- **Ranking impact**: Low-medium, CWV-mediated.
- **Crawl-budget impact**: None.
- **Priority**: Medium
- **Difficulty**: Medium (1–3 hours) — mechanical but touches multiple files.
- **Files**: `AgencyProfile.jsx`, `Home.jsx` (dead code, skip), `claim-listing/page.jsx`, plus any other `<img>` usage.
- **Functions/components**: replace raw `<img>` tags with `next/image`, `<Image>` component, supplying explicit width/height.
- **Proposed change**: swap `<img>` → `next/image`'s `<Image>` for company logos and hero images; `remotePatterns` is already configured in `next.config.mjs`, so this is a drop-in swap, not new infra.
- **Risks**: `next/image` requires known dimensions or `fill` + a sized parent — verify logo containers have defined aspect ratios before swapping, or CLS could temporarily worsen.
- **Estimated SEO improvement**: Low-medium.

### #13 — Windowed pagination starves deep-ranked companies of link equity
- **Why it hurts rankings**: companies ranked deep in a large category+state listing (e.g. #200 of 500) may need many "Next" clicks to reach from page 1 — both for users and for Google's link-equity flow, since only page 1, current±1, and the last page are linked.
- **Googlebot effect**: deep pages still get crawled via sitemap, but receive less internal PageRank than a shallower click-depth would provide.
- **Ranking impact**: Low-medium — affects listing rank order more than page indexability.
- **Crawl-budget impact**: Low.
- **Priority**: Medium
- **Difficulty**: Medium (1–3 hours) — needs a real design decision, not just a link tweak.
- **Files**: `app/[category]/[state]/page.jsx`
- **Functions/components**: the pagination window builder.
- **Proposed change**: either (a) widen the pagination window slightly and add a "jump to page" control, or (b) — cheaper — ensure every company also appears reachable via a secondary path (e.g. an A-Z or alphabetical index) so depth isn't purely rank-order-dependent. Recommend (a) first since it directly addresses the audit's stated mechanism.
- **Risks**: over-widening the window re-creates the "wall of pagination links" smell — keep it proportionate (e.g. first 3, current±2, last 3, not every page).
- **Estimated SEO improvement**: Low-medium.

### #19 — Thin (<5 company) category+state pages stay indexable if linked, despite sitemap omission
- **Why it hurts rankings**: sitemap omission alone doesn't stop indexing if the page is reachable via a link (and #5's state-hub link fix above makes more of these reachable) — thin pages diluting the site's average content-quality signal is a real, if soft, ranking risk (Panda-style quality signals).
- **Googlebot effect**: Google may index and lightly rank these, but they contribute to a site-wide thin-content pattern that can suppress the whole domain's quality assessment if the ratio is bad enough.
- **Ranking impact**: Medium — protective/defensive rather than upside; matters more as other fixes make these pages more linked/discoverable.
- **Crawl-budget impact**: Slight positive if explicitly noindexed (frees budget for pages that can actually rank).
- **Priority**: Medium — sequence this **after** #1/#5 since those fixes increase how many of these thin pages become newly reachable.
- **Difficulty**: Easy (<30 min) once the threshold decision is made.
- **Files**: `app/sitemap.js`, `app/[category]/[state]/page.jsx`
- **Functions/components**: the same company-count threshold already used for sitemap inclusion; apply it to `generateMetadata`'s `robots` field too.
- **Proposed change**: when company count < 5 (matching the existing sitemap threshold), set `robots: { index: false, follow: true }` in `generateMetadata` for that page — noindex but still pass link equity through.
- **Risks**: don't noindex pages that will cross the 5-company threshold soon (e.g. a growing category) without revisiting — this should be dynamic (computed per-request from live count), not a static list.
- **Estimated SEO improvement**: Medium, defensive.

**Phase 2 checklist**: #1+#6 → #3 → #4 → #10 → #13 → #19. Sequence #1/#6 and #3/#4 first — they're the core link-topology fixes everything else assumes.

---

## Phase 3 — Content Improvements

Not pure code tasks — content/data work, but with a code-enablement component.

### #2 — ~500 category+state pages carry no unique content beyond one templated sentence
- **Why it hurts rankings**: this is the audit's other Critical finding — 500 pages sharing one substituted-variable sentence reads as a doorway-page pattern to a quality classifier, even though the underlying listing data is real and differentiated.
- **Googlebot effect**: Google's helpful-content / quality systems evaluate templated near-duplicate pages as a class; a bad ratio (10 pages with real prose : ~9,000 without) can suppress ranking for the whole class even where individual pages have real data value.
- **Ranking impact**: Critical/High — likely the single largest lever in this entire audit for long-tail category+state queries specifically.
- **Crawl-budget impact**: Neutral (doesn't change page count, changes page quality).
- **Priority**: Critical
- **Difficulty**: Hard (half day+) — this is a content-authoring project, not a bug fix. The code change (unlocking the `!stateName` gate) is Easy; the actual content is the real work.
- **Files**: `app/[category]/[state]/page.jsx` (the `cat.longDescription` gate) plus wherever category description content lives (likely a categories table/data file).
- **Functions/components**: the conditional currently restricting `longDescription` rendering to `!stateName`.
- **Proposed change**: two-part — (1) code: remove the `!stateName` gate so state-level pages can render a description field; (2) content: author real per-category+state description content (even a templated-but-data-driven paragraph pulling in real local stats — company count, top subcategories represented, notable certifications present in that state — beats static boilerplate and can be semi-automated rather than hand-written for 500 pages). Recommend starting with a data-driven template (real numbers pulled live per state) rather than committing to 500 hand-written paragraphs — much lower effort, still genuinely unique per page since the underlying numbers differ.
- **Risks**: a "smarter template" can still read as templated if the sentence structure doesn't vary — vary structure/phrasing, not just substituted values, or this doesn't actually fix the underlying quality signal.
- **Estimated SEO improvement**: High — audit's own top-ranked content issue.

### #7 — Homepage SSR link surface: only 4/10 categories, 1/50 states in raw HTML
- **Why it hurts rankings**: the homepage is the site's highest-authority page; under-linking from it wastes the site's strongest PageRank source.
- **Googlebot effect**: same mechanism as #4 — first-wave HTML parse sees a fraction of the real link surface.
- **Ranking impact**: Medium-high, but bucketed as long-term because a good fix means a real homepage UX redesign, not a mechanical link-unhiding (that's #4's job for nav; this is specifically homepage body content).
- **Crawl-budget impact**: Positive.
- **Priority**: High (impact) but sequenced Long-term (effort/design risk)
- **Difficulty**: Hard (half day+) — UX design work, not just markup.
- **Files**: `src/views/DirectoryHub.jsx`
- **Functions/components**: the category grid and state-picker sections.
- **Proposed change**: redesign the category/state selection UI so all 10 categories and a meaningful state set (not just California) are real `<Link>`s in the initial render, without turning the homepage into a link farm visually — e.g. a full category grid (already close to this per the recent premium redesign) plus a "Popular states" strip with 8-10 real state links instead of 1.
- **Risks**: this collides with the in-progress DirectoryHub premium redesign (per project memory) — coordinate so the redesign's next phase incorporates this requirement rather than conflicting with it.
- **Estimated SEO improvement**: Medium-high, but don't rush ahead of the redesign work already in flight.

### #14 — 93 inline `style={{}}` occurrences per render on the highest-volume template
- **Why it hurts rankings**: not an SEO issue directly — flagged in the audit as a code-quality/HTML-bloat item, included here only because it's on the audit's list.
- **Googlebot effect**: negligible — modest HTML size increase, not a crawl or render blocker.
- **Ranking impact**: None measurable.
- **Crawl-budget impact**: None.
- **Priority**: Low
- **Difficulty**: Medium (1–3 hours), mechanical Tailwind-class conversion.
- **Files**: `app/[category]/[state]/page.jsx`
- **Functions/components**: every inline `style={{...}}` in the file.
- **Proposed change**: convert to Tailwind classes to match the rest of the file's convention.
- **Risks**: pure refactor risk (visual regression) — no SEO risk.
- **Estimated SEO improvement**: None — do this opportunistically, not on the SEO roadmap's critical path.

---

## Phase 4 — Long-Term Authority Improvements

### #20 — Domain authority/backlink gap vs. Thomasnet, Manta, D&B, IndustryNet
- **Why it hurts rankings**: all four competitors are 20-100+ year old domains with backlink profiles a young site structurally cannot match through on-page work alone — this is the audit's explicit "off-page, no code fix" finding.
- **Googlebot effect**: domain-level authority signals (aggregated from backlink profile) factor into ranking independent of any individual page's on-page quality.
- **Ranking impact**: High, but on a multi-month timescale and via a completely different workstream (outreach/PR/partnerships, not code).
- **Crawl-budget impact**: Indirect positive over time — higher-authority domains get crawled more frequently and deeply.
- **Priority**: High (impact), Low (this-sprint actionability)
- **Difficulty**: N/A — not an engineering task.
- **Files**: n/a
- **Functions/components**: n/a
- **Proposed change**: this is item #6 on the user's own original priority list — backlink building. Not further specified here since it's out of scope for a code roadmap; flag as the standing long-term initiative that Phases 1-3 are designed to make worth investing in (no point building backlinks to thin, unlinked pages — sequence this after Phases 1-2 land).
- **Risks**: none code-related.
- **Estimated SEO improvement**: High, long-horizon, off-page.

---

## GitHub Issues

One issue per task (excludes F1–F6, which are a single review-and-commit action, and #20, which isn't an engineering task).

<details>
<summary>Issue template pattern used below</summary>

```
Title: [SEO][P#] <short description>
Problem / Evidence / Affected files / Implementation steps / Acceptance criteria / Priority / Estimated effort
```
</details>

**Issue: [SEO][P1] Re-enable category+state → state hub cross-link**
- Problem: Category+state pages never link to their own state hub; the fix already exists as dead code.
- Evidence: `showStateFilter` gate at `app/[category]/[state]/page.jsx:431,702` hardcoded off.
- Affected files: `app/[category]/[state]/page.jsx`
- Steps: Remove/flip the `showStateFilter` gate; verify sidebar renders correctly across category-only and category+state views.
- Acceptance criteria: every category+state page renders a working link to its state hub; no layout regression on category-only pages.
- Priority: High | Effort: Easy (<30 min)

**Issue: [SEO][P1] Remove `force-dynamic` from category hub pages**
- Problem: `force-dynamic` overrides a working `generateStaticParams`, forcing SSR on every request for the 10 most-linked pages.
- Evidence: `app/[category]/page.jsx:9`
- Affected files: `app/[category]/page.jsx`
- Steps: Delete the `force-dynamic` export; add `revalidate` if data freshness requires it; confirm build emits 10 static pages.
- Acceptance criteria: `next build` output shows these routes as static/ISR, not dynamic.
- Priority: Medium | Effort: Easy (<30 min)

**Issue: [SEO][P1] robots.txt cleanup — remove dead pre-migration disallow rules**
- Problem: robots.txt disallows routes that no longer exist post-Next migration.
- Evidence: `/AdminDashboard`, `/AgencyProfile`, `/InviteAgency`, `/join` entries in `app/robots.js`.
- Affected files: `app/robots.js`
- Steps: Remove the four stale entries.
- Acceptance criteria: robots.txt only lists routes that currently exist and need disallowing.
- Priority: Low | Effort: Easy (<30 min)

**Issue: [SEO][P1] Fix conflicting robots meta on 404 page**
- Problem: 404 page ships both default `index,follow` and an overriding `noindex` meta tag.
- Evidence: root metadata in `app/layout.jsx` vs. not-found page metadata.
- Affected files: `app/layout.jsx`, not-found page
- Steps: Give the not-found page its own explicit `robots: { index: false, follow: false }` instead of relying on override precedence.
- Acceptance criteria: only one robots meta tag present in rendered 404 HTML.
- Priority: Low | Effort: Easy (<30 min)

**Issue: [SEO][P1] Clamp out-of-range pagination params**
- Problem: `?page=99` returns HTTP 200 with a title claiming "Page 99" while rendering page-1 content.
- Evidence: `app/[category]/[state]/page.jsx`
- Affected files: `app/[category]/[state]/page.jsx`
- Steps: Clamp `pageParam` to `[1, totalPages]` before title/content generation.
- Acceptance criteria: requesting an out-of-range page number no longer produces a title/content mismatch.
- Priority: Low | Effort: Easy (<30 min)

**Issue: [SEO][P1] Trim SERP titles to ≤60 characters**
- Problem: several titles run 63-72 characters, past Google's practical SERP display limit, hurting CTR via truncation.
- Evidence: sampled category/state/subcategory metadata templates.
- Affected files: `app/[category]/[state]/page.jsx`, `app/[category]/[state]/[subcategory]/page.jsx`, `app/states/[slug]/page.jsx`
- Steps: Shorten title template filler words while preserving category/state keywords; verify against a sample of combos.
- Acceptance criteria: sampled titles across templates land at ≤60 chars without dropping target keywords.
- Priority: Low | Effort: Easy (<30 min)

**Issue: [SEO][P1] Add BreadcrumbList schema to state hub pages**
- Problem: state hub pages have no breadcrumb structured data, unlike every other listing template.
- Evidence: `app/states/[slug]/page.jsx`
- Affected files: `app/states/[slug]/page.jsx`
- Steps: Add a 2-level `BreadcrumbList` (Home → State) mirroring the existing pattern from category+state pages.
- Acceptance criteria: state hub pages validate in Google's Rich Results Test with correct breadcrumb markup.
- Priority: Medium | Effort: Easy (<30 min)

**Issue: [SEO][P1] Extend company profile breadcrumb to 4 levels**
- Problem: company profile breadcrumb JSON-LD is only 2 levels deep (Home → Company), skipping category/state.
- Evidence: `app/company/[slug]/page.jsx:113-122`
- Affected files: `app/company/[slug]/page.jsx`
- Steps: Extend to Home → Category → State → Company using already-fetched company data; pick a deterministic primary category for multi-category companies.
- Acceptance criteria: breadcrumb schema is 4 levels deep and consistent across repeated requests for the same company.
- Priority: Medium | Effort: Easy (<30 min)

**Issue: [SEO][P1] Deduplicate metadata/body DB queries via React cache()**
- Problem: `generateMetadata` and the page body independently re-fetch identical data, doubling DB round-trips on the two highest-traffic templates.
- Evidence: no request-level memoization in `src/db/neonApi.js`.
- Affected files: `app/[category]/[state]/page.jsx`, `app/company/[slug]/page.jsx`, `src/db/neonApi.js`
- Steps: Wrap shared fetch functions in React's `cache()`; verify call sites pass identical primitive args so memoization actually dedupes.
- Acceptance criteria: request-level logging/profiling shows one DB round-trip per unique query per request, not two.
- Priority: Medium | Effort: Medium (1-3 hrs)

**Issue: [SEO][P2] Add crawlable subcategory+state discovery links**
- Problem: thousands of subcategory+state pages have zero internal link path; only reachable via sitemap.
- Evidence: verified by grepping every link-construction site across the codebase; audit issues #1 and #6.
- Affected files: `app/[category]/[state]/page.jsx`, `src/components/listing/FilterBar.jsx`, `OtherCategoriesCard.jsx`
- Steps: Add a server-rendered "Browse by type" link block on category+state pages listing that category's subcategories within the state; cap/paginate if a category has many subcategories.
- Acceptance criteria: every subcategory+state page is reachable via a real `<Link>` from its parent category+state page, verified in raw HTML (view-source, not just rendered DOM).
- Priority: High | Effort: Medium (1-3 hrs)

**Issue: [SEO][P2] Link company profiles to their own category+state page and state hub**
- Problem: company pages link up/sideways only, never down into the category+state/state-hub layer.
- Evidence: audit issue #3.
- Affected files: `src/views/AgencyProfile.jsx`
- Steps: Add two links using already-fetched company data, placed near existing category navigation.
- Acceptance criteria: every company profile links to its category+state page and state hub.
- Priority: High | Effort: Easy-Medium (30 min-2 hrs)

**Issue: [SEO][P2] SSR the header mega-menu and /browse initial content**
- Problem: primary nav and `/browse` contribute ~0 crawlable links/content in raw HTML — gated behind client state or client-only rendering.
- Evidence: audit issue #4.
- Affected files: `src/Layout.jsx`, `src/views/Categories.jsx`
- Steps: Render the full link list unconditionally in DOM (CSS-hidden-until-interaction, not JS-mount-gated); server-render `/browse`'s initial category/state grid.
- Acceptance criteria: view-source on any page shows the full nav link set; view-source on `/browse` shows real category/state links, not a loading shell.
- Priority: High | Effort: Medium (1-3 hrs)

**Issue: [SEO][P2] Migrate to next/image for company logos and hero images**
- Problem: `next/image` is unused despite `remotePatterns` already configured; several images lack explicit dimensions, risking CLS.
- Evidence: audit issue #10.
- Affected files: `src/views/AgencyProfile.jsx`, `app/claim-listing/page.jsx`
- Steps: Replace `<img>` with `next/image`'s `<Image>`, supplying explicit width/height or a sized `fill` container.
- Acceptance criteria: no raw `<img>` tags remain on sampled templates; Lighthouse CLS score improves on AgencyProfile.
- Priority: Medium | Effort: Medium (1-3 hrs)

**Issue: [SEO][P2] Widen/rework category+state pagination window**
- Problem: windowed pagination (page 1, current±1, last) starves deep-ranked companies of link equity.
- Evidence: audit issue #13.
- Affected files: `app/[category]/[state]/page.jsx`
- Steps: Widen the window proportionately (e.g. first 3, current±2, last 3) and/or add a jump-to-page control.
- Acceptance criteria: deep listing entries are reachable in fewer clicks without creating a link-dilution wall.
- Priority: Medium | Effort: Medium (1-3 hrs)

**Issue: [SEO][P2] Explicit noindex for thin (<5 company) category+state pages**
- Problem: thin pages remain indexable if linked, despite sitemap omission, once #1/#5 make more of them reachable.
- Evidence: audit issue #19.
- Affected files: `app/sitemap.js`, `app/[category]/[state]/page.jsx`
- Steps: Apply the existing 5-company sitemap threshold to `generateMetadata`'s `robots` field (`noindex, follow`) computed live per request.
- Acceptance criteria: pages below threshold render `noindex` meta; pages that cross the threshold dynamically stop being noindexed without a manual list update.
- Priority: Medium | Effort: Easy (<30 min) — sequence after P2 link fixes land.

**Issue: [SEO][P3] Add unique per-category+state description content**
- Problem: ~500 category+state pages share one templated sentence; real prose is gated to nationwide-only pages.
- Evidence: audit issue #2, the audit's top content finding.
- Affected files: `app/[category]/[state]/page.jsx`, category description data source.
- Steps: Remove the `!stateName` gate; author a data-driven description template pulling real per-state numbers (company count, top subcategories, certifications present) with varied sentence structure, not just substituted values.
- Acceptance criteria: category+state pages render genuinely differentiated prose (not just numeral substitution) verified across a sample.
- Priority: Critical | Effort: Hard (half day+, content-heavy)

**Issue: [SEO][P3] Redesign homepage link surface (category grid + state picker)**
- Problem: homepage's real SSR link surface is only 4/10 categories and 1/50 states.
- Evidence: audit issue #7.
- Affected files: `src/views/DirectoryHub.jsx`
- Steps: Coordinate with in-progress DirectoryHub premium redesign; ensure next redesign phase includes full category grid + a real multi-state "Popular states" link strip in raw HTML.
- Acceptance criteria: homepage view-source shows all 10 categories and 8+ states as real links.
- Priority: High (impact) | Effort: Hard (half day+, design work) — do not start until redesign coordination confirmed.

**Issue: [SEO][P3] Convert inline styles to Tailwind classes on category+state template**
- Problem: 93 inline `style={{}}` occurrences per render, inconsistent with the file's own Tailwind usage elsewhere.
- Evidence: audit issue #14.
- Affected files: `app/[category]/[state]/page.jsx`
- Steps: Convert inline styles to Tailwind utility classes matching existing file conventions.
- Acceptance criteria: no `style={{}}` remaining in the file; visual regression check passes.
- Priority: Low | Effort: Medium (1-3 hrs) — opportunistic, not SEO-critical-path.

---

## Dependency Graph

```
Phase 0 (F1-F6 review & commit)
   │
   ├──> #5 (state-hub link)  ──┐
   ├──> #9 (force-dynamic)      │
   ├──> #16 (robots.txt)        │
   ├──> #17 (404 robots meta)   │  Phase 1 — all independent of
   ├──> #18 (page clamp)        │  each other, only depend on
   ├──> #15 (title length)      │  Phase 0 baseline
   ├──> #12 (state breadcrumb)  │
   ├──> #11 (company breadcrumb)│
   └──> #8  (React cache())    ─┘
              │
              ▼
   #1+#6 (subcategory links) ──┐
   #3 (company→hub links)      │  Phase 2 — #1/#6 and #3/#4 are
   #4 (SSR nav/browse)         │  the core link-topology fixes;
              │                │  #19 depends on #5 (more thin
              ▼                │  pages become reachable)
   #19 (noindex thin pages) <──┘
   #10 (next/image) — independent, can run parallel to above
   #13 (pagination window) — independent, can run parallel
              │
              ▼
   #2 (unique content) — benefits from #1/#5/#19 (link topology
              │            + noindex baseline settled first)
   #7 (homepage redesign) — gated on in-progress DirectoryHub work
   #14 (inline styles) — fully independent, anytime
              │
              ▼
   #20 (backlinks) — sequence last; don't build authority
                     into thin/unlinked pages
```

## Execution Order

1. **Phase 0**: `git diff` review → commit F1-F6. *(blocks nothing below but should ship first — it's the highest-leverage single fix and a prerequisite baseline for sitemap/canonical-dependent work.)*
2. **Phase 1** (same day): #5, #9, #16, #17, #18, #15, #12, #11, #8 — any order, all independent.
3. **Phase 2** (this week): #1+#6, #3, #4 first (core topology) → #19 → #10, #13 in parallel.
4. **Phase 3** (this sprint/next): #2 (start immediately, longest lead time) → #7 (after redesign coordination) → #14 (anytime, filler work).
5. **Phase 4** (ongoing): #20, kicked off once Phase 2 link topology is live — don't build backlinks into a site that still has orphaned pages.

## Checklist

- [x] Review and commit F1–F6
- [ ] #5 state-hub cross-link
- [ ] #9 remove force-dynamic
- [ ] #16 robots.txt cleanup
- [ ] #17 404 robots meta fix
- [ ] #18 pagination param clamp
- [ ] #15 title length trim
- [ ] #12 state hub BreadcrumbList
- [ ] #11 company breadcrumb depth
- [ ] #8 React cache() dedup
- [ ] #1+#6 subcategory discovery links
- [ ] #3 company→hub links
- [ ] #4 SSR header/browse
- [ ] #19 noindex thin pages
- [ ] #10 next/image migration
- [ ] #13 pagination window widen
- [ ] #2 unique category+state content
- [ ] #7 homepage link surface redesign
- [ ] #14 inline style cleanup
- [ ] #20 backlink building (ongoing, off-page)

## Sprint Plan

**Sprint 0 (today, <1 day)**: Phase 0 + all of Phase 1. Nine easy/medium fixes, one review-and-commit. Ship as a single PR or a few small ones — low individual risk.

**Sprint 1 (this week)**: Phase 2 core — #1+#6, #3, #4. This is the load-bearing link-topology sprint; everything downstream (content quality signal, #19, eventually backlinks) assumes this is live.

**Sprint 2 (following week)**: Phase 2 cleanup — #19, #10, #13 — plus start #2's content-template design (data-driven description generator, not hand-written copy).

**Sprint 3+ (ongoing)**: #2 content rollout across all 500 category+state pages; #7 folded into the next DirectoryHub redesign phase; #14 picked up opportunistically by whoever touches that file next.

**Continuous**: #20 backlink outreach begins once Sprint 1 ships — no code dependency, but sequenced to not waste outreach effort linking into pages that were, until Sprint 1, orphaned.
