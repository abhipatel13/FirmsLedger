import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { companies, categories, company_categories, states } from '@/db/schema';
import { eq, and, ilike, or, inArray } from 'drizzle-orm';
import { searchTokens } from '@/lib/searchIntent';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q            = (searchParams.get('q') || '').trim();
  const categorySlug  = (searchParams.get('category') || '').trim();
  const stateSlug     = (searchParams.get('state') || '').trim();

  // Need at least a real text query or one filter — otherwise there's nothing to search on.
  const hasQuery  = q.length >= 2;
  const hasFilter = !!categorySlug || !!stateSlug;
  if (!hasQuery && !hasFilter) {
    return NextResponse.json([]);
  }

  const conditions = [eq(companies.approved, true)];

  if (hasQuery) {
    // Match each significant word separately instead of the whole phrase as one
    // literal substring — "cnc machines in california" has to match a company
    // whose name says "Machining" and whose state says "California", which no
    // single contiguous %pattern% ever could. Words are stemmed so machines /
    // machine / machining all match, and stopwords are dropped so "in" is not
    // required to appear anywhere.
    const tokens = searchTokens(q);
    if (!tokens.length && !hasFilter) return NextResponse.json([]);

    for (const token of tokens) {
      const pattern = `%${token}%`;
      conditions.push(
        or(
          ilike(companies.name, pattern),
          ilike(companies.description, pattern),
          ilike(companies.hq_city, pattern),
          ilike(companies.hq_state_label, pattern),
        )
      );
    }
  }

  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id, is_parent: categories.is_parent })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);

    if (!cat) return NextResponse.json([]);

    let categoryIds = [cat.id];
    if (cat.is_parent) {
      const subs = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parent_id, cat.id));
      categoryIds.push(...subs.map((s) => s.id));
    }

    const links = await db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    if (!links.length) return NextResponse.json([]);
    conditions.push(inArray(companies.id, [...new Set(links.map((l) => l.company_id))]));
  }

  if (stateSlug) {
    const [state] = await db
      .select({ id: states.id })
      .from(states)
      .where(eq(states.slug, stateSlug))
      .limit(1);

    if (!state) return NextResponse.json([]);
    conditions.push(eq(companies.hq_state_id, state.id));
  }

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
    .where(and(...conditions))
    .limit(50);

  return NextResponse.json(results);
}
