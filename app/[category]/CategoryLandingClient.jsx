'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';

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
    { name: 'Montana',    slug: 'montana'    },
    { name: 'Idaho',      slug: 'idaho'      },
    { name: 'Wyoming',    slug: 'wyoming'    },
    { name: 'Colorado',   slug: 'colorado'   },
    { name: 'New Mexico', slug: 'new-mexico' },
    { name: 'Arizona',    slug: 'arizona'    },
    { name: 'Utah',       slug: 'utah'       },
    { name: 'Nevada',     slug: 'nevada'     },
    { name: 'California', slug: 'california' },
    { name: 'Oregon',     slug: 'oregon'     },
    { name: 'Washington', slug: 'washington' },
    { name: 'Alaska',     slug: 'alaska'     },
    { name: 'Hawaii',     slug: 'hawaii'     },
  ],
};

const REGION_ACCENTS = {
  Northeast: '#e8b94a',
  Midwest:   '#ffb084',
  South:     '#1a3a3a',
  West:      '#6b9080',
};

const ALL_STATES_FLAT = Object.values(US_STATES_BY_REGION)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name));

export default function CategoryLandingClient({ cat, slug, otherCategories }) {
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [pickedCategory, setPickedCategory] = useState(slug);
  const [pickedState, setPickedState] = useState(ALL_STATES_FLAT[0].slug);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#64748b', textDecoration: 'none', marginBottom: 20 }}>
            ← Back to Directory
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cat.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: '#64748b', textTransform: 'uppercase' }}>
              Manufacturing Category
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1, marginBottom: 12, marginTop: 0 }}>
            {cat.name}
          </h1>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, maxWidth: 560, marginBottom: 0 }}>
            {cat.desc} Browse all 50 states — ranked by real reviews, not paid placements.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 96px' }}>

        {/* ── Subcategories ── */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 16 }}>
            Filter by Subcategory (optional)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={() => setSelectedSubcat(null)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: 9999,
                border: '1px solid',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                backgroundColor: selectedSubcat === null ? '#0f172a' : '#ffffff',
                color: selectedSubcat === null ? '#ffffff' : '#475569',
                borderColor: selectedSubcat === null ? '#0f172a' : '#e2e8f0',
              }}
            >
              All {cat.shortName}
            </button>
            {cat.subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubcat(selectedSubcat === sub.slug ? null : sub.slug)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 16px',
                  borderRadius: 9999,
                  border: '1px solid',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                  backgroundColor: selectedSubcat === sub.slug ? '#0f172a' : '#ffffff',
                  color: selectedSubcat === sub.slug ? '#ffffff' : '#475569',
                  borderColor: selectedSubcat === sub.slug ? '#0f172a' : '#e2e8f0',
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
          {selectedSubcat && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
              Showing results for <strong style={{ color: '#0f172a' }}>{cat.subcategories.find((s) => s.slug === selectedSubcat)?.name}</strong> — select a state below.
            </p>
          )}
        </div>

        {/* ── State picker ── */}
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 16 }}>
          Browse by category &amp; state
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <select
            value={pickedCategory}
            onChange={(e) => setPickedCategory(e.target.value)}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              minWidth: 240,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {MANUFACTURING_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={pickedState}
            onChange={(e) => setPickedState(e.target.value)}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              minWidth: 200,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {ALL_STATES_FLAT.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <Link
            href={
              selectedSubcat && pickedCategory === slug
                ? `/${pickedCategory}/${selectedSubcat}/${pickedState}`
                : `/${pickedCategory}/${pickedState}`
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: 10,
              padding: '11px 20px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Companies <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Other categories ── */}
      <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 20 }}>
            Other categories
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 9999,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#334155',
                  textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.accent, flexShrink: 0 }} />
                {c.shortName}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
