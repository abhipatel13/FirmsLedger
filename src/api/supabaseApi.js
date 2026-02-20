/**
 * Supabase-backed API. Same interface as mock apiClient for Category, Agency, AgencyCategory, Review, Lead.
 * DB columns are snake_case; we return them as-is so the app (which uses snake_case) works without changes.
 */
import { supabase } from '@/lib/supabase';

function toCamelCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      return [camel, toCamelCase(v)];
    })
  );
}

function toSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const snake = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
      return [snake, v];
    })
  );
}

function mapOrder(orderKey) {
  if (!orderKey || typeof orderKey !== 'string') return { column: 'created_at', ascending: false };
  const desc = orderKey.startsWith('-');
  const column = desc ? orderKey.slice(1) : orderKey;
  const dbColumn = column.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  return { column: dbColumn, ascending: !desc };
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchAgencies(where = {}, orderKey = '-avg_rating', limit) {
  let q = supabase.from('agencies').select('*').eq('approved', true);
  Object.entries(where).forEach(([k, v]) => {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (v === true || v === false) q = q.eq(col, v);
    else if (v != null && v !== '') q = q.eq(col, v);
  });
  const { column, ascending } = mapOrder(orderKey);
  q = q.order(column, { ascending });
  if (typeof limit === 'number') q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchAgencyById(id) {
  const { data, error } = await supabase.from('agencies').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchAgencyCategories(where = {}) {
  let q = supabase.from('agency_categories').select('*');
  Object.entries(where).forEach(([k, v]) => {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (v != null && v !== '') q = q.eq(col, v);
  });
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchReviews(where = {}, orderKey = '-created_date', limit) {
  let q = supabase.from('reviews').select('*');
  Object.entries(where).forEach(([k, v]) => {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (v === true || v === false) q = q.eq(col, v);
    else if (v != null && v !== '') q = q.eq(col, v);
  });
  const { column, ascending } = mapOrder(orderKey);
  q = q.order(column, { ascending });
  if (typeof limit === 'number') q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchLeads(where = {}, orderKey, limit) {
  let q = supabase.from('leads').select('*');
  Object.entries(where).forEach(([k, v]) => {
    const col = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (v != null && v !== '') q = q.eq(col, v);
  });
  if (orderKey) {
    const { column, ascending } = mapOrder(orderKey);
    q = q.order(column, { ascending });
  }
  if (typeof limit === 'number') q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export async function createAgency(payload, categoryIds = []) {
  const row = toSnakeCase({ ...payload });
  if (!row.slug && row.name) row.slug = slugify(row.name);
  row.approved = false;
  const { data, error } = await supabase.from('agencies').insert(row).select('*').single();
  if (error) throw error;
  for (const categoryId of categoryIds) {
    if (categoryId) await createAgencyCategory(data.id, categoryId);
  }
  return data;
}

export async function createAgencyCategory(agencyId, categoryId) {
  const { data, error } = await supabase.from('agency_categories').insert({ agency_id: agencyId, category_id: categoryId }).select('*').single();
  if (error) throw error;
  return data;
}

export async function createLead(payload) {
  const row = toSnakeCase(payload);
  const { data, error } = await supabase.from('leads').insert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function getInviteByToken(token) {
  const { data, error } = await supabase
    .from('company_invites')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function markInviteUsed(inviteId, agencyId) {
  const { error } = await supabase
    .from('company_invites')
    .update({ used_at: new Date().toISOString(), agency_id: agencyId })
    .eq('id', inviteId);
  if (error) throw error;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Single agency by id or slug (for profile page; RLS allows if approved)
export async function fetchAgencyByIdAny(id) {
  if (!id) return null;
  const { data: byId, error: errId } = await supabase.from('agencies').select('*').eq('id', id).eq('approved', true).maybeSingle();
  if (errId) throw errId;
  if (byId) return byId;
  if (UUID_REGEX.test(String(id))) return null;
  const { data: bySlug, error: errSlug } = await supabase.from('agencies').select('*').eq('slug', id).eq('approved', true).maybeSingle();
  if (errSlug) throw errSlug;
  return bySlug ?? null;
}
