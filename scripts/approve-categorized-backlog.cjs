/**
 * Bulk-approve unapproved companies that have at least one category.
 *
 * Companies with no category cannot appear on any category page, so they
 * stay pending — approving them would create orphaned profile pages.
 *
 * Writes the affected IDs to scripts/data/ before updating so the change
 * can be reverted with a single UPDATE.
 *
 * Usage:
 *   node scripts/approve-categorized-backlog.cjs --dry-run
 *   node scripts/approve-categorized-backlog.cjs
 */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const DRY_RUN = process.argv.includes('--dry-run');

function databaseUrl() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const match = fs.readFileSync(envPath, 'utf8').match(/DATABASE_URL=(.*)/);
  if (!match) throw new Error('DATABASE_URL not found in .env.local');
  return match[1].trim().replace(/^["']|["']$/g, '');
}

async function main() {
  const sql = neon(databaseUrl());

  const before = await sql`
    select approved, count(*)::int n from companies group by approved order by approved
  `;
  console.log('Before:', JSON.stringify(before));

  const targets = await sql`
    select c.id
    from companies c
    where c.approved = false
      and exists (select 1 from company_categories cc where cc.company_id = c.id)
  `;
  const ids = targets.map((r) => r.id);

  const skipped = await sql`
    select count(*)::int n
    from companies c
    where c.approved = false
      and not exists (select 1 from company_categories cc where cc.company_id = c.id)
  `;

  console.log(`Will approve: ${ids.length}`);
  console.log(`Skipped (no category, stays pending): ${skipped[0].n}`);

  if (DRY_RUN) {
    console.log('Dry run — nothing written.');
    return;
  }
  if (ids.length === 0) {
    console.log('Nothing to approve.');
    return;
  }

  const dir = path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const snapshot = path.join(dir, `approved-backlog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(snapshot, JSON.stringify({ ids }, null, 2));
  console.log(`Revert snapshot: ${snapshot}`);

  await sql`update companies set approved = true where id = any(${ids})`;

  const after = await sql`
    select approved, count(*)::int n from companies group by approved order by approved
  `;
  console.log('After:', JSON.stringify(after));
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
