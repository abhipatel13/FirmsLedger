// Run: node src/lib/listingFacts.test.mjs
import assert from 'node:assert/strict';
import { buildListingFacts, companyCity, companyCertifications } from './listingFacts.js';

const companies = [
  { hq_city: 'HOUSTON', website: 'a.com', capabilities: ['Injection Molding', 'Overmolding'], certifications: ['ISO 9001'], updated_at: '2026-08-05T10:00:00Z' },
  { hq_city: 'houston ', capabilities: ['Injection Molding'], certifications: ['ISO\n9001', 'ISO 13485'], updated_at: '2026-09-01T00:00:00Z' },
  { hq_city: 'fort worth', website: 'c.com', products: ['Overmolding'], updated_at: null },
  { hq_city: null, capabilities: ['Thermoforming'] },
];

const f = buildListingFacts(companies);
assert.equal(f.count, 4);
assert.deepEqual(f.cities, [{ name: 'Houston', count: 2 }, { name: 'Fort Worth', count: 1 }]);
assert.deepEqual(f.specialties.map((s) => [s.name, s.count]), [['Injection Molding', 2], ['Overmolding', 2]]);
assert.deepEqual(f.certifications.map((c) => [c.name, c.count]), [['ISO 9001', 2], ['ISO 13485', 1]]);
assert.equal(f.withWebsite, 2);
assert.equal(f.lastUpdated.toISOString(), '2026-09-01T00:00:00.000Z');
assert.equal(companyCity({ hq_city: '  ' }), null);
assert.deepEqual(companyCertifications({ certifications: ['ISO9001', 'ISO 9001'] }), ['ISO 9001']);
assert.deepEqual(buildListingFacts([]), { count: 0, cities: [], specialties: [], certifications: [], withWebsite: 0, lastUpdated: null });
console.log('ok: listing facts');
