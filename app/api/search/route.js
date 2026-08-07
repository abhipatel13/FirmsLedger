import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { companies, categories, company_categories, states } from '@/db/schema';
import { eq, and, ilike, or, inArray } from 'drizzle-orm';
import { searchTokens } from '@/lib/searchIntent';
import { parseEmployeeCount, bucketKeyFor } from '@/lib/employeeCount';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q            = (searchParams.get('q') || '').trim();
  const categorySlug  = (searchParams.get('category') || '').trim();
  const subcategorySlug = (searchParams.get('subcategory') || '').trim();
  const stateSlug     = (searchParams.get('state') || '').trim();
  const employeesParam = (searchParams.get('employees') || '').trim();

  const categorySlugs = categorySlug ? categorySlug.split(',').filter(Boolean) : [];
  const subcategorySlugs = subcategorySlug ? subcategorySlug.split(',').filter(Boolean) : [];
  const allCategorySlugs = [...categorySlugs, ...subcategorySlugs];

  const stateSlugs    = stateSlug ? stateSlug.split(',').filter(Boolean) : [];
  const employeeRanges = employeesParam ? employeesParam.split(',').filter(Boolean) : [];

  // Need at least a real text query or one filter — otherwise there's nothing to search on.
  const hasQuery  = q.length >= 2;
  const hasFilter = allCategorySlugs.length > 0 || stateSlugs.length > 0 || employeeRanges.length > 0;
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

  if (allCategorySlugs.length) {
    const matchedCats = await db
      .select({ id: categories.id, is_parent: categories.is_parent })
      .from(categories)
      .where(inArray(categories.slug, allCategorySlugs));

    if (!matchedCats.length) return NextResponse.json([]);

    let categoryIds = matchedCats.map((c) => c.id);
    const parentIds = matchedCats.filter((c) => c.is_parent).map((c) => c.id);

    if (parentIds.length) {
      const subs = await db
        .select({ id: categories.id })
        .from(categories)
        .where(inArray(categories.parent_id, parentIds));
      categoryIds.push(...subs.map((s) => s.id));
    }

    const links = await db
      .select({ company_id: company_categories.company_id })
      .from(company_categories)
      .where(inArray(company_categories.category_id, categoryIds));

    if (!links.length) return NextResponse.json([]);
    conditions.push(inArray(companies.id, [...new Set(links.map((l) => l.company_id))]));
  }

  if (stateSlugs.length) {
    const matchedStates = await db
      .select({ id: states.id })
      .from(states)
      .where(inArray(states.slug, stateSlugs));

    if (!matchedStates.length) return NextResponse.json([]);
    conditions.push(inArray(companies.hq_state_id, matchedStates.map((s) => s.id)));
  }

  let results = await db
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
      website: companies.website,
      employee_count: companies.employee_count,
      certifications: companies.certifications,
    })
    .from(companies)
    .where(and(...conditions))
    .limit(50);

  if (employeeRanges.length) {
    const wanted = new Set(employeeRanges);
    results = results.filter((c) => wanted.has(bucketKeyFor(parseEmployeeCount(c.employee_count))));
  }

  return NextResponse.json(results);
}
