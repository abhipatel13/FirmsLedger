'use client';

/**
 * DirectoryHub — Clay.com design system applied to FirmsLedger directory
 *
 * Design tokens (from DESIGN.md):
 *   canvas:        #fffaf0   warm cream page floor
 *   surface-soft:  #faf5e8   section alternates, CTA band
 *   surface-card:  #f5f0e0   card fills, badge pills
 *   surface-strong:#ebe6d6   emphasized bands
 *   ink:           #0a0a0a   headlines, primary buttons
 *   body:          #3a3a3a   running text
 *   muted:         #6a6a6a   captions, sub-labels
 *   hairline:      #e5e5e5   1px borders
 *   card-pink:     #ff4d8b   Bike Manufacturers card
 *   card-ochre:    #e8b94a   Electrical Manufacturers card
 *   card-teal:     #1a3a3a   Mechanical Manufacturers card
 *
 * radius: 12px buttons · 16px cards · 24px feature cards · pill = 9999px
 * section spacing: 96px
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Star, Shield, Search, MapPin, Package, Wrench, Cpu, Car, Shirt, Sofa, UtensilsCrossed, Stethoscope } from 'lucide-react';

// ─── Static data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'bike-manufacturers',
    name: 'Bike Manufacturers',
    desc: 'Road, mountain, BMX, and specialty bicycle makers across the US.',
    count: '40+',
    // feature-card-peach  (#ffb084) — warm, tactile, hands-on craft
    bg: '#ffb084',
    text: '#0a0a0a',
    btnBg: '#0a0a0a',
    btnText: '#ffffff',
    icon: BikeIcon,
  },
  {
    slug: 'electrical-manufacturers',
    name: 'Electrical Manufacturers',
    desc: 'Wiring systems, components, switchgear, and electrical equipment.',
    count: '120+',
    // feature-card-ochre (#e8b94a) — energy, voltage, amber warmth
    bg: '#e8b94a',
    text: '#0a0a0a',
    btnBg: '#0a0a0a',
    btnText: '#ffffff',
    icon: BoltIcon,
  },
  {
    slug: 'mechanical-manufacturers',
    name: 'Mechanical Manufacturers',
    desc: 'CNC machining, precision parts, assemblies, and tooling.',
    count: '95+',
    // feature-card-teal (#1a3a3a) — industrial, precision, serious
    bg: '#1a3a3a',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: GearIcon,
  },
  {
    slug: 'plastics-packaging-manufacturers',
    name: 'Plastics & Packaging Manufacturers',
    desc: 'Injection molding, packaging materials, containers, and plastic components.',
    count: '60+',
    bg: '#6b9080',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: Package,
  },
  {
    slug: 'metal-fabrication-machining',
    name: 'Metal Fabrication & Machining',
    desc: 'Sheet metal, welding, stamping, and custom metal fabrication.',
    count: '85+',
    bg: '#243B58',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: Wrench,
  },
  {
    slug: 'electronics-semiconductor-manufacturers',
    name: 'Electronics & Semiconductor Manufacturers',
    desc: 'PCBs, chips, electronic assemblies, and semiconductor components.',
    count: '70+',
    bg: '#2E4E6E',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: Cpu,
  },
  {
    slug: 'automotive-parts-manufacturers',
    name: 'Automotive Parts Manufacturers',
    desc: 'OEM and aftermarket automotive components and assemblies.',
    count: '55+',
    bg: '#c0563c',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: Car,
  },
  {
    slug: 'textile-apparel-manufacturers',
    name: 'Textile & Apparel Manufacturers',
    desc: 'Fabric production, garment manufacturing, and textile finishing.',
    count: '30+',
    bg: '#d9a5ad',
    text: '#0a0a0a',
    btnBg: '#0a0a0a',
    btnText: '#ffffff',
    icon: Shirt,
  },
  {
    slug: 'furniture-woodworking-manufacturers',
    name: 'Furniture & Woodworking Manufacturers',
    desc: 'Custom furniture, cabinetry, and woodworking production.',
    count: '25+',
    bg: '#a97452',
    text: '#ffffff',
    btnBg: '#fffaf0',
    btnText: '#0a0a0a',
    icon: Sofa,
  },
  {
    slug: 'food-beverage-processing',
    name: 'Food & Beverage Processing',
    desc: 'Food processing equipment, packaging lines, and beverage production.',
    count: '50+',
    bg: '#e0b04a',
    text: '#0a0a0a',
    btnBg: '#0a0a0a',
    btnText: '#ffffff',
    icon: UtensilsCrossed,
  },
  {
    slug: 'medical-device-manufacturers',
    name: 'Medical Device Manufacturers',
    desc: 'Diagnostic equipment, surgical instruments, and medical components.',
    count: '40+',
    bg: '#8fb8a8',
    text: '#0a0a0a',
    btnBg: '#0a0a0a',
    btnText: '#ffffff',
    icon: Stethoscope,
  },
];

const US_STATES = [
  { name: 'Maine', slug: 'maine', abbr: 'ME', region: 'Northeast' },
  { name: 'Vermont', slug: 'vermont', abbr: 'VT', region: 'Northeast' },
  { name: 'New Hampshire', slug: 'new-hampshire', abbr: 'NH', region: 'Northeast' },
  { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA', region: 'Northeast' },
  { name: 'Rhode Island', slug: 'rhode-island', abbr: 'RI', region: 'Northeast' },
  { name: 'Connecticut', slug: 'connecticut', abbr: 'CT', region: 'Northeast' },
  { name: 'New York', slug: 'new-york', abbr: 'NY', region: 'Northeast' },
  { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ', region: 'Northeast' },
  { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA', region: 'Northeast' },
  { name: 'Delaware', slug: 'delaware', abbr: 'DE', region: 'Northeast' },
  { name: 'Maryland', slug: 'maryland', abbr: 'MD', region: 'Northeast' },
  { name: 'Ohio', slug: 'ohio', abbr: 'OH', region: 'Midwest' },
  { name: 'Michigan', slug: 'michigan', abbr: 'MI', region: 'Midwest' },
  { name: 'Indiana', slug: 'indiana', abbr: 'IN', region: 'Midwest' },
  { name: 'Illinois', slug: 'illinois', abbr: 'IL', region: 'Midwest' },
  { name: 'Wisconsin', slug: 'wisconsin', abbr: 'WI', region: 'Midwest' },
  { name: 'Minnesota', slug: 'minnesota', abbr: 'MN', region: 'Midwest' },
  { name: 'Iowa', slug: 'iowa', abbr: 'IA', region: 'Midwest' },
  { name: 'Missouri', slug: 'missouri', abbr: 'MO', region: 'Midwest' },
  { name: 'North Dakota', slug: 'north-dakota', abbr: 'ND', region: 'Midwest' },
  { name: 'South Dakota', slug: 'south-dakota', abbr: 'SD', region: 'Midwest' },
  { name: 'Nebraska', slug: 'nebraska', abbr: 'NE', region: 'Midwest' },
  { name: 'Kansas', slug: 'kansas', abbr: 'KS', region: 'Midwest' },
  { name: 'West Virginia', slug: 'west-virginia', abbr: 'WV', region: 'South' },
  { name: 'Virginia', slug: 'virginia', abbr: 'VA', region: 'South' },
  { name: 'Kentucky', slug: 'kentucky', abbr: 'KY', region: 'South' },
  { name: 'Tennessee', slug: 'tennessee', abbr: 'TN', region: 'South' },
  { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC', region: 'South' },
  { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC', region: 'South' },
  { name: 'Georgia', slug: 'georgia', abbr: 'GA', region: 'South' },
  { name: 'Florida', slug: 'florida', abbr: 'FL', region: 'South' },
  { name: 'Alabama', slug: 'alabama', abbr: 'AL', region: 'South' },
  { name: 'Mississippi', slug: 'mississippi', abbr: 'MS', region: 'South' },
  { name: 'Arkansas', slug: 'arkansas', abbr: 'AR', region: 'South' },
  { name: 'Louisiana', slug: 'louisiana', abbr: 'LA', region: 'South' },
  { name: 'Oklahoma', slug: 'oklahoma', abbr: 'OK', region: 'South' },
  { name: 'Texas', slug: 'texas', abbr: 'TX', region: 'South' },
  { name: 'Montana', slug: 'montana', abbr: 'MT', region: 'West' },
  { name: 'Idaho', slug: 'idaho', abbr: 'ID', region: 'West' },
  { name: 'Wyoming', slug: 'wyoming', abbr: 'WY', region: 'West' },
  { name: 'Colorado', slug: 'colorado', abbr: 'CO', region: 'West' },
  { name: 'New Mexico', slug: 'new-mexico', abbr: 'NM', region: 'West' },
  { name: 'Arizona', slug: 'arizona', abbr: 'AZ', region: 'West' },
  { name: 'Utah', slug: 'utah', abbr: 'UT', region: 'West' },
  { name: 'Nevada', slug: 'nevada', abbr: 'NV', region: 'West' },
  { name: 'California', slug: 'california', abbr: 'CA', region: 'West' },
  { name: 'Oregon', slug: 'oregon', abbr: 'OR', region: 'West' },
  { name: 'Washington', slug: 'washington', abbr: 'WA', region: 'West' },
  { name: 'Alaska', slug: 'alaska', abbr: 'AK', region: 'West' },
  { name: 'Hawaii', slug: 'hawaii', abbr: 'HI', region: 'West' },
];

const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];

// Region accent colors (match category card palette)
const REGION_ACCENTS = {
  Northeast: { color: '#e8b94a', textOnColor: '#0a0a0a' }, // ochre
  Midwest:   { color: '#ffb084', textOnColor: '#0a0a0a' }, // peach
  South:     { color: '#1a3a3a', textOnColor: '#ffffff' }, // teal
  West:      { color: '#6b9080', textOnColor: '#ffffff' }, // sage
};

// Rough manufacturer count per state (for hover tooltip)
const STATE_COUNTS = {
  california: 145, texas: 132, 'new-york': 98, pennsylvania: 87, ohio: 76,
  michigan: 71, illinois: 68, florida: 52, 'north-carolina': 52, indiana: 45,
  massachusetts: 42, wisconsin: 43, georgia: 41, 'new-jersey': 44, minnesota: 39,
  washington: 37, tennessee: 48, virginia: 35, arizona: 34, missouri: 38,
  colorado: 31, 'south-carolina': 31, kentucky: 29, connecticut: 27, maryland: 26,
  utah: 24, louisiana: 23, oregon: 28, iowa: 22, oklahoma: 20, nevada: 19,
  kansas: 19, alabama: 28, arkansas: 17, nebraska: 15, 'west-virginia': 14,
  mississippi: 14, 'new-hampshire': 16, idaho: 13, maine: 12, 'rhode-island': 12,
  'new-mexico': 12, delaware: 11, montana: 8, 'north-dakota': 10, 'south-dakota': 9,
  vermont: 8, wyoming: 7, alaska: 5, hawaii: 6,
};

// Grid positions for the simplified map view [col, row] (1-indexed, 12 cols × 8 rows)
const MAP_POSITIONS = {
  AK: [1, 1],
  WA: [2, 2], MT: [3, 2], ND: [4, 2], MN: [5, 2],
  OR: [2, 3], ID: [3, 3], SD: [4, 3], WI: [5, 3], MI: [6, 3],
  CA: [2, 4], NV: [3, 4], WY: [4, 4], NE: [5, 4], IA: [6, 4], IL: [7, 4],
  IN: [8, 4], OH: [9, 4], PA: [10, 4], NJ: [11, 4], CT: [12, 4],
  UT: [3, 5], CO: [4, 5], KS: [5, 5], MO: [6, 5], KY: [8, 5],
  WV: [9, 5], VA: [10, 5], MD: [11, 5], DE: [12, 5],
  AZ: [2, 6], NM: [3, 6], OK: [4, 6], AR: [5, 6], TN: [6, 6], NC: [7, 6], SC: [8, 6],
  HI: [1, 7], TX: [4, 7], LA: [5, 7], MS: [6, 7], AL: [7, 7], GA: [8, 7],
  FL: [8, 8],
  ME: [12, 1],
  VT: [11, 2], NH: [12, 2],
  NY: [9, 3], MA: [10, 3], RI: [11, 3],
};

// State pill with hover count
function StatePill({ state, categorySlug, accentColor, accentTextColor }) {
  const [hovered, setHovered] = React.useState(false);
  const count = STATE_COUNTS[state.slug];
  return (
    <Link
      href={`/top/${categorySlug || 'bike-manufacturers'}/${state.slug}`}
      title={`${state.name}${count ? ` — ${count} companies` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: hovered ? accentColor + '22' : '#f5f0e0',
        border: `1px solid ${hovered ? accentColor : '#e5e5e5'}`,
        borderRadius: 9999,
        padding: '7px 12px',
        fontSize: 13,
        fontWeight: 500,
        color: '#3a3a3a',
        textDecoration: 'none',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: hovered ? accentColor : '#9a9a9a', fontFamily: '"IBM Plex Mono", monospace' }}>
        {state.abbr}
      </span>
      {state.name}
      {hovered && count && (
        <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, marginLeft: 2, fontFamily: '"IBM Plex Mono", monospace' }}>
          · {count}
        </span>
      )}
    </Link>
  );
}

// Simplified grid map view
function StateMap({ states, categorySlug }) {
  const statesByAbbr = Object.fromEntries(states.map(s => [s.abbr, s]));
  const [hoveredAbbr, setHoveredAbbr] = React.useState(null);

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 46px)',
        gridTemplateRows: 'repeat(8, 38px)',
        gap: 3,
        maxWidth: 600,
      }}>
        {Object.entries(MAP_POSITIONS).map(([abbr, [col, row]]) => {
          const state = statesByAbbr[abbr];
          const region = state?.region;
          const accent = region ? REGION_ACCENTS[region] : null;
          const isHovered = hoveredAbbr === abbr;
          const count = state ? STATE_COUNTS[state.slug] : null;
          if (!state) {
            return (
              <div
                key={abbr}
                style={{
                  gridColumn: col,
                  gridRow: row,
                  backgroundColor: '#f5f0e0',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#c0bab0',
                  opacity: 0.5,
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                {abbr}
              </div>
            );
          }
          return (
            <Link
              key={abbr}
              href={`/top/${categorySlug || 'bike-manufacturers'}/${state.slug}`}
              title={`${state.name}${count ? ` — ${count} companies` : ''}`}
              style={{
                gridColumn: col,
                gridRow: row,
                backgroundColor: isHovered ? accent.color + 'cc' : accent.color + (isHovered ? 'ff' : 'cc'),
                backgroundImage: isHovered ? 'none' : undefined,
                background: isHovered
                  ? accent.color
                  : accent.color + 'bb',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: accent.textOnColor,
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: '"IBM Plex Mono", monospace',
                transition: 'all 0.12s',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isHovered ? `0 2px 8px ${accent.color}60` : 'none',
                zIndex: isHovered ? 2 : 1,
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredAbbr(abbr)}
              onMouseLeave={() => setHoveredAbbr(null)}
            >
              {abbr}
            </Link>
          );
        })}
      </div>
      {/* Region legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        {REGIONS.map(region => {
          const acc = REGION_ACCENTS[region];
          return (
            <div key={region} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: acc.color, display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#6a6a6a' }}>{region}</span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: '#9a9a9a', marginTop: 12 }}>
        Simplified layout — hover a state to preview, click to browse manufacturers.
      </p>
    </div>
  );
}

const STATS = [
  { value: '11', label: 'Categories' },
  { value: '50', label: 'States covered' },
  { value: '500+', label: 'Companies listed' },
  { value: '100%', label: 'Verified listings' },
];

// ─── Inline icons ──────────────────────────────────────────────────────────────

function BikeIcon({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 0 0-1-1h-3l-2 5" />
      <path d="m9 15 3-9 3.5 4.5" />
      <path d="M5.5 14 9 6h5" />
      <path d="m18.5 14-2.5-4" />
    </svg>
  );
}

function BoltIcon({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function GearIcon({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── Hero search preview (illustrative, not real data) ────────────────────────
// NOTE: All company names, cities, and ratings in PREVIEW_EXAMPLES are
// illustrative placeholders to demo the product UI — not real listings.

const PREVIEW_EXAMPLES = [
  {
    label: 'Top Bike Manufacturers in California',
    accent: '#ffb084',
    rows: [
      { rank: 1, name: 'Golden State Cycle Works', city: 'San Francisco', rating: 4.9 },
      { rank: 2, name: 'Pacific Bike Industries', city: 'Los Angeles', rating: 4.7 },
      { rank: 3, name: 'SoCal Bikes Co.', city: 'San Diego', rating: 4.5 },
    ],
  },
  {
    label: 'Top Electrical Manufacturers in Texas',
    accent: '#e8b94a',
    rows: [
      { rank: 1, name: 'Lone Star Power Systems', city: 'Austin', rating: 4.8 },
      { rank: 2, name: 'Texas Switchgear Co.', city: 'Houston', rating: 4.7 },
      { rank: 3, name: 'DFW Electric Works', city: 'Dallas', rating: 4.4 },
    ],
  },
  {
    label: 'Top Mechanical Manufacturers in Ohio',
    accent: '#1a3a3a',
    accentText: '#ffffff',
    rows: [
      { rank: 1, name: 'Ohio Precision Industries', city: 'Columbus', rating: 4.9 },
      { rank: 2, name: 'Great Lakes Machining', city: 'Cleveland', rating: 4.6 },
      { rank: 3, name: 'Buckeye CNC Works', city: 'Cincinnati', rating: 4.4 },
    ],
  },
];

function StarsMini({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="10" height="10" viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? '#e8b94a' : '#e5e5e5'}
          stroke={n <= Math.round(rating) ? '#e8b94a' : '#e5e5e5'}
          strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function HeroSearchPreview() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((i) => (i + 1) % PREVIEW_EXAMPLES.length);
        setFading(false);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const ex = PREVIEW_EXAMPLES[active];

  return (
    <div style={{
      maxWidth: 520,
      margin: '24px auto 0',
      backgroundColor: '#f5f0e0',
      borderRadius: 20,
      padding: '16px 20px',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.3s',
      textAlign: 'left',
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ex.accent, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#6a6a6a', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
          {ex.label}
        </span>
      </div>

      {/* Company rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ex.rows.map((row) => (
          <div
            key={row.rank}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#fffaf0',
              borderRadius: 10,
              padding: '8px 12px',
              border: '1px solid #e5e5e5',
            }}
          >
            <span style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: row.rank === 1 ? ex.accent : '#f5f0e0',
              color: row.rank === 1 ? (ex.accentText || '#0a0a0a') : '#9a9a9a',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: '"IBM Plex Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              #{row.rank}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</p>
              <p style={{ fontSize: 11, color: '#6a6a6a', margin: 0 }}>{row.city}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <StarsMini rating={row.rating} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#3a3a3a', fontFamily: '"IBM Plex Mono", monospace' }}>{row.rating.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
        {PREVIEW_EXAMPLES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 200); }}
            style={{
              width: i === active ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === active ? '#0a0a0a' : '#e5e5e5',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── "Why Trust Our Listings" section data ─────────────────────────────────────
// All claims are accurate based on the actual platform design:
//   "100%" — companies require admin approval (approved=false by default) before publishing
//   "0"    — no pay-to-rank, no sponsored placements (design principle, stated in site copy)
//   "50"   — all 50 US states in the directory (static data)
//   "3"    — three manufacturer categories currently live in the directory
//   "2×"   — both company listings AND individual reviews require separate approval steps

const TRUST_CLAIMS = [
  {
    number: '100%',
    label: 'Listings reviewed before publishing',
    desc: 'Every company submission goes through a manual approval step — nothing appears live automatically.',
    accent: '#ffb084',
  },
  {
    number: '0',
    label: 'Paid rankings — ever',
    desc: "Companies can't buy their way up the list. All positions are determined solely by verified ratings and reviews.",
    accent: '#e8b94a',
  },
  {
    number: '50',
    label: 'US states in the directory',
    desc: 'Full national coverage — every state, not just the top markets. Find manufacturers wherever you operate.',
    accent: '#1a3a3a',
    accentText: '#ffffff',
  },
  {
    number: '11',
    label: 'Focused manufacturing categories',
    desc: 'Bike, electrical, mechanical, plastics, metal fabrication, electronics, automotive, textile, furniture, food & beverage, and medical device manufacturing.',
    accent: '#6b9080',
    accentText: '#ffffff',
  },
  {
    number: '2×',
    label: 'Approval steps per review',
    desc: 'Both the company listing and each individual review go through a separate verification check before going live.',
    accent: '#ffb084',
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function DirectoryHub() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [stateView, setStateView] = useState('list');

  function handleSearch(e) {
    e.preventDefault();
    if (selectedCategory && selectedState) {
      router.push(`/top/${selectedCategory}/${selectedState}`);
    }
  }

  return (
    <div style={{ backgroundColor: '#fffaf0' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════ */}
      {/* Canvas bg, centered, 96px vertical padding */}
      <section style={{ backgroundColor: '#fffaf0', padding: '96px 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Badge pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f5f0e0', borderRadius: 9999, padding: '4px 14px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0a0a0a', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#0a0a0a', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
              US Manufacturer Directory
            </span>
          </div>

          {/* Display headline — Barlow Condensed 800 */}
          <h1 style={{
            fontSize: 'clamp(52px, 7vw, 84px)',
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: '-1px',
            color: '#0a0a0a',
            marginBottom: 24,
            maxWidth: 820,
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: '"Barlow Condensed", sans-serif',
            textTransform: 'uppercase',
          }}>
            Find the top manufacturers
            <br />
            in the United States
          </h1>

          {/* Sub-headline */}
          <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.55, color: '#3a3a3a', marginBottom: 48, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            Browse verified manufacturers across the United States by category and state — bike, electrical, mechanical, and more.
          </p>

          {/* Search widget — surface-card bg, rounded-xl */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 8,
              backgroundColor: '#f5f0e0',
              borderRadius: 24,
              padding: 8,
              maxWidth: 600,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: '1 1 180px',
                backgroundColor: '#fffaf0',
                border: '1px solid #e5e5e5',
                borderRadius: 12,
                padding: '11px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: selectedCategory ? '#0a0a0a' : '#6a6a6a',
                cursor: 'pointer',
                outline: 'none',
                minWidth: 160,
              }}
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                flex: '1 1 180px',
                backgroundColor: '#fffaf0',
                border: '1px solid #e5e5e5',
                borderRadius: 12,
                padding: '11px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: selectedState ? '#0a0a0a' : '#6a6a6a',
                cursor: 'pointer',
                outline: 'none',
                minWidth: 160,
              }}
            >
              <option value="" disabled>Select State</option>
              {US_STATES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!selectedCategory || !selectedState}
              style={{
                backgroundColor: selectedCategory && selectedState ? '#0a0a0a' : '#e5e5e5',
                color: selectedCategory && selectedState ? '#ffffff' : '#6a6a6a',
                border: 'none',
                borderRadius: 12,
                padding: '11px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: selectedCategory && selectedState ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
            >
              <Search size={15} />
              Find Manufacturers
            </button>
          </form>

          {/* Example link */}
          <p style={{ fontSize: 13, color: '#6a6a6a', marginTop: 16 }}>
            Try:{' '}
            <Link href="/top/bike-manufacturers/california" style={{ color: '#0a0a0a', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Top Bike Manufacturers in California
            </Link>
          </p>

          {/* Live search preview mockup */}
          <HeroSearchPreview />
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════ */}
      {/* surface-card pill, centered, compact */}
      <div style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          backgroundColor: '#f5f0e0',
          borderRadius: 24,
          padding: '28px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: 20,
        }}>
          {STATS.map(({ value, label }, i) => (
            <div key={label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {i > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: 1,
                  backgroundColor: '#e5e5e5',
                }} />
              )}
              <span style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: '#0a0a0a', lineHeight: 1, fontFamily: '"IBM Plex Mono", monospace' }}>
                {value}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#6a6a6a', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORY FEATURE CARDS ═════════════════════════════════════ */}
      {/* 3 saturated cards: peach / ochre / teal — 96px section padding */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Section label */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            Browse by Category
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 48, lineHeight: 0.95, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
            Popular manufacturing categories
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.slug}
                  style={{
                    backgroundColor: cat.bg,
                    borderRadius: 24,
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 280,
                  }}
                >
                  {/* Icon + count row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Icon size={28} color={cat.text} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: cat.text,
                      opacity: 0.7,
                      backgroundColor: cat.text === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      borderRadius: 9999,
                      padding: '3px 10px',
                      fontFamily: '"IBM Plex Mono", monospace',
                    }}>
                      {cat.count} companies
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.0, letterSpacing: '0px', color: cat.text, marginBottom: 10, flex: 1, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: cat.text, opacity: 0.75, marginBottom: 24 }}>
                    {cat.desc}
                  </p>

                  {/* Quick state links */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {['California', 'Texas', 'New York'].map((state) => (
                      <Link
                        key={state}
                        href={`/top/${cat.slug}/${state.toLowerCase().replace(/\s+/g, '-')}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: cat.text,
                          backgroundColor: cat.text === '#ffffff' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                          borderRadius: 9999,
                          padding: '5px 12px',
                          textDecoration: 'none',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {state}
                      </Link>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/top/${cat.slug}/california`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: cat.btnBg,
                      color: cat.btnText,
                      borderRadius: 12,
                      padding: '11px 18px',
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: 'none',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Browse listings
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ WHY TRUST OUR LISTINGS ═════════════════════════════════════ */}
      {/* canvas bg, 5 cards, each with ONE number + ONE claim */}
      <section style={{ backgroundColor: '#fffaf0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            Why trust our listings
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 48, lineHeight: 0.95, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
            What makes this directory different
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {TRUST_CLAIMS.map(({ number, label, desc, accent, accentText }) => (
              <div
                key={number + label}
                style={{
                  backgroundColor: '#faf5e8',
                  borderRadius: 20,
                  padding: '28px 24px',
                  border: '1px solid #e5e5e5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Number badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'fit-content',
                  backgroundColor: accent,
                  color: accentText || '#0a0a0a',
                  borderRadius: 12,
                  padding: '6px 14px',
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '0px',
                  lineHeight: 1,
                  fontFamily: '"IBM Plex Mono", monospace',
                }}>
                  {number}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: 0, lineHeight: 1.3 }}>{label}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#6a6a6a', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO BROWSE ═══════════════════════════════════════════════ */}
      {/* surface-soft bg, 3-step process */}
      <section style={{ backgroundColor: '#faf5e8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 0.95, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
            From search to shortlist in seconds
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              {
                num: '1',
                numBg: '#ffb084',
                numColor: '#0a0a0a',
                title: 'Pick a category',
                desc: 'Choose from Bike, Electrical, Mechanical, and more. Each category has dedicated ranked lists.',
              },
              {
                num: '2',
                numBg: '#e8b94a',
                numColor: '#0a0a0a',
                title: 'Select your state',
                desc: 'All 50 US states covered. Find manufacturers close to your supply chain.',
              },
              {
                num: '3',
                numBg: '#1a3a3a',
                numColor: '#ffffff',
                title: 'Browse the rankings',
                desc: 'Ranked by verified reviews and ratings. No pay-to-rank. No sponsored placements.',
              },
            ].map(({ num, numBg, numColor, title, desc }) => (
              <div key={num} style={{ backgroundColor: '#fffaf0', borderRadius: 16, padding: 28, border: '1px solid #e5e5e5' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: numBg,
                  color: numColor,
                  fontSize: 18,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  fontFamily: '"IBM Plex Mono", monospace',
                }}>
                  {num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px', color: '#0a0a0a', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: '#3a3a3a' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ US STATES ═══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fffaf0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Header row */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, fontFamily: '"IBM Plex Mono", monospace' }}>
            Browse by State
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', lineHeight: 0.95, margin: 0, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
              Every US state
            </h2>
            <span style={{ fontSize: 12, color: '#6a6a6a', fontWeight: 500, fontFamily: '"IBM Plex Mono", monospace' }}>50 states · 3 categories each</span>
          </div>

          {/* Search + view toggle row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            {/* Search input */}
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#6a6a6a', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search states…"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#f5f0e0',
                  border: '1px solid #e5e5e5',
                  borderRadius: 12,
                  padding: '10px 14px 10px 38px',
                  fontSize: 14,
                  color: '#0a0a0a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* View toggle */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f5f0e0', borderRadius: 12, padding: 4, gap: 2, flexShrink: 0 }}>
              {[
                { id: 'list', label: 'By Region' },
                { id: 'map',  label: 'Map View'  },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setStateView(id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 9,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: stateView === id ? '#0a0a0a' : 'transparent',
                    color: stateView === id ? '#ffffff' : '#6a6a6a',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List view */}
          {stateView === 'list' && (() => {
            const query = stateSearch.toLowerCase().trim();
            const hasResults = REGIONS.some(region =>
              US_STATES.filter(s => s.region === region).some(
                s => !query || s.name.toLowerCase().includes(query) || s.abbr.toLowerCase() === query
              )
            );
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                {!hasResults && (
                  <p style={{ fontSize: 14, color: '#6a6a6a' }}>No states match &ldquo;{stateSearch}&rdquo;</p>
                )}
                {REGIONS.map((region) => {
                  const accent = REGION_ACCENTS[region];
                  const states = US_STATES.filter(
                    s => s.region === region &&
                    (!query || s.name.toLowerCase().includes(query) || s.abbr.toLowerCase() === query)
                  );
                  if (states.length === 0) return null;
                  return (
                    <div key={region} style={{ borderLeft: `3px solid ${accent.color}`, paddingLeft: 20 }}>
                      {/* Region header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
                          textTransform: 'uppercase', color: accent.color, whiteSpace: 'nowrap',
                          fontFamily: '"IBM Plex Mono", monospace',
                        }}>
                          {region}
                        </span>
                        <span style={{ fontSize: 11, color: '#9a9a9a', fontFamily: '"IBM Plex Mono", monospace' }}>{states.length} states</span>
                        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }} />
                      </div>

                      {/* State pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {states.map((state) => (
                          <StatePill
                            key={state.slug}
                            state={state}
                            categorySlug={selectedCategory || 'bike-manufacturers'}
                            accentColor={accent.color}
                            accentTextColor={accent.textOnColor}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Map view */}
          {stateView === 'map' && (() => {
            const query = stateSearch.toLowerCase().trim();
            const filteredStates = query
              ? US_STATES.filter(s => s.name.toLowerCase().includes(query) || s.abbr.toLowerCase() === query)
              : US_STATES;
            return (
              <StateMap
                states={filteredStates}
                categorySlug={selectedCategory || 'bike-manufacturers'}
              />
            );
          })()}

        </div>
      </section>

      {/* ══ TRUST SIGNALS ═══════════════════════════════════════════════ */}
      {/* surface-soft bg */}
      <section style={{ backgroundColor: '#faf5e8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 0.95, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
            Why FirmsLedger?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: CheckCircle, title: 'Verified listings', desc: 'Every manufacturer is checked before going live. No ghost profiles, no unverified entries.' },
              { icon: Star, title: 'Real reviews only', desc: 'All reviews are from verified clients. We never edit, filter, or hide ratings.' },
              { icon: Shield, title: 'Unbiased rankings', desc: 'Rankings are purely performance-based. Zero pay-to-rank influence — ever.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: '#fffaf0', borderRadius: 16, padding: 28, border: '1px solid #e5e5e5' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={18} color="#0a0a0a" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: '#3a3a3a' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ════════════════════════════════════════════════════ */}
      {/* surface-strong bg, rounded-xl, illustrated-band style */}
      <section style={{ padding: '0 24px 96px', backgroundColor: '#fffaf0' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            backgroundColor: '#ebe6d6',
            borderRadius: 24,
            padding: 'clamp(48px, 6vw, 80px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, fontFamily: '"IBM Plex Mono", monospace' }}>
              For manufacturers
            </p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.5px', color: '#0a0a0a', lineHeight: 0.95, marginBottom: 16, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
              Get your company in front of buyers
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: '#3a3a3a' }}>
              Join FirmsLedger and appear in state-level ranked lists. Verified listings reach procurement managers actively searching for manufacturers.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link
              href="/ListYourCompany"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#0a0a0a',
                color: '#ffffff',
                borderRadius: 12,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
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
                backgroundColor: '#fffaf0',
                color: '#0a0a0a',
                borderRadius: 12,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e5e5e5',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
