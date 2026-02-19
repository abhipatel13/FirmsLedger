#!/usr/bin/env node
/**
 * Seed Base44 entities from CSV exports.
 * Requires: NEXT_PUBLIC_BASE44_APP_ID, NEXT_PUBLIC_BASE44_APP_BASE_URL (in .env.local or env).
 *
 * Usage:
 *   npm run seed
 *   node --env-file=.env.local scripts/seed-base44.mjs   (Node 20+)
 *   node scripts/seed-base44.mjs   (after loading .env.local yourself)
 */

import { createClient } from '@base44/sdk';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = parseRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj = {};
    header.forEach((key, j) => {
      let val = values[j];
      if (val === undefined) val = '';
      obj[key] = val;
    });
    rows.push(obj);
  }
  return rows;
}

function parseRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function readCSV(name) {
  const path = join(ROOT, `${name}_export.csv`);
  if (!existsSync(path)) {
    console.warn(`Missing ${path}, skipping.`);
    return [];
  }
  return parseCSV(readFileSync(path, 'utf-8'));
}

function toBool(v) {
  if (v === true || v === false) return v;
  return String(v).toLowerCase() === 'true';
}

function toNum(v) {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string' || !v.trim()) return undefined;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

// Build payload for Category: only entity fields, no system columns
function toCategoryPayload(row) {
  const p = {
    name: row.name,
    slug: row.slug,
  };
  if (row.parent_id) p.parent_id = row.parent_id;
  if (row.icon) p.icon = row.icon;
  if (row.description) p.description = row.description;
  if (row.is_parent !== undefined) p.is_parent = toBool(row.is_parent);
  if (row.order !== undefined && row.order !== '') p.order = toNum(row.order) ?? 0;
  if (row.id) p.id = row.id;
  return p;
}

function toAgencyPayload(row) {
  const p = {
    name: row.name,
    slug: row.slug,
  };
  const optional = {
    website: (v) => v,
    description: (v) => v,
    logo_url: (v) => v,
    team_size: (v) => v,
    hq_country: (v) => v,
    hq_state: (v) => v,
    hq_city: (v) => v,
    pricing_model: (v) => v,
    min_project_size: (v) => v,
    founded_year: toNum,
    avg_rating: toNum,
    review_count: toNum,
    verified: toBool,
    featured: toBool,
    approved: toBool,
    remote_support: toBool,
    owner_user_id: (v) => v,
    services_offered: toArray,
    industries_served: toArray,
  };
  for (const [key, fn] of Object.entries(optional)) {
    if (row[key] !== undefined && row[key] !== '') {
      const val = fn(row[key]);
      if (val !== undefined) p[key] = val;
    }
  }
  if (row.id) p.id = row.id;
  return p;
}

function toAgencyCategoryPayload(row) {
  const p = { agency_id: row.agency_id, category_id: row.category_id };
  if (row.id) p.id = row.id;
  return p;
}

function toReviewPayload(row) {
  const p = {
    agency_id: row.agency_id,
    user_id: row.user_id,
    rating_overall: toNum(row.rating_overall),
    title: row.title,
    body: row.body,
  };
  const optional = {
    rating_quality: toNum,
    rating_communication: toNum,
    rating_value: toNum,
    rating_timeliness: toNum,
    work_duration: (v) => v,
    role_hired: (v) => v,
    company_name: (v) => v,
    verified: toBool,
    approved: toBool,
    agency_response: (v) => v,
    agency_response_date: (v) => v,
  };
  for (const [key, fn] of Object.entries(optional)) {
    if (row[key] !== undefined && row[key] !== '') {
      const val = fn(row[key]);
      if (val !== undefined) p[key] = val;
    }
  }
  if (row.id) p.id = row.id;
  return p;
}

function toLeadPayload(row) {
  const p = {
    role: row.role,
    number_of_hires: toNum(row.number_of_hires) ?? 1,
    timeline: row.timeline,
  };
  const optional = {
    user_id: (v) => v,
    company_name: (v) => v,
    contact_email: (v) => v,
    contact_phone: (v) => v,
    budget_range: (v) => v,
    country: (v) => v,
    state: (v) => v,
    city: (v) => v,
    remote_allowed: toBool,
    description: (v) => v,
    status: (v) => v,
    agencies_contacted: toArray,
  };
  for (const [key, fn] of Object.entries(optional)) {
    if (row[key] !== undefined && row[key] !== '') {
      const val = fn(row[key]);
      if (val !== undefined) p[key] = val;
    }
  }
  if (row.id) p.id = row.id;
  return p;
}

// Load .env.local if present and vars not set (Node < 20)
function loadEnvLocal() {
  const path = join(ROOT, '.env.local');
  if (existsSync(path) && !process.env.NEXT_PUBLIC_BASE44_APP_ID) {
    const content = readFileSync(path, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

// REST API client using api_key header (https://app.base44.com/api/apps/{appId}/entities/...)
async function restCreate(appId, apiKey, entityName, payload) {
  const url = `https://app.base44.com/api/apps/${appId}/entities/${entityName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function main() {
  loadEnvLocal();
  const appId = process.env.NEXT_PUBLIC_BASE44_APP_ID;
  const appBaseUrl = process.env.NEXT_PUBLIC_BASE44_APP_BASE_URL || 'https://app.base44.com';
  const token = process.env.BASE44_ACCESS_TOKEN || process.env.NEXT_PUBLIC_BASE44_ACCESS_TOKEN || '';
  const apiKey = process.env.BASE44_API_KEY || token;

  if (!appId) {
    console.error('Set NEXT_PUBLIC_BASE44_APP_ID (e.g. in .env.local).');
    process.exit(1);
  }

  const useRestApi = Boolean(apiKey);
  let base44 = null;
  if (!useRestApi) {
    try {
      base44 = createClient({
        appId,
        token,
        serverUrl: '',
        requiresAuth: false,
        appBaseUrl,
        functionsVersion: process.env.NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION,
      });
    } catch (e) {
      console.error('Set BASE44_API_KEY in .env.local for REST API seeding, or configure SDK auth.');
      process.exit(1);
    }
  }

  const delayMs = Number(process.env.SEED_DELAY_MS) || 200; // avoid 429 rate limit
  const delay = () => new Promise((r) => setTimeout(r, delayMs));

  const createEntity = useRestApi
    ? async (entityName, payload) => {
        const out = await restCreate(appId, apiKey, entityName, payload);
        await delay();
        return out;
      }
    : async (entityName, payload) => {
        const entity = base44.entities[entityName];
        if (!entity || typeof entity.create !== 'function') throw new Error(`No entity ${entityName}`);
        const out = await entity.create(payload);
        await delay();
        return out;
      };

  const categories = readCSV('Category');
  const agencies = readCSV('Agency');
  const agencyCategories = readCSV('AgencyCategory');
  const reviews = readCSV('Review');
  const leads = readCSV('Lead');

  console.log('Seeding: Categories=%d, Agencies=%d, AgencyCategories=%d, Reviews=%d, Leads=%d',
    categories.length, agencies.length, agencyCategories.length, reviews.length, leads.length);

  // 1. Categories
  for (const row of categories) {
    try {
      const payload = toCategoryPayload(row);
      await createEntity('Category', payload);
      console.log('  Category:', payload.slug || payload.name);
    } catch (e) {
      console.warn('  Category skip:', row.slug || row.name, e.message || e);
    }
  }

  // 2. Agencies
  for (const row of agencies) {
    try {
      const payload = toAgencyPayload(row);
      await createEntity('Agency', payload);
      console.log('  Agency:', payload.slug || payload.name);
    } catch (e) {
      console.warn('  Agency skip:', row.slug || row.name, e.message || e);
    }
  }

  // 3. AgencyCategory
  for (const row of agencyCategories) {
    try {
      const payload = toAgencyCategoryPayload(row);
      await createEntity('AgencyCategory', payload);
    } catch (e) {
      console.warn('  AgencyCategory skip:', row.id, e.message || e);
    }
  }

  // 4. Reviews
  for (const row of reviews) {
    try {
      const payload = toReviewPayload(row);
      await createEntity('Review', payload);
    } catch (e) {
      console.warn('  Review skip:', row.id, e.message || e);
    }
  }

  // 5. Leads
  for (const row of leads) {
    try {
      const payload = toLeadPayload(row);
      await createEntity('Lead', payload);
    } catch (e) {
      console.warn('  Lead skip:', row.id, e.message || e);
    }
  }

  console.log('Seed finished.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
