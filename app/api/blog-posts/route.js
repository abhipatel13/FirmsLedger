import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** GET /api/blog-posts — public list of published AI-generated posts */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category, read_time, meta_description, image_url, image_alt, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
