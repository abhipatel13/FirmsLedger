// Run: node src/lib/generated/subcategoryCombos.test.mjs
//
// Guards the generated subcategory inventory list and the param mapping that
// consumes it in app/[category]/[state]/[subcategory]/page.jsx.
//
// Two failure modes this exists to catch:
//
// 1. A BLANKED LIST. The list decides whether a subcategory x state page
//    renders or redirects to its parent. An empty or truncated file would
//    redirect thousands of live pages. build-static-data.mjs only rewrites it
//    when the DB pull returned rows, but nothing stops a bad commit.
//
// 2. THE SWAPPED SEGMENTS. That route's folder names do not match the URL: the
//    [state] folder carries the SUBCATEGORY slug and [subcategory] carries the
//    STATE slug. generateStaticParams must honour that inversion or it silently
//    prerenders hundreds of wrong URLs that all 404.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MANUFACTURING_CATEGORIES, CATEGORY_SLUGS } from '../manufacturingCategories.js';
import { ALL_US_STATES } from '../usStates.js';

const here = dirname(fileURLToPath(import.meta.url));
const combos = JSON.parse(readFileSync(resolve(here, 'subcategoryCombos.json'), 'utf8'));

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);
const VALID_STATES = new Set(ALL_US_STATES.map((s) => s.slug));
const SUBS_BY_CATEGORY = new Map(
  MANUFACTURING_CATEGORIES.map((c) => [c.slug, new Set(c.subcategories.map((s) => s.slug))])
);

// ── 1. The list is present and plausible ────────────────────────────────────
assert.ok(Array.isArray(combos), 'combos must be an array');
assert.ok(
  combos.length > 500,
  `expected >500 combos, got ${combos.length} — a blanked or truncated file would ` +
  `redirect live subcategory pages to their parent category`
);

// ── 2. Every entry references slugs that actually exist ─────────────────────
for (const c of combos) {
  assert.ok(VALID_CATEGORIES.has(c.category), `unknown category slug: ${c.category}`);
  assert.ok(VALID_STATES.has(c.state), `unknown state slug: ${c.state}`);
  const subs = SUBS_BY_CATEGORY.get(c.category);
  assert.ok(subs?.has(c.sub), `"${c.sub}" is not a subcategory of "${c.category}"`);
  assert.ok(Number.isInteger(c.n) && c.n >= 1, `combo must have n >= 1, got ${c.n}: ${c.category}/${c.sub}/${c.state}`);
}

// ── 3. Keys are unique ──────────────────────────────────────────────────────
const keys = combos.map((c) => `${c.category}|${c.sub}|${c.state}`);
assert.equal(new Set(keys).size, keys.length, 'duplicate (category, sub, state) entries');

// ── 4. THE SWAP. Mirror generateStaticParams, then destructure exactly as the
// page component does, and assert we land back on the same triple.
const params = combos
  .filter((c) => c.n >= 5)
  .map((c) => ({ category: c.category, state: c.sub, subcategory: c.state }));

assert.ok(params.length > 0, 'no combos meet the >=5 prerender threshold');

for (const p of params) {
  // Verbatim from the page component and generateMetadata:
  const { category, state: subcategory, subcategory: state } = p;
  assert.ok(
    SUBS_BY_CATEGORY.get(category)?.has(subcategory),
    `param mapping is swapped: /${category}/${p.state}/${p.subcategory} resolves ` +
    `subcategory="${subcategory}", which is not a subcategory of "${category}"`
  );
  assert.ok(
    VALID_STATES.has(state),
    `param mapping is swapped: resolved state="${state}" is not a US state slug`
  );
}

// ── 4b. MULTI-PARENT SUBCATEGORIES. categories.slug is UNIQUE in the DB, so a
// subcategory row has exactly one parent_id — but the static config lists some
// under two parents, and the route serves both. Keying the generator on
// parent_id (the first implementation) silently redirected the second parent's
// URLs even though they list companies. Assert every static parent is covered.
const multiParent = [...SUBS_BY_CATEGORY.entries()]
  .flatMap(([cat, subs]) => [...subs].map((sub) => [sub, cat]))
  .reduce((m, [sub, cat]) => m.set(sub, [...(m.get(sub) || []), cat]), new Map());

for (const [sub, parents] of multiParent) {
  if (parents.length < 2) continue;
  const covered = new Set(combos.filter((c) => c.sub === sub).map((c) => c.category));
  if (covered.size === 0) continue; // subcategory genuinely has no companies anywhere
  for (const parent of parents) {
    assert.ok(
      covered.has(parent),
      `"${sub}" has inventory but no combos under parent "${parent}" — the ` +
      `generator is keying on the DB parent_id instead of every static parent, ` +
      `so /${parent}/${sub}/* would redirect despite listing companies`
    );
  }
}

// ── 5. The prerendered set is a subset of the guard's set ───────────────────
// If a prerendered page were absent from the full list, the guard would
// redirect a page the build had just baked.
const all = new Set(keys);
for (const p of params) {
  const key = `${p.category}|${p.state}|${p.subcategory}`;
  assert.ok(all.has(key), `prerendered combo missing from guard list: ${key}`);
}

console.log(
  `subcategoryCombos OK — ${combos.length} combos, ` +
  `${params.length} prerendered (n>=5), segment mapping verified`
);
