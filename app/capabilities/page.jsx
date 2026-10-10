import Capabilities from '@/views/Capabilities';
import { CAPABILITIES, CAPABILITY_SLUGS, capabilityHref, capabilityImageUrl } from '@/lib/capabilities';
import { fetchCategoryCounts } from '@/db/neonApi';
import { SITE_NAME, BASE_URL, OG_IMAGES } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Manufacturing Capabilities',
  description: 'Browse US manufacturers by process — wire and cable, solar, injection molding, welding, sheet metal, PCB and more on FirmsLedger.',
  alternates: { canonical: `${_BASE}/capabilities` },
  openGraph: {
    images: OG_IMAGES,
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

  // The grid is image cards, so the page carried ~66 words (Ubersuggest
  // audit, 2026-10-10). This server-rendered summary gives each capability
  // its description and live count in plain text.
  return (
    <>
      <Capabilities counts={counts} items={items} />
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '8px 24px 56px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
          Find US manufacturers by process
        </h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 16px' }}>
          Each capability page lists US companies that perform that process, with their headquarters state,
          company size and direct contact details. Open a capability to compare suppliers nationwide, then narrow
          the list to a single state.
        </p>
        <ul style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          {items.map((c) => (
            <li key={c.slug}>
              <a href={c.href} style={{ color: '#1A2E4A', fontWeight: 600 }}>{c.name}</a>
              {counts?.[c.slug] > 0 ? ` (${counts[c.slug]} companies)` : ''}: {c.desc}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
