/**
 * API client — Neon/Drizzle backend for the FirmsLedger manufacturer directory.
 * All data access goes through this file. Tables: states, companies, categories,
 * company_categories, reviews, listing_requests, company_invites.
 * Database: Neon PostgreSQL via @neondatabase/serverless + Drizzle ORM.
 */
import * as neon from '@/db/neonApi';

// ── Mock fallback (used when DATABASE_URL is not set in dev) ──────────────────

const mockCategories = [
  { id: 'cat-1',  name: 'Electrical Components Manufacturers',            slug: 'electrical-components',     description: 'Wiring, switchgear, and electrical components',       icon: 'zap',        order: 1,  is_parent: false },
  { id: 'cat-2',  name: 'Mechanical Components Manufacturers',            slug: 'mechanical-components',     description: 'CNC machining, precision parts, and assemblies',      icon: 'settings',   order: 2,  is_parent: false },
  { id: 'cat-3',  name: 'Plastics & Packaging Manufacturers',             slug: 'plastics-packaging',        description: 'Injection molding, packaging materials, containers',  icon: 'package',    order: 3,  is_parent: false },
  { id: 'cat-4',  name: 'Metal Fabrication & Machining',                  slug: 'metal-fabrication',         description: 'Sheet metal, welding, stamping, custom fabrication',  icon: 'wrench',     order: 4,  is_parent: false },
  { id: 'cat-5',  name: 'Electronics & Semiconductor Manufacturers',      slug: 'electronics-semiconductor', description: 'PCBs, chips, electronic assemblies',                  icon: 'cpu',        order: 5,  is_parent: false },
  { id: 'cat-6',  name: 'Automotive Parts Manufacturers',                 slug: 'automotive-parts',          description: 'OEM and aftermarket auto components',                 icon: 'car',        order: 6,  is_parent: false },
  { id: 'cat-7',  name: 'Textile & Apparel Manufacturers',                slug: 'textile-apparel',           description: 'Fabric production and garment manufacturing',         icon: 'shirt',      order: 7,  is_parent: false },
  { id: 'cat-8',  name: 'Furniture & Woodworking Manufacturers',          slug: 'furniture-woodworking',     description: 'Custom furniture, cabinetry, and woodworking',        icon: 'sofa',       order: 8,  is_parent: false },
  { id: 'cat-9',  name: 'Food & Beverage Processing Equipment Manufacturers', slug: 'food-beverage-processing', description: 'Food processing equipment and beverage production', icon: 'utensils',   order: 9,  is_parent: false },
  { id: 'cat-10', name: 'Medical Device Manufacturers',                   slug: 'medical-devices',           description: 'Diagnostic equipment and surgical instruments',       icon: 'stethoscope',order: 10, is_parent: false },
];

const mockCompanies = [
  { id: 'co-1', name: 'California Precision Works', slug: 'california-precision-works', description: 'ISO 9001 certified manufacturer.', hq_state: 'california', hq_state_label: 'California', hq_city: 'San Francisco', website: '', logo_url: '', avg_rating: '4.9', review_count: 87, is_verified: true, approved: true },
  { id: 'co-2', name: 'Allied Bike Industries',     slug: 'allied-bike-industries',     description: 'Mid-size bike manufacturer.',         hq_state: 'california', hq_state_label: 'California', hq_city: 'Los Angeles',    website: '', logo_url: '', avg_rating: '4.7', review_count: 54, is_verified: true, approved: true },
  { id: 'co-3', name: 'Massachusetts Precision Works', slug: 'massachusetts-precision-works', description: 'Precision CNC machining and tooling manufacturer serving aerospace and medical device clients.', hq_state: 'massachusetts', hq_state_label: 'Massachusetts', hq_city: 'Worcester', website: '', logo_url: '', avg_rating: '4.8', review_count: 62, is_verified: true, approved: true },
];

function filterBy(obj, where) {
  return Object.entries(where).every(([k, v]) => obj[k] === v);
}

function sortByKey(items, orderKey) {
  if (!orderKey || !items.length) return [...items];
  const isDesc = orderKey.startsWith('-');
  const key = isDesc ? orderKey.slice(1) : orderKey;
  return [...items].sort((a, b) => {
    const aVal = a[key]; const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return isDesc ? -1 : 1;
    if (bVal == null) return isDesc ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return isDesc ? bVal - aVal : aVal - bVal;
    return isDesc ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
  });
}

const mockEntityApi = {
  Category: {
    list: () => Promise.resolve(mockCategories),
  },
  Company: {
    list: (order, limit) => {
      let list = sortByKey(mockCompanies, order || '-avg_rating');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    filter: (where, order, limit) => {
      let list = mockCompanies.filter((c) => filterBy(c, where));
      list = sortByKey(list, order || '-avg_rating');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    filterByCategory: (slug, order, limit) => {
      let list = sortByKey(mockCompanies, order || '-avg_rating');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
  },
  CompanyCategory: {
    list: () => Promise.resolve([]),
    filter: () => Promise.resolve([]),
  },
  Review: {
    list: (order, limit) => Promise.resolve([]),
    filter: (where, order, limit) => Promise.resolve([]),
  },
};

// ── Neon entity API ───────────────────────────────────────────────────────────

const neonEntityApi = {
  State: {
    list: () => neon.fetchStates(),
    bySlug: (slug) => neon.fetchStateBySlug(slug),
  },
  Category: {
    list: () => neon.fetchCategories(),
  },
  Company: {
    list: (order, limit) => neon.fetchCompanies({}, order, limit),
    filter: async (where, order, limit) => {
      if (where?.id != null) {
        const one = await neon.fetchCompanyByIdAny(where.id);
        return one ? [one] : [];
      }
      return neon.fetchCompanies(where || {}, order, limit);
    },
    filterByCategory: (slug, order, limit) =>
      neon.fetchCompaniesByCategoryAndState(slug, null, order, limit),
    filterByCategoryAndState: (categorySlug, stateSlug, order, limit) =>
      neon.fetchCompaniesByCategoryAndState(categorySlug, stateSlug, order, limit),
    create: (data, categoryIds = []) => neon.createCompany(data, categoryIds),
  },
  CompanyCategory: {
    list: () => neon.fetchCompanyCategories({}),
    filter: (where) => neon.fetchCompanyCategories(where),
  },
  Review: {
    list: (order, limit) => neon.fetchReviews({ approved: true }, order, limit),
    filter: (where, order, limit) => neon.fetchReviews(where || { approved: true }, order, limit),
  },
};

const hasNeon = () => !!process.env.DATABASE_URL;
const entityApi = hasNeon() ? neonEntityApi : mockEntityApi;

// ── Listing request (List Your Company form) ──────────────────────────────────

export async function submitListingRequest(data) {
  const res = await fetch('/api/listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_name:  data.name || data.company_name,
      contact_email: data.email,
      contact_phone: data.phone || '',
      website:       data.website || '',
      hq_state:      data.hq_state || '',
      hq_city:       data.hq_city || '',
      category_slug: data.category_slug || data.category_ids?.[0] || '',
      description:   data.description || data.message || '',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Failed to submit listing');
  return json;
}

// ── Invites ───────────────────────────────────────────────────────────────────

export async function getInviteByToken(token) {
  return hasNeon() ? neon.getInviteByToken(token) : null;
}

export async function markInviteUsed(inviteId, companyId) {
  if (hasNeon()) return neon.markInviteUsed(inviteId, companyId);
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const api = {
  entities: entityApi,
  submitListingRequest,
  getInviteByToken,
  markInviteUsed,
  hasNeon,
  // NavigationTracker calls this; no-op since we have no analytics table
  appLogs: { logUserInApp: () => Promise.resolve() },
};
