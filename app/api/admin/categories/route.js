import { NextResponse } from 'next/server';
import { getAdminFromCookie } from '@/lib/admin-auth';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

async function requireAdmin() {
  const admin = await getAdminFromCookie();
  return admin || null;
}

// GET /api/admin/categories
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/admin/categories error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/admin/categories — create a category
export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, slug, description, icon, order, parent_id } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [row] = await db.insert(categories).values({
      name: name.trim(),
      slug: slug?.trim() || slugify(name),
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      order: Number.isFinite(+order) ? +order : 0,
      parent_id: parent_id || null,
      is_parent: !parent_id,
    }).returning();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
