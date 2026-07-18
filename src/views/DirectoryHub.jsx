'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Shield, Package, Wrench, Cpu, Car, Shirt, Sofa, UtensilsCrossed, Stethoscope } from 'lucide-react';

// ─── Design tokens ──────────────────────────────────────────────────────────────
// surface-page: #ffffff   surface-alt: #f8fafc   surface-subtle: #f1f5f9
// border: #e2e8f0   text-primary: #0f172a   text-body: #334155   text-muted: #64748b

// ─── Static data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'electrical-components',
    name: 'Electrical Components Manufacturers',
    shortName: 'Electrical Components',
    desc: 'Wiring systems, components, switchgear, and electrical equipment.',
    count: '120+',
    accentBg: '#fef9ee',
    accentBorder: '#fde68a',
    accentText: '#92400e',
    dot: '#eab308',
    icon: BoltIcon,
  },
  {
    slug: 'mechanical-components',
    name: 'Mechanical Components Manufacturers',
    shortName: 'Mechanical Components',
    desc: 'CNC machining, precision parts, assemblies, and tooling.',
    count: '95+',
    accentBg: '#f8fafc',
    accentBorder: '#e2e8f0',
    accentText: '#1e3a5f',
    dot: '#64748b',
    icon: GearIcon,
  },
  {
    slug: 'plastics-packaging',
    name: 'Plastics & Packaging Manufacturers',
    shortName: 'Plastics & Packaging',
    desc: 'Injection molding, packaging materials, containers, and plastic components.',
    count: '60+',
    accentBg: '#f0fdf4',
    accentBorder: '#bbf7d0',
    accentText: '#166534',
    dot: '#22c55e',
    icon: Package,
  },
  {
    slug: 'metal-fabrication',
    name: 'Metal Fabrication & Machining',
    shortName: 'Metal Fabrication',
    desc: 'Sheet metal, welding, stamping, and custom metal fabrication.',
    count: '85+',
    accentBg: '#eff6ff',
    accentBorder: '#bfdbfe',
    accentText: '#1e3a8a',
    dot: '#3b82f6',
    icon: Wrench,
  },
  {
    slug: 'electronics-semiconductor',
    name: 'Electronics & Semiconductor Manufacturers',
    shortName: 'Electronics & Semiconductor',
    desc: 'PCBs, chips, electronic assemblies, and semiconductor components.',
    count: '70+',
    accentBg: '#f5f3ff',
    accentBorder: '#ddd6fe',
    accentText: '#4c1d95',
    dot: '#6366f1',
    icon: Cpu,
  },
  {
    slug: 'automotive-parts',
    name: 'Automotive Parts Manufacturers',
    shortName: 'Automotive Parts',
    desc: 'OEM and aftermarket automotive components and assemblies.',
    count: '55+',
    accentBg: '#fff1f2',
    accentBorder: '#fecdd3',
    accentText: '#9f1239',
    dot: '#ef4444',
    icon: Car,
  },
  {
    slug: 'textile-apparel',
    name: 'Textile & Apparel Manufacturers',
    shortName: 'Textile & Apparel',
    desc: 'Fabric production, garment manufacturing, and textile finishing.',
    count: '30+',
    accentBg: '#fdf2f8',
    accentBorder: '#f9a8d4',
    accentText: '#831843',
    dot: '#ec4899',
    icon: Shirt,
  },
  {
    slug: 'furniture-woodworking',
    name: 'Furniture & Woodworking Manufacturers',
    shortName: 'Furniture & Woodworking',
    desc: 'Custom furniture, cabinetry, and woodworking production.',
    count: '25+',
    accentBg: '#fffbeb',
    accentBorder: '#fde68a',
    accentText: '#78350f',
    dot: '#f59e0b',
    icon: Sofa,
  },
  {
    slug: 'food-beverage-processing',
    name: 'Food & Beverage Processing',
    shortName: 'Food & Beverage',
    desc: 'Food processing equipment, packaging lines, and beverage production.',
    count: '50+',
    accentBg: '#fff7ed',
    accentBorder: '#fed7aa',
    accentText: '#7c2d12',
    dot: '#f97316',
    icon: UtensilsCrossed,
  },
  {
    slug: 'medical-devices',
    name: 'Medical Device Manufacturers',
    shortName: 'Medical Devices',
    desc: 'Diagnostic equipment, surgical instruments, and medical components.',
    count: '40+',
    accentBg: '#f0fdfa',
    accentBorder: '#99f6e4',
    accentText: '#134e4a',
    dot: '#14b8a6',
    icon: Stethoscope,
  },
];

const US_STATES = [
  { name: 'Maine',           slug: 'maine',           abbr: 'ME', region: 'Northeast' },
  { name: 'Vermont',         slug: 'vermont',         abbr: 'VT', region: 'Northeast' },
  { name: 'New Hampshire',   slug: 'new-hampshire',   abbr: 'NH', region: 'Northeast' },
  { name: 'Massachusetts',   slug: 'massachusetts',   abbr: 'MA', region: 'Northeast' },
  { name: 'Rhode Island',    slug: 'rhode-island',    abbr: 'RI', region: 'Northeast' },
  { name: 'Connecticut',     slug: 'connecticut',     abbr: 'CT', region: 'Northeast' },
  { name: 'New York',        slug: 'new-york',        abbr: 'NY', region: 'Northeast' },
  { name: 'New Jersey',      slug: 'new-jersey',      abbr: 'NJ', region: 'Northeast' },
  { name: 'Pennsylvania',    slug: 'pennsylvania',    abbr: 'PA', region: 'Northeast' },
  { name: 'Delaware',        slug: 'delaware',        abbr: 'DE', region: 'Northeast' },
  { name: 'Maryland',        slug: 'maryland',        abbr: 'MD', region: 'Northeast' },
  { name: 'Ohio',            slug: 'ohio',            abbr: 'OH', region: 'Midwest'   },
  { name: 'Michigan',        slug: 'michigan',        abbr: 'MI', region: 'Midwest'   },
  { name: 'Indiana',         slug: 'indiana',         abbr: 'IN', region: 'Midwest'   },
  { name: 'Illinois',        slug: 'illinois',        abbr: 'IL', region: 'Midwest'   },
  { name: 'Wisconsin',       slug: 'wisconsin',       abbr: 'WI', region: 'Midwest'   },
  { name: 'Minnesota',       slug: 'minnesota',       abbr: 'MN', region: 'Midwest'   },
  { name: 'Iowa',            slug: 'iowa',            abbr: 'IA', region: 'Midwest'   },
  { name: 'Missouri',        slug: 'missouri',        abbr: 'MO', region: 'Midwest'   },
  { name: 'North Dakota',    slug: 'north-dakota',    abbr: 'ND', region: 'Midwest'   },
  { name: 'South Dakota',    slug: 'south-dakota',    abbr: 'SD', region: 'Midwest'   },
  { name: 'Nebraska',        slug: 'nebraska',        abbr: 'NE', region: 'Midwest'   },
  { name: 'Kansas',          slug: 'kansas',          abbr: 'KS', region: 'Midwest'   },
  { name: 'West Virginia',   slug: 'west-virginia',   abbr: 'WV', region: 'South'     },
  { name: 'Virginia',        slug: 'virginia',        abbr: 'VA', region: 'South'     },
  { name: 'Kentucky',        slug: 'kentucky',        abbr: 'KY', region: 'South'     },
  { name: 'Tennessee',       slug: 'tennessee',       abbr: 'TN', region: 'South'     },
  { name: 'North Carolina',  slug: 'north-carolina',  abbr: 'NC', region: 'South'     },
  { name: 'South Carolina',  slug: 'south-carolina',  abbr: 'SC', region: 'South'     },
  { name: 'Georgia',         slug: 'georgia',         abbr: 'GA', region: 'South'     },
  { name: 'Florida',         slug: 'florida',         abbr: 'FL', region: 'South'     },
  { name: 'Alabama',         slug: 'alabama',         abbr: 'AL', region: 'South'     },
  { name: 'Mississippi',     slug: 'mississippi',     abbr: 'MS', region: 'South'     },
  { name: 'Arkansas',        slug: 'arkansas',        abbr: 'AR', region: 'South'     },
  { name: 'Louisiana',       slug: 'louisiana',       abbr: 'LA', region: 'South'     },
  { name: 'Oklahoma',        slug: 'oklahoma',        abbr: 'OK', region: 'South'     },
  { name: 'Texas',           slug: 'texas',           abbr: 'TX', region: 'South'     },
  { name: 'Montana',         slug: 'montana',         abbr: 'MT', region: 'West'      },
  { name: 'Idaho',           slug: 'idaho',           abbr: 'ID', region: 'West'      },
  { name: 'Wyoming',         slug: 'wyoming',         abbr: 'WY', region: 'West'      },
  { name: 'Colorado',        slug: 'colorado',        abbr: 'CO', region: 'West'      },
  { name: 'New Mexico',      slug: 'new-mexico',      abbr: 'NM', region: 'West'      },
  { name: 'Arizona',         slug: 'arizona',         abbr: 'AZ', region: 'West'      },
  { name: 'Utah',            slug: 'utah',            abbr: 'UT', region: 'West'      },
  { name: 'Nevada',          slug: 'nevada',          abbr: 'NV', region: 'West'      },
  { name: 'California',      slug: 'california',      abbr: 'CA', region: 'West'      },
  { name: 'Oregon',          slug: 'oregon',          abbr: 'OR', region: 'West'      },
  { name: 'Washington',      slug: 'washington',      abbr: 'WA', region: 'West'      },
  { name: 'Alaska',          slug: 'alaska',          abbr: 'AK', region: 'West'      },
  { name: 'Hawaii',          slug: 'hawaii',          abbr: 'HI', region: 'West'      },
];

const STATS = [
  { value: '10',   label: 'Categories' },
  { value: '50',   label: 'States covered' },
  { value: '67',   label: 'Companies listed' },
  { value: '100%', label: 'Verified listings' },
];

const TRUST_CLAIMS = [
  {
    number: '100%',
    label: 'Listings reviewed before publishing',
    desc: 'Every company submission goes through a manual approval step — nothing appears live automatically.',
    iconBg: '#fef9ee',
    iconColor: '#d97706',
  },
  {
    number: '0',
    label: 'Paid rankings — ever',
    desc: "Companies can't buy their way up the list. All positions are determined solely by verified ratings and reviews.",
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
  },
  {
    number: '50',
    label: 'US states in the directory',
    desc: 'Full national coverage — every state, not just the top markets.',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
  },
  {
    number: '10',
    label: 'Manufacturing categories',
    desc: 'Electrical, mechanical, plastics, metal fabrication, electronics, automotive, textile, furniture, food, and medical.',
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
  },
  {
    number: '2×',
    label: 'Verification steps per review',
    desc: 'Both the company listing and each individual review go through a separate verification check before going live.',
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
  },
];

// ─── Inline icons ────────────────────────────────────────────────────────────────

function BoltIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function GearIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────────

export default function DirectoryHub() {
  const [selectedState, setSelectedState] = useState('california');

  return (
    <div style={{ backgroundColor: '#ffffff' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '80px 0 88px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 24px' }}>
          <div className="hero-grid">

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 9999,
                padding: '5px 14px',
                marginBottom: 28,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#1e40af', textTransform: 'uppercase' }}>
                  US Manufacturer Directory
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: 20,
                maxWidth: 560,
              }}>
                Find top{' '}
                <span style={{ color: '#1A2E4A' }}>manufacturers</span>
                {' '}across the US
              </h1>

              <p style={{
                fontSize: 18,
                lineHeight: 1.65,
                color: '#475569',
                marginBottom: 32,
                maxWidth: 480,
              }}>
                Browse verified manufacturers across every US state by category — electrical, mechanical, automotive, and more. Ranked by real reviews.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {[
                  { icon: CheckCircle, text: '100% verified listings' },
                  { icon: Shield,      text: 'Zero paid rankings' },
                  { icon: Star,        text: 'All 50 US states' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px 24px',
                }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: 4, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══ CATEGORY CARDS ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: '80px 24px' }} id="categories">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
              Browse by Category
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
              Popular manufacturing categories
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.slug}
                  className="card-hover"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: cat.accentBg,
                    border: `1px solid ${cat.accentBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={18} color={cat.accentText} />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 8, lineHeight: 1.35, flex: 1 }}>
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b', marginBottom: 16 }}>
                    {cat.desc}
                  </p>

                  {/* Quick state links */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['california', 'texas', 'new-york'].map((stateSlug, i) => {
                      const stateNames = { 'california': 'California', 'texas': 'Texas', 'new-york': 'New York' };
                      return (
                        <Link
                          key={stateSlug}
                          href={`/${cat.slug}/${stateSlug}`}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 9999,
                            padding: '3px 10px',
                            textDecoration: 'none',
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                        >
                          {stateNames[stateSlug]}
                        </Link>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${cat.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      color: '#1A2E4A',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'gap 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.gap = '8px'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.gap = '5px'; }}
                  >
                    View all states
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ WHY TRUST ═════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
              Why trust our listings
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
              What makes this directory different
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {TRUST_CLAIMS.map(({ number, label, desc, iconBg, iconColor }) => (
              <div
                key={number + label}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 16,
                  padding: '24px 22px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'fit-content',
                  backgroundColor: iconBg,
                  color: iconColor,
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {number}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>{label}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: '80px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
              How it works
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
              From search to shortlist in seconds
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              {
                num: '1',
                numColor: '#1A2E4A',
                title: 'Pick a category',
                desc: 'Choose from Electrical Components, Mechanical Components, Automotive, and more.',
              },
              {
                num: '2',
                numColor: '#D48E1A',
                title: 'Select your state',
                desc: 'All 50 US states covered. Find manufacturers close to your supply chain.',
              },
              {
                num: '3',
                numColor: '#16a34a',
                title: 'Browse the rankings',
                desc: 'Ranked by verified reviews and ratings. No pay-to-rank. No sponsored placements.',
              },
            ].map(({ num, numColor, title, desc }) => (
              <div key={num} style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: '28px 24px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: numColor + '14',
                  border: `1px solid ${numColor}28`,
                  color: numColor,
                  fontSize: 15,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {num}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em', color: '#0f172a', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#475569', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ US STATES PANEL ═══════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 24px', borderTop: '1px solid #e2e8f0' }} id="states">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
                Browse by State
              </p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
                Every US state
              </h2>
            </div>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              50 states · 10 categories each
            </span>
          </div>

          {/* 2-panel state selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            minHeight: 480,
          }} className="state-panel">

            {/* Left: scrollable state list */}
            <div style={{
              borderRight: '1px solid #e2e8f0',
              maxHeight: 540,
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              padding: '4px 0',
            }}>
              {US_STATES.map((state) => {
                const active = selectedState === state.slug;
                return (
                  <button
                    key={state.slug}
                    onMouseEnter={() => setSelectedState(state.slug)}
                    onClick={() => setSelectedState(state.slug)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 20px',
                      fontSize: active ? 14 : 13.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#0f172a' : '#64748b',
                      background: active ? '#ffffff' : 'none',
                      border: 'none',
                      borderLeft: active ? '2px solid #1A2E4A' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                      lineHeight: 1.4,
                      fontFamily: 'inherit',
                    }}
                  >
                    {state.name}
                  </button>
                );
              })}
            </div>

            {/* Right: categories for selected state */}
            <div style={{ padding: '32px 40px', backgroundColor: '#ffffff' }}>
              {(() => {
                const state = US_STATES.find(s => s.slug === selectedState);
                if (!state) return null;
                return (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
                        {state.name}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        {state.region} · Choose a manufacturing category
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/${cat.slug}/${selectedState}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13.5,
                            color: '#334155',
                            textDecoration: 'none',
                            lineHeight: 1.5,
                            padding: '6px 0',
                            borderBottom: '1px solid transparent',
                            transition: 'color 0.12s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A2E4A'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#334155'; }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cat.dot, flexShrink: 0 }} />
                          {cat.shortName} in {state.name}
                        </Link>
                      ))}
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                      <Link
                        href={`/states/${state.slug}`}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#1A2E4A',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'gap 0.12s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.gap = '8px'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.gap = '5px'; }}
                      >
                        See all manufacturers in {state.name}
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <style>{`
            @media (max-width: 640px) {
              .state-panel { grid-template-columns: 1fr !important; }
              .state-panel > div:first-child { max-height: 200px !important; border-right: none !important; border-bottom: 1px solid #e2e8f0; }
            }
          `}</style>
        </div>
      </section>

      {/* ══ WHY FIRMSLEDGER ═══════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: '80px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
              Why FirmsLedger?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { icon: CheckCircle, title: 'Verified listings', desc: 'Every manufacturer is checked before going live. No ghost profiles, no unverified entries.', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { icon: Star,        title: 'Real reviews only', desc: 'All reviews are from verified clients. We never edit, filter, or hide ratings.', color: '#d97706', bg: '#fef9ee', border: '#fde68a' },
              { icon: Shield,      title: 'Unbiased rankings', desc: 'Rankings are purely performance-based. Zero pay-to-rank influence — ever.', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            ].map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: '28px 24px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  <Icon size={18} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#475569', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#1A2E4A', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40,
          }}>
            <div style={{ maxWidth: 560 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                For manufacturers
              </p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', lineHeight: 1.15, marginBottom: 16 }}>
                Get your company in front of buyers
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: 0 }}>
                Join FirmsLedger and appear in state-level ranked lists. Verified listings reach procurement managers actively searching for manufacturers.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href="/list-your-company"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F5A623',
                  color: '#1A2E4A',
                  borderRadius: 9999,
                  padding: '14px 28px',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D48E1A'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,166,35,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,166,35,0.35)'; }}
              >
                List Your Company
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: 9999,
                  padding: '14px 28px',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
