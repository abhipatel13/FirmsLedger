/**
/**
 * FirmsLedger Data Pipeline Importer
 * 
 * Imports ready companies from pipeline/staged_companies.json into the
 * PostgreSQL production database.
 * 
 * Run in dry-run mode (default):
 *   node pipeline/import_helper.cjs
 * 
 * Run in commit mode (writes to DB):
 *   node pipeline/import_helper.cjs --commit
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const COMMIT = process.argv.includes('--commit');

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

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[,.]/g, '')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|group|holdings|industries)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function main() {
  let stagedPath = path.join(__dirname, 'staged_companies.json');
  
  const jsonIndex = process.argv.indexOf('--json');
  if (jsonIndex !== -1 && process.argv[jsonIndex + 1]) {
    stagedPath = path.resolve(process.argv[jsonIndex + 1]);
  } else {
    // Also support --json=path format
    const eqIndex = process.argv.findIndex(arg => arg.startsWith('--json='));
    if (eqIndex !== -1) {
      stagedPath = path.resolve(process.argv[eqIndex].split('=')[1]);
    }
  }

  if (!fs.existsSync(stagedPath)) {
    console.error(`[!] Staged companies JSON file not found at: ${stagedPath}\nRun run_pipeline.py first to generate it.`);
    process.exit(1);
  }

  const stagedRecords = JSON.parse(fs.readFileSync(stagedPath, 'utf8'));
  console.log(`[*] Loaded ${stagedRecords.length} staged companies for import from ${path.basename(stagedPath)}.\n`);

  // Load existing metadata from DB for lookup and uniqueness constraints
  const categories = await sql`SELECT id, slug FROM categories`;
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const states = await sql`SELECT id, slug, name FROM states`;
  const stateBySlug = new Map(states.map((s) => [s.slug, s]));

  const existingCompanies = await sql`SELECT name, slug FROM companies`;
  const existingSlugs = new Set(existingCompanies.map((c) => c.slug));
  const existingNames = new Set(existingCompanies.map((c) => normalizeName(c.name)));

  console.log(`[*] DB has ${existingCompanies.length} existing companies.`);

  let insertedCount = 0;
  let skippedDupCount = 0;
  let skippedNoStateCount = 0;

  for (const rec of stagedRecords) {
    const normName = normalizeName(rec.company_name);

    // Double check DB duplicate safety
    if (existingNames.has(normName)) {
      console.log(`  [skip-dup]   ${rec.company_name} (already in DB)`);
      skippedDupCount++;
      continue;
    }

    // Resolve State Reference
    const state = stateBySlug.get(rec.state_slug);
    if (!state) {
      console.log(`  [skip-state] ${rec.company_name} (unmatched state slug: '${rec.state_slug}')`);
      skippedNoStateCount++;
      continue;
    }

    // Generate unique slug
    const baseSlug = slugify(rec.company_name);
    const slug = uniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(slug);

    // Prep record
    const companyData = {
      name: rec.company_name,
      slug,
      website: rec.website || null,
      phone: rec.phone || null,
      address: rec.address || null,
      hq_city: rec.city || null,
      hq_state_id: state.id,
      hq_state_label: state.name,
      description: rec.raw_description || null,
      products: rec.raw_products || [],
      capabilities: rec.raw_services || [],
      industries_served: rec.raw_industries || [],
      certifications: rec.raw_certifications || [],
      contact_email: rec.raw_email || null,
      avg_rating: String(rec.rating || 0.0),
      review_count: parseInt(rec.reviews || 0),
      data_source: rec.source || 'google_maps',
      source_url: rec.source_url || null,
      approved: false, // Must be verified by admin
      is_verified: false,
      featured: false
    };

    if (!COMMIT) {
      console.log(`  [dry-run] Would insert: ${companyData.name} (${companyData.hq_city}, ${companyData.hq_state_label})`);
      insertedCount++;
      continue;
    }

    // Write to production DB
    try {
      const [insertedRow] = await sql`
        INSERT INTO companies (
          name, slug, website, phone, address, hq_city, hq_state_id, hq_state_label,
          description, products, capabilities, industries_served, certifications,
          contact_email, avg_rating, review_count, data_source, source_url,
          approved, is_verified, featured
        ) VALUES (
          ${companyData.name}, ${companyData.slug}, ${companyData.website}, ${companyData.phone},
          ${companyData.address}, ${companyData.hq_city}, ${companyData.hq_state_id}, ${companyData.hq_state_label},
          ${companyData.description}, ${companyData.products}, ${companyData.capabilities},
          ${companyData.industries_served}, ${companyData.certifications}, ${companyData.contact_email},
          ${companyData.avg_rating}, ${companyData.review_count}, ${companyData.data_source}, ${companyData.source_url},
          ${companyData.approved}, ${companyData.is_verified}, ${companyData.featured}
        ) RETURNING id
      `;

      // Resolve Category Reference
      const categorySlug = rec.google_category; // mapped from search query in run_pipeline.py
      const category = categoryBySlug.get(categorySlug);
      if (category) {
        await sql`
          INSERT INTO company_categories (company_id, category_id)
          VALUES (${insertedRow.id}, ${category.id})
          ON CONFLICT DO NOTHING
        `;
      }

      console.log(`  [inserted] ${companyData.name} (${companyData.hq_city}, ${companyData.hq_state_label})`);
      insertedCount++;
    } catch (err) {
      console.error(`  [error] Failed to insert ${companyData.name}:`, err.message);
    }
  }

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`  ${COMMIT ? 'Inserted' : 'Would insert'}:      ${insertedCount}`);
  console.log(`  Skipped (Duplicate in DB):   ${skippedDupCount}`);
  console.log(`  Skipped (No matched state):  ${skippedNoStateCount}`);
  
  if (!COMMIT) {
    console.log(`\n[!] This was a dry-run. To write these records to production, run:`);
    console.log(`    node pipeline/import_helper.cjs --commit`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
