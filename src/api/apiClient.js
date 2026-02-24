/**
 * API client: uses Supabase when NEXT_PUBLIC_SUPABASE_URL is set, otherwise in-memory mock data.
 */
import { hasSupabase } from '@/lib/supabase';
import * as db from '@/api/supabaseApi';

// Categories from Category_export.csv (fallback when no Supabase)
const mockCategories = [
  { id: '69925d108a86cc8e55f7e0f9', parent_id: '', name: 'Staffing Companies', slug: 'staffing-companies', description: 'Recruitment and staffing services', icon: 'users', order: 1, is_parent: true },
  { id: '69926debe8ad702015479f4d', parent_id: '', name: 'Healthcare Staffing', slug: 'healthcare-staffing', description: 'Healthcare and medical staffing agencies', icon: '', order: 1, is_parent: false },
  { id: '69926debe8ad702015479f4e', parent_id: '', name: 'IT Staffing', slug: 'it-staffing', description: 'Information technology staffing agencies', icon: '', order: 2, is_parent: false },
  { id: '69926debe8ad702015479f4f', parent_id: '', name: 'Temporary Staffing', slug: 'temporary-staffing', description: 'Temporary and short-term staffing solutions', icon: '', order: 3, is_parent: false },
  { id: '69926debe8ad702015479f50', parent_id: '', name: 'Permanent Staffing', slug: 'permanent-staffing', description: 'Permanent placement and hiring services', icon: '', order: 4, is_parent: false },
  { id: '69926debe8ad702015479f51', parent_id: '', name: 'Executive Search', slug: 'executive-search', description: 'Executive and leadership recruitment', icon: '', order: 5, is_parent: false },
  { id: '69926debe8ad702015479f52', parent_id: '', name: 'Remote Staffing', slug: 'remote-staffing', description: 'Remote and distributed team staffing', icon: '', order: 6, is_parent: false },
  { id: '69926debe8ad702015479f53', parent_id: '', name: 'Contract Staffing', slug: 'contract-staffing', description: 'Contract and project-based staffing', icon: '', order: 7, is_parent: false },
  { id: '69926debe8ad702015479f54', parent_id: '', name: 'HR & Recruitment Services', slug: 'hr-recruitment-services', description: 'HR outsourcing and recruitment services', icon: '', order: 8, is_parent: false },
  { id: '69926debe8ad702015479f55', parent_id: '', name: 'Technical Staffing', slug: 'technical-staffing', description: 'Technical and engineering staffing', icon: '', order: 9, is_parent: false },
  { id: '69926debe8ad702015479f56', parent_id: '', name: 'Industrial Staffing', slug: 'industrial-staffing', description: 'Industrial and manufacturing staffing', icon: '', order: 10, is_parent: false },
  { id: '699267fe6620995b461b1b2e', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Healthcare Staffing', slug: 'healthcare-staffing', description: 'Medical and healthcare professionals', icon: 'heart', order: 1, is_parent: false },
  { id: '699267fe6620995b461b1b2f', parent_id: '69925d108a86cc8e55f7e0f9', name: 'IT Staffing', slug: 'it-staffing', description: 'Technology and software staffing', icon: 'laptop', order: 2, is_parent: false },
  { id: '699267fe6620995b461b1b30', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Temporary Staffing', slug: 'temporary-staffing', description: 'Short-term and contract staffing', icon: 'clock', order: 3, is_parent: false },
  { id: '699267fe6620995b461b1b31', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Permanent Staffing', slug: 'permanent-staffing', description: 'Full-time permanent hiring', icon: 'user-check', order: 4, is_parent: false },
  { id: '699267fe6620995b461b1b32', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Executive Search', slug: 'executive-search', description: 'C-level and senior executive recruitment', icon: 'briefcase', order: 5, is_parent: false },
  { id: '699267dfc67d77e239cf41d5', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Remote Staffing', slug: 'remote-staffing', description: 'Remote and distributed team staffing', icon: 'globe', order: 9, is_parent: false },
  { id: '699267dfc67d77e239cf41d6', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Contract Staffing', slug: 'contract-staffing', description: 'Contract and project-based staffing', icon: 'file-text', order: 10, is_parent: false },
  { id: '699267dfc67d77e239cf41d7', parent_id: '69925d108a86cc8e55f7e0f9', name: 'HR & Recruitment Services', slug: 'hr-recruitment-services', description: 'HR consulting and recruitment process outsourcing', icon: 'users-2', order: 11, is_parent: false },
  { id: '699267dfc67d77e239cf41d8', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Technical Staffing', slug: 'technical-staffing', description: 'Technical and specialized staffing', icon: 'cpu', order: 12, is_parent: false },
  { id: '699267dfc67d77e239cf41d9', parent_id: '69925d108a86cc8e55f7e0f9', name: 'Industrial Staffing', slug: 'industrial-staffing', description: 'Manufacturing and industrial staffing', icon: 'factory', order: 13, is_parent: false },
];

const mockAgencies = [
  { id: 'agency-1', name: 'NextEdge Talent', slug: 'nextedge-talent', description: 'Executive search and fractional HR leadership.', website: 'https://nextedge.in', logo_url: 'https://ui-avatars.com/api/?name=NextEdge&background=4F46E5&color=fff', hq_city: 'Mumbai', hq_state: 'Maharashtra', hq_country: 'India', team_size: '1-10', approved: true, featured: true, verified: false, avg_rating: 4.5, review_count: 12 },
  { id: 'agency-2', name: 'Wisemonk', slug: 'wisemonk', description: 'Remote staffing, EOR and HR-as-a-service for startups.', website: 'https://wisemonk.io', logo_url: 'https://ui-avatars.com/api/?name=Wisemonk&background=DC2626&color=fff', hq_city: 'Bengaluru', hq_state: 'Karnataka', hq_country: 'India', team_size: '1-10', approved: true, featured: true, verified: true, avg_rating: 4.8, review_count: 8 },
  { id: 'agency-3', name: 'TalentBridge Consulting', slug: 'talentbridge-consulting', description: 'CXO and senior leadership hires for mid-sized firms.', website: 'https://talentbridge.in', logo_url: 'https://ui-avatars.com/api/?name=TalentBridge&background=2563EB&color=fff', hq_city: 'Pune', hq_state: 'Maharashtra', hq_country: 'India', team_size: '1-10', approved: true, featured: false, verified: false, avg_rating: 4.2, review_count: 5 },
];

const mockAgencyCategories = [
  { id: 'ac-1', agency_id: 'agency-1', category_id: '69926debe8ad702015479f51' }, // Executive Search
  { id: 'ac-2', agency_id: 'agency-2', category_id: '69926debe8ad702015479f52' }, // Remote Staffing
  { id: 'ac-3', agency_id: 'agency-3', category_id: '69926debe8ad702015479f51' }, // Executive Search
];

const mockReviews = [];

function filterBy(obj, where) {
  return Object.entries(where).every(([k, v]) => obj[k] === v);
}

function sortByKey(items, orderKey) {
  if (!orderKey || !items.length) return [...items];
  const desc = orderKey.startsWith('-');
  const key = desc ? orderKey.slice(1) : orderKey;
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return desc ? -1 : 1;
    if (bVal == null) return desc ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return desc ? bVal - aVal : aVal - bVal;
    const sA = String(aVal);
    const sB = String(bVal);
    return desc ? (sB < sA ? 1 : sB > sA ? -1 : 0) : (sA < sB ? -1 : sA > sB ? 1 : 0);
  });
}

const mockEntityApi = {
  Category: {
    list: () => Promise.resolve(mockCategories),
  },
  Agency: {
    list: (order, limit) => {
      let list = sortByKey(mockAgencies, order || '-avg_rating');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    filter: (where, order, limit) => {
      if (where && where.id != null) {
        const one = mockAgencies.find((a) => a.id === where.id);
        return Promise.resolve(one ? [one] : []);
      }
      let list = mockAgencies.filter((a) => filterBy(a, where));
      list = sortByKey(list, order || '-avg_rating');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    update: (id, data) => {
      const i = mockAgencies.findIndex((a) => a.id === id);
      if (i !== -1) Object.assign(mockAgencies[i], data);
      return Promise.resolve(mockAgencies[i] || { id, ...data });
    },
    delete: () => Promise.resolve(),
  },
  AgencyCategory: {
    list: () => Promise.resolve(mockAgencyCategories),
    filter: (where) => Promise.resolve(mockAgencyCategories.filter((ac) => filterBy(ac, where))),
  },
  Review: {
    list: (order, limit) => {
      let list = sortByKey(mockReviews, order || '-created_date');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    filter: (where, order, limit) => {
      let list = mockReviews.filter((r) => filterBy(r, where));
      list = sortByKey(list, order || '-created_date');
      if (typeof limit === 'number') list = list.slice(0, limit);
      return Promise.resolve(list);
    },
    update: (id, data) => Promise.resolve({ id, ...data }),
    delete: () => Promise.resolve(),
  },
  Lead: {
    filter: (where, order, limit) => Promise.resolve([]),
    create: (data) => Promise.resolve({ id: 'lead-1', ...data }),
  },
};

const supabaseEntityApi = {
  Category: {
    list: () => db.fetchCategories(),
  },
  Agency: {
    list: (order, limit) => db.fetchAgencies({ approved: true }, order, limit),
    filter: async (where, order, limit) => {
      if (where && where.id != null) {
        const one = await db.fetchAgencyByIdAny(where.id);
        return one ? [one] : [];
      }
      return db.fetchAgencies(where || { approved: true }, order, limit);
    },
    update: async () => { throw new Error('Approve agencies from Supabase Dashboard'); },
    delete: async () => { throw new Error('Delete agencies from Supabase Dashboard'); },
    create: (data, categoryIds = []) => db.createAgency(data, categoryIds),
  },
  AgencyCategory: {
    list: () => db.fetchAgencyCategories({}),
    filter: (where) => db.fetchAgencyCategories(where),
  },
  Review: {
    list: (order, limit) => db.fetchReviews({ approved: true }, order, limit),
    filter: (where, order, limit) => db.fetchReviews(where || { approved: true }, order, limit),
    update: async () => { throw new Error('Moderate reviews from Supabase Dashboard'); },
    delete: async () => { throw new Error('Delete from Supabase Dashboard'); },
  },
  Lead: {
    filter: (where, order, limit) => db.fetchLeads(where || {}, order, limit),
    create: (data) => db.createLead(data),
  },
};

const entityApi = hasSupabase() ? supabaseEntityApi : mockEntityApi;

/** Submit listing request (company adds their data). When Supabase is on, uses server API (service role) so RLS does not block the insert. */
export async function submitListingRequest(data) {
  if (hasSupabase()) {
    const res = await fetch('/api/listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        company_name: data.company_name,
        email: data.email,
        website: data.website,
        message: data.message,
        description: data.description,
        hq_city: data.hq_city,
        hq_state: data.hq_state,
        hq_country: data.hq_country || 'India',
        team_size: data.team_size,
        category_ids: data.category_ids || [],
        invite_id: data.invite_id || null,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Failed to submit listing');
    return json;
  }
  return Promise.resolve({ id: 'pending', message: 'We will contact you soon.' });
}

/** Get invite by token (for /join?token=xxx). */
export async function getInviteByToken(token) {
  return hasSupabase() ? db.getInviteByToken(token) : null;
}

/** Mark invite as used after company submits listing. */
export async function markInviteUsed(inviteId, agencyId) {
  if (hasSupabase()) return db.markInviteUsed(inviteId, agencyId);
}

export const api = {
  auth: {
    me: () => Promise.resolve(null),
    redirectToLogin: () => {},
  },
  entities: entityApi,
  appLogs: {
    logUserInApp: () => Promise.resolve(),
  },
  submitListingRequest,
  getInviteByToken,
  markInviteUsed,
  hasSupabase: () => hasSupabase(),
};
