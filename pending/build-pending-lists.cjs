#!/usr/bin/env node
/**
 * Writes CSVs of everything blocking pages from reaching Google, into pending/.
 * Re-run any time to refresh: `node pending/build-pending-lists.cjs`
 *
 * The three sitemap predicates this mirrors:
 *   company profile  -> companies.approved AND description IS NOT NULL
 *   category+state   -> >= MIN_LIVE_COMPANIES approved companies (app/sitemap.js)
 *   subcategory      -> not emitted by app/sitemap.js at all
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const MIN_LIVE_COMPANIES = 5; // keep in sync with app/sitemap.js
const OUT = __dirname;
const sql = neon(process.env.DATABASE_URL);

function toCsv(rows, cols) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

function write(file, rows, cols) {
  fs.writeFileSync(path.join(OUT, file), toCsv(rows, cols));
  console.log(`${String(rows.length).padStart(5)}  ${file}`);
}

(async () => {
  // 1. Approved but no description — page renders noindex, so it is unreachable.
  const noDesc = await sql`
    SELECT name, slug, website, hq_city, hq_state_label, data_source
    FROM companies WHERE approved AND description IS NULL
    ORDER BY hq_state_label NULLS LAST, name`;
  write('01-approved-missing-description.csv', noDesc,
    ['name', 'slug', 'website', 'hq_city', 'hq_state_label', 'data_source']);

  // 2. Not approved — excluded from every listing and from the sitemap.
  const pending = await sql`
    SELECT name, slug, website, hq_city, hq_state_label, data_source,
           (description IS NOT NULL) AS has_description,
           created_at
    FROM companies WHERE NOT approved
    ORDER BY created_at DESC NULLS LAST`;
  write('02-not-approved.csv', pending,
    ['name', 'slug', 'website', 'hq_city', 'hq_state_label', 'data_source', 'has_description', 'created_at']);

  // 3. Category+state combos under the sitemap floor, and how many they need.
  const combos = await sql`
    SELECT c.slug AS category_slug, s.slug AS state_slug, count(*)::int AS approved_companies
    FROM companies co
    JOIN company_categories cc ON cc.company_id = co.id
    JOIN categories c          ON c.id = cc.category_id
    JOIN states s              ON s.id = co.hq_state_id
    WHERE co.approved
    GROUP BY 1, 2 HAVING count(*) < ${MIN_LIVE_COMPANIES}
    ORDER BY count(*) DESC`;
  write('03-category-state-below-sitemap-floor.csv',
    combos.map((r) => ({
      ...r,
      url: `/${r.category_slug}/${r.state_slug}`,
      needed_for_sitemap: MIN_LIVE_COMPANIES - r.approved_companies,
      needed_for_top_10: Math.max(0, 10 - r.approved_companies),
    })),
    ['url', 'category_slug', 'state_slug', 'approved_companies', 'needed_for_sitemap', 'needed_for_top_10']);

  // 4. Companies with no state — cannot appear on any /{category}/{state} page.
  const noState = await sql`
    SELECT name, slug, website, hq_city, address, approved
    FROM companies WHERE hq_state_id IS NULL ORDER BY approved DESC, name`;
  write('04-missing-state.csv', noState,
    ['name', 'slug', 'website', 'hq_city', 'address', 'approved']);

  // 5. Companies in no category — orphaned from the whole category tree.
  const noCat = await sql`
    SELECT co.name, co.slug, co.website, co.hq_state_label, co.approved
    FROM companies co
    LEFT JOIN company_categories cc ON cc.company_id = co.id
    WHERE cc.company_id IS NULL ORDER BY co.approved DESC, co.name`;
  write('05-missing-category.csv', noCat,
    ['name', 'slug', 'website', 'hq_state_label', 'approved']);
})().catch((e) => {
  console.error('failed:', e.message);
  process.exit(1);
});
