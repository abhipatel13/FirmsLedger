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
import { MANUFACTURING_CATEGORIES } from '../src/lib/manufacturingCategories.js';

const OUT = resolve(process.cwd(), '.static-data/db-snapshot.json');
// Unlike OUT (a gitignored build artifact) this one is a tracked source file:
// app/[category]/[state]/[subcategory]/page.jsx imports it, so it must be in
// the bundle at runtime, not read from disk. See buildSubcategoryCombos below.
const COMBOS_OUT = resolve(process.cwd(), 'src/lib/generated/subcategoryCombos.json');
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

/**
 * Every (category, subcategory, state) triple that has at least one approved
 * company, with its count.
 *
 * Why this file exists: the subcategory route's generateStaticParams used to
 * return [], so all ~4,300 subcategory x state URLs rendered on demand. Only
 * ~1,600 have any companies; discovering that the other ~2,700 are empty cost
 * two aggregate queries each (the count===0 parent retry), in both
 * generateMetadata and the page body. Crawlers walking that space queried Neon
 * every couple of seconds, and with a fixed 300s autosuspend the compute never
 * slept — measured 2026-09-11: awake 87.4% of the month for 79 seconds of real
 * query work per 11 hours. This list answers "does this page exist?" with zero
 * queries. See HISTORY.md 2026-09-11.
 */
function buildSubcategoryCombos({ companies, company_categories, categories, states }) {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const stateSlugById = new Map(states.map((s) => [s.id, s.slug]));

  // Keyed on the STATIC config's parent(s), not the DB parent_id.
  //
  // categories.slug is UNIQUE, so a subcategory row has exactly one parent in
  // the DB — but MANUFACTURING_CATEGORIES deliberately lists some under two
  // (wiring-harness under electrical-components AND automotive-parts;
  // medical-packaging under plastics-packaging AND medical-devices). The route
  // serves whichever pairing the static config exposes and resolves companies
  // by subcategory SLUG, so keying on parent_id alone would make the second
  // parent's URLs redirect even though they list companies today
  // (wiring-harness has 65 approved). Emit one entry per static parent.
  const parentsBySub = new Map();
  for (const parent of MANUFACTURING_CATEGORIES) {
    for (const sub of parent.subcategories) {
      const list = parentsBySub.get(sub.slug);
      if (list) list.push(parent.slug);
      else parentsBySub.set(sub.slug, [parent.slug]);
    }
  }

  const linksByCompany = new Map();
  for (const link of company_categories) {
    const list = linksByCompany.get(link.company_id);
    if (list) list.push(link);
    else linksByCompany.set(link.company_id, [link]);
  }

  const counts = new Map(); // "category|sub|state" -> n
  for (const c of companies) {
    if (!c.approved || !c.hq_state_id) continue;
    const stateSlug = stateSlugById.get(c.hq_state_id);
    if (!stateSlug) continue;
    for (const link of linksByCompany.get(c.id) || []) {
      const sub = catById.get(link.category_id);
      // Subcategories only — a link to a top-level category is not this route.
      if (!sub || !sub.parent_id) continue;
      // A sub the static config does not expose is unreachable by this route,
      // so it gets no entry.
      for (const parentSlug of parentsBySub.get(sub.slug) || []) {
        const key = `${parentSlug}|${sub.slug}|${stateSlug}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
  }

  return [...counts]
    .map(([key, n]) => {
      const [category, sub, state] = key.split('|');
      return { category, sub, state, n };
    })
    .sort((a, b) => b.n - a.n || a.category.localeCompare(b.category) || a.sub.localeCompare(b.sub));
}

async function main() {
  const url = databaseUrl();
  if (!url) {
    console.warn('[static-data] No DATABASE_URL — writing empty snapshot.');
    return write({ companies: [], company_categories: [], categories: [], states: [] });
  }

  const sql = neon(url);
  const companies = await selectAll(sql, 'companies');
  const company_categories = await selectAll(sql, 'company_categories');
  const categories = await sql.query('select * from categories');
  const states = await sql.query('select id, slug, name from states');

  write({ companies, company_categories, categories, states });
  console.log(
    `[static-data] ${companies.length} companies, ` +
    `${company_categories.length} links, ${categories.length} categories, ` +
    `${states.length} states`
  );

  // Deliberately only rewritten when the pull actually returned rows. An empty
  // combos file would make the route's guard 404 the whole subcategory surface,
  // so a failed snapshot must leave the last good committed list in place.
  if (companies.length > 0 && states.length > 0) {
    const combos = buildSubcategoryCombos({ companies, company_categories, categories, states });
    mkdirSync(dirname(COMBOS_OUT), { recursive: true });
    writeFileSync(COMBOS_OUT, JSON.stringify(combos, null, 0) + '\n');
    const prerendered = combos.filter((c) => c.n >= 5).length;
    console.log(
      `[static-data] ${combos.length} subcategory x state combos with inventory ` +
      `(${prerendered} with >=5 companies, which is what gets prerendered)`
    );
  } else {
    console.warn('[static-data] snapshot empty — keeping existing subcategoryCombos.json');
  }
}

function write(data) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data));
}

main().catch((err) => {
  // Never fail the deploy on a snapshot problem — the page code falls back to
  // the cached DB path when the snapshot is empty. Same posture as sitemap.js.
  // subcategoryCombos.json is deliberately NOT touched here: it is tracked
  // source, and blanking it would 404 every subcategory page.
  console.warn('[static-data] snapshot failed, writing empty:', err.message);
  write({ companies: [], company_categories: [], categories: [], states: [] });
});
