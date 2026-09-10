/**
 * GET /api/admin/stats
 * Aggregated counts for the admin overview.
 *
 * Counts are done in SQL. The previous version SELECTed every row of
 * `companies` and `reviews` and counted them in JavaScript — ~12,800 rows over
 * the wire to produce two integers.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { companies, reviews, listing_requests, claims, categories } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

const n = (v: unknown): number => Number(v ?? 0);

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = req.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;
  if (!isValidCron) {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const admin = await getAdminFromCookie();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [companiesData, reviewsData, listingData, claimsData, categoriesData] = await Promise.all([
    safe(async () => {
      const [r] = await db.select({
        total: sql`count(*)::int`,
        pending: sql`count(*) FILTER (WHERE ${companies.approved} IS NOT TRUE)::int`,
        verified: sql`count(*) FILTER (WHERE ${companies.is_verified})::int`,
      }).from(companies);
      return { total: n(r?.total), pending: n(r?.pending), verified: n(r?.verified) };
    }, { total: 0, pending: 0, verified: 0 }),

    safe(async () => {
      const [r] = await db.select({
        total: sql`count(*)::int`,
        pending: sql`count(*) FILTER (WHERE ${reviews.approved} IS NOT TRUE)::int`,
      }).from(reviews);
      return { total: n(r?.total), pending: n(r?.pending) };
    }, { total: 0, pending: 0 }),

    safe(async () => {
      const [r] = await db.select({
        total: sql`count(*)::int`,
        pending: sql`count(*) FILTER (WHERE ${listing_requests.status} = 'pending')::int`,
      }).from(listing_requests);
      return { total: n(r?.total), pending: n(r?.pending) };
    }, { total: 0, pending: 0 }),

    safe(async () => {
      const [r] = await db.select({
        total: sql`count(*)::int`,
        pending: sql`count(*) FILTER (WHERE ${claims.status} = 'pending')::int`,
        approved: sql`count(*) FILTER (WHERE ${claims.status} = 'approved')::int`,
      }).from(claims);
      return { total: n(r?.total), pending: n(r?.pending), approved: n(r?.approved) };
    }, { total: 0, pending: 0, approved: 0 }),

    safe(async () => {
      const [r] = await db.select({ total: sql`count(*)::int` }).from(categories);
      return { total: n(r?.total) };
    }, { total: 0 }),
  ]);

  return NextResponse.json({
    companies: companiesData,
    reviews: reviewsData,
    listingRequests: listingData,
    claims: claimsData,
    categories: categoriesData,
  });
}
