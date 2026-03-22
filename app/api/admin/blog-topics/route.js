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

/** GET /api/admin/blog-topics — list all topics with status */
export async function GET() {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('blog_topics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/admin/blog-topics — add one or more prompts to the queue */
export async function POST(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const body = await request.json();

  // Accept either { prompt: string } or { prompts: string[] }
  const prompts = body.prompts
    ? body.prompts.filter(Boolean)
    : body.prompt
    ? [body.prompt]
    : [];

  if (prompts.length === 0) {
    return NextResponse.json({ error: 'prompt or prompts array is required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const rows = prompts.map((p) => ({ prompt: p.trim(), status: 'pending' }));
  const { data, error } = await supabase.from('blog_topics').insert(rows).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, inserted: data });
}

/** DELETE /api/admin/blog-topics?id=uuid — remove a topic */
export async function DELETE(request) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) return NextResponse.json({ error: 'Admin login required' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getServiceSupabase();

  // Nullify blog_posts.topic_id first to avoid FK constraint violation
  await supabase.from('blog_posts').update({ topic_id: null }).eq('topic_id', id);

  const { error } = await supabase.from('blog_topics').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
