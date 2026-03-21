import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

/** GET /api/admin/blog-posts — list all AI-generated posts */
export async function GET() {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, category, read_time, published, indexed_at, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

/** PATCH /api/admin/blog-posts — toggle published or update fields */
export async function PATCH(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE /api/admin/blog-posts?id=uuid */
export async function DELETE(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
