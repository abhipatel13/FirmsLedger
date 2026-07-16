import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { db } from '@/db/client';
import { companies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

async function getCompanyData(slug) {
  try {
    if (!slug) return null;
    const [row] = await db
      .select({
        name: companies.name,
        hq_city: companies.hq_city,
        hq_state: companies.hq_state,
        hq_state_label: companies.hq_state_label,
        logo_url: companies.logo_url,
        website: companies.website,
        employee_count: companies.employee_count,
        description: companies.description,
        avg_rating: companies.avg_rating,
        review_count: companies.review_count,
      })
      .from(companies)
      .where(and(eq(companies.slug, slug), eq(companies.approved, true)))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const company = await getCompanyData(slug);

  const companyName = company?.name || 'Company Profile';
  const location = [company?.hq_city, company?.hq_state_label].filter(Boolean).join(', ');
  const description = company
    ? `${companyName} is a verified US manufacturer${location ? ` based in ${location}` : ''} listed on FirmsLedger. View their profile, ratings, and reviews.`
    : `View this company profile on FirmsLedger – the US manufacturer directory.`;

  const canonical = `${_BASE}/companies/${slug}`;
  return {
    title: companyName,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical },
    openGraph: {
      title: `${companyName} | ${SITE_NAME}`,
      description,
      type: 'profile',
      url: canonical,
    },
  };
}

export default async function CompanyProfilePage({ params }) {
  const resolved = await params;
  const slug = typeof resolved?.slug === 'string' ? resolved.slug.trim() : '';
  const company = await getCompanyData(slug);

  const profileUrl = `${_BASE}/companies/${slug}`;

  const localBusinessJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: company.name,
        url: profileUrl,
        ...(company.logo_url && { logo: company.logo_url, image: company.logo_url }),
        ...(company.description && { description: company.description }),
        ...(company.website && { sameAs: [company.website] }),
        ...(company.employee_count && { numberOfEmployees: { '@type': 'QuantitativeValue', value: company.employee_count } }),
        ...((company.hq_city || company.hq_state_label) && {
          address: {
            '@type': 'PostalAddress',
            ...(company.hq_city && { addressLocality: company.hq_city }),
            ...(company.hq_state_label && { addressRegion: company.hq_state_label }),
            addressCountry: 'US',
          },
        }),
        ...(company.avg_rating && company.review_count > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: company.avg_rating,
            reviewCount: company.review_count,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }
    : null;

  const breadcrumbJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
          { '@type': 'ListItem', position: 2, name: 'Directory', item: `${_BASE}/Directory` },
          { '@type': 'ListItem', position: 3, name: company.name, item: profileUrl },
        ],
      }
    : null;

  return (
    <>
      {localBusinessJsonLd && <JsonLd data={localBusinessJsonLd} />}
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
        <AgencyProfile companySlug={slug || undefined} />
      </Suspense>
    </>
  );
}
