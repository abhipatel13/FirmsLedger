import CountryPage from '@/views/CountryPage';
import { BASE_URL, SITE_NAME, SEO_YEAR } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const country = params?.country || 'United States';

  const title = `Top Business Service Providers in ${country} (${SEO_YEAR})`;
  const description = `Discover verified business service providers in ${country}. Browse top-rated companies by category, city, reviews, and expertise on FirmsLedger — updated for ${SEO_YEAR}.`;
  const canonical = `${_BASE}/CountryPage?country=${encodeURIComponent(country)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default function CountryPageRoute({ searchParams }) {
  return <CountryPage searchParams={searchParams} />;
}
