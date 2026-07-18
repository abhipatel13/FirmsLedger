/**
 * Seed all 50 US states into the states table.
 * Run: node scripts/seed-states.cjs
 */
'use strict';

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const STATES = [
  { name: 'Alabama',        slug: 'alabama',        region: 'South' },
  { name: 'Alaska',         slug: 'alaska',         region: 'West' },
  { name: 'Arizona',        slug: 'arizona',        region: 'West' },
  { name: 'Arkansas',       slug: 'arkansas',       region: 'South' },
  { name: 'California',     slug: 'california',     region: 'West' },
  { name: 'Colorado',       slug: 'colorado',       region: 'West' },
  { name: 'Connecticut',    slug: 'connecticut',    region: 'Northeast' },
  { name: 'Delaware',       slug: 'delaware',       region: 'Northeast' },
  { name: 'Florida',        slug: 'florida',        region: 'South' },
  { name: 'Georgia',        slug: 'georgia',        region: 'South' },
  { name: 'Hawaii',         slug: 'hawaii',         region: 'West' },
  { name: 'Idaho',          slug: 'idaho',          region: 'West' },
  { name: 'Illinois',       slug: 'illinois',       region: 'Midwest' },
  { name: 'Indiana',        slug: 'indiana',        region: 'Midwest' },
  { name: 'Iowa',           slug: 'iowa',           region: 'Midwest' },
  { name: 'Kansas',         slug: 'kansas',         region: 'Midwest' },
  { name: 'Kentucky',       slug: 'kentucky',       region: 'South' },
  { name: 'Louisiana',      slug: 'louisiana',      region: 'South' },
  { name: 'Maine',          slug: 'maine',          region: 'Northeast' },
  { name: 'Maryland',       slug: 'maryland',       region: 'Northeast' },
  { name: 'Massachusetts',  slug: 'massachusetts',  region: 'Northeast' },
  { name: 'Michigan',       slug: 'michigan',       region: 'Midwest' },
  { name: 'Minnesota',      slug: 'minnesota',      region: 'Midwest' },
  { name: 'Mississippi',    slug: 'mississippi',    region: 'South' },
  { name: 'Missouri',       slug: 'missouri',       region: 'Midwest' },
  { name: 'Montana',        slug: 'montana',        region: 'West' },
  { name: 'Nebraska',       slug: 'nebraska',       region: 'Midwest' },
  { name: 'Nevada',         slug: 'nevada',         region: 'West' },
  { name: 'New Hampshire',  slug: 'new-hampshire',  region: 'Northeast' },
  { name: 'New Jersey',     slug: 'new-jersey',     region: 'Northeast' },
  { name: 'New Mexico',     slug: 'new-mexico',     region: 'West' },
  { name: 'New York',       slug: 'new-york',       region: 'Northeast' },
  { name: 'North Carolina', slug: 'north-carolina', region: 'South' },
  { name: 'North Dakota',   slug: 'north-dakota',   region: 'Midwest' },
  { name: 'Ohio',           slug: 'ohio',           region: 'Midwest' },
  { name: 'Oklahoma',       slug: 'oklahoma',       region: 'South' },
  { name: 'Oregon',         slug: 'oregon',         region: 'West' },
  { name: 'Pennsylvania',   slug: 'pennsylvania',   region: 'Northeast' },
  { name: 'Rhode Island',   slug: 'rhode-island',   region: 'Northeast' },
  { name: 'South Carolina', slug: 'south-carolina', region: 'South' },
  { name: 'South Dakota',   slug: 'south-dakota',   region: 'Midwest' },
  { name: 'Tennessee',      slug: 'tennessee',      region: 'South' },
  { name: 'Texas',          slug: 'texas',          region: 'South' },
  { name: 'Utah',           slug: 'utah',           region: 'West' },
  { name: 'Vermont',        slug: 'vermont',        region: 'Northeast' },
  { name: 'Virginia',       slug: 'virginia',       region: 'South' },
  { name: 'Washington',     slug: 'washington',     region: 'West' },
  { name: 'West Virginia',  slug: 'west-virginia',  region: 'South' },
  { name: 'Wisconsin',      slug: 'wisconsin',      region: 'Midwest' },
  { name: 'Wyoming',        slug: 'wyoming',        region: 'West' },
];

async function main() {
  console.log('Seeding states...');
  let inserted = 0;
  let skipped = 0;

  for (const state of STATES) {
    const existing = await sql`SELECT id FROM states WHERE slug = ${state.slug} LIMIT 1`;
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await sql`
      INSERT INTO states (name, slug, region)
      VALUES (${state.name}, ${state.slug}, ${state.region})
    `;
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
