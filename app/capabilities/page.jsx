import Capabilities from '@/views/Capabilities';
import { CAPABILITIES, CAPABILITY_SLUGS, capabilityHref, capabilityImageUrl } from '@/lib/capabilities';
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
  const counts = await fetchCategoryCounts(CAPABILITY_SLUGS);

  // Image URLs are resolved here because R2_PUBLIC_URL is a server-only env
  // var; the view is a client component and must not read it.
  const items = CAPABILITIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    desc: c.desc,
    href: capabilityHref(c),
    imageUrl: capabilityImageUrl(c),
  }));

  return <Capabilities counts={counts} items={items} />;
}
