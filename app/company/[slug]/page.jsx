// `false`, not a duration. A prebuilt page with a time-based revalidate still
// RE-RENDERS AT RUNTIME when it expires, and a runtime render falls through to
// the DB (getCompany -> fetchCompanyByIdAny). Across 9,125 pages a 7-day window
// is ~1,300 revalidations/day — a DB touch every ~66s, still inside Neon's 300s
// scale-to-zero window, so the compute would never sleep and the bill would not
// move. With `false` these pages are only ever rebuilt by a deploy.
//
// CONSEQUENCE: freshness now comes from rebuilds, NOT from revalidateTag —
// the build path reads the snapshot file and never touches unstable_cache, so
// the 'companies' tag does not reach these pages. The deploy hook on admin
// approval is REQUIRED, not optional. See HISTORY.md 2026-09-05.
export const revalidate = false;
export const dynamicParams = true;

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { getCompanyDescription, getCategoryHref, buildCompanyTitle } from '@/utils';
import { ALL_US_STATES } from '@/lib/usStates';
import {
  fetchCompanyByIdAny,
  fetchCompanyCategories,
  fetchCategories,
  fetchCompaniesByCategoryAndState,
} from '@/db/neonApi';
import {
  approvedCompanySlugs,
  buildCompanyByIdAny,
  buildCompanyCategories,
  buildCategories,
  buildTopCompaniesInCategory,
} from '@/db/staticData';

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

// During `next build` these resolve from one bulk load instead of two DB
// round-trips per page (~18,250 queries across 9,125 profiles). Outside a build
// the loaders return undefined and we fall through to the cached DB path.
const getCompany = async (slug) =>
  (await buildCompanyByIdAny(slug)) ?? (await fetchCompanyByIdAny(slug).catch(() => null));

const getCompanyCategories = async (companyId) =>
  (await buildCompanyCategories(companyId)) ??
  (await fetchCompanyCategories({ company_id: companyId }).catch(() => []));

const getCategories = async () =>
  (await buildCategories()) ?? (await fetchCategories().catch(() => []));

const getTopInCategory = async (categorySlug) =>
  (await buildTopCompaniesInCategory(categorySlug, 30)) ??
  (await fetchCompaniesByCategoryAndState(categorySlug, null, '-avg_rating', 30).catch(() => []));

export async function generateStaticParams() {
  const slugs = await approvedCompanySlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const company = await getCompany(slug);

  const companyName = company?.name || 'Company Profile';
  const location = [company?.hq_city, company?.hq_state_label].filter(Boolean).join(', ');
  const description = company
    ? `${companyName} is a verified US manufacturer${location ? ` based in ${location}` : ''} listed on FirmsLedger. View their profile, ratings, and reviews.`
    : `View this company profile on FirmsLedger – the US manufacturer directory.`;

  const canonical = `${_BASE}/company/${slug}`;
  return {
    title: buildCompanyTitle(companyName, company?.hq_city, company?.hq_state_label),
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

  const company = await getCompany(slug);
  if (!company) notFound();

  let reviews = [];
  let companyCategories = [];
  let similarCompanies = [];

  if (company?.id) {
    // ponytail: the reviews table is empty (0 rows as of 2026-08-19), so
    // querying it on all 9,102 company pages bought nothing but Neon compute
    // time. Restore the fetchReviews call here the moment review collection
    // ships — cached and tagged 'companies', not uncached, or the drip returns.
    companyCategories = await getCompanyCategories(company.id);

    if (companyCategories.length > 0) {
      const allCats = await getCategories();
      const catsById = new Map(allCats.map((c) => [c.id, c]));
      const catIds = companyCategories.map((cc) => cc.category_id);
      companyCategories = allCats
        .filter((c) => catIds.includes(c.id))
        .map((c) => ({ ...c, parentSlug: c.is_parent ? c.slug : catsById.get(c.parent_id)?.slug || null }));
      const primarySlug = companyCategories[0]?.slug;
      if (primarySlug) {
        similarCompanies = (await getTopInCategory(primarySlug))
          .filter((c) => c.id !== company.id)
          .slice(0, 4);
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
        ...(company.review_count > 0 && Number(company.avg_rating) > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: company.avg_rating,
            reviewCount: company.review_count,
          },
        }),
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

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE }
  ];

  const primaryCategory = companyCategories?.[0];
  const stateObj = company?.hq_state_label ? ALL_US_STATES.find(s => s.name === company.hq_state_label) : null;

  let currentPos = 2;
  if (primaryCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: currentPos++,
      name: primaryCategory.name,
      item: `${_BASE}${getCategoryHref(primaryCategory)}`
    });

    if (stateObj) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: currentPos++,
        name: `${primaryCategory.name} in ${stateObj.name}`,
        item: `${_BASE}${getCategoryHref(primaryCategory, stateObj.slug)}`
      });
    }
  }

  breadcrumbItems.push({
    '@type': 'ListItem',
    position: currentPos,
    name: company.name,
    item: profileUrl
  });

  const breadcrumbJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
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
