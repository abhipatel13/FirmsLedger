/**
 * Neon/Drizzle data layer — mirrors the old supabaseApi interface so callers
 * (apiClient.js, route handlers) require minimal changes.
 *
 * Tables: states, categories, companies, company_categories, reviews,
 *         listing_requests, company_invites, email_campaigns, email_logs,
 *         submission_logs, marketplace_rfqs, marketplace_suppliers,
 *         marketplace_responses
 */
import { db } from './client';
import {
  states,
  categories,
  companies,
  company_categories,
  reviews,
  listing_requests,
  company_invites,
  email_campaigns,
  email_logs,
  submission_logs,
  marketplace_rfqs,
  marketplace_suppliers,
  marketplace_responses,
  claims,
  company_leads,
} from './schema';
import { eq, and, inArray, isNull, isNotNull, gt, asc, desc, ilike, sql } from 'drizzle-orm';
import { parseEmployeeCount, bucketKeyFor } from '@/lib/employeeCount';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

/**
 * Returns ORDER BY terms for `key`, always followed by a tiebreak on the
 * primary key.
 *
 * The tiebreak is not cosmetic. SQL guarantees no ordering among rows that tie
 * on the sort column, so the result depends on the execution plan — and the
 * plan changes with data growth, autovacuum, parallel-worker availability, and
 * every scale-to-zero restart. 445 of the 1,058 metal-fabrication companies
 * share avg_rating = 5.00, and pages 1 and 2 are fetched as separate queries at
 * separate times (separate cache entries, filled hours apart). With no total
 * order, forcing two different plans put 21 of 25 companies on BOTH pages,
 * meaning ~21 others appeared on neither and were unreachable through
 * pagination despite being approved and counted in the total.
 *
 * Spread it at the call site: .orderBy(...orderCol(companies, key))
 */
function orderCol(table, key = '-avg_rating') {
  const isDesc = key.startsWith('-');
  const col = key.replace(/^-/, '').replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  const column = table[col];
  const primary = column
    ? (isDesc ? desc(column) : asc(column))
    : (isDesc ? desc(table.created_at) : asc(table.created_at));
  // table.id is a uuid primary key on every table routed through here, so this
  // makes the sort a total order.
  return table.id ? [primary, asc(table.id)] : [primary];
}

// ── Cache policy ──────────────────────────────────────────────────────────────
// Neon bills active compute time, so the goal is not "fast queries" but "long
// stretches with zero queries" so the compute can scale to zero. Everything
// read-only shares the 'companies' tag; admin writes call revalidateTag to push
// changes out immediately, and the TTL is only a backstop for the pipeline/
// scripts that write to Postgres directly and never hit the admin API.
// See docs/superpowers/plans/2026-08-19-neon-compute-cost-reduction.md
const WEEK = 604800;
const CACHE_TAGS = ['companies'];

// ── States ────────────────────────────────────────────────────────────────────

const fetchStatesImpl = async (orderKey = 'name') => {
  try {
    return await db.select().from(states).orderBy(asc(states[orderKey] ?? states.name));
  } catch (err) {
    console.error('Error fetching states:', err);
    return [];
  }
};

export const fetchStates = cache(
  unstable_cache(fetchStatesImpl, ['fetchStates'], { revalidate: WEEK, tags: CACHE_TAGS })
);

const fetchStateBySlugImpl = async (slug) => {
  try {
    const [row] = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
    return row ?? null;
  } catch (err) {
    console.error('Error fetching state by slug:', err);
    return null;
  }
};

export const fetchStateBySlug = cache(
  unstable_cache(fetchStateBySlugImpl, ['fetchStateBySlug'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/** Returns state id for a slug, or null if not found. */
export async function resolveStateId(slug) {
  if (!slug) return null;
  const state = await fetchStateBySlug(slug);
  return state?.id ?? null;
}

// ── Categories ────────────────────────────────────────────────────────────────

const fetchCategoriesImpl = async () => {
  try {
    return await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

export const fetchCategories = cache(
  unstable_cache(fetchCategoriesImpl, ['fetchCategories'], { revalidate: WEEK, tags: CACHE_TAGS })
);

// ── Companies ─────────────────────────────────────────────────────────────────

/**
 * Generic company fetch with optional equality filters.
 * Callers may pass { hq_state_slug: 'california' } to filter by state slug
 * (resolved via join); all other keys are matched directly on the companies table.
 */
export async function fetchCompanies(where = {}, orderKey = '-avg_rating', limit) {
  const { hq_state_slug, hq_state, ...rest } = where;

  // If filtering by state, resolve slug → id first
  let stateId = null;
  const stateSlug = hq_state_slug || hq_state; // accept both old and new key names
  if (stateSlug) {
    stateId = await resolveStateId(String(stateSlug).toLowerCase());
    if (!stateId) return []; // unknown state → no results
  }

  const conditions = [];

  if (stateId) {
    conditions.push(eq(companies.hq_state_id, stateId));
  }

  let approvedSet = false;
  for (const [k, v] of Object.entries(rest)) {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (companies[col] !== undefined && v != null && v !== '') {
      conditions.push(eq(companies[col], v));
      if (col === 'approved') approvedSet = true;
    }
  }
  // Default to approved-only unless the caller explicitly filtered on `approved`
  // (e.g. admin queues need approved: false).
  if (!approvedSet) conditions.push(eq(companies.approved, true));

  let q = db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(...orderCol(companies, orderKey));

  if (typeof limit === 'number') q = q.limit(limit);
  return q;
}

const fetchApprovedCompanyCountImpl = async () => {
  if (!db) return 67;

  try {
    const [row] = await db
      .select({ count: sql`count(*)` })
      .from(companies)
      .where(eq(companies.approved, true));

    return Number(row?.count ?? 0);
  } catch {
    return 67;
  }
};

export const fetchApprovedCompanyCount = cache(
  unstable_cache(fetchApprovedCompanyCountImpl, ['fetchApprovedCompanyCount'], { revalidate: WEEK, tags: CACHE_TAGS })
);

const fetchHomepageStatsImpl = async () => {
  if (!db) {
    return { companyCount: 67, categoryCount: 10, stateCount: 50 };
  }

  try {
    const [compRow] = await db.select({ count: sql`count(*)` }).from(companies);
    const [catRow] = await db.select({ count: sql`count(*)` }).from(categories);
    const [stateRow] = await db.select({ count: sql`count(*)` }).from(states);

    return {
      companyCount: Number(compRow?.count ?? 67),
      categoryCount: Number(catRow?.count ?? 10),
      stateCount: Number(stateRow?.count ?? 50),
    };
  } catch (err) {
    console.error('Error fetching homepage stats:', err);
    return { companyCount: 67, categoryCount: 10, stateCount: 50 };
  }
};

export const fetchHomepageStats = cache(
  unstable_cache(fetchHomepageStatsImpl, ['fetchHomepageStats'], { revalidate: WEEK, tags: CACHE_TAGS })
);

// Bounded — a category has at most ~10 ids. Safe to keep as an IN list.
async function resolveCategoryIds(categorySlug) {
  const [cat] = await db
    .select({ id: categories.id, is_parent: categories.is_parent })
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat) return [];

  const categoryIds = [cat.id];
  if (cat.is_parent) {
    const subs = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parent_id, cat.id));
    categoryIds.push(...subs.map((s) => s.id));
  }
  return categoryIds;
}

/**
 * Fetch companies by category slug, with optional state slug filter.
 * Used by /top/[category]/[state] page.
 */
const fetchCompaniesByCategoryAndStateImpl = async (categorySlug, stateSlug, orderKey = '-avg_rating', limit = 200, offset = 0, filters = {}) => {
  try {
    const activeFilters = filters || {};
    const activeOffset = Number(offset) || 0;
    const activeLimit = Number(limit) || 200;
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (!categoryIds.length) return [];

    const subquery = db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    const conditions = [
      eq(companies.approved, true),
      inArray(companies.id, subquery),
    ];

    if (stateSlug) {
      const stateId = await resolveStateId(String(stateSlug).toLowerCase());
      if (!stateId) return []; // unknown state
      conditions.push(eq(companies.hq_state_id, stateId));
    }

    if (activeFilters.stateSlugs?.length) {
      const resolvedIds = (
        await Promise.all(activeFilters.stateSlugs.map((s) => resolveStateId(String(s).toLowerCase())))
      ).filter(Boolean);
      if (!resolvedIds.length) return []; // none of the requested states matched
      conditions.push(inArray(companies.hq_state_id, resolvedIds));
    }

    const hasEmployeeFilter = activeFilters.employeeRanges?.length > 0;

    let query = db
      .select()
      .from(companies)
      .where(and(...conditions))
      .orderBy(...orderCol(companies, orderKey));

    if (!hasEmployeeFilter) {
      query = query.limit(activeLimit).offset(activeOffset);
    }

    let rows = await query;

    if (hasEmployeeFilter) {
      const wanted = new Set(activeFilters.employeeRanges);
      rows = rows.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
    }

    return rows;
  } catch (err) {
    // ponytail: swallow transient Neon errors (e.g. dropped fetch during a
    // background unstable_cache revalidation) so they degrade to an empty
    // result instead of throwing a 500 into the triggering request.
    console.error('Error fetching companies by category/state:', err);
    return [];
  }
};

export const fetchCompaniesByCategoryAndState = cache(
  unstable_cache(fetchCompaniesByCategoryAndStateImpl, ['fetchCompaniesByCategoryAndState'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/**
 * Cheap SQL count of matching companies for a category + state combination.
 */
const countCompaniesByCategoryAndStateImpl = async (categorySlug, stateSlug, filters = {}) => {
  try {
    const activeFilters = filters || {};
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (!categoryIds.length) return 0;

    const subquery = db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    const conditions = [
      eq(companies.approved, true),
      inArray(companies.id, subquery),
    ];

    if (stateSlug) {
      const stateId = await resolveStateId(String(stateSlug).toLowerCase());
      if (!stateId) return 0;
      conditions.push(eq(companies.hq_state_id, stateId));
    }

    if (activeFilters.stateSlugs?.length) {
      const resolvedIds = (
        await Promise.all(activeFilters.stateSlugs.map((s) => resolveStateId(String(s).toLowerCase())))
      ).filter(Boolean);
      if (!resolvedIds.length) return 0;
      conditions.push(inArray(companies.hq_state_id, resolvedIds));
    }

    const hasEmployeeFilter = activeFilters.employeeRanges?.length > 0;

    if (hasEmployeeFilter) {
      let rows = await db
        .select({ employee_count: companies.employee_count })
        .from(companies)
        .where(and(...conditions));
      const wanted = new Set(activeFilters.employeeRanges);
      rows = rows.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
      return rows.length;
    }

    const [row] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(companies)
      .where(and(...conditions));

    return row?.count || 0;
  } catch (err) {
    console.error('Error counting companies by category/state:', err);
    return 0;
  }
};

export const countCompaniesByCategoryAndState = cache(
  unstable_cache(countCompaniesByCategoryAndStateImpl, ['countCompaniesByCategoryAndState'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/**
 * Interim subcategory filter: narrows a fetched company list down to companies
 * whose `name` or `description` mentions any of the subcategory's keywords.
 * Applied in-app because the `companies` table has no subcategory column yet —
 * real subcategory tagging is a separate follow-up. An empty/absent keyword list
 * passes everything through untouched.
 */
export function filterCompaniesBySubcategoryKeywords(companies, keywords) {
  if (!keywords?.length) return companies;
  const needles = keywords.map((k) => String(k).toLowerCase());
  return companies.filter((c) => {
    const haystack = `${c.name || ''} ${c.description || ''}`.toLowerCase();
    return needles.some((k) => haystack.includes(k));
  });
}

/**
 * Returns per-state result counts for a category, for the filter sidebar.
 * Scoped to the category only — not re-scoped by other active filters (v1 simplification).
 */
const fetchStateCountsForCategoryImpl = async (categorySlug) => {
  try {
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (!categoryIds.length) return [];

    const subquery = db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    const rows = await db
      .select({
        hq_state_id: companies.hq_state_id,
        hq_state_label: companies.hq_state_label,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(companies)
      .where(and(eq(companies.approved, true), inArray(companies.id, subquery)))
      .groupBy(companies.hq_state_id, companies.hq_state_label);

    const stateRows = await db.select().from(states);
    const idToSlug = new Map(stateRows.map((s) => [s.id, s.slug]));

    return rows
      .filter((row) => row.hq_state_id && idToSlug.has(row.hq_state_id))
      .map((row) => ({ stateSlug: idToSlug.get(row.hq_state_id), stateLabel: row.hq_state_label, count: row.count }))
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    console.error('Error fetching state counts for category:', err);
    return [];
  }
};

export const fetchStateCountsForCategory = cache(
  unstable_cache(fetchStateCountsForCategoryImpl, ['fetchStateCountsForCategory'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/**
 * Live stats for a state hub page: total companies, top represented
 * categories (rolled up to their top-level parent), and top HQ cities.
 */
const fetchStateHubStatsImpl = async (stateSlug) => {
  const empty = { totalCount: 0, topCategories: [], topCities: [] };
  const stateId = await resolveStateId(stateSlug);
  if (!stateId) return empty;

  try {
    const inState = and(eq(companies.approved, true), eq(companies.hq_state_id, stateId));

    const [totalRows, categoryRows, cityRows, allCats] = await Promise.all([
      db.select({ count: sql`count(*)`.mapWith(Number) }).from(companies).where(inState),

      db
        .select({ category_id: company_categories.category_id, count: sql`count(*)`.mapWith(Number) })
        .from(company_categories)
        .innerJoin(companies, eq(companies.id, company_categories.company_id))
        .where(inState)
        .groupBy(company_categories.category_id),

      db
        .select({ city: companies.hq_city, count: sql`count(*)`.mapWith(Number) })
        .from(companies)
        .where(and(inState, isNotNull(companies.hq_city)))
        .groupBy(companies.hq_city)
        .orderBy(desc(sql`count(*)`))
        .limit(5),

      fetchCategories(),
    ]);

    const catsById = new Map(allCats.map((c) => [c.id, c]));
    const topLevelOf = (cat) => (cat.parent_id ? catsById.get(cat.parent_id) || cat : cat);

    const rollup = new Map();
    for (const row of categoryRows) {
      const cat = catsById.get(row.category_id);
      if (!cat) continue;
      const top = topLevelOf(cat);
      const existing = rollup.get(top.slug);
      rollup.set(top.slug, { slug: top.slug, name: top.name, count: (existing?.count || 0) + row.count });
    }

    return {
      totalCount: totalRows[0]?.count || 0,
      topCategories: [...rollup.values()].sort((a, b) => b.count - a.count),
      topCities: cityRows.map((r) => ({ city: r.city, count: r.count })),
    };
  } catch (err) {
    console.error('Error fetching state hub stats:', err);
    return empty;
  }
};

export const fetchStateHubStats = cache(
  unstable_cache(fetchStateHubStatsImpl, ['fetchStateHubStats'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/**
 * Returns live-computed stats for a category (+ optionally state) listing page.
 * No hourly-rate field — deliberately absent (no such data exists).
 */
const fetchCategoryStatsImpl = async (categorySlug, stateSlug = null) => {
  const categoryIds = await resolveCategoryIds(categorySlug);
  if (!categoryIds.length) {
    return { verifiedCount: 0, totalCount: 0, medianRating: null, statesCovered: 0, topSpecialties: [] };
  }

  const subquery = db
    .select({ company_id: company_categories.company_id })
    .from(company_categories)
    .where(inArray(company_categories.category_id, categoryIds));

  const conditions = [
    eq(companies.approved, true),
    inArray(companies.id, subquery),
  ];

  if (stateSlug) {
    const stateId = await resolveStateId(stateSlug.toLowerCase());
    if (stateId) conditions.push(eq(companies.hq_state_id, stateId));
  }

  try {
    const [statsRow, certRows] = await Promise.all([
      db
        .select({
          totalCount: sql`count(*)`.mapWith(Number),
          verifiedCount: sql`count(case when ${companies.is_verified} = true then 1 end)`.mapWith(Number),
          medianRating: sql`percentile_cont(0.5) within group (order by (case when ${companies.avg_rating} > '0.0' then ${companies.avg_rating}::float end))`.mapWith(Number),
          statesCovered: sql`count(distinct ${companies.hq_state_id})`.mapWith(Number),
        })
        .from(companies)
        .where(and(...conditions)),

      db
        .select({
          cert: sql`unnest(${companies.certifications})`.mapWith(String),
          count: sql`count(*)`.mapWith(Number),
        })
        .from(companies)
        .where(and(...conditions, isNotNull(companies.certifications)))
        .groupBy(sql`unnest(${companies.certifications})`)
        .orderBy(desc(sql`count(*)`))
        .limit(3)
        .catch(() => []),
    ]);

    const stats = statsRow[0] || { totalCount: 0, verifiedCount: 0, medianRating: null, statesCovered: 0 };
    const topSpecialties = certRows ? certRows.map((r) => r.cert) : [];

    return {
      totalCount: stats.totalCount || 0,
      verifiedCount: stats.verifiedCount || 0,
      medianRating: stats.medianRating,
      statesCovered: stats.statesCovered || 0,
      topSpecialties,
    };
  } catch (err) {
    console.error('Error fetching category stats:', err);
    return { verifiedCount: 0, totalCount: 0, medianRating: null, statesCovered: 0, topSpecialties: [] };
  }
};

export const fetchCategoryStats = cache(
  unstable_cache(fetchCategoryStatsImpl, ['fetchCategoryStats'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/** @deprecated Use fetchCompaniesByCategoryAndState instead */
export async function fetchCompaniesByCategory(categorySlug, orderKey = '-avg_rating', limit = 200) {
  return fetchCompaniesByCategoryAndState(categorySlug, null, orderKey, limit);
}

export async function fetchCompanyById(id) {
  if (!id) return null;
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return row ?? null;
}

const fetchCompanyByIdAnyImpl = async (idOrSlug) => {
  if (!idOrSlug) return null;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    const match = UUID_REGEX.test(String(idOrSlug))
      ? eq(companies.id, idOrSlug)
      : eq(companies.slug, idOrSlug);

    const [row] = await db
      .select()
      .from(companies)
      .where(and(match, eq(companies.approved, true)))
      .limit(1);
    return row ?? null;
  } catch (err) {
    console.error('Error fetching company by id/slug:', err);
    return null;
  }
};

/**
 * Approved company counts for a set of category slugs, in one grouped query.
 *
 * Used by /capabilities to show real inventory on each card. One query rather
 * than one per capability, and cached on the shared 'companies' tag so the
 * page adds no recurring Neon traffic.
 */
const fetchCategoryCountsImpl = async (slugs) => {
  if (!Array.isArray(slugs) || slugs.length === 0) return {};
  try {
    const rows = await db
      .select({ slug: categories.slug, n: sql`count(${companies.id})::int` })
      .from(categories)
      .innerJoin(company_categories, eq(company_categories.category_id, categories.id))
      .innerJoin(companies, and(eq(companies.id, company_categories.company_id), eq(companies.approved, true)))
      .where(inArray(categories.slug, slugs))
      .groupBy(categories.slug);
    return Object.fromEntries(rows.map((r) => [r.slug, r.n]));
  } catch (err) {
    console.error('Error fetching category counts:', err);
    return {};
  }
};

export const fetchCategoryCounts = cache(
  unstable_cache(fetchCategoryCountsImpl, ['fetchCategoryCounts'], { revalidate: WEEK, tags: CACHE_TAGS })
);

export const fetchCompanyByIdAny = cache(
  unstable_cache(fetchCompanyByIdAnyImpl, ['fetchCompanyByIdAny'], { revalidate: WEEK, tags: CACHE_TAGS })
);

/**
 * Create a company. Pass hq_state_slug (e.g. 'california') and we resolve it
 * to hq_state_id automatically. hq_state_label is set from the states table.
 */
export async function createCompany(payload, categoryIds = []) {
  const row = { ...payload };
  if (!row.slug && row.name) row.slug = slugify(row.name);
  row.approved = false;

  // Resolve state FK if caller passed a slug
  const stateSlug = row.hq_state_slug || row.hq_state;
  delete row.hq_state_slug;
  delete row.hq_state; // remove old text field — not in schema

  if (stateSlug && !row.hq_state_id) {
    const state = await fetchStateBySlug(String(stateSlug).toLowerCase());
    if (state) {
      row.hq_state_id = state.id;
      if (!row.hq_state_label) row.hq_state_label = state.name;
    }
  }

  const [company] = await db.insert(companies).values(row).returning();
  for (const categoryId of categoryIds) {
    if (categoryId) await createCompanyCategory(company.id, categoryId);
  }
  return company;
}

export async function updateCompany(id, patch) {
  const [row] = await db.update(companies).set(patch).where(eq(companies.id, id)).returning();
  return row;
}

export async function deleteCompany(id) {
  await db.delete(companies).where(eq(companies.id, id));
}

const fetchCompanyCategoriesImpl = async (where = {}) => {
  try {
    const conditions = [];
    for (const [k, v] of Object.entries(where)) {
      const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
      if (company_categories[col] !== undefined && v != null && v !== '') {
        conditions.push(eq(company_categories[col], v));
      }
    }
    const q = conditions.length
      ? db.select().from(company_categories).where(and(...conditions))
      : db.select().from(company_categories);
    return await q.limit(10000);
  } catch (err) {
    console.error('Error fetching company categories:', err);
    return [];
  }
};

export const fetchCompanyCategories = cache(
  unstable_cache(fetchCompanyCategoriesImpl, ['fetchCompanyCategories'], { revalidate: WEEK, tags: CACHE_TAGS })
);

export async function createCompanyCategory(companyId, categoryId) {
  const [row] = await db
    .insert(company_categories)
    .values({ company_id: companyId, category_id: categoryId })
    .returning();
  return row;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function fetchReviews(where = {}, orderKey = '-created_at', limit) {
  const conditions = [];
  for (const [k, v] of Object.entries(where)) {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (reviews[col] !== undefined) {
      if (v === true || v === false) conditions.push(eq(reviews[col], v));
      else if (v != null && v !== '') conditions.push(eq(reviews[col], v));
    }
  }

  let q = db
    .select()
    .from(reviews)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderCol(reviews, orderKey));

  if (typeof limit === 'number') q = q.limit(limit);
  return q;
}

// ── Listing Requests ──────────────────────────────────────────────────────────

/**
 * Create a listing request. Accepts hq_state (slug or label) and resolves
 * it to hq_state_id + hq_state_label automatically.
 */
export async function createListingRequest(payload) {
  const row = { ...payload };

  const stateSlug = row.hq_state_slug || row.hq_state;
  delete row.hq_state_slug;
  delete row.hq_state;

  if (stateSlug && !row.hq_state_id) {
    const state = await fetchStateBySlug(String(stateSlug).toLowerCase());
    if (state) {
      row.hq_state_id = state.id;
      if (!row.hq_state_label) row.hq_state_label = state.name;
    }
  }

  const [result] = await db.insert(listing_requests).values(row).returning();
  return result;
}

export async function fetchListingRequests(where = {}, orderKey = '-created_at', limit) {
  const conditions = [];
  for (const [k, v] of Object.entries(where)) {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (listing_requests[col] !== undefined && v != null && v !== '') {
      conditions.push(eq(listing_requests[col], v));
    }
  }

  let q = db
    .select()
    .from(listing_requests)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderCol(listing_requests, orderKey));

  if (typeof limit === 'number') q = q.limit(limit);
  return q;
}

// ── Company Invites ───────────────────────────────────────────────────────────

export async function getInviteByToken(token) {
  const t = typeof token === 'string' ? token.trim() : '';
  if (!t) return null;

  const [row] = await db
    .select()
    .from(company_invites)
    .where(
      and(
        eq(company_invites.token, t),
        isNull(company_invites.used_at),
        gt(company_invites.expires_at, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function markInviteUsed(inviteId, companyId) {
  await db
    .update(company_invites)
    .set({ used_at: new Date(), company_id: companyId })
    .where(eq(company_invites.id, inviteId));
}

// ── Email Campaigns ───────────────────────────────────────────────────────────

export async function fetchEmailCampaigns(limit = 100) {
  return db
    .select()
    .from(email_campaigns)
    .orderBy(desc(email_campaigns.created_at))
    .limit(limit);
}

export async function fetchEmailCampaignById(id) {
  const [row] = await db.select().from(email_campaigns).where(eq(email_campaigns.id, id)).limit(1);
  return row ?? null;
}

export async function createEmailCampaign(payload) {
  const [row] = await db.insert(email_campaigns).values(payload).returning();
  return row;
}

export async function updateEmailCampaign(id, patch) {
  const [row] = await db.update(email_campaigns).set(patch).where(eq(email_campaigns.id, id)).returning();
  return row;
}

// ── Email Logs ────────────────────────────────────────────────────────────────

export async function fetchEmailLogs(campaignId, limit = 500) {
  return db
    .select()
    .from(email_logs)
    .where(eq(email_logs.campaign_id, campaignId))
    .orderBy(desc(email_logs.created_at))
    .limit(limit);
}

export async function createEmailLog(payload) {
  const [row] = await db.insert(email_logs).values(payload).returning();
  return row;
}

export async function updateEmailLog(id, patch) {
  const [row] = await db.update(email_logs).set(patch).where(eq(email_logs.id, id)).returning();
  return row;
}

// ── Submission Logs ───────────────────────────────────────────────────────────

export async function fetchSubmissionLogs(limit = 200) {
  return db
    .select()
    .from(submission_logs)
    .orderBy(desc(submission_logs.submitted_at))
    .limit(limit);
}

export async function createSubmissionLog(payload) {
  const [row] = await db.insert(submission_logs).values(payload).returning();
  return row;
}

/** Returns up to `limit` URLs not yet submitted (for the submit-urls cron). */
export async function getUnsubmittedUrls(limit = 20) {
  const rows = await db
    .select({ url: submission_logs.url })
    .from(submission_logs)
    .where(eq(submission_logs.submitted, false))
    .orderBy(asc(submission_logs.submitted_at))
    .limit(limit);
  return rows.map((r) => r.url);
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export async function fetchOpenRfqs(limit = 100) {
  return db
    .select()
    .from(marketplace_rfqs)
    .where(eq(marketplace_rfqs.status, 'open'))
    .orderBy(desc(marketplace_rfqs.created_at))
    .limit(limit);
}

export async function createRfq(payload) {
  const [row] = await db.insert(marketplace_rfqs).values(payload).returning();
  return row;
}

export async function fetchActiveSuppliers(limit = 100) {
  return db
    .select()
    .from(marketplace_suppliers)
    .where(eq(marketplace_suppliers.status, 'active'))
    .orderBy(desc(marketplace_suppliers.created_at))
    .limit(limit);
}

export async function createSupplier(payload) {
  const [row] = await db.insert(marketplace_suppliers).values(payload).returning();
  return row;
}

export async function createMarketplaceResponse(payload) {
  const [row] = await db.insert(marketplace_responses).values(payload).returning();
  return row;
}

/** Increment response_count on an RFQ. */
export async function incrementRfqResponseCount(rfqId) {
  await db
    .update(marketplace_rfqs)
    .set({ response_count: sql`${marketplace_rfqs.response_count} + 1` })
    .where(eq(marketplace_rfqs.id, rfqId));
}

/** Increment inquiry_count on a supplier listing. */
export async function incrementSupplierInquiryCount(supplierId) {
  await db
    .update(marketplace_suppliers)
    .set({ inquiry_count: sql`${marketplace_suppliers.inquiry_count} + 1` })
    .where(eq(marketplace_suppliers.id, supplierId));
}

/** Fetch RFQ by id (used in respond route to get poster email). */
export async function fetchRfqById(id) {
  const [row] = await db.select().from(marketplace_rfqs).where(eq(marketplace_rfqs.id, id)).limit(1);
  return row ?? null;
}

/** Fetch supplier by id (used in respond route to get poster email). */
export async function fetchSupplierById(id) {
  const [row] = await db.select().from(marketplace_suppliers).where(eq(marketplace_suppliers.id, id)).limit(1);
  return row ?? null;
}

// ── Owner dashboard ───────────────────────────────────────────────────────────
// Ownership is "the account holding this company's APPROVED claim" — see
// drizzle/0002_claims.sql. companies.owner_user_id is a dead Supabase-era
// column and is not consulted.
//
// NOTHING HERE IS CACHED, deliberately. These are per-account authenticated
// reads; an unstable_cache entry keyed only on the company id would serve one
// owner's view to another, and a `cache()` wrapper would outlive a permission
// change within the same render.

/** Every company this account has claimed, approved or not, newest first. */
export async function fetchClaimsForUser(userId) {
  if (!userId) return [];
  try {
    return await db
      .select({
        claim_id: claims.id,
        claim_status: claims.status,
        claim_created_at: claims.created_at,
        reviewed_at: claims.reviewed_at,
        review_note: claims.review_note,
        id: companies.id,
        slug: companies.slug,
        name: companies.name,
        logo_url: companies.logo_url,
        hq_city: companies.hq_city,
        hq_state_label: companies.hq_state_label,
        avg_rating: companies.avg_rating,
        review_count: companies.review_count,
        description: companies.description,
        lead_count: sql`(SELECT count(*) FROM ${company_leads}
                          WHERE ${company_leads.company_id} = ${companies.id})::int`,
      })
      .from(claims)
      .innerJoin(companies, eq(claims.company_id, companies.id))
      .where(eq(claims.user_id, userId))
      .orderBy(desc(claims.created_at))
      .limit(50);
  } catch (err) {
    console.error('Error fetching claims for user:', err);
    return [];
  }
}

/**
 * The company at `companyId` ONLY IF `userId` holds its approved claim.
 * Returns null otherwise — callers treat null as "not yours" and 404, so a
 * probe cannot distinguish a missing company from someone else's.
 *
 * Every owner write must go through this. Never trust a company id from a
 * request body.
 */
export async function fetchCompanyForOwner(companyId, userId) {
  if (!companyId || !userId) return null;
  try {
    const [row] = await db
      .select({ company: companies })
      .from(claims)
      .innerJoin(companies, eq(claims.company_id, companies.id))
      .where(and(
        eq(claims.company_id, companyId),
        eq(claims.user_id, userId),
        eq(claims.status, 'approved'),
      ))
      .limit(1);
    return row?.company ?? null;
  } catch (err) {
    console.error('Error fetching company for owner:', err);
    return null;
  }
}

/** Category ids currently linked to a company. */
export async function fetchCategoryIdsForCompany(companyId) {
  const rows = await db
    .select({ category_id: company_categories.category_id })
    .from(company_categories)
    .where(eq(company_categories.company_id, companyId));
  return rows.map((r) => r.category_id);
}

/**
 * Replace a company's category links with `categoryIds`.
 *
 * Returns the slugs whose listing pages are now stale (added AND removed), so
 * the caller can revalidate them. Only ids that exist in `categories` are
 * written — an unknown id is dropped rather than trusted.
 */
export async function setCompanyCategories(companyId, categoryIds) {
  const wanted = [...new Set((categoryIds || []).filter(Boolean))];

  const valid = wanted.length
    ? (await db.select({ id: categories.id, slug: categories.slug })
        .from(categories).where(inArray(categories.id, wanted)))
    : [];
  const validIds = valid.map((c) => c.id);

  const before = await fetchCategoryIdsForCompany(companyId);
  const added = validIds.filter((id) => !before.includes(id));
  const removed = before.filter((id) => !validIds.includes(id));
  if (!added.length && !removed.length) return [];

  // ponytail: delete-all-then-insert. The link table holds a handful of rows
  // per company, so a diffed update would be more code for no gain.
  await db.delete(company_categories).where(eq(company_categories.company_id, companyId));
  for (const categoryId of validIds) {
    await db.insert(company_categories).values({ company_id: companyId, category_id: categoryId });
  }

  const touched = [...new Set([...added, ...removed])];
  const rows = touched.length
    ? await db.select({ slug: categories.slug }).from(categories).where(inArray(categories.id, touched))
    : [];
  return rows.map((r) => r.slug);
}

/** State slug for a company, used to revalidate its category+state pages. */
export async function fetchStateSlugForCompany(companyId) {
  const [row] = await db
    .select({ slug: states.slug })
    .from(companies)
    .innerJoin(states, eq(companies.hq_state_id, states.id))
    .where(eq(companies.id, companyId))
    .limit(1);
  return row?.slug ?? null;
}
