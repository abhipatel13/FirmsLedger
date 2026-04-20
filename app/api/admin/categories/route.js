import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function db() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) return null;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return admin;
}

// GET /api/admin/categories — list all categories (parents + subs)
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data, error } = await db()
      .from('categories')
      .select('id, parent_id, name, slug, description, icon, "order", is_parent, created_at')
      .order('order', { ascending: true })
      .order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
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

    const row = {
      name: name.trim(),
      slug: (slug?.trim() || slugify(name)),
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      order: Number.isFinite(+order) ? +order : 0,
      parent_id: parent_id || null,
      is_parent: !parent_id,
    };

    const { data, error } = await db().from('categories').insert(row).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
