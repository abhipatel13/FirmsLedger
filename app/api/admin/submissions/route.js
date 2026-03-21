import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET(request) {
  try {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('submission_logs')
      .select('id, url, platform, status, response, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[submissions] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error('[submissions] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getUnsubmittedUrls } = await import('@/lib/automation/topicsManager');
    const { submitUrls } = await import('@/lib/automation/urlSubmitter');

    const urls = await getUnsubmittedUrls(20);
    if (urls.length === 0) {
      return NextResponse.json({ success: true, submitted: 0, message: 'No new URLs to submit' });
    }

    const summary = await submitUrls(urls);
    return NextResponse.json({ success: true, submitted: urls.length, summary });
  } catch (err) {
    console.error('[submissions] Manual trigger error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
