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
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Star, Shield, Search, MapPin } from 'lucide-react';

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

const STATS = [
  { value: '3', label: 'Categories' },
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function DirectoryHub() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (selectedCategory && selectedState) {
      router.push(`/top/${selectedCategory}/${selectedState}`);
    }
  }

  return (
    <div style={{ backgroundColor: '#fffaf0', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════ */}
      {/* Canvas bg, centered, 96px vertical padding */}
      <section style={{ backgroundColor: '#fffaf0', padding: '96px 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Badge pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f5f0e0', borderRadius: 9999, padding: '4px 14px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0a0a0a', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', color: '#0a0a0a', textTransform: 'uppercase' }}>
              US Manufacturer Directory
            </span>
          </div>

          {/* Display headline — Inter 500, -2.5px tracking (Plain Black substitute) */}
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '-2.5px',
            color: '#0a0a0a',
            marginBottom: 24,
            maxWidth: 820,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Find the top manufacturers
            <br />
            in your state
          </h1>

          {/* Sub-headline */}
          <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.55, color: '#3a3a3a', marginBottom: 48, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            Browse verified manufacturers by category and state — bike, electrical, mechanical, and more.
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
              <span style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6a6a6a', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
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
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center' }}>
            Browse by Category
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', textAlign: 'center', marginBottom: 48, lineHeight: 1.1 }}>
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
                      fontSize: 12,
                      fontWeight: 600,
                      color: cat.text,
                      opacity: 0.6,
                      backgroundColor: cat.text === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      borderRadius: 9999,
                      padding: '3px 10px',
                    }}>
                      {cat.count} companies
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.3px', color: cat.text, marginBottom: 10, flex: 1 }}>
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

      {/* ══ HOW TO BROWSE ═══════════════════════════════════════════════ */}
      {/* surface-soft bg, 3-step process */}
      <section style={{ backgroundColor: '#faf5e8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12, textAlign: 'center' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 1.1 }}>
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
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
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
      {/* Canvas bg, region groups */}
      <section style={{ backgroundColor: '#fffaf0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12 }}>
            Browse by State
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', lineHeight: 1.1, margin: 0 }}>
              Every US state
            </h2>
            <span style={{ fontSize: 14, color: '#6a6a6a', fontWeight: 500 }}>50 states · 3 categories each</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {REGIONS.map((region) => {
              const states = US_STATES.filter((s) => s.region === region);
              return (
                <div key={region}>
                  {/* Region label with hairline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9a9a9a', whiteSpace: 'nowrap' }}>
                      {region}
                    </span>
                    <div style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }} />
                  </div>

                  {/* State pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {states.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/top/bike-manufacturers/${state.slug}`}
                        title={state.name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#f5f0e0',
                          border: '1px solid #e5e5e5',
                          borderRadius: 9999,
                          padding: '7px 14px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#3a3a3a',
                          textDecoration: 'none',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ebe6d6';
                          e.currentTarget.style.borderColor = '#0a0a0a';
                          e.currentTarget.style.color = '#0a0a0a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f0e0';
                          e.currentTarget.style.borderColor = '#e5e5e5';
                          e.currentTarget.style.color = '#3a3a3a';
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a' }}>{state.abbr}</span>
                        {state.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TRUST SIGNALS ═══════════════════════════════════════════════ */}
      {/* surface-soft bg */}
      <section style={{ backgroundColor: '#faf5e8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', textAlign: 'center', marginBottom: 56, lineHeight: 1.1 }}>
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
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 12 }}>
              For manufacturers
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, letterSpacing: '-1px', color: '#0a0a0a', lineHeight: 1.1, marginBottom: 16 }}>
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
