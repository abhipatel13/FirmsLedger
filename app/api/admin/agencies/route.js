import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAdminFromCookie } from '@/lib/admin-auth';
import { db } from '@/db/client';
import { companies } from '@/db/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

async function requireAdmin() {
  const admin = await getAdminFromCookie();
  return admin || null;
}

/**
 * GET /api/admin/agencies?status=all|pending|approved&q=&limit=
 *
 * Filtering and searching happen in SQL. This used to return EVERY company —
 * 12,804 rows x 13 columns on every page load — and the page then filtered them
 * in the browser, which meant there was no way to list the ~3,678 unapproved
 * ones without scrolling the entire table.
 */
const MAX_LIMIT = 500;

export async function GET(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all').trim();
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(Number(searchParams.get('limit')) || 200, MAX_LIMIT);

    const conditions = [];
    if (status === 'pending')  conditions.push(sql`${companies.approved} IS NOT TRUE`);
    if (status === 'approved') conditions.push(eq(companies.approved, true));
    if (status === 'verified') conditions.push(eq(companies.is_verified, true));
    if (status === 'featured') conditions.push(eq(companies.featured, true));
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(or(
        ilike(companies.name, pattern),
        ilike(companies.contact_email, pattern),
        ilike(companies.hq_city, pattern),
      ));
    }

    // Counts come from one aggregate query rather than from the length of a
    // fully-materialised list, so they stay correct under a LIMIT.
    const [countRow] = await db.select({
      total:    sql`count(*)::int`,
      approved: sql`count(*) FILTER (WHERE ${companies.approved})::int`,
      pending:  sql`count(*) FILTER (WHERE ${companies.approved} IS NOT TRUE)::int`,
      verified: sql`count(*) FILTER (WHERE ${companies.is_verified})::int`,
      featured: sql`count(*) FILTER (WHERE ${companies.featured})::int`,
    }).from(companies);

    const rows = await db
      .select({
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        contact_email: companies.contact_email,
        website: companies.website,
        hq_city: companies.hq_city,
        hq_state_label: companies.hq_state_label,
        approved: companies.approved,
        is_verified: companies.is_verified,
        featured: companies.featured,
        avg_rating: companies.avg_rating,
        review_count: companies.review_count,
        created_at: companies.created_at,
      })
      .from(companies)
      .where(conditions.length ? and(...conditions) : undefined)
      // Unapproved listings are the queue, so newest-first is what a reviewer
      // wants. asc(id) is not needed: created_at is effectively unique here and
      // this list is not paginated.
      .orderBy(desc(companies.created_at))
      .limit(limit);

    return NextResponse.json({
      data: rows,
      counts: {
        total: Number(countRow?.total ?? 0),
        approved: Number(countRow?.approved ?? 0),
        pending: Number(countRow?.pending ?? 0),
        verified: Number(countRow?.verified ?? 0),
        featured: Number(countRow?.featured ?? 0),
      },
      truncated: rows.length >= limit,
      limit,
    });
  } catch (err) {
    console.error('GET /api/admin/agencies error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/admin/agencies — create a new company
export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, contact_email, website, logo_url, description,
      hq_city, hq_state, hq_state_label, employee_count, founded_year,
      certifications, approved, is_verified, featured } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const [row] = await db.insert(companies).values({
      name: name.trim(),
      slug: slugify(name),
      contact_email: contact_email?.trim() || null,
      website: website?.trim() || null,
      logo_url: logo_url?.trim() || null,
      description: description?.trim() || null,
      hq_city: hq_city?.trim() || null,
      hq_state_label: hq_state_label?.trim() || hq_state?.trim() || null,
      employee_count: employee_count?.trim() || null,
      founded_year: founded_year ? parseInt(founded_year, 10) : null,
      certifications: Array.isArray(certifications) ? certifications.filter(Boolean) : [],
      approved: approved === true || approved === 'true',
      is_verified: is_verified === true || is_verified === 'true',
      featured: featured === true || featured === 'true',
    }).returning();

    revalidateTag('companies');
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/agencies error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT /api/admin/agencies — full company update
export async function PUT(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, name, contact_email, website, logo_url, description,
      hq_city, hq_state, hq_state_label, employee_count, founded_year,
      certifications, approved, is_verified, featured } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

    const [row] = await db.update(companies).set({
      name: name.trim(),
      slug: slugify(name),
      contact_email: contact_email?.trim() || null,
      website: website?.trim() || null,
      logo_url: logo_url?.trim() || null,
      description: description?.trim() || null,
      hq_city: hq_city?.trim() || null,
      hq_state_label: hq_state_label?.trim() || hq_state?.trim() || null,
      employee_count: employee_count?.trim() || null,
      founded_year: founded_year ? parseInt(founded_year, 10) : null,
      certifications: Array.isArray(certifications) ? certifications.filter(Boolean) : [],
      approved: approved === true || approved === 'true',
      is_verified: is_verified === true || is_verified === 'true',
      featured: featured === true || featured === 'true',
      updated_at: new Date(),
    }).where(eq(companies.id, id)).returning();

    revalidateTag('companies');
    return NextResponse.json(row);
  } catch (err) {
    console.error('PUT /api/admin/agencies error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

// PATCH /api/admin/agencies — toggle approved/is_verified/featured or delete
export async function PATCH(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, action, ...fields } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (action === 'delete') {
      await db.delete(companies).where(eq(companies.id, id));
      revalidateTag('companies');
      return NextResponse.json({ ok: true });
    }

    const allowed = ['approved', 'is_verified', 'featured'];
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const [row] = await db.update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning({ id: companies.id, name: companies.name, approved: companies.approved, is_verified: companies.is_verified, featured: companies.featured });

    revalidateTag('companies');
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
