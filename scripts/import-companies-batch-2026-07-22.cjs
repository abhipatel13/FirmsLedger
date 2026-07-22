/**
 * One-off import: 7-category NY/TX/CA directory-scrape batch received 2026-07-22.
 * (automotive parts, CNC machining, electrical components, food & beverage,
 * medical packaging -> medical-device-manufacturers, metal fabrication, plastics & packaging)
 *
 * Source xlsx files already extracted to scripts/data/<category>-2026-07-22.json.
 * This batch has no website/domain field, so dedup is by normalized name only
 * (both against the DB and within/across the 7 files in this batch).
 *
 *   node scripts/import-companies-batch-2026-07-22.cjs            # dry-run (default)
 *   node scripts/import-companies-batch-2026-07-22.cjs --commit    # write to DB
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const COMMIT = process.argv.includes('--commit');

const BATCHES = [
  { file: 'automotive-parts-2026-07-22.json', categorySlug: 'automotive-parts-manufacturers' },
  { file: 'cnc-machine-2026-07-22.json', categorySlug: 'cnc-machining' },
  { file: 'electrical-components-2026-07-22.json', categorySlug: 'electrical-components' },
  { file: 'food-beverage-processing-2026-07-22.json', categorySlug: 'food-beverage-processing' },
  { file: 'medical-packaging-2026-07-22.json', categorySlug: 'medical-device-manufacturers' },
  { file: 'metal-fabrication-2026-07-22.json', categorySlug: 'metal-fabrication-machining' },
  { file: 'plastics-packaging-2026-07-22.json', categorySlug: 'plastics-packaging-manufacturers' },
];

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

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[,.]/g, '')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|group|holdings|industries)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const categories = await sql`SELECT id, slug FROM categories`;
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const states = await sql`SELECT id, slug, name FROM states`;
  const stateBySlug = new Map(states.map((s) => [s.slug, s]));

  const existingCompanies = await sql`SELECT name, slug FROM companies`;
  const existingSlugs = new Set(existingCompanies.map((c) => c.slug));
  const existingNames = new Set(existingCompanies.map((c) => normalizeName(c.name)));

  console.log(`DB has ${existingCompanies.length} existing companies\n`);

  const seenNamesInBatch = new Set();

  let totalInserted = 0;
  let totalSkippedDupDb = 0;
  let totalSkippedDupBatch = 0;
  let totalSkippedNoState = 0;
  let totalSkippedNoCategory = 0;

  for (const { file, categorySlug } of BATCHES) {
    const category = categoryBySlug.get(categorySlug);
    console.log(`\n── ${file} (category: ${categorySlug}) ──────────────────────`);
    if (!category) {
      console.error(`  Category not found: ${categorySlug} — skipping whole file`);
      totalSkippedNoCategory++;
      continue;
    }

    const inputPath = path.join(__dirname, 'data', file);
    const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    for (const rec of raw) {
      const normName = normalizeName(rec.name);

      if (existingNames.has(normName)) {
        console.log(`  [skip-db-dup]    ${rec.name}`);
        totalSkippedDupDb++;
        continue;
      }
      if (seenNamesInBatch.has(normName)) {
        console.log(`  [skip-batch-dup] ${rec.name}`);
        totalSkippedDupBatch++;
        continue;
      }

      const state = stateBySlug.get(rec.state_slug);
      if (!state) {
        console.log(`  [skip-no-state]  ${rec.name} (state_slug=${rec.state_slug})`);
        totalSkippedNoState++;
        continue;
      }

      seenNamesInBatch.add(normName);

      const baseSlug = slugify(rec.name);
      const slug = uniqueSlug(baseSlug, existingSlugs);
      existingSlugs.add(slug);

      const data = {
        name: rec.name,
        slug,
        hq_state_id: state.id,
        hq_state_label: state.name,
        hq_city: rec.hq_city || null,
        phone: rec.phone || null,
        address: rec.address || null,
        employee_count: rec.employee_count || null,
        data_source: rec.data_source || 'directory-scrape',
        source_url: rec.source_url || null,
      };

      if (!COMMIT) {
        console.log(`  [dry-run] Would insert: ${data.name} (${data.hq_city}, ${data.hq_state_label})`);
        totalInserted++;
        continue;
      }

      const [row] = await sql`
        INSERT INTO companies (
          name, slug,
          hq_state_id, hq_state_label, hq_city,
          phone, address, country,
          employee_count,
          data_source, source_url,
          approved, is_verified, featured
        ) VALUES (
          ${data.name}, ${data.slug},
          ${data.hq_state_id}, ${data.hq_state_label}, ${data.hq_city},
          ${data.phone}, ${data.address}, ${'United States'},
          ${data.employee_count},
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
      totalInserted++;
    }
  }

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`  ${COMMIT ? 'Inserted' : 'Would insert'}:      ${totalInserted}`);
  console.log(`  Skipped (already in DB):     ${totalSkippedDupDb}`);
  console.log(`  Skipped (dup within batch):  ${totalSkippedDupBatch}`);
  console.log(`  Skipped (no matching state): ${totalSkippedNoState}`);
  console.log(`  Skipped (no category, whole file): ${totalSkippedNoCategory}`);
  if (!COMMIT) console.log(`\nDry-run only. Re-run with --commit to write to the DB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
