import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { companies } from '@/db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const pattern = `%${q}%`;

  const results = await db
    .select({
      slug: companies.slug,
      name: companies.name,
      description: companies.description,
      hq_city: companies.hq_city,
      hq_state_label: companies.hq_state_label,
      avg_rating: companies.avg_rating,
      review_count: companies.review_count,
      logo_url: companies.logo_url,
      is_verified: companies.is_verified,
    })
    .from(companies)
    .where(
      and(
        eq(companies.approved, true),
        or(
          ilike(companies.name, pattern),
          ilike(companies.description, pattern),
          ilike(companies.hq_city, pattern),
        )
      )
    )
    .limit(30);

  return NextResponse.json(results);
}
