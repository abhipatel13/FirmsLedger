import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

/**
 * GET /api/cron/daily-blog
 *
 * Called daily by Vercel Cron (configured in vercel.json).
 * Picks the oldest pending topic from blog_topics and triggers generation.
 * Secured by CRON_SECRET — Vercel passes this in the Authorization header.
 */
export async function GET(request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // Pick the oldest pending topic
  const { data: topics, error } = await supabase
    .from('blog_topics')
    .select('id, prompt')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!topics || topics.length === 0) {
    return NextResponse.json({ message: 'No pending topics in queue' });
  }

  const topic = topics[0];

  // Call the generate-blog API
  const genRes = await fetch(`${BASE_URL}/api/admin/generate-blog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': process.env.CRON_SECRET,
    },
    body: JSON.stringify({ prompt: topic.prompt, topicId: topic.id }),
  });

  const result = await genRes.json();

  if (!genRes.ok) {
    return NextResponse.json(
      { error: 'Generation failed', topic: topic.prompt, detail: result },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    topic: topic.prompt,
    slug: result.slug,
    url: result.url,
  });
}
