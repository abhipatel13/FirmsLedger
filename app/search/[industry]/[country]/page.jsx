import { permanentRedirect } from 'next/navigation';
import { countrySlugToName } from '@/lib/programmaticSeo';

export default async function SearchIndustryCountryPage({ params }) {
  const { industry, country } = await params;
  const countryName = countrySlugToName(country);
  const query = countryName ? `?country=${encodeURIComponent(countryName)}` : '';
  permanentRedirect(`/directory/${industry}${query}`);
}
