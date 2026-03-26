import { permanentRedirect } from 'next/navigation';
import { countrySlugToName, stateSlugToInfo } from '@/lib/programmaticSeo';

export default async function SearchIndustryCountryStatePage({ params }) {
  const { industry, country, state } = await params;
  const countryName = countrySlugToName(country);
  const stateInfo = stateSlugToInfo(country, state);
  const stateName = stateInfo?.name || state;
  const query = new URLSearchParams();
  if (countryName) query.set('country', countryName);
  if (stateName) query.set('state', stateName);
  const qs = query.toString();
  permanentRedirect(`/directory/${industry}${qs ? `?${qs}` : ''}`);
}
