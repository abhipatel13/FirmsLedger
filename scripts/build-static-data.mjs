/**
 * Dumps the tables the prerender needs into a single JSON file, once, before
 * `next build` runs.
 *
 * Why a file and not a query: rendering ~9,125 profile pages needs every company
 * row. Fetching that during the build failed three ways on 2026-09-05 —
 *   1. per-page queries stampeded the DB (24x ETIMEDOUT),
 *   2. one `select * from companies` returned 4.58MB and Neon's SQL-over-HTTP
 *      driver truncated it (`SyntaxError: ... is not valid JSON`),
 *   3. chunked reads ran once per Next.js worker, so several workers each fired
 *      24 sequential requests at a 0.25 CU compute and timed out again.
 * One process, one pass, one file removes all three.
 *
 * Build-critical — must stay tracked in git, like scripts/check-title-suffix.mjs.
 * The output file is a build artifact and is gitignored.
 */

import { neon } from '@neondatabase/serverless';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.cwd(), '.static-data/db-snapshot.json');
const CHUNK = 1000;

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Vercel injects env vars; locally they live in .env.local.
  try {
    const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    const m = env.match(/^DATABASE_URL=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  return null;
}

async function selectAll(sql, table) {
  const rows = [];
  for (let offset = 0; ; offset += CHUNK) {
    // Ordered by id so the offset window is stable across requests.
    // sql.query(), not sql(): the driver only accepts plain strings this way.
    const batch = await sql.query(
      `select * from ${table} order by id limit ${CHUNK} offset ${offset}`
    );
    rows.push(...batch);
    if (batch.length < CHUNK) return rows;
  }
}

async function main() {
  const url = databaseUrl();
  if (!url) {
    console.warn('[static-data] No DATABASE_URL — writing empty snapshot.');
    return write({ companies: [], company_categories: [], categories: [] });
  }

  const sql = neon(url);
  const companies = await selectAll(sql, 'companies');
  const company_categories = await selectAll(sql, 'company_categories');
  const categories = await sql.query('select * from categories');

  write({ companies, company_categories, categories });
  console.log(
    `[static-data] ${companies.length} companies, ` +
    `${company_categories.length} links, ${categories.length} categories`
  );
}

function write(data) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data));
}

main().catch((err) => {
  // Never fail the deploy on a snapshot problem — the page code falls back to
  // the cached DB path when the snapshot is empty. Same posture as sitemap.js.
  console.warn('[static-data] snapshot failed, writing empty:', err.message);
  write({ companies: [], company_categories: [], categories: [] });
});
