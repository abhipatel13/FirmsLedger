/**
 * GET /api/admin/seo-audit
 *
 * Returns SEO audit data for the admin dashboard:
 * - latest: one row per page_url (most recent audit)
 * - trend:  all audits in the last 7 days (for line chart)
 *
 * Security: requires admin cookie OR CRON_SECRET header
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDailySeoAudit } from '@/lib/automation/seoAuditor';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Accept admin cookie OR cron secret (to let the cron trigger a fresh audit)
  const cronSecret = request.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = getServiceSupabase();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Latest audit per page (using a window-function-style query) ─────────
  // Supabase doesn't support DISTINCT ON via the JS client, so we fetch
  // recent audits ordered by date and deduplicate in JS.
  const { data: allRecent, error: recentErr } = await supabase
    .from('seo_audits')
    .select('id, page_url, score, issues, checks, audited_at')
    .gte('audited_at', since7d)
    .order('audited_at', { ascending: false })
    .limit(500);

  if (recentErr) {
    return NextResponse.json({ error: recentErr.message }, { status: 500 });
  }

  // Deduplicate: keep only the most-recent record per page_url
  const latestMap = new Map<string, (typeof allRecent)[0]>();
  for (const row of allRecent ?? []) {
    if (!latestMap.has(row.page_url)) {
      latestMap.set(row.page_url, row);
    }
  }
  const latest = Array.from(latestMap.values()).sort((a, b) => a.score - b.score);

  // ── 7-day trend (score per page per day) ─────────────────────────────────
  // Group by (page_url, date) — average score per page per day
  const trendMap = new Map<string, { date: string; scores: number[] }>();

  for (const row of allRecent ?? []) {
    const date = row.audited_at.slice(0, 10); // "YYYY-MM-DD"
    const key = `${row.page_url}__${date}`;
    if (!trendMap.has(key)) trendMap.set(key, { date, scores: [] });
    trendMap.get(key)!.scores.push(row.score);
  }

  // Build daily average-score series per page
  const trendByPage = new Map<string, { date: string; score: number }[]>();
  for (const [key, { date, scores }] of trendMap.entries()) {
    const pageUrl = key.split('__')[0];
    if (!trendByPage.has(pageUrl)) trendByPage.set(pageUrl, []);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    trendByPage.get(pageUrl)!.push({ date, score: avg });
  }

  // Build a simple overall daily average (for the summary chart)
  const dailyAvgMap = new Map<string, number[]>();
  for (const { date, scores } of trendMap.values()) {
    if (!dailyAvgMap.has(date)) dailyAvgMap.set(date, []);
    dailyAvgMap.get(date)!.push(...scores);
  }
  const overallTrend = Array.from(dailyAvgMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, scores]) => ({
      date,
      avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    }));

  return NextResponse.json({
    latest,
    overallTrend,
    trendByPage: Object.fromEntries(trendByPage),
    summary: {
      total: latest.length,
      green: latest.filter((r) => r.score >= 80).length,
      yellow: latest.filter((r) => r.score >= 60 && r.score < 80).length,
      red: latest.filter((r) => r.score < 60).length,
      avgScore:
        latest.length > 0
          ? Math.round(
              latest.reduce((s, r) => s + r.score, 0) / latest.length
            )
          : 0,
    },
  });
}

// POST /api/admin/seo-audit — manually trigger a fresh audit run
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await runDailySeoAudit();
    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[seo-audit] Manual trigger error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
