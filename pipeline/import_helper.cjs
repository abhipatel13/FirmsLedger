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

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\u0000/g, '');
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

  const companiesToInsert = [];

  for (const rec of stagedRecords) {
    const normName = normalizeName(rec.company_name);

    // Double check DB duplicate safety
    if (existingNames.has(normName)) {
      console.log(`  [skip-dup]   ${rec.company_name} (already in DB)`);
      skippedDupCount++;
      continue;
    }

    // Verify it is a United States company
    if (!rec.address || !rec.address.includes('United States')) {
      console.log(`  [skip-non-us] ${rec.company_name} (address does not contain 'United States')`);
      skippedNoStateCount++;
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

    // Prep record with sanitization
    const companyData = {
      name: sanitizeString(rec.company_name),
      slug,
      website: sanitizeString(rec.website) || null,
      phone: sanitizeString(rec.phone) || null,
      address: sanitizeString(rec.address) || null,
      hq_city: sanitizeString(rec.city) || null,
      hq_state_id: state.id,
      hq_state_label: state.name,
      description: sanitizeString(rec.raw_description) || null,
      products: (rec.raw_products || []).map(sanitizeString),
      capabilities: (rec.raw_services || []).map(sanitizeString),
      industries_served: (rec.raw_industries || []).map(sanitizeString),
      certifications: (rec.raw_certifications || []).map(sanitizeString),
      contact_email: sanitizeString(rec.raw_email) || null,
      avg_rating: String(rec.rating || 0.0),
      review_count: parseInt(rec.reviews || 0),
      data_source: rec.source || 'google_maps',
      source_url: sanitizeString(rec.source_url) || null,
      approved: false, // Must be verified by admin
      is_verified: false,
      featured: false,
      images: []
    };

    if (rec.images) {
      try {
        const parsedImages = typeof rec.images === 'string' ? JSON.parse(rec.images) : rec.images;
        if (Array.isArray(parsedImages)) {
          companyData.images = parsedImages.map(img => sanitizeString(img.url)).filter(Boolean);
        }
      } catch (err) {
        // Ignore or log parsing error
      }
    }

    // Resolve Category Reference
    const categorySlug = rec.google_category; // mapped from search query in run_pipeline.py
    const category = categoryBySlug.get(categorySlug);
    if (category) {
      companyData.categoryId = category.id;
    }

    companiesToInsert.push(companyData);
  }

  if (!COMMIT) {
    for (const companyData of companiesToInsert) {
      console.log(`  [dry-run] Would insert: ${companyData.name} (${companyData.hq_city}, ${companyData.hq_state_label}) with ${companyData.images.length} images`);
      insertedCount++;
    }
  } else {
    // Commit in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < companiesToInsert.length; i += BATCH_SIZE) {
      const batch = companiesToInsert.slice(i, i + BATCH_SIZE);
      console.log(`[*] Committing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(companiesToInsert.length / BATCH_SIZE)} (${batch.length} companies)...`);

      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const company of batch) {
        const rowPlaceholders = [];
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.name);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.slug);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.website);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.phone);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.address);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.hq_city);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.hq_state_id);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.hq_state_label);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.description);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.products);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.capabilities);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.industries_served);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.certifications);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.contact_email);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.avg_rating);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.review_count);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.data_source);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.source_url);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.approved);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.is_verified);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.featured);
        rowPlaceholders.push(`$${paramIndex++}`); params.push(company.images);
        
        values.push(`(${rowPlaceholders.join(', ')})`);
      }

      if (values.length === 0) continue;

      const queryText = `
        INSERT INTO companies (
          name, slug, website, phone, address, hq_city, hq_state_id, hq_state_label,
          description, products, capabilities, industries_served, certifications,
          contact_email, avg_rating, review_count, data_source, source_url,
          approved, is_verified, featured, images
        ) VALUES ${values.join(', ')}
        RETURNING id, name, slug
      `;

      try {
        const insertedRows = await sql(queryText, params);
        
        // Build batch insert for company_categories
        const categoryValues = [];
        const categoryParams = [];
        let catParamIdx = 1;

        for (const insertedRow of insertedRows) {
          const original = batch.find(c => c.slug === insertedRow.slug);
          if (original && original.categoryId) {
            categoryValues.push(`($${catParamIdx++}, $${catParamIdx++})`);
            categoryParams.push(insertedRow.id, original.categoryId);
          }
          console.log(`  [inserted] ${insertedRow.name}`);
          insertedCount++;
        }

        if (categoryValues.length > 0) {
          const catQueryText = `
            INSERT INTO company_categories (company_id, category_id)
            VALUES ${categoryValues.join(', ')}
            ON CONFLICT DO NOTHING
          `;
          await sql(catQueryText, categoryParams);
        }
      } catch (err) {
        console.error(`  [error] Failed to commit batch starting with ${batch[0].name}:`, err.message);
      }
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
