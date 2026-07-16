import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { ArrowRight } from 'lucide-react';
import StateCategoryCard from '@/components/StateCategoryCard';
import StatePill from '@/components/Statepill';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Static state data ─────────────────────────────────────────────────────────

const ALL_STATES = [
  { name: 'Alabama',       slug: 'alabama',        region: 'South'    },
  { name: 'Alaska',        slug: 'alaska',         region: 'West'     },
  { name: 'Arizona',       slug: 'arizona',        region: 'West'     },
  { name: 'Arkansas',      slug: 'arkansas',       region: 'South'    },
  { name: 'California',    slug: 'california',     region: 'West'     },
  { name: 'Colorado',      slug: 'colorado',       region: 'West'     },
  { name: 'Connecticut',   slug: 'connecticut',    region: 'Northeast'},
  { name: 'Delaware',      slug: 'delaware',       region: 'Northeast'},
  { name: 'Florida',       slug: 'florida',        region: 'South'    },
  { name: 'Georgia',       slug: 'georgia',        region: 'South'    },
  { name: 'Hawaii',        slug: 'hawaii',         region: 'West'     },
  { name: 'Idaho',         slug: 'idaho',          region: 'West'     },
  { name: 'Illinois',      slug: 'illinois',       region: 'Midwest'  },
  { name: 'Indiana',       slug: 'indiana',        region: 'Midwest'  },
  { name: 'Iowa',          slug: 'iowa',           region: 'Midwest'  },
  { name: 'Kansas',        slug: 'kansas',         region: 'Midwest'  },
  { name: 'Kentucky',      slug: 'kentucky',       region: 'South'    },
  { name: 'Louisiana',     slug: 'louisiana',      region: 'South'    },
  { name: 'Maine',         slug: 'maine',          region: 'Northeast'},
  { name: 'Maryland',      slug: 'maryland',       region: 'Northeast'},
  { name: 'Massachusetts', slug: 'massachusetts',  region: 'Northeast'},
  { name: 'Michigan',      slug: 'michigan',       region: 'Midwest'  },
  { name: 'Minnesota',     slug: 'minnesota',      region: 'Midwest'  },
  { name: 'Mississippi',   slug: 'mississippi',    region: 'South'    },
  { name: 'Missouri',      slug: 'missouri',       region: 'Midwest'  },
  { name: 'Montana',       slug: 'montana',        region: 'West'     },
  { name: 'Nebraska',      slug: 'nebraska',       region: 'Midwest'  },
  { name: 'Nevada',        slug: 'nevada',         region: 'West'     },
  { name: 'New Hampshire', slug: 'new-hampshire',  region: 'Northeast'},
  { name: 'New Jersey',    slug: 'new-jersey',     region: 'Northeast'},
  { name: 'New Mexico',    slug: 'new-mexico',     region: 'West'     },
  { name: 'New York',      slug: 'new-york',       region: 'Northeast'},
  { name: 'North Carolina',slug: 'north-carolina', region: 'South'    },
  { name: 'North Dakota',  slug: 'north-dakota',   region: 'Midwest'  },
  { name: 'Ohio',          slug: 'ohio',           region: 'Midwest'  },
  { name: 'Oklahoma',      slug: 'oklahoma',       region: 'South'    },
  { name: 'Oregon',        slug: 'oregon',         region: 'West'     },
  { name: 'Pennsylvania',  slug: 'pennsylvania',   region: 'Northeast'},
  { name: 'Rhode Island',  slug: 'rhode-island',   region: 'Northeast'},
  { name: 'South Carolina',slug: 'south-carolina', region: 'South'    },
  { name: 'South Dakota',  slug: 'south-dakota',   region: 'Midwest'  },
  { name: 'Tennessee',     slug: 'tennessee',      region: 'South'    },
  { name: 'Texas',         slug: 'texas',          region: 'South'    },
  { name: 'Utah',          slug: 'utah',           region: 'West'     },
  { name: 'Vermont',       slug: 'vermont',        region: 'Northeast'},
  { name: 'Virginia',      slug: 'virginia',       region: 'South'    },
  { name: 'Washington',    slug: 'washington',     region: 'West'     },
  { name: 'West Virginia', slug: 'west-virginia',  region: 'South'    },
  { name: 'Wisconsin',     slug: 'wisconsin',      region: 'Midwest'  },
  { name: 'Wyoming',       slug: 'wyoming',        region: 'West'     },
];

const CATEGORIES = [
  { slug: 'bike-manufacturers',       name: 'Bike Manufacturers',       accent: '#ffb084', accentText: '#0a0a0a' },
  { slug: 'electrical-manufacturers', name: 'Electrical Manufacturers', accent: '#e8b94a', accentText: '#0a0a0a' },
  { slug: 'mechanical-manufacturers', name: 'Mechanical Manufacturers', accent: '#1a3a3a', accentText: '#ffffff' },
];

const STATE_MAP = Object.fromEntries(ALL_STATES.map((s) => [s.slug, s]));

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ALL_STATES.map((s) => ({ slug: s.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) return { title: `State | ${SITE_NAME}` };

  const title = `Manufacturers in ${state.name} | ${SITE_NAME}`;
  const description = `Find verified bike, electrical, and mechanical manufacturers in ${state.name}. Browse ranked lists by category — updated regularly with real client reviews.`;
  const canonical = `${_BASE}/states/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image' },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StateHubPage({ params }) {
  const { slug } = await params;
  const state = STATE_MAP[slug];
  if (!state) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Manufacturers in ${state.name}`,
    description: `Browse verified bike, electrical, and mechanical manufacturers in ${state.name}.`,
    url: `${_BASE}/states/${slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: _BASE },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        {/* ── Page header ── */}
        <div style={{ backgroundColor: '#faf5e8', borderBottom: '1px solid #e5e5e5', padding: '48px 24px 40px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#6a6a6a', textDecoration: 'none', marginBottom: 20 }}>
              ← Back to Directory
            </Link>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f5f0e0', borderRadius: 9999, padding: '4px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#6a6a6a', textTransform: 'uppercase' }}>
                {state.region}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-1.5px', color: '#0a0a0a', lineHeight: 1.1, marginBottom: 16, marginTop: 0 }}>
              Manufacturers in {state.name}
            </h1>
            <p style={{ fontSize: 17, color: '#3a3a3a', lineHeight: 1.55, maxWidth: 560, marginBottom: 0 }}>
              Browse verified bike, electrical, and mechanical manufacturers in {state.name} — ranked by real customer reviews.
            </p>
          </div>
        </div>

        {/* ── Category cards ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 80px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 32 }}>
            Choose a category
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {CATEGORIES.map((cat) => (
              <StateCategoryCard key={cat.slug} cat={cat} slug={slug} stateName={state.name} />
            ))}
          </div>
        </div>

        {/* ── Other states ── */}
        <div style={{ backgroundColor: '#faf5e8', borderTop: '1px solid #e5e5e5', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 20 }}>
              Other states
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_STATES.filter((s) => s.slug !== slug).slice(0, 20).map((s) => (
                <StatePill key={s.slug} name={s.name} slug={s.slug} />
              ))}
              <Link
                href="/#states"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#0a0a0a',
                  borderRadius: 9999,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ffffff',
                  textDecoration: 'none',
                }}
              >
                All 50 states <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
