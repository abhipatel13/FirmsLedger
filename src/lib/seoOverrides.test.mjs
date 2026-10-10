// Run: node src/lib/seoOverrides.test.mjs
import assert from 'node:assert/strict';
import { SEO_OVERRIDES, TARGET_PAGES, joinList, stripLinks, fillPlaceholders, fillAll, resolveOverride, listingVars, stateHubVars } from './seoOverrides.js';

assert.equal(joinList([]), '');
assert.equal(joinList(['a']), 'a');
assert.equal(joinList(['a', 'b', 'c']), 'a, b and c');
assert.equal(stripLinks('See [the list](/x/y) now'), 'See the list now');

assert.equal(fillPlaceholders('{N} in {state}', { N: 5, state: 'Texas' }), '5 in Texas');
assert.equal(fillPlaceholders('{N} in {state}', { N: 5, state: '' }), null);
assert.equal(fillPlaceholders('{N} items', { N: 0 }), '0 items');
assert.equal(fillAll(['A {x}.', 'B {y}.'], { x: 1 }), 'A 1.');
assert.equal(fillAll(['A {x}.'], {}), null);

const r = resolveOverride({ title: 'T {N}', h1: 'H', meta_description: 'M {gone}', intro_md: ['P1 {N}', ['S1 {gone}.', 'S2.'], '{gone}'], faqs: [{ q: 'Q', a: 'A {N}' }, { q: 'Q2', a: '{gone}' }] }, { N: 3 });
assert.deepEqual(r, { title: 'T 3', h1: 'H', description: null, intro: ['P1 3', 'S2.'], faqs: [{ q: 'Q', a: 'A 3' }] });
assert.equal(resolveOverride(null, {}), null);

const facts = { count: 3, cities: [{ name: 'Houston', count: 2 }, { name: 'Austin', count: 1 }], specialties: [{ name: 'Injection Molding', count: 2 }], certifications: [{ name: 'ISO 9001', count: 2 }], withWebsite: 2 };
const companies = [
  { name: 'Acme Medical Molding', hq_city: 'Houston' },
  { name: 'Bolt', description: 'automotive trim', hq_city: 'houston ' },
  { name: 'Cog', certifications: ['ISO 13485'], hq_city: 'Austin' },
];
const cat = { slug: 'plastics-packaging', subcategories: [{ slug: 'injection-molding', name: 'Injection Molding' }, { slug: 'blow-molding', name: 'Blow Molding' }] };
const v = listingVars({ facts, companies, stateName: 'Texas', stateSlug: 'texas', cat, subCounts: { 'injection-molding': 22, 'blow-molding': 2 }, override: { keywords: { medical: /medical|13485/i, none: /zzz/ }, regions: { houston: ['houston'] } } });
assert.equal(v.N, 3);
assert.equal(v.cities, 'Houston (2) and Austin (1)');
assert.equal(v.specialties, 'injection molding');
assert.equal(v.kw_medical, 'Acme Medical Molding and Cog');
assert.equal(v.kw_none, '');
assert.equal(v.region_houston, 2);
assert.equal(v.n_injection_molding, 22);
assert.equal(v.subcategoryLinks, '[injection molding in Texas](/plastics-packaging/injection-molding/texas) (22)');
assert.equal(v.subcategoryNames, 'injection molding');

const h = stateHubVars({ stateName: 'Texas', stateSlug: 'texas', totalCount: 391, topCities: [{ city: 'Houston', count: 52 }], topCategories: [{ slug: 'plastics-packaging', count: 66 }, { slug: 'tiny', count: 2 }], categories: [{ slug: 'plastics-packaging', titleNoun: 'Plastics & Packaging Manufacturers' }, { slug: 'tiny', titleNoun: 'Tiny' }] });
assert.equal(h.categoryLinks, '[plastics & packaging manufacturers in Texas](/plastics-packaging/texas) (66)');
assert.equal(h.topCategories, 'plastics & packaging manufacturers (66)');

assert.equal(TARGET_PAGES.length, 10);
for (const [path, o] of Object.entries(SEO_OVERRIDES)) {
  assert.ok(o.label && o.title && o.h1 && o.meta_description, path);
  assert.equal(o.faqs.length, 3, path);
  assert.ok(o.title.replace('{N}', '999').length <= 50, `${path} title too long`);
  assert.ok(o.meta_description.replace('{N}', '999').length <= 160, `${path} meta too long`);
}
console.log('ok: seo overrides');
