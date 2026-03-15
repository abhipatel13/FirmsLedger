import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

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
          description = `${companyName} is a verified business service provider${location ? ` based in ${location}` : ''} listed on FirmsLedger. View services, team size, and contact information.`;
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <AgencyProfile companySlug={slug || undefined} />
    </Suspense>
  );
}
