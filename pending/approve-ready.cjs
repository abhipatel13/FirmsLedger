#!/usr/bin/env node
/**
 * Approves unapproved companies that already meet the bar for an indexable
 * page: real description, website, state, category, slug.
 *
 * Writes pending/approved-<date>.csv FIRST as a rollback list — undo with:
 *   node pending/approve-ready.cjs --rollback pending/approved-<date>.csv
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const MIN_DESC = 100;

async function rollback(file) {
  const ids = fs.readFileSync(file, 'utf8').trim().split('\n').slice(1).map((l) => l.split(',')[0]);
  const r = await sql`UPDATE companies SET approved = false WHERE id = ANY(${ids}) RETURNING id`;
  console.log(`rolled back ${r.length} companies`);
}

async function approve() {
  const ready = await sql`
    SELECT co.id, co.name, co.slug, co.hq_state_label
    FROM companies co
    WHERE NOT co.approved
      AND co.description IS NOT NULL AND length(co.description) > ${MIN_DESC}
      AND co.website IS NOT NULL
      AND co.hq_state_id IS NOT NULL
      AND co.slug IS NOT NULL
      AND EXISTS (SELECT 1 FROM company_categories cc WHERE cc.company_id = co.id)
    ORDER BY co.name`;

  if (!ready.length) return console.log('nothing to approve');

  const stamp = new Date().toISOString().slice(0, 10);
  const out = path.join(__dirname, `approved-${stamp}.csv`);
  const esc = (v) => (/[",\n]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
  fs.writeFileSync(out, 'id,name,slug,hq_state_label\n' +
    ready.map((r) => [r.id, r.name, r.slug, r.hq_state_label].map(esc).join(',')).join('\n') + '\n');
  console.log(`rollback list: ${path.basename(out)} (${ready.length} rows)`);

  const ids = ready.map((r) => r.id);
  const done = await sql`UPDATE companies SET approved = true WHERE id = ANY(${ids}) RETURNING id`;
  console.log(`approved ${done.length} companies`);
}

const arg = process.argv.indexOf('--rollback');
(arg > -1 ? rollback(process.argv[arg + 1]) : approve()).catch((e) => {
  console.error('failed:', e.message);
  process.exit(1);
});
