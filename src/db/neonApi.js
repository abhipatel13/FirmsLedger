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
} from './schema';
import { eq, and, inArray, isNull, gt, asc, desc, ilike, sql } from 'drizzle-orm';
import { parseEmployeeCount, bucketKeyFor } from '@/lib/employeeCount';

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function orderCol(table, key = '-avg_rating') {
  const isDesc = key.startsWith('-');
  const col = key.replace(/^-/, '').replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  const column = table[col];
  if (!column) return isDesc ? desc(table.created_at) : asc(table.created_at);
  return isDesc ? desc(column) : asc(column);
}

// ── States ────────────────────────────────────────────────────────────────────

export async function fetchStates(orderKey = 'name') {
  return db.select().from(states).orderBy(asc(states[orderKey] ?? states.name));
}

export async function fetchStateBySlug(slug) {
  const [row] = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
  return row ?? null;
}

/** Returns state id for a slug, or null if not found. */
export async function resolveStateId(slug) {
  if (!slug) return null;
  const state = await fetchStateBySlug(slug);
  return state?.id ?? null;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function fetchCategories() {
  return db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));
}

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
    .orderBy(orderCol(companies, orderKey));

  if (typeof limit === 'number') q = q.limit(limit);
  return q;
}

export async function fetchApprovedCompanyCount() {
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
}

/** Resolves a category slug (including its subcategories, if it's a parent) to the set of matching, approved company IDs. Returns [] if the category or no linked companies exist. */
async function resolveCategoryCompanyIds(categorySlug) {
  const [cat] = await db
    .select({ id: categories.id, is_parent: categories.is_parent })
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat) return [];

  let categoryIds = [cat.id];
  if (cat.is_parent) {
    const subs = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parent_id, cat.id));
    categoryIds.push(...subs.map((s) => s.id));
  }

  const links = await db
    .select({ company_id: company_categories.company_id })
    .from(company_categories)
    .where(inArray(company_categories.category_id, categoryIds));

  return [...new Set(links.map((l) => l.company_id))];
}

/**
 * Fetch companies by category slug, with optional state slug filter.
 * Used by /top/[category]/[state] page.
 */
export async function fetchCompaniesByCategoryAndState(categorySlug, stateSlug, orderKey = '-avg_rating', limit = 200, filters = {}) {
  const companyIds = await resolveCategoryCompanyIds(categorySlug);
  if (!companyIds.length) return [];

  const conditions = [
    eq(companies.approved, true),
    inArray(companies.id, companyIds),
  ];

  if (stateSlug) {
    const stateId = await resolveStateId(String(stateSlug).toLowerCase());
    if (!stateId) return []; // unknown state
    conditions.push(eq(companies.hq_state_id, stateId));
  }

  if (filters.stateSlugs?.length) {
    const resolvedIds = (
      await Promise.all(filters.stateSlugs.map((s) => resolveStateId(String(s).toLowerCase())))
    ).filter(Boolean);
    if (!resolvedIds.length) return []; // none of the requested states matched
    conditions.push(inArray(companies.hq_state_id, resolvedIds));
  }

  let rows = await db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(orderCol(companies, orderKey))
    .limit(limit);

  if (filters.employeeRanges?.length) {
    const wanted = new Set(filters.employeeRanges);
    rows = rows.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
  }

  return rows;
}

/**
 * Returns per-state result counts for a category, for the filter sidebar.
 * Scoped to the category only — not re-scoped by other active filters (v1 simplification).
 */
export async function fetchStateCountsForCategory(categorySlug) {
  const companyIds = await resolveCategoryCompanyIds(categorySlug);
  if (!companyIds.length) return [];

  const rows = await db
    .select({ hq_state_id: companies.hq_state_id, hq_state_label: companies.hq_state_label })
    .from(companies)
    .where(and(eq(companies.approved, true), inArray(companies.id, companyIds)));

  const stateRows = await db.select().from(states);
  const idToSlug = new Map(stateRows.map((s) => [s.id, s.slug]));

  const counts = new Map(); // stateSlug -> { stateSlug, stateLabel, count }
  for (const row of rows) {
    if (!row.hq_state_id) continue;
    const stateSlug = idToSlug.get(row.hq_state_id);
    if (!stateSlug) continue;
    const existing = counts.get(stateSlug);
    if (existing) existing.count += 1;
    else counts.set(stateSlug, { stateSlug, stateLabel: row.hq_state_label, count: 1 });
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/**
 * Returns live-computed stats for a category (+ optionally state) listing page.
 * No hourly-rate field — deliberately absent (no such data exists).
 */
export async function fetchCategoryStats(categorySlug, stateSlug = null) {
  const companyIds = await resolveCategoryCompanyIds(categorySlug);
  if (!companyIds.length) {
    return { verifiedCount: 0, totalCount: 0, medianRating: null, statesCovered: 0, topSpecialties: [] };
  }

  const conditions = [
    eq(companies.approved, true),
    inArray(companies.id, companyIds),
  ];

  if (stateSlug) {
    const stateId = await resolveStateId(stateSlug.toLowerCase());
    if (stateId) conditions.push(eq(companies.hq_state_id, stateId));
  }

  const rows = await db
    .select({
      is_verified: companies.is_verified,
      avg_rating: companies.avg_rating,
      hq_state_id: companies.hq_state_id,
      certifications: companies.certifications,
    })
    .from(companies)
    .where(and(...conditions));

  const totalCount = rows.length;
  const verifiedCount = rows.filter((r) => r.is_verified).length;

  // Median of avg_rating where avg_rating > 0 — computed in JS
  const ratings = rows
    .map((r) => parseFloat(r.avg_rating))
    .filter((r) => !Number.isNaN(r) && r > 0)
    .sort((a, b) => a - b);

  let medianRating = null;
  if (ratings.length > 0) {
    const mid = Math.floor(ratings.length / 2);
    medianRating = ratings.length % 2 === 0
      ? Number(((ratings[mid - 1] + ratings[mid]) / 2).toFixed(2))
      : ratings[mid];
  }

  // Distinct states (suppressed on state pages by the caller)
  const uniqueStates = new Set(rows.map((r) => r.hq_state_id).filter(Boolean));
  const statesCovered = uniqueStates.size;

  // Up to 3 most common certification values
  const certCounts = new Map();
  for (const row of rows) {
    if (row.certifications && Array.isArray(row.certifications)) {
      for (const cert of row.certifications) {
        certCounts.set(cert, (certCounts.get(cert) || 0) + 1);
      }
    }
  }
  const topSpecialties = [...certCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cert]) => cert);

  return { verifiedCount, totalCount, medianRating, statesCovered, topSpecialties };
}

/** @deprecated Use fetchCompaniesByCategoryAndState instead */
export async function fetchCompaniesByCategory(categorySlug, orderKey = '-avg_rating', limit = 200) {
  return fetchCompaniesByCategoryAndState(categorySlug, null, orderKey, limit);
}

export async function fetchCompanyById(id) {
  if (!id) return null;
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return row ?? null;
}

export async function fetchCompanyByIdAny(idOrSlug) {
  if (!idOrSlug) return null;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (UUID_REGEX.test(String(idOrSlug))) {
    const [row] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, idOrSlug), eq(companies.approved, true)))
      .limit(1);
    return row ?? null;
  }

  const [row] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.slug, idOrSlug), eq(companies.approved, true)))
    .limit(1);
  return row ?? null;
}

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

export async function fetchCompanyCategories(where = {}) {
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
  return q.limit(10000);
}

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
    .orderBy(orderCol(reviews, orderKey));

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
    .orderBy(orderCol(listing_requests, orderKey));

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
