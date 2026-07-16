import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { ArrowRight } from 'lucide-react';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Static category data ──────────────────────────────────────────────────────

const CATEGORIES = {
  'bike-manufacturers': {
    name: 'Bike Manufacturers',
    noun: 'bike manufacturers',
    desc: 'Road, mountain, BMX, and specialty bicycle makers across the US.',
    accent: '#ffb084',
    accentText: '#0a0a0a',
  },
  'electrical-manufacturers': {
    name: 'Electrical Manufacturers',
    noun: 'electrical manufacturers',
    desc: 'Wiring systems, components, switchgear, and electrical equipment producers across the US.',
    accent: '#e8b94a',
    accentText: '#0a0a0a',
  },
  'mechanical-manufacturers': {
    name: 'Mechanical Manufacturers',
    noun: 'mechanical manufacturers',
    desc: 'CNC machining, precision parts, assemblies, and industrial tooling makers across the US.',
    accent: '#1a3a3a',
    accentText: '#ffffff',
  },
  'plastics-packaging-manufacturers': {
    name: 'Plastics & Packaging Manufacturers',
    noun: 'plastics & packaging manufacturers',
    desc: 'Injection molding, packaging materials, containers, and plastic component makers across the US.',
    accent: '#6b9080',
    accentText: '#ffffff',
  },
  'metal-fabrication-machining': {
    name: 'Metal Fabrication & Machining',
    noun: 'metal fabrication & machining companies',
    desc: 'Sheet metal, welding, stamping, and custom metal fabrication shops across the US.',
    accent: '#243B58',
    accentText: '#ffffff',
  },
  'electronics-semiconductor-manufacturers': {
    name: 'Electronics & Semiconductor Manufacturers',
    noun: 'electronics & semiconductor manufacturers',
    desc: 'PCBs, chips, electronic assemblies, and semiconductor component makers across the US.',
    accent: '#2E4E6E',
    accentText: '#ffffff',
  },
  'automotive-parts-manufacturers': {
    name: 'Automotive Parts Manufacturers',
    noun: 'automotive parts manufacturers',
    desc: 'OEM and aftermarket automotive component and assembly makers across the US.',
    accent: '#c0563c',
    accentText: '#ffffff',
  },
  'textile-apparel-manufacturers': {
    name: 'Textile & Apparel Manufacturers',
    noun: 'textile & apparel manufacturers',
    desc: 'Fabric production, garment manufacturing, and textile finishing companies across the US.',
    accent: '#d9a5ad',
    accentText: '#0a0a0a',
  },
  'furniture-woodworking-manufacturers': {
    name: 'Furniture & Woodworking Manufacturers',
    noun: 'furniture & woodworking manufacturers',
    desc: 'Custom furniture, cabinetry, and woodworking production companies across the US.',
    accent: '#a97452',
    accentText: '#ffffff',
  },
  'food-beverage-processing': {
    name: 'Food & Beverage Processing',
    noun: 'food & beverage processing companies',
    desc: 'Food processing equipment, packaging lines, and beverage production companies across the US.',
    accent: '#e0b04a',
    accentText: '#0a0a0a',
  },
  'medical-device-manufacturers': {
    name: 'Medical Device Manufacturers',
    noun: 'medical device manufacturers',
    desc: 'Diagnostic equipment, surgical instruments, and medical component makers across the US.',
    accent: '#8fb8a8',
    accentText: '#0a0a0a',
  },
};

// All 50 US states with region grouping
const US_STATES_BY_REGION = {
  Northeast: [
    { name: 'Maine',          slug: 'maine'          },
    { name: 'Vermont',        slug: 'vermont'        },
    { name: 'New Hampshire',  slug: 'new-hampshire'  },
    { name: 'Massachusetts',  slug: 'massachusetts'  },
    { name: 'Rhode Island',   slug: 'rhode-island'   },
    { name: 'Connecticut',    slug: 'connecticut'    },
    { name: 'New York',       slug: 'new-york'       },
    { name: 'New Jersey',     slug: 'new-jersey'     },
    { name: 'Pennsylvania',   slug: 'pennsylvania'   },
    { name: 'Delaware',       slug: 'delaware'       },
    { name: 'Maryland',       slug: 'maryland'       },
  ],
  Midwest: [
    { name: 'Ohio',         slug: 'ohio'         },
    { name: 'Michigan',     slug: 'michigan'     },
    { name: 'Indiana',      slug: 'indiana'      },
    { name: 'Illinois',     slug: 'illinois'     },
    { name: 'Wisconsin',    slug: 'wisconsin'    },
    { name: 'Minnesota',    slug: 'minnesota'    },
    { name: 'Iowa',         slug: 'iowa'         },
    { name: 'Missouri',     slug: 'missouri'     },
    { name: 'North Dakota', slug: 'north-dakota' },
    { name: 'South Dakota', slug: 'south-dakota' },
    { name: 'Nebraska',     slug: 'nebraska'     },
    { name: 'Kansas',       slug: 'kansas'       },
  ],
  South: [
    { name: 'West Virginia',  slug: 'west-virginia'  },
    { name: 'Virginia',       slug: 'virginia'       },
    { name: 'Kentucky',       slug: 'kentucky'       },
    { name: 'Tennessee',      slug: 'tennessee'      },
    { name: 'North Carolina', slug: 'north-carolina' },
    { name: 'South Carolina', slug: 'south-carolina' },
    { name: 'Georgia',        slug: 'georgia'        },
    { name: 'Florida',        slug: 'florida'        },
    { name: 'Alabama',        slug: 'alabama'        },
    { name: 'Mississippi',    slug: 'mississippi'    },
    { name: 'Arkansas',       slug: 'arkansas'       },
    { name: 'Louisiana',      slug: 'louisiana'      },
    { name: 'Oklahoma',       slug: 'oklahoma'       },
    { name: 'Texas',          slug: 'texas'          },
  ],
  West: [
    { name: 'Montana',     slug: 'montana'     },
    { name: 'Idaho',       slug: 'idaho'       },
    { name: 'Wyoming',     slug: 'wyoming'     },
    { name: 'Colorado',    slug: 'colorado'    },
    { name: 'New Mexico',  slug: 'new-mexico'  },
    { name: 'Arizona',     slug: 'arizona'     },
    { name: 'Utah',        slug: 'utah'        },
    { name: 'Nevada',      slug: 'nevada'      },
    { name: 'California',  slug: 'california'  },
    { name: 'Oregon',      slug: 'oregon'      },
    { name: 'Washington',  slug: 'washington'  },
    { name: 'Alaska',      slug: 'alaska'      },
    { name: 'Hawaii',      slug: 'hawaii'      },
  ],
};

const REGION_ACCENTS = {
  Northeast: '#e8b94a',
  Midwest:   '#ffb084',
  South:     '#1a3a3a',
  West:      '#6b9080',
};

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: `Category | ${SITE_NAME}` };

  const title = `${cat.name} Directory — All 50 US States | ${SITE_NAME}`;
  const description = `Browse verified ${cat.noun} across all 50 US states on FirmsLedger. Find top-rated ${cat.noun} ranked by real customer reviews, not paid placements.`;
  const canonical = `${_BASE}/categories/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image' },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryHubPage({ params }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} Directory`,
    description: `Browse verified ${cat.noun} across all 50 US states on FirmsLedger.`,
    url: `${_BASE}/categories/${slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: _BASE },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh' }}>

        {/* ── Page header ── */}
        <div style={{ backgroundColor: '#faf5e8', borderBottom: '1px solid #e5e5e5', padding: '48px 24px 40px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#6a6a6a', textDecoration: 'none', marginBottom: 20 }}>
              ← Back to Directory
            </Link>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: cat.accent, borderRadius: 9999, padding: '4px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: cat.accentText, textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
                Category
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', lineHeight: 0.95, marginBottom: 16, marginTop: 0, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
              {cat.name} Directory
            </h1>
            <p style={{ fontSize: 17, color: '#3a3a3a', lineHeight: 1.55, maxWidth: 560, marginBottom: 0 }}>
              {cat.desc} Browse all 50 states — ranked by real reviews, not paid placements.
            </p>
          </div>
        </div>

        {/* ── State grid ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 96px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 40, fontFamily: '"IBM Plex Mono", monospace' }}>
            Browse by state — 50 US states covered
          </p>

          {Object.entries(US_STATES_BY_REGION).map(([region, states]) => (
            <div key={region} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: REGION_ACCENTS[region], fontFamily: '"IBM Plex Mono", monospace' }}>
                  {region}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }} />
              </div>

              <style>{`
                .state-pill-${region} { background-color: #f5f0e0; border-color: #e5e5e5; }
                .state-pill-${region}:hover { background-color: ${REGION_ACCENTS[region]}22; border-color: ${REGION_ACCENTS[region]}; }
              `}</style>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {states.map((state) => (
                  <Link
                    key={state.slug}
                    href={`/top/${slug}/${state.slug}`}
                    className={`state-pill-${region}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      border: '1px solid',
                      borderRadius: 9999,
                      padding: '8px 14px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#3a3a3a',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {state.name}
                    <ArrowRight size={12} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Other categories ── */}
        <div style={{ backgroundColor: '#faf5e8', borderTop: '1px solid #e5e5e5', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 24 }}>
              Other categories
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {Object.entries(CATEGORIES).filter(([s]) => s !== slug).map(([s, c]) => (
                <Link
                  key={s}
                  href={`/categories/${s}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: c.accent,
                    color: c.accentText,
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {c.name}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
