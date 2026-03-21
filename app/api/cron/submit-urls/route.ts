/**
 * GET /api/cron/submit-urls
 *
 * Module 3 — Auto URL Submission
 * Runs at 09:00 UTC daily (configured in vercel.json).
 *
 * Finds recently published blog URLs not yet submitted,
 * then submits them to Google, Bing, and ping services.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUnsubmittedUrls } from '@/lib/automation/topicsManager';
import { submitUrls } from '@/lib/automation/urlSubmitter';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ── Find unsubmitted URLs ─────────────────────────────────────────────
    const urls = await getUnsubmittedUrls(20);

    if (urls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new URLs to submit',
        submitted: 0,
      });
    }

    // ── Submit to all platforms ───────────────────────────────────────────
    const summary = await submitUrls(urls);

    // Summarise per-platform success counts
    const platformStats: Record<string, { success: number; failed: number; skipped: number }> = {};
    for (const { results } of summary) {
      for (const r of results) {
        if (!platformStats[r.platform]) {
          platformStats[r.platform] = { success: 0, failed: 0, skipped: 0 };
        }
        platformStats[r.platform][r.status]++;
      }
    }

    return NextResponse.json({
      success: true,
      submitted: urls.length,
      urls,
      platformStats,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[submit-urls] Cron fatal error:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
