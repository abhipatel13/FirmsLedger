// Run: node src/lib/searchRanking.test.mjs
import assert from 'node:assert/strict';
import { rankSearchResults, relevanceScore, normalizeText } from './searchRanking.js';
import { searchTokens } from './searchIntent.js';

const rank = (rows, q) => rankSearchResults([...rows], q, searchTokens(q)).map((r) => r.name);

// The reported bug: exact-name match buried under bio matches ("...over a
// century... craftsmanship...").
const centuries = [
  { name: 'Moslow Wood Products', description: 'For over a century, trusted craftsmanship', avg_rating: '4.6', review_count: 20 },
  { name: 'Sustar Woodworks', description: 'traditional Shaker craftsmanship', avg_rating: '5.0', review_count: 3 },
  { name: 'Richelieu Foods Inc', description: 'legacy on craftsmanship since 1862', avg_rating: '4.0' },
  { name: 'Centuries Crafts', description: 'handmade Damascus knives', avg_rating: '0' },
];
assert.equal(rank(centuries, 'centuries crafts')[0], 'Centuries Crafts');

// Prefix match beats a mid-name token match.
const prefix = [
  { name: 'Acme Custom Boxes', description: '' },
  { name: 'Boxes By Prime', description: '' },
  { name: 'Prime Custom Boxes', description: '' },
];
assert.equal(rank(prefix, 'prime custom boxes')[0], 'Prime Custom Boxes');

// Name hit outranks a higher-rated company matched only in its description.
const nameVsDesc = [
  { name: 'Big Industrial Co', description: 'we do welding and fabrication', avg_rating: '5.0', review_count: 99, is_verified: true },
  { name: 'Welding Works LLC', description: 'general shop', avg_rating: '2.1' },
];
assert.equal(rank(nameVsDesc, 'welding')[0], 'Welding Works LLC');

// No query (filter-only browse): quality ordering, verified + rating first.
const browse = [
  { name: 'Zeta', avg_rating: '3.0' },
  { name: 'Alpha', avg_rating: '4.8', is_verified: true },
  { name: 'Beta', avg_rating: '4.9' },
];
assert.equal(rank(browse, '')[0], 'Alpha');

// Ties broken by rating, order stable otherwise.
assert.equal(normalizeText('  Fancy-Co, Inc. '), 'fancy co inc');
assert.ok(relevanceScore({ name: 'Centuries Crafts' }, 'centuries crafts', ['centur', 'craft']) > 1000);

console.log('searchRanking.test.mjs OK');
