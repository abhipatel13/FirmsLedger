import Locations from '@/views/Locations';
import JsonLd from '@/components/JsonLd';
import { ALL_US_STATES } from '@/lib/usStates';
import { TIER1_SLUGS, TIER2_SLUGS } from '@/lib/locationTiers';
import { SITE_NAME, BASE_URL, OG_IMAGE } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Manufacturer Locations',
  description: 'Browse verified US manufacturers by state — find shops in top manufacturing hubs like Ohio, Michigan, Texas and California, or search any of the 50 states.',
  alternates: { canonical: `${_BASE}/locations` },
  openGraph: { images: [OG_IMAGE],
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
      { '@type': 'ListItem', position: 2, name: 'Locations', item: `${_BASE}/locations` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Locations tier1={tier1} tier2={tier2} rest={rest} />
      {/* The view is a grid of state names (~93 words, Ubersuggest audit
          2026-10-10). Explain what each state page holds, in server HTML. */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '8px 24px 56px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
          Browse US manufacturers by state
        </h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 12px' }}>
          Every state page lists the manufacturers headquartered there, grouped by industry, with a count for each
          industry and the cities where they are concentrated. From a state you can open any industry, such as
          metal fabrication, electronics, plastics or medical devices, to compare individual companies by city,
          size and specialty, and contact them directly.
        </p>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>
          Major US manufacturing hubs include {tier1.map((s) => s.name).join(', ')}.
          Sourcing from a supplier in your own or a neighboring state usually shortens lead times and lowers freight costs.
        </p>
      </section>
    </>
  );
}
