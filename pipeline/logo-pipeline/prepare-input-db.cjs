'use strict';
/**
 * Build input.csv from Neon — every approved company that has a website.
 *
 * Replaces prepare-input.cjs, which joined against a 2026-07-31 CSV snapshot
 * and therefore only ever saw 690 of the 8,748 eligible listings.
 *
 * One query, run by hand. Companies already carrying a logo are skipped unless
 * --all is passed, so re-running after a partial batch is cheap.
 */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const all = process.argv.includes('--all');
// --tier1 = the top 30 companies of each top-level category, ranked exactly as
// app/[category]/[state]/page.jsx renders them (-avg_rating, id tiebreak). These
// are the listings a visitor actually sees on page one, so they are where a
// missing logo costs the most.
const tier1 = process.argv.includes('--tier1');
const out = path.join(__dirname, 'input.csv');
const sql = neon(process.env.DATABASE_URL);

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

(async () => {
  let rows;
  if (tier1) {
    rows = await sql`
      WITH ranked AS (
        SELECT co.id, co.slug, co.name, co.website,
               row_number() OVER (PARTITION BY c.slug
                                  ORDER BY co.avg_rating DESC NULLS LAST, co.id ASC) rn
        FROM categories c
        JOIN company_categories cc ON cc.category_id = c.id
        JOIN companies co ON co.id = cc.company_id
        WHERE c.parent_id IS NULL AND co.approved
          AND co.website IS NOT NULL AND co.website <> ''
          AND co.logo_status IS DISTINCT FROM 'ready'
      )
      SELECT DISTINCT id, slug, name, website FROM ranked WHERE rn <= 30 ORDER BY id`;
  } else if (all) {
    rows = await sql`SELECT id, slug, name, website FROM companies
                      WHERE approved AND website IS NOT NULL AND website <> '' ORDER BY id`;
  } else {
    rows = await sql`SELECT id, slug, name, website FROM companies
                      WHERE approved AND website IS NOT NULL AND website <> ''
                        AND (logo_status IS DISTINCT FROM 'ready') ORDER BY id`;
  }

  const lines = ['id,slug,name,website'];
  for (const r of rows) {
    lines.push([r.id, r.slug, r.name, r.website].map(csvEscape).join(','));
  }
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`wrote ${rows.length} rows -> ${out}${tier1 ? ' (tier1: top 30/category)' : all ? ' (--all)' : ' (skipping logo_status=ready)'}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
