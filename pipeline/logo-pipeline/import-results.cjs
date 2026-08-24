'use strict';
// Phase D — write results.csv back into companies.logo_url.
// Dry-run by default; pass --apply to write. Reads only the local CSV, so the
// only Neon traffic is the UPDATEs themselves (one statement per company).
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const apply = process.argv.includes('--apply');
// Objects are uploaded under a fixed key (logos/{id}.webp) with a 1-year
// `immutable` Cache-Control. That is right for serving but means a corrected
// re-run would never reach anyone who already loaded the old image. Stamping a
// version token onto the stored URL busts browser and edge caches without
// giving up immutable caching. R2 ignores the query string.
const version = process.argv.includes('--version')
  ? process.argv[process.argv.indexOf('--version') + 1]
  : String(Math.floor(Date.now() / 1000));
const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
if (!base) throw new Error('R2_PUBLIC_URL not set');

// Last row per id wins — results.csv is append-only, so a later line supersedes
// an earlier one for the same company. A terminal `failed` must therefore be able
// to *retract* an earlier dry-run `would_upload` (that's how a stale row for a
// company with no object in R2 slipped through and would have 404'd on a live page).
const rows = new Map();
for (const line of fs.readFileSync(path.join(__dirname, 'results.csv'), 'utf8').split('\n')) {
  const [id, slug, status, source, r2] = line.split(',');
  if (!id || id === 'id' || !status) continue;
  if (status !== 'found' && status !== 'would_upload') { rows.delete(id); continue; }
  if (!r2) { rows.delete(id); continue; }
  // r2 column is sometimes a bare key, sometimes a full URL from an older
  // R2_PUBLIC_URL. Either way, keep only the key and rebuild off the current base.
  const key = r2.replace(/^https?:\/\/[^/]+\//, '').replace(/\?.*$/, '');
  rows.set(id, { slug, source, url: `${base}/${key}?v=${version}` });
}

const sql = neon(process.env.DATABASE_URL);
(async () => {
  console.log(`${rows.size} companies to import (${apply ? 'APPLY' : 'dry-run'})`);
  let n = 0, skipped = 0;
  for (const [id, r] of rows) {
    // Never write a URL that doesn't serve — a 404 here is a broken image on a
    // live company page, which is worse than the blank placeholder.
    const head = await fetch(r.url, { method: 'HEAD' });
    if (!head.ok) { console.log(`  SKIP ${r.slug} (HTTP ${head.status})`); skipped++; continue; }
    console.log(`  ${r.slug} -> ${r.url}`);
    if (!apply) continue;
    await sql`
      UPDATE companies
      SET logo_url = ${r.url}, logo_status = 'ready',
          logo_source = ${r.source || null}, logo_updated_at = now()
      WHERE id = ${id}
    `;
    n++;
  }
  if (apply) {
    const check = await sql`SELECT count(*)::int AS n FROM companies WHERE logo_status = 'ready'`;
    console.log(`updated ${n}, skipped ${skipped}; total ready in DB: ${check[0].n}`);
    if (check[0].n < n) throw new Error('fewer ready rows than updates — write failed');
  } else {
    console.log(`skipped ${skipped} unreachable`);
    console.log('dry-run only — re-run with --apply to write');
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
