// Run: node src/lib/searchIntent.test.mjs
import assert from 'node:assert/strict';
import { parseSearchIntent, canonicalPathFor, searchTokens, stem } from './searchIntent.js';

function intent(q) {
  const i = parseSearchIntent(q);
  return [i.categorySlug, i.subcategorySlug, i.stateSlug];
}

// The two queries reported as broken, in every casing.
for (const q of [
  'cnc machines in california',
  'CNC MACHINES IN CALIFORNIA',
  'Cnc Machines In California',
  'california cnc machining',
  'cnc machine california',
]) {
  assert.deepEqual(intent(q), ['mechanical-components', 'cnc-machining', 'california'], q);
}

for (const q of ['Electronics components in Texas', 'electronics components texas', 'TEXAS ELECTRONICS']) {
  const [cat, , state] = intent(q);
  assert.equal(cat, 'electronics-semiconductor', q);
  assert.equal(state, 'texas', q);
}

// "electronics" must not collapse into "electrical" — a shared-prefix matcher would.
assert.equal(intent('electrical components')[0], 'electrical-components');
assert.equal(intent('electronics')[0], 'electronics-semiconductor');

// Multi-word state names, and the longest-match rule.
assert.equal(intent('injection molding in new york')[2], 'new-york');
assert.equal(intent('sheet metal west virginia')[2], 'west-virginia');

// Genuinely ambiguous: "components" is shared, so refuse to guess.
assert.equal(intent('components')[0], null);

// State alone, category alone.
assert.deepEqual(intent('california'), [null, null, 'california']);
assert.deepEqual(intent('medical devices'), ['medical-devices', null, null]);

// Company-name searches must not be hijacked into a category.
assert.deepEqual(intent('Matenaer Corporation'), [null, null, null]);

// Unconsumed words survive as the text query.
assert.equal(parseSearchIntent('matenaer in california').rest, 'matenaer');
assert.equal(parseSearchIntent('cnc machining in california').rest, '');

// URL shape: subcategory before state.
assert.equal(
  canonicalPathFor(parseSearchIntent('cnc machines in california')),
  '/mechanical-components/cnc-machining/california',
);
assert.equal(canonicalPathFor(parseSearchIntent('medical devices')), '/medical-devices');
assert.equal(canonicalPathFor(parseSearchIntent('california')), null);

// Stemming: plural/gerund variants converge, short words are left alone.
assert.equal(stem('machines'), stem('machining'));
assert.equal(stem('cnc'), 'cnc');
assert.notEqual(stem('electronics'), stem('electrical'));

// Stopwords are dropped so they are never required to match a company row.
assert.deepEqual(searchTokens('cnc machines in california'), ['cnc', 'machin', 'california']);
assert.deepEqual(searchTokens('top manufacturers in the usa'), []);

console.log('searchIntent: all assertions passed');
