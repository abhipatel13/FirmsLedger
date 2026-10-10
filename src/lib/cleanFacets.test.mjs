// Run: node src/lib/cleanFacets.test.mjs
// Every DROP case below is real text pulled from the companies table.
import assert from 'node:assert/strict';
import { cleanFacets } from './cleanFacets.js';

const DROP = [
  'Link to: Fabrication',                                    // nav link
  '☆ Explore Our Products',                                  // decorated CTA
  'Explore Our Capabilities',                                // CTA
  'Director of Product Quality',                             // job title
  'Excellent prices, perfect parts, and on-time delivery. I would use this supplier again!',
  'We focus on delivering fire protection services that safeguard your business.',
  'Manufacturing Capabilities',                              // section heading
  'Capabilities & Products',                                 // heading pair
  'Terms of Service',                                        // site chrome
  'Thought Partnership and Innovation',                      // marketing
  'Quality metal fabrication since 1934',                    // tagline
  'Location Factory Service Center #82-AL',                  // plant directory row
  'Additional Services',                                     // generic bucket
  'Industries Served',
  '',
  '   ',
];

const KEEP = [
  'Prototype Sheet Metal Fabrication',
  'Powder Coating',
  'Silk Screening',
  'Cable/Wire Harness Assemblies',
  'Printed Circuit Board Assembly',
  'CNC Turret Punch',
];

for (const junk of DROP) {
  assert.deepEqual(cleanFacets([junk]), [], `should drop: ${JSON.stringify(junk)}`);
}
assert.deepEqual(cleanFacets(KEEP), KEEP, 'should keep real capability labels');

// Pipe-delimited tables are split into separate labels.
assert.deepEqual(
  cleanFacets(['|  Powder Coating  |  Silk Screening']),
  ['Powder Coating', 'Silk Screening'],
);

// ALL-CAPS is title-cased, acronyms survive, joiners are not shouted.
assert.deepEqual(
  cleanFacets(['SHEET METAL FABRICATION AND WELDING']),
  ['Sheet Metal Fabrication and Welding'],
);
assert.deepEqual(cleanFacets(['CNC MACHINING']), ['CNC Machining']);

// Case-insensitive dedupe, and the limit is honoured.
assert.deepEqual(cleanFacets(['Powder Coating', 'powder coating']), ['Powder Coating']);
assert.equal(cleanFacets(KEEP, 2).length, 2);

// Bad input must not throw.
for (const bad of [null, undefined, 'not-an-array', 42, {}]) {
  assert.deepEqual(cleanFacets(bad), [], `should tolerate ${JSON.stringify(bad)}`);
}
assert.deepEqual(cleanFacets([null, undefined, 'Powder Coating']), ['Powder Coating']);

console.log('cleanFacets: all checks passed');

assert.deepEqual(
  cleanFacets(['Kernell\u00e2\u0080\u0099s automatic Machining', 'Electrical discharge machining (', 'Wire EDM (Electrical Discharge']),
  ['Kernell\u2019s automatic Machining', 'Electrical discharge machining', 'Wire EDM'],
);
