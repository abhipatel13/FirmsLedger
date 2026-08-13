import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import CategoryCard from '@/components/CategoryCard';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { ArrowRight } from 'lucide-react';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const ALL_STATES = [
  { name: 'Alabama',        slug: 'alabama',        region: 'South'     },
  { name: 'Alaska',         slug: 'alaska',         region: 'West'      },
  { name: 'Arizona',        slug: 'arizona',        region: 'West'      },
  { name: 'Arkansas',       slug: 'arkansas',       region: 'South'     },
  { name: 'California',     slug: 'california',     region: 'West'      },
  { name: 'Colorado',       slug: 'colorado',       region: 'West'      },
  { name: 'Connecticut',    slug: 'connecticut',    region: 'Northeast' },
  { name: 'Delaware',       slug: 'delaware',       region: 'Northeast' },
  { name: 'Florida',        slug: 'florida',        region: 'South'     },
  { name: 'Georgia',        slug: 'georgia',        region: 'South'     },
  { name: 'Hawaii',         slug: 'hawaii',         region: 'West'      },
  { name: 'Idaho',          slug: 'idaho',          region: 'West'      },
  { name: 'Illinois',       slug: 'illinois',       region: 'Midwest'   },
  { name: 'Indiana',        slug: 'indiana',        region: 'Midwest'   },
  { name: 'Iowa',           slug: 'iowa',           region: 'Midwest'   },
  { name: 'Kansas',         slug: 'kansas',         region: 'Midwest'   },
  { name: 'Kentucky',       slug: 'kentucky',       region: 'South'     },
  { name: 'Louisiana',      slug: 'louisiana',      region: 'South'     },
  { name: 'Maine',          slug: 'maine',          region: 'Northeast' },
  { name: 'Maryland',       slug: 'maryland',       region: 'Northeast' },
  { name: 'Massachusetts',  slug: 'massachusetts',  region: 'Northeast' },
  { name: 'Michigan',       slug: 'michigan',       region: 'Midwest'   },
  { name: 'Minnesota',      slug: 'minnesota',      region: 'Midwest'   },
  { name: 'Mississippi',    slug: 'mississippi',    region: 'South'     },
  { name: 'Missouri',       slug: 'missouri',       region: 'Midwest'   },
  { name: 'Montana',        slug: 'montana',        region: 'West'      },
  { name: 'Nebraska',       slug: 'nebraska',       region: 'Midwest'   },
  { name: 'Nevada',         slug: 'nevada',         region: 'West'      },
  { name: 'New Hampshire',  slug: 'new-hampshire',  region: 'Northeast' },
  { name: 'New Jersey',     slug: 'new-jersey',     region: 'Northeast' },
  { name: 'New Mexico',     slug: 'new-mexico',     region: 'West'      },
  { name: 'New York',       slug: 'new-york',       region: 'Northeast' },
  { name: 'North Carolina', slug: 'north-carolina', region: 'South'     },
  { name: 'North Dakota',   slug: 'north-dakota',   region: 'Midwest'   },
  { name: 'Ohio',           slug: 'ohio',           region: 'Midwest'   },
  { name: 'Oklahoma',       slug: 'oklahoma',       region: 'South'     },
  { name: 'Oregon',         slug: 'oregon',         region: 'West'      },
  { name: 'Pennsylvania',   slug: 'pennsylvania',   region: 'Northeast' },
  { name: 'Rhode Island',   slug: 'rhode-island',   region: 'Northeast' },
  { name: 'South Carolina', slug: 'south-carolina', region: 'South'     },
  { name: 'South Dakota',   slug: 'south-dakota',   region: 'Midwest'   },
  { name: 'Tennessee',      slug: 'tennessee',      region: 'South'     },
  { name: 'Texas',          slug: 'texas',          region: 'South'     },
  { name: 'Utah',           slug: 'utah',           region: 'West'      },
  { name: 'Vermont',        slug: 'vermont',        region: 'Northeast' },
  { name: 'Virginia',       slug: 'virginia',       region: 'South'     },
  { name: 'Washington',     slug: 'washington',     region: 'West'      },
  { name: 'West Virginia',  slug: 'west-virginia',  region: 'South'     },
  { name: 'Wisconsin',      slug: 'wisconsin',      region: 'Midwest'   },
  { name: 'Wyoming',        slug: 'wyoming',        region: 'West'      },
  { name: 'District of Columbia', slug: 'district-of-columbia', region: 'Northeast' },
];

const CATEGORIES = [
  { slug: 'electrical-components',     name: 'Electrical Components Manufacturers',          shortDesc: 'Wiring, switchgear & components',          dot: '#eab308', icon: '⚡' },
  { slug: 'mechanical-components',     name: 'Mechanical Components Manufacturers',          shortDesc: 'CNC machining & precision parts',           dot: '#64748b', icon: '⚙️' },
  { slug: 'plastics-packaging',        name: 'Plastics & Packaging Manufacturers',           shortDesc: 'Injection molding & packaging',             dot: '#22c55e', icon: '📦' },
  { slug: 'metal-fabrication',         name: 'Metal Fabrication & Machining',                shortDesc: 'Sheet metal, welding & stamping',           dot: '#3b82f6', icon: '🔧' },
  { slug: 'electronics-semiconductor', name: 'Electronics & Semiconductor Manufacturers',    shortDesc: 'PCBs, chips & assemblies',                  dot: '#6366f1', icon: '🖥️' },
  { slug: 'automotive-parts',          name: 'Automotive Parts Manufacturers',               shortDesc: 'OEM & aftermarket components',              dot: '#ef4444', icon: '🚗' },
  { slug: 'textile-apparel',           name: 'Textile & Apparel Manufacturers',              shortDesc: 'Fabric & garment manufacturing',            dot: '#ec4899', icon: '🧵' },
  { slug: 'furniture-woodworking',     name: 'Furniture & Woodworking Manufacturers',        shortDesc: 'Custom furniture & cabinetry',              dot: '#f59e0b', icon: '🪵' },
  { slug: 'food-beverage-processing',  name: 'Food & Beverage Processing Equipment Manufacturers', shortDesc: 'Processing & packaging lines',         dot: '#84cc16', icon: '🍽️' },
  { slug: 'medical-devices',           name: 'Medical Device Manufacturers',                 shortDesc: 'Diagnostic & surgical equipment',           dot: '#14b8a6', icon: '🩺' },
];

const STATE_MAP = Object.fromEntries(ALL_STATES.map((s) => [s.slug, s]));

export function generateStaticParams() {
  return ALL_STATES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) return { title: 'State' };

  const title       = `Manufacturers in ${state.name}`;
  const description = `Find manufacturers in ${state.name}. Browse electrical components, mechanical components, automotive, electronics, and more.`;
  const canonical   = `${_BASE}/states/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function StateHubPage({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Manufacturers in ${state.name}`,
    description: `Browse manufacturers across all categories in ${state.name}.`,
    url: `${_BASE}/states/${slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: _BASE },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
      { '@type': 'ListItem', position: 2, name: 'States', item: `${_BASE}/#states` },
      { '@type': 'ListItem', position: 3, name: state.name, item: `${_BASE}/states/${slug}` },
    ],
  };

  const otherStates = ALL_STATES.filter((s) => s.slug !== slug).slice(0, 24);

  return (
    <>
      <style>{`
        .state-pill:hover { border-color: #94a3b8 !important; color: #0f172a !important; }
      `}</style>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '48px 24px 44px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {/* Breadcrumb */}
            <nav className="scrollbar-hide" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 20,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
            }}>
              <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Home</Link>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, flexShrink: 0 }}>States</span>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, flexShrink: 0 }}>{state.name}</span>
            </nav>

            {/* Region badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 9999,
              padding: '4px 12px',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {state.region}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              lineHeight: 1.1,
              marginBottom: 12,
              marginTop: 0,
            }}>
              Manufacturers in {state.name}
            </h1>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, maxWidth: 640, marginBottom: 0 }}>
              Browse manufacturers in {state.name} by category. FirmsLedger lists verified {state.name} manufacturers
              across {CATEGORIES.length} primary industries, from {CATEGORIES[0].name.toLowerCase()} to{' '}
              {CATEGORIES[CATEGORIES.length - 1].name.toLowerCase()}. Our industrial directory helps procurement teams and engineers 
              compare local {state.name} suppliers, review company capabilities, verify certifications, 
              and request a quote directly from a manufacturer's profile.
            </p>
          </div>
        </div>

        {/* ── Category cards ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 80px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 28 }}>
            Choose a manufacturing category
          </p>

          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, maxWidth: 760, marginBottom: 32 }}>
            {state.name} is part of the {state.region} region, home to industrial facilities spanning {CATEGORIES.map(c => c.name).slice(0, 5).join(', ')}, and more.
            Each category page below lists {state.name}-based companies with their headquarters location, team size, ISO certifications,
            and verified customer reviews where available. Sourcing local production partners in {state.name} helps reduce supply chain 
            transit times and logistics costs. Whether you are sourcing {CATEGORIES[0].shortDesc.toLowerCase()} or{' '}
            {CATEGORIES[3].shortDesc.toLowerCase()}, start by selecting the manufacturing category that matches your project requirements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => (
              <CategoryCard
                key={cat.slug}
                href={`/${cat.slug}/${slug}`}
                icon={cat.icon}
                name={cat.name}
                description={`${cat.shortDesc} in ${state.name}`}
                colorIndex={idx}
              />
            ))}
          </div>
        </div>

        {/* ── Other states ── */}
        <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '48px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 20 }}>
              Other states
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {otherStates.map((s) => (
                <Link
                  key={s.slug}
                  href={`/states/${s.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 9999,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#475569',
                    textDecoration: 'none',
                    transition: 'all 0.12s',
                  }}
                className="state-pill"
                >
                  {s.name}
                </Link>
              ))}
              <Link
                href="/#states"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: '#0f172a',
                  borderRadius: 9999,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ffffff',
                  textDecoration: 'none',
                }}
              >
                All 50 states <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
