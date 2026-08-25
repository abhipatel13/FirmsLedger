import Locations from '@/views/Locations';
import { ALL_US_STATES } from '@/lib/usStates';
import { TIER1_SLUGS, TIER2_SLUGS } from '@/lib/locationTiers';
import { SITE_NAME, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Manufacturer Locations',
  description: 'Browse verified US manufacturers by state — find shops in top manufacturing hubs like Ohio, Michigan, Texas and California, or search any of the 50 states.',
  alternates: { canonical: `${_BASE}/locations` },
  openGraph: {
    title: `Manufacturer Locations | ${SITE_NAME}`,
    description: 'Browse verified US manufacturers by state — find shops in top manufacturing hubs or search any of the 50 states.',
    type: 'website',
    url: `${_BASE}/locations`,
  },
};

export default function LocationsPage() {
  const bySlug = Object.fromEntries(ALL_US_STATES.map((s) => [s.slug, s]));
  const tier1 = TIER1_SLUGS.map((slug) => bySlug[slug]).filter(Boolean);
  const tier2 = TIER2_SLUGS.map((slug) => bySlug[slug]).filter(Boolean);
  const usedSlugs = new Set([...TIER1_SLUGS, ...TIER2_SLUGS]);
  const rest = ALL_US_STATES.filter((s) => !usedSlugs.has(s.slug));

  return <Locations tier1={tier1} tier2={tier2} rest={rest} />;
}
