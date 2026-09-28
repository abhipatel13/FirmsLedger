/**
 * One-off import: Electrical Components Manufacturers data received 2026-07-20
 * (4 xlsx exports: national + California + New York + Texas).
 * Source JSON already extracted to scripts/data/electrical-components-2026-07-20.json.
 *
 * Dedupes against companies already in the DB (by normalized name and by
 * website domain) and within the batch itself, so it's safe to re-run.
 *
 *   node scripts/import-electrical-2026-07-20.cjs            # dry-run (default)
 *   node scripts/import-electrical-2026-07-20.cjs --commit    # write to DB
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const COMMIT = process.argv.includes('--commit');
const CATEGORY_SLUG = 'electrical-components';

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base, existing) {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) slug = `${base}-${i++}`;
  return slug;
}

// Normalize a company name for dedup comparison: strip legal suffixes/punctuation.
function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[,.]/g, '')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|group|holdings|industries)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function domainOf(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── Load & dedup ──────────────────────────────────────────────────────────

async function main() {
  const inputPath = path.join(__dirname, 'data', 'electrical-components-2026-07-20.json');
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${raw.length} raw records from xlsx export\n`);

  const category = (await sql`SELECT id FROM categories WHERE slug = ${CATEGORY_SLUG} LIMIT 1`)[0];
  if (!category) {
    console.error(`Category not found: ${CATEGORY_SLUG}`);
    process.exit(1);
  }

  const states = await sql`SELECT id, slug, name FROM states`;
  const stateBySlug = new Map(states.map((s) => [s.slug, s]));

  const existingCompanies = await sql`SELECT name, slug, website FROM companies`;
  const existingSlugs = new Set(existingCompanies.map((c) => c.slug));
  const existingNames = new Set(existingCompanies.map((c) => normalizeName(c.name)));
  const existingDomains = new Set(
    existingCompanies.map((c) => domainOf(c.website)).filter(Boolean)
  );

  console.log(`DB has ${existingCompanies.length} existing companies\n`);

  let inserted = 0;
  let skippedDupDb = 0;
  let skippedDupBatch = 0;
  let skippedNoState = 0;
  let skippedNoName = 0;

  const seenNamesInBatch = new Set();
  const seenDomainsInBatch = new Set();

  for (const rec of raw) {
    if (!rec.name) { skippedNoName++; continue; }

    const normName = normalizeName(rec.name);
    const domain = domainOf(rec.website);

    // Dedup against DB
    if (existingNames.has(normName) || (domain && existingDomains.has(domain))) {
      skippedDupDb++;
      console.log(`  [skip-db-dup]    ${rec.name}`);
      continue;
    }
    // Dedup within this batch (same company can appear in national + state file)
    if (seenNamesInBatch.has(normName) || (domain && seenDomainsInBatch.has(domain))) {
      skippedDupBatch++;
      console.log(`  [skip-batch-dup] ${rec.name}`);
      continue;
    }

    const state = stateBySlug.get(rec.state_slug);
    if (!state) { skippedNoState++; continue; }

    seenNamesInBatch.add(normName);
    if (domain) seenDomainsInBatch.add(domain);

    const baseSlug = slugify(rec.name);
    if (!baseSlug) { skippedNoName++; continue; }
    const slug = uniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(slug);

    const data = {
      name: rec.name,
      slug,
      description: rec.description || null,
      website: rec.website || null,
      founded_year: rec.founded_year || null,
      employee_count: rec.employee_count || null,
      hq_state_id: state.id,
      hq_state_label: state.name,
      hq_city: rec.hq_city || null,
      phone: rec.phone || null,
      address: rec.address || null,
      products: rec.products || null,
      industries_served: rec.industries_served || null,
      capabilities: rec.capabilities || null,
      certifications: rec.certifications || null,
      naics_code: rec.naics_code || null,
      linkedin_url: rec.linkedin_url || null,
      data_source: rec.data_source || 'manual-research',
      source_url: rec.source_url || null,
    };

    if (!COMMIT) {
      console.log(`  [dry-run] Would insert: ${data.name} (${data.hq_city}, ${data.hq_state_label})`);
      inserted++;
      continue;
    }

    const [row] = await sql`
      INSERT INTO companies (
        name, slug, description, website,
        founded_year, employee_count,
        hq_state_id, hq_state_label, hq_city,
        phone, address, country,
        products, industries_served, capabilities,
        certifications, naics_code, linkedin_url,
        data_source, source_url,
        approved, is_verified, featured
      ) VALUES (
        ${data.name}, ${data.slug}, ${data.description}, ${data.website},
        ${data.founded_year}, ${data.employee_count},
        ${data.hq_state_id}, ${data.hq_state_label}, ${data.hq_city},
        ${data.phone}, ${data.address}, ${'United States'},
        ${data.products}, ${data.industries_served}, ${data.capabilities},
        ${data.certifications}, ${data.naics_code}, ${data.linkedin_url},
        ${data.data_source}, ${data.source_url},
        ${false}, ${false}, ${false}
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO company_categories (company_id, category_id)
      VALUES (${row.id}, ${category.id})
      ON CONFLICT DO NOTHING
    `;

    console.log(`  [insert] ${data.name} (${data.hq_city}, ${data.hq_state_label})`);
    inserted++;
  }

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`  ${COMMIT ? 'Inserted' : 'Would insert'}: ${inserted}`);
  console.log(`  Skipped (already in DB):     ${skippedDupDb}`);
  console.log(`  Skipped (dup within batch):  ${skippedDupBatch}`);
  console.log(`  Skipped (no matching state): ${skippedNoState}`);
  console.log(`  Skipped (no name):           ${skippedNoName}`);
  if (!COMMIT) console.log(`\nDry-run only. Re-run with --commit to write to the DB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
