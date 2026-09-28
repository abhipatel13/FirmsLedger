import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { submission_logs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await db
      .select({
        id: submission_logs.id,
        url: submission_logs.url,
        platform: submission_logs.platform,
        status: submission_logs.status,
        response: submission_logs.response,
        submitted_at: submission_logs.submitted_at,
      })
      .from(submission_logs)
      .orderBy(desc(submission_logs.submitted_at))
      .limit(200);

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

    const { getUnsubmittedUrls } = await import('@/db/neonApi');
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
