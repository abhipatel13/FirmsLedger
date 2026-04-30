/**
 * generate-seo-tracking.cjs
 *
 * Queries Supabase for every (category_slug, country) combo with ≥1 approved
 * agency, then writes seo-tracking.csv with one row per indexable page so
 * Google indexing can be tracked weekly.
 *
 * Run: node scripts/generate-seo-tracking.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
const YEAR = new Date().getFullYear();
const MIN_LIVE = 1; // skip combos with fewer live agencies

if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or anon/service key in .env.local');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

/* Pull every row from a table with .range() pagination so we don't truncate at 1000. */
async function pageAll(table, select) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

/* Title overrides — same data lives in src/lib/seo.js. We mirror only the keys
   we need for naming (top, noun, name). Pages not in this map render with
   plain "Top {Category} Companies in {Country} ({YEAR})". */
function loadTitleOverrides() {
  const file = path.join(__dirname, '..', 'src', 'lib', 'seo.js');
  const src = fs.readFileSync(file, 'utf8');
  // Naive parse: find CATEGORY_TITLE_OVERRIDES { ... } block
  const m = src.match(/export const CATEGORY_TITLE_OVERRIDES\s*=\s*({[\s\S]*?\n};)/);
  if (!m) return {};
  // Build a JS object via Function — file uses plain JS literals, no template
  // strings or imports inside the object.
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`return ${m[1].replace(/;$/, '')}`)();
  } catch (e) {
    console.warn('Could not parse seo.js overrides:', e.message);
    return {};
  }
}

const OVERRIDES = loadTitleOverrides();

function buildTitle(categoryName, slug, country, liveCount) {
  // Override match: slug → country|*
  const slugOv = OVERRIDES[slug] || {};
  const ov = slugOv[country] || slugOv['*'] || null;

  const noun = ov?.noun || 'Companies';
  const name = ov?.name || categoryName;
  const top = ov?.top != null ? ov.top : Math.min(liveCount, 10); // default top to live count capped at 10
  const topPart = top ? `Top ${top}` : 'Top';
  const locPart = country && country !== '(global)' ? ` in ${country}` : '';
  return `${topPart} ${name} ${noun}${locPart} (${YEAR})`;
}

function buildUrl(slug, country) {
  if (!country || country === '(global)') return `${BASE_URL}/directory/${slug}`;
  const qp = new URLSearchParams({ country });
  return `${BASE_URL}/directory/${slug}?${qp.toString()}`;
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

(async function main() {
  console.log('Loading categories...');
  const categories = await pageAll('categories', 'id, slug, name, parent_id, is_parent');
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  console.log(`Loaded ${categories.length} categories.`);

  console.log('Loading agency_categories...');
  const links = await pageAll('agency_categories', 'agency_id, category_id');
  console.log(`Loaded ${links.length} category links.`);

  console.log('Loading approved agencies...');
  const agencies = await pageAll('agencies', 'id, hq_country, approved');
  const approved = agencies.filter((a) => a.approved === true);
  const agencyById = Object.fromEntries(approved.map((a) => [a.id, a]));
  console.log(`Loaded ${approved.length} approved agencies.`);

  // For parent categories include all child agencies via parent_id rollup.
  // Parent slug aggregates every child's agencies.
  const childrenByParent = {};
  for (const c of categories) {
    const pid = c.parent_id;
    if (pid) {
      (childrenByParent[pid] ||= []).push(c.id);
    }
  }

  // Build (category_id → Set<agency_id>)
  const directAgencies = {};
  for (const link of links) {
    const ag = agencyById[link.agency_id];
    if (!ag) continue;
    (directAgencies[link.category_id] ||= new Set()).add(link.agency_id);
  }

  // Effective agencies per category: direct + all descendants if parent.
  function agenciesFor(catId) {
    const c = catById[catId];
    if (!c) return new Set();
    if (c.is_parent) {
      const set = new Set();
      // Roll up all children
      const stack = [...(childrenByParent[catId] || [])];
      while (stack.length) {
        const childId = stack.pop();
        const direct = directAgencies[childId];
        if (direct) for (const id of direct) set.add(id);
        const grand = childrenByParent[childId];
        if (grand) stack.push(...grand);
      }
      // Also include direct (rare for parents)
      const own = directAgencies[catId];
      if (own) for (const id of own) set.add(id);
      return set;
    }
    return directAgencies[catId] || new Set();
  }

  // For each category, group its agencies by hq_country.
  const rows = [];
  let countSlugs = 0;
  for (const cat of categories) {
    const agSet = agenciesFor(cat.id);
    if (agSet.size < MIN_LIVE) continue;

    countSlugs++;
    const byCountry = {};
    let globalCount = 0;
    for (const aid of agSet) {
      const ag = agencyById[aid];
      if (!ag) continue;
      globalCount++;
      const c = (ag.hq_country || '').trim();
      if (!c) continue;
      byCountry[c] = (byCountry[c] || 0) + 1;
    }

    // 1) Country-specific rows (≥ MIN_LIVE)
    for (const [country, count] of Object.entries(byCountry)) {
      if (count < MIN_LIVE) continue;
      rows.push({
        title: buildTitle(cat.name, cat.slug, country, count),
        url: buildUrl(cat.slug, country),
        slug: cat.slug,
        country,
        target: (OVERRIDES[cat.slug]?.[country]?.top ?? OVERRIDES[cat.slug]?.['*']?.top) || '',
        live: count,
      });
    }

    // 2) Global row (no country filter) — only if ≥ MIN_LIVE total
    if (globalCount >= MIN_LIVE) {
      rows.push({
        title: buildTitle(cat.name, cat.slug, null, globalCount),
        url: buildUrl(cat.slug, null),
        slug: cat.slug,
        country: '(global)',
        target: OVERRIDES[cat.slug]?.['*']?.top || '',
        live: globalCount,
      });
    }
  }

  console.log(`${countSlugs} categories with ≥${MIN_LIVE} live agency. ${rows.length} trackable URLs.`);

  // Sort: country-specific first (by country, slug), then globals last
  rows.sort((a, b) => {
    const ag = a.country === '(global)';
    const bg = b.country === '(global)';
    if (ag !== bg) return ag ? 1 : -1;
    return a.country.localeCompare(b.country) || a.slug.localeCompare(b.slug);
  });

  const headers = [
    'SEO Title', 'URL', 'Slug', 'Country', 'Target N', 'Live Companies', 'In Sitemap',
    'Wk1 Indexed', 'Wk1 Position', 'Wk1 Impressions', 'Wk1 Clicks',
    'Wk2 Indexed', 'Wk2 Position', 'Wk2 Impressions', 'Wk2 Clicks',
    'Wk3 Indexed', 'Wk3 Position', 'Wk3 Impressions', 'Wk3 Clicks',
    'Wk4 Indexed', 'Wk4 Position', 'Wk4 Impressions', 'Wk4 Clicks',
    'Notes',
  ];

  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      csvEscape(r.title), csvEscape(r.url), csvEscape(r.slug), csvEscape(r.country),
      csvEscape(r.target), csvEscape(r.live), 'Yes',
      '', '', '', '',
      '', '', '', '',
      '', '', '', '',
      '', '', '', '',
      '',
    ].join(','));
  }

  const outFile = path.join(__dirname, '..', 'seo-tracking.csv');
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
  console.log(`Wrote ${outFile} (${rows.length} rows).`);
})();
