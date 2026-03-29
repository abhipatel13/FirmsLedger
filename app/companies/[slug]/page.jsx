import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

async function getCompanyData(slug) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey || !slug) return null;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/agencies?slug=eq.${encodeURIComponent(slug)}&select=name,hq_city,hq_country,logo_url,website,phone,team_size,description,avg_rating,review_count&limit=1`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data?.[0] || null;
    }
  } catch {}
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let companyName = 'Company Profile';
  let description = `View this company profile on FirmsLedger – the global verified business directory.`;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && slug) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/agencies?slug=eq.${encodeURIComponent(slug)}&select=name,hq_city,hq_country&limit=1`,
        {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          next: { revalidate: 3600 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.[0]?.name) {
          companyName = data[0].name;
          const location = [data[0].hq_city, data[0].hq_country].filter(Boolean).join(', ');
          description = `${companyName} is a verified business${location ? ` based in ${location}` : ''} listed on FirmsLedger. View their products & services, team size, and contact information.`;
        }
      }
    }
  } catch {
    // fall through to defaults
  }

  const canonical = `${_BASE}/companies/${slug}`;
  return {
    title: companyName,
    description,
    robots: { index: false, follow: false },
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

  const localBusinessJsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: company.name,
        url: `${_BASE}/companies/${slug}`,
        ...(company.logo_url && { logo: company.logo_url }),
        ...(company.description && { description: company.description }),
        ...(company.website && { sameAs: [company.website] }),
        ...(company.phone && { telephone: company.phone }),
        ...(company.team_size && { numberOfEmployees: { '@type': 'QuantitativeValue', value: company.team_size } }),
        ...((company.hq_city || company.hq_country) && {
          address: {
            '@type': 'PostalAddress',
            ...(company.hq_city && { addressLocality: company.hq_city }),
            ...(company.hq_country && { addressCountry: company.hq_country }),
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

  return (
    <>
      {localBusinessJsonLd && <JsonLd data={localBusinessJsonLd} />}
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
        <AgencyProfile companySlug={slug || undefined} />
      </Suspense>
    </>
  );
}
