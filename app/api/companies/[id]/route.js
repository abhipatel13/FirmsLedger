import { NextResponse } from 'next/server';
import { fetchCompanyByIdAny } from '@/db/neonApi';

/**
 * GET /api/companies/:id
 * Minimal public lookup by UUID or slug, for client components that need
 * to resolve a company reference from a query param (e.g. ?agency=<id>).
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const company = await fetchCompanyByIdAny(id);
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  return NextResponse.json({
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo_url: company.logo_url,
    hq_city: company.hq_city,
    hq_state_label: company.hq_state_label,
  });
}
