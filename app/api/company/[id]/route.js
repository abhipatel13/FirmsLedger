import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getUserFromCookie } from '@/lib/user-auth';
import {
  fetchCompanyForOwner,
  setCompanyCategories,
  fetchStateSlugForCompany,
  updateCompany,
} from '@/db/neonApi';

// Editable profile fields, with their caps. An allowlist, not a denylist:
// `approved`, `is_verified`, `featured`, `slug`, `name`, `avg_rating` and
// `review_count` are editorial or derived, so an owner must never set them by
// posting extra keys.
const TEXT_FIELDS = {
  description: 4000,
  address: 300,
  hq_city: 120,
  phone: 40,
  website: 300,
  contact_email: 320,
  linkedin_url: 300,
  employee_count: 40,
};

const ARRAY_FIELDS = ['certifications', 'products', 'industries_served', 'capabilities'];
const MAX_ARRAY_ITEMS = 30;
const MAX_ARRAY_ITEM_LEN = 120;

const isHttpUrl = (v) => /^https?:\/\/\S+$/i.test(v);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function buildPatch(body) {
  const patch = {};
  const errors = [];

  for (const [field, max] of Object.entries(TEXT_FIELDS)) {
    if (!(field in body)) continue;
    const raw = body[field];
    if (raw !== null && typeof raw !== 'string') {
      errors.push(`${field} must be text`);
      continue;
    }
    const value = (raw ?? '').trim().slice(0, max);
    if (value && (field === 'website' || field === 'linkedin_url') && !isHttpUrl(value)) {
      errors.push(`${field} must start with http:// or https://`);
      continue;
    }
    if (value && field === 'contact_email' && !isEmail(value)) {
      errors.push('contact_email must be a valid email address');
      continue;
    }
    patch[field] = value || null;
  }

  for (const field of ARRAY_FIELDS) {
    if (!(field in body)) continue;
    const raw = body[field];
    if (raw === null) { patch[field] = null; continue; }
    if (!Array.isArray(raw)) { errors.push(`${field} must be a list`); continue; }
    const items = [...new Set(
      raw.filter((v) => typeof v === 'string')
         .map((v) => v.trim().slice(0, MAX_ARRAY_ITEM_LEN))
         .filter(Boolean)
    )].slice(0, MAX_ARRAY_ITEMS);
    patch[field] = items.length ? items : null;
  }

  return { patch, errors };
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

    const { id } = await params;

    // Ownership is re-checked here on every write. The client tells us WHICH
    // company, never WHETHER it may edit it. A company the account does not own
    // is indistinguishable from one that does not exist.
    const company = await fetchCompanyForOwner(id, user.id);
    if (!company) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { patch, errors } = buildPatch(body);

    let categoryIds = null;
    if ('category_ids' in body) {
      if (!Array.isArray(body.category_ids)) {
        errors.push('category_ids must be a list');
      } else if (body.category_ids.length === 0) {
        errors.push('Select at least one category.');
      } else {
        categoryIds = body.category_ids;
      }
    }

    if (errors.length) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }
    if (!Object.keys(patch).length && !categoryIds) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    if (Object.keys(patch).length) {
      patch.updated_at = new Date();
      await updateCompany(company.id, patch);
    }

    let changedCategorySlugs = [];
    if (categoryIds) {
      changedCategorySlugs = await setCompanyCategories(company.id, categoryIds);
    }

    // Company pages are `revalidate = false` (see app/company/[slug]/page.jsx),
    // so freshness normally only comes from a rebuild. On-demand revalidation
    // is what makes an owner's edit visible without waiting for a deploy —
    // without this the save appears to do nothing.
    const revalidated = [`/company/${company.slug}`];
    revalidatePath(`/company/${company.slug}`);

    // Listing pages render the description and the company's category
    // membership, so they go stale too.
    if (changedCategorySlugs.length) {
      const stateSlug = await fetchStateSlugForCompany(company.id);
      for (const slug of changedCategorySlugs) {
        revalidatePath(`/${slug}`);
        revalidated.push(`/${slug}`);
        if (stateSlug) {
          revalidatePath(`/${slug}/${stateSlug}`);
          revalidated.push(`/${slug}/${stateSlug}`);
        }
      }
    }

    return NextResponse.json({ success: true, revalidated });
  } catch (err) {
    console.error('[company PATCH] Error:', err);
    return NextResponse.json({ error: 'Could not save your changes.' }, { status: 500 });
  }
}
