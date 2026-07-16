/**
 * GET /api/admin/stats
 * Returns aggregated stats for the admin dashboard.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { companies, reviews, listing_requests } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = req.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;
  if (!isValidCron) {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const admin = await getAdminFromCookie();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [companiesData, reviewsData, listingData] = await Promise.all([
    safe(async () => {
      const rows = await db.select({ approved: companies.approved }).from(companies);
      const total = rows.length;
      const pending = rows.filter((r: { approved: boolean | null }) => !r.approved).length;
      return { total, pending };
    }, { total: 0, pending: 0 }),

    safe(async () => {
      const rows = await db.select({ approved: reviews.approved }).from(reviews);
      const total = rows.length;
      const pending = rows.filter((r: { approved: boolean | null }) => !r.approved).length;
      return { total, pending };
    }, { total: 0, pending: 0 }),

    safe(async () => {
      const rows = await db.select({ status: listing_requests.status }).from(listing_requests);
      const total = rows.length;
      const pending = rows.filter((r: { status: string | null }) => r.status === 'pending').length;
      return { total, pending };
    }, { total: 0, pending: 0 }),
  ]);

  return NextResponse.json({
    companies: companiesData,
    reviews: reviewsData,
    listingRequests: listingData,
  });
}
