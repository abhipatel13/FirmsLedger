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

// PATCH /api/admin/categories/[id] — update a category
export async function PATCH(request, { params }) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await request.json();
    const { name, slug, description, icon, order, parent_id } = body;

    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof slug === 'string' && slug.trim()) updates.slug = slug.trim();
    else if (typeof name === 'string' && !slug) updates.slug = slugify(name);
    if (description !== undefined) updates.description = description?.trim() || null;
    if (icon !== undefined) updates.icon = icon?.trim() || null;
    if (order !== undefined && Number.isFinite(+order)) updates.order = +order;
    if (parent_id !== undefined) {
      updates.parent_id = parent_id || null;
      updates.is_parent = !parent_id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { data, error } = await db()
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('PATCH /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(_request, { params }) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Block delete if category has children
    const { count: childCount, error: countErr } = await db()
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);
    if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });
    if ((childCount || 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${childCount} subcategories depend on this. Delete or reassign them first.` },
        { status: 409 }
      );
    }

    const { error } = await db().from('categories').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
