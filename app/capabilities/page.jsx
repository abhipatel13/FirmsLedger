import Capabilities from '@/views/Capabilities';
import { CAPABILITY_SLUGS } from '@/lib/capabilities';
import { MANUFACTURING_CATEGORIES, ALL_SUBCATEGORY_SLUGS } from '@/lib/manufacturingCategories';
import { fetchCategoryCounts } from '@/db/neonApi';
import { SITE_NAME, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Manufacturing Capabilities',
  description: 'Browse US manufacturers by process — wire and cable, solar, injection molding, welding, sheet metal, PCB and more on FirmsLedger.',
  alternates: { canonical: `${_BASE}/capabilities` },
  openGraph: {
    title: `Manufacturing Capabilities | ${SITE_NAME}`,
    description: 'Browse US manufacturers by process — wire and cable, solar, injection molding, welding, sheet metal, PCB and more.',
    type: 'website',
    url: `${_BASE}/capabilities`,
  },
};

export default async function CapabilitiesPage() {
  // One query covers both the featured cards and the full index below them.
  const counts = await fetchCategoryCounts([...new Set([...CAPABILITY_SLUGS, ...ALL_SUBCATEGORY_SLUGS])]);

  // Everything with at least one approved company, grouped by parent industry,
  // so /capabilities is a complete index and nothing is reachable only via
  // /browse.
  const groups = MANUFACTURING_CATEGORIES
    .map((cat) => ({
      slug: cat.slug,
      name: cat.shortName || cat.name,
      children: (cat.subcategories || [])
        .filter((s) => counts[s.slug] > 0)
        .sort((a, b) => counts[b.slug] - counts[a.slug]),
    }))
    .filter((g) => g.children.length > 0);

  return <Capabilities counts={counts} groups={groups} />;
}
