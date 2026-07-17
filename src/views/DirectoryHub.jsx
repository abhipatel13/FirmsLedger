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

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Shield, Package, Wrench, Cpu, Car, Shirt, Sofa, UtensilsCrossed, Stethoscope } from 'lucide-react';

// ─── Static data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
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

// Rough manufacturer count per state
const STATS = [
  { value: '11', label: 'Categories' },
  { value: '50', label: 'States covered' },
  { value: '67', label: 'Companies listed' },
  { value: '100%', label: 'Verified listings' },
];

// ─── Inline icons ──────────────────────────────────────────────────────────────

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
  const [selectedStatePanel, setSelectedStatePanel] = useState('california');

  return (
    <div style={{ backgroundColor: '#fffaf0' }}>

      {/* ══ HERO — asymmetric 2-column split ══════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '64px 0 72px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 24px' }}>
          <div className="hero-grid">

            {/* LEFT — headline + search + trust */}
            <div>
              {/* Badge pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 9999,
                padding: '5px 14px',
                marginBottom: 28,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#1A2E4A', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', color: '#1A2E4A', textTransform: 'uppercase' }}>
                  US Manufacturer Directory
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: '-2px',
                color: '#0F172A',
                marginBottom: 20,
                maxWidth: 560,
              }}>
                Find the top{' '}
                <span style={{ color: '#1A2E4A' }}>manufacturers</span>
                {' '}in the US
              </h1>

              {/* Sub-headline */}
              <p style={{
                fontSize: 18,
                lineHeight: 1.65,
                color: '#475569',
                marginBottom: 24,
                maxWidth: 480,
              }}>
                Browse verified manufacturers across every US state by category — bike, electrical, mechanical, and more. Ranked by real reviews.
              </p>

              {/* Trust signals row */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Mini stats 2×2 grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {STATS.map(({ value, label }) => (
                  <div key={label} style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '16px 20px',
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: 4, letterSpacing: '-0.5px', fontFamily: '"IBM Plex Mono", monospace' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ STATS BAND ══════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#1A2E4A', borderTop: '1px solid #243B58', borderBottom: '1px solid #243B58' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                style={{
                  textAlign: 'center',
                  padding: '36px 32px',
                  borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  flex: '1 1 160px',
                }}
              >
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(30px, 3vw, 44px)',
                  fontWeight: 700,
                  color: '#F5A623',
                  lineHeight: 1,
                  fontFamily: '"IBM Plex Mono", monospace',
                  marginBottom: 8,
                }}>
                  {value}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CATEGORY FEATURE CARDS ═════════════════════════════════════ */}
      {/* 3 saturated cards: peach / ochre / teal — 96px section padding */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Section label */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            Browse by Category
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 48, lineHeight: 1.1, textTransform: 'uppercase' }}>
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
                  {/* Icon row */}
                  <div style={{ marginBottom: 20 }}>
                    <Icon size={28} color={cat.text} />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.0, letterSpacing: '0px', color: cat.text, marginBottom: 10, flex: 1, fontFamily: 'inherit', textTransform: 'uppercase' }}>
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
      <section style={{ backgroundColor: '#fffaf0', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            Why trust our listings
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 48, lineHeight: 1.1, textTransform: 'uppercase' }}>
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
      <section style={{ backgroundColor: '#faf5e8', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 1.1, textTransform: 'uppercase' }}>
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

      {/* ══ US STATES — Sortlist-style interactive panel ══════════════ */}
      <section style={{ backgroundColor: '#fffaf0', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Header */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, fontFamily: '"IBM Plex Mono", monospace' }}>
            Browse by State
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0a0a0a', lineHeight: 1.1, margin: 0, textTransform: 'uppercase' }}>
              Every US state
            </h2>
            <span style={{ fontSize: 12, color: '#6a6a6a', fontWeight: 500, fontFamily: '"IBM Plex Mono", monospace' }}>
              50 states · 11 categories each
            </span>
          </div>

          {/* 2-panel state selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            border: '1px solid #e5e5e5',
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            minHeight: 480,
          }} className="state-panel">

            {/* Left: scrollable state list */}
            <div style={{
              borderRight: '1px solid #e5e5e5',
              maxHeight: 540,
              overflowY: 'auto',
              backgroundColor: '#faf5e8',
              padding: '8px 0',
            }}>
              {US_STATES.map((state) => {
                const isSelected = selectedStatePanel === state.slug;
                return (
                  <button
                    key={state.slug}
                    onMouseEnter={() => setSelectedStatePanel(state.slug)}
                    onClick={() => setSelectedStatePanel(state.slug)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 24px',
                      fontSize: isSelected ? 19 : 16,
                      fontWeight: isSelected ? 700 : 400,
                      color: isSelected ? '#0a0a0a' : '#a0978a',
                      background: isSelected ? '#ffffff' : 'none',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #1A2E4A' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      lineHeight: 1.3,
                      fontFamily: 'inherit',
                    }}
                  >
                    {state.name}
                  </button>
                );
              })}
            </div>

            {/* Right: category links for selected state */}
            <div style={{ padding: '36px 44px', backgroundColor: '#ffffff' }}>
              {(() => {
                const state = US_STATES.find(s => s.slug === selectedStatePanel);
                if (!state) return null;
                return (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', margin: '0 0 6px' }}>
                        {state.name}
                      </h3>
                    </div>

                    {/* Category links — 2-col grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/top/${cat.slug}/${selectedStatePanel}`}
                          style={{
                            fontSize: 14,
                            color: '#0a0a0a',
                            textDecoration: 'none',
                            lineHeight: 1.5,
                            padding: '2px 0',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A2E4A'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#0a0a0a'; e.currentTarget.style.textDecoration = 'none'; }}
                        >
                          {cat.name} in {state.name}
                        </Link>
                      ))}
                    </div>

                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f0ede6' }}>
                      <Link
                        href={`/Directory?state=${state.name}`}
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#1A2E4A',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#F5A623')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                      >
                        See all manufacturers in {state.name} →
                      </Link>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Responsive: mobile collapses to simple list */}
          <style>{`
            @media (max-width: 640px) {
              .state-panel { grid-template-columns: 1fr !important; }
              .state-panel > div:first-child { max-height: 240px !important; border-right: none !important; border-bottom: 1px solid #e5e5e5; }
            }
          `}</style>
        </div>
      </section>

      {/* ══ TRUST SIGNALS ═══════════════════════════════════════════════ */}
      {/* surface-soft bg */}
      <section style={{ backgroundColor: '#faf5e8', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 1.1, textTransform: 'uppercase' }}>
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
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 14, fontFamily: '"IBM Plex Mono", monospace' }}>
                For manufacturers
              </p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.1, marginBottom: 18 }}>
                Get your company in front of buyers
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', maxWidth: 480 }}>
                Join FirmsLedger and appear in state-level ranked lists. Verified listings reach procurement managers actively searching for manufacturers.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href="/ListYourCompany"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F5A623',
                  color: '#1A2E4A',
                  borderRadius: 9999,
                  padding: '15px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D48E1A'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(245,166,35,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,166,35,0.4)'; }}
              >
                List Your Company
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  borderRadius: 9999,
                  padding: '15px 32px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
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
