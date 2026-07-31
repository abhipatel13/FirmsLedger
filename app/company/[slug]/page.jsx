export const revalidate = 3600;

import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { getCompanyDescription } from '@/utils';
import {
  fetchCompanyByIdAny,
  fetchReviews,
  fetchCompanyCategories,
  fetchCategories,
  fetchCompaniesByCategoryAndState,
} from '@/db/neonApi';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// Internal-only columns that must never reach the client bundle (RSC props
// passed to a 'use client' component get serialized and shipped to the browser).
const INTERNAL_FIELDS = ['data_source', 'source_url', 'owner_user_id'];

function stripInternalFields(row) {
  if (!row) return row;
  const clean = { ...row };
  for (const field of INTERNAL_FIELDS) delete clean[field];
  return clean;
}

// Only profiles with real content are indexable. A name-and-address stub adds
// no value in search results and dilutes site-wide quality signals.
// Mirrored as a SQL predicate in app/sitemap.js — keep the two in agreement.
function isIndexable(company) {
  return Boolean(company?.approved) && typeof company?.description === 'string' && company.description.trim() !== '';
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const company = await fetchCompanyByIdAny(slug).catch(() => null);

  const companyName = company?.name || 'Company Profile';
  const location = [company?.hq_city, company?.hq_state_label].filter(Boolean).join(', ');
  const description = company
    ? `${companyName} is a verified US manufacturer${location ? ` based in ${location}` : ''} listed on FirmsLedger. View their profile, ratings, and reviews.`
    : `View this company profile on FirmsLedger – the US manufacturer directory.`;

  const canonical = `${_BASE}/company/${slug}`;
  return {
    title: companyName,
    description,
    robots: isIndexable(company) ? undefined : { index: false, follow: true },
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

  const company = await fetchCompanyByIdAny(slug).catch(() => null);

  let reviews = [];
  let companyCategories = [];
  let similarCompanies = [];

  if (company?.id) {
    [reviews, companyCategories] = await Promise.all([
      fetchReviews({ company_id: company.id, approved: true }, '-created_at', 50).catch(() => []),
      fetchCompanyCategories({ company_id: company.id }).catch(() => []),
    ]);

    if (companyCategories.length > 0) {
      const allCats = await fetchCategories().catch(() => []);
      const catIds = companyCategories.map((cc) => cc.category_id);
      companyCategories = allCats.filter((c) => catIds.includes(c.id));
      const primarySlug = companyCategories[0]?.slug;
      if (primarySlug) {
        similarCompanies = await fetchCompaniesByCategoryAndState(primarySlug, null, '-avg_rating', 30)
          .then((list) => list.filter((c) => c.id !== company.id).slice(0, 4))
          .catch(() => []);
      }
    }
  }

  const profileUrl = `${_BASE}/company/${slug}`;

  const localBusinessJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: company.name,
        url: profileUrl,
        ...(company.logo_url && { logo: company.logo_url, image: company.logo_url }),
        description: getCompanyDescription(company),
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
      }
    : null;

  const breadcrumbJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
          { '@type': 'ListItem', position: 2, name: company.name, item: profileUrl },
        ],
      }
    : null;

  return (
    <>
      {localBusinessJsonLd && <JsonLd data={localBusinessJsonLd} />}
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
        <AgencyProfile
          companySlug={slug || undefined}
          initialCompany={stripInternalFields(company)}
          initialReviews={reviews}
          initialCategories={companyCategories}
          initialSimilar={similarCompanies.map(stripInternalFields)}
        />
      </Suspense>
    </>
  );
}
