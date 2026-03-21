/**
 * GET /api/cron/seo-audit
 *
 * Module 2 — Daily SEO Audit
 * Runs at 08:00 UTC daily (configured in vercel.json).
 *
 * Audits the top 20 pages for SEO health using 10 checks each,
 * stores results in Supabase `seo_audits`, and returns a JSON summary.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailySeoAudit } from '@/lib/automation/seoAuditor';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await runDailySeoAudit();

    return NextResponse.json({
      success: true,
      audited: summary.audited,
      skipped: summary.skipped,
      avgScore: summary.avgScore,
      needsAttention: summary.needsAttention,
      needsAttentionCount: summary.needsAttention.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[seo-audit] Cron fatal error:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
