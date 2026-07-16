'use client';

/**
 * Layout — Clay.com design system
 * Nav:    canvas #fffaf0 bg · 64px height · mega-menu dropdown
 * Footer: surface-soft #faf5e8 bg · 4-column restructured links
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

// Mega-menu data
const MEGA_CATEGORIES = [
  { slug: 'bike-manufacturers',       name: 'Bike Manufacturers',       accent: '#ffb084', desc: 'Road, mountain & BMX' },
  { slug: 'electrical-manufacturers', name: 'Electrical Manufacturers', accent: '#e8b94a', desc: 'Wiring, switchgear & components' },
  { slug: 'mechanical-manufacturers', name: 'Mechanical Manufacturers', accent: '#1a3a3a', desc: 'CNC machining & precision parts' },
];

// Top 6 states by listing count
const MEGA_STATES = [
  { name: 'California',  slug: 'california'  },
  { name: 'Texas',       slug: 'texas'        },
  { name: 'New York',    slug: 'new-york'     },
  { name: 'Pennsylvania',slug: 'pennsylvania' },
  { name: 'Ohio',        slug: 'ohio'         },
  { name: 'Michigan',    slug: 'michigan'     },
];

function MapPinMini() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseTab, setBrowseTab] = useState('category');
  const pathname = usePathname();
  const browseRef = useRef(null);

  // Close mega-menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffaf0' }}>

      {/* ── Nav ─── canvas bg, 64px, sticky */}
      <header style={{
        backgroundColor: '#fffaf0',
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/logo.svg" alt="FirmsLedger" style={{ height: 36, width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">

            {/* Browse mega-menu trigger */}
            <div
              ref={browseRef}
              style={{ position: 'relative' }}
              onMouseEnter={() => setBrowseOpen(true)}
              onMouseLeave={() => setBrowseOpen(false)}
            >
              <button
                onClick={() => setBrowseOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  color: browseOpen ? '#0a0a0a' : '#6a6a6a',
                  backgroundColor: browseOpen ? '#f5f0e0' : 'transparent',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                Browse
                <ChevronDown
                  size={14}
                  style={{ transform: browseOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                />
              </button>

              {/* Mega-menu panel */}
              {browseOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#fffaf0',
                  border: '1px solid #e5e5e5',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(10,10,10,0.10)',
                  width: 460,
                  padding: 20,
                  zIndex: 100,
                }}>
                  {/* Tab bar */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16, backgroundColor: '#f5f0e0', borderRadius: 12, padding: 4 }}>
                    {[{ id: 'category', label: 'By Category' }, { id: 'state', label: 'By State' }].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setBrowseTab(id)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: 9,
                          border: 'none',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          backgroundColor: browseTab === id ? '#0a0a0a' : 'transparent',
                          color: browseTab === id ? '#ffffff' : '#6a6a6a',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* By Category */}
                  {browseTab === 'category' && (
                    <div>
                      {MEGA_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setBrowseOpen(false)}
                          className="mega-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            textDecoration: 'none',
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.accent, flexShrink: 0, border: cat.accent === '#1a3a3a' ? '2px solid #1a3a3a' : 'none' }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                            <p style={{ fontSize: 12, color: '#6a6a6a', margin: '2px 0 0' }}>{cat.desc}</p>
                          </div>
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid #e5e5e5', marginTop: 10, paddingTop: 12 }}>
                        <Link
                          href="/Categories"
                          onClick={() => setBrowseOpen(false)}
                          style={{ fontSize: 13, fontWeight: 600, color: '#6a6a6a', textDecoration: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                        >
                          Browse all categories →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* By State */}
                  {browseTab === 'state' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {MEGA_STATES.map((st) => (
                          <Link
                            key={st.slug}
                            href={`/states/${st.slug}`}
                            onClick={() => setBrowseOpen(false)}
                            className="mega-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '9px 12px',
                              borderRadius: 10,
                              textDecoration: 'none',
                              fontSize: 14,
                              fontWeight: 500,
                              color: '#0a0a0a',
                            }}
                          >
                            <MapPinMini />
                            {st.name}
                          </Link>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid #e5e5e5', marginTop: 10, paddingTop: 12 }}>
                        <Link
                          href="/#states"
                          onClick={() => setBrowseOpen(false)}
                          style={{ fontSize: 13, fontWeight: 600, color: '#6a6a6a', textDecoration: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                        >
                          Browse all 50 states →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: pathname === '/contact' ? '#0a0a0a' : '#6a6a6a',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'color 0.15s, background 0.15s',
                backgroundColor: pathname === '/contact' ? '#f5f0e0' : 'transparent',
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA — primary button */}
          <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/ListYourCompany"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#0a0a0a',
                color: '#ffffff',
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                lineHeight: 1,
                transition: 'background 0.15s',
              }}
            >
              List Your Company
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="show-mobile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {mobileOpen ? <X size={22} color="#0a0a0a" /> : <Menu size={22} color="#0a0a0a" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            backgroundColor: '#fffaf0',
            borderTop: '1px solid #e5e5e5',
            padding: '12px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9a9a9a', padding: '8px 12px 4px', margin: 0, fontFamily: '"IBM Plex Mono", monospace' }}>
              By Category
            </p>
            {MEGA_CATEGORIES.map(({ slug, name, accent }) => (
              <Link
                key={slug}
                href={`/categories/${slug}`}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, color: '#3a3a3a', textDecoration: 'none', padding: '10px 12px', borderRadius: 10 }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                {name}
              </Link>
            ))}

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9a9a9a', padding: '12px 12px 4px', margin: 0, fontFamily: '"IBM Plex Mono", monospace' }}>
              By State
            </p>
            {MEGA_STATES.map(({ slug, name }) => (
              <Link
                key={slug}
                href={`/states/${slug}`}
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, fontWeight: 500, color: '#3a3a3a', textDecoration: 'none', padding: '10px 12px', borderRadius: 10, display: 'block' }}
              >
                {name}
              </Link>
            ))}

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: 15, fontWeight: 500, color: '#3a3a3a', textDecoration: 'none', padding: '10px 12px', borderRadius: 10, display: 'block', borderTop: '1px solid #e5e5e5', marginTop: 8, paddingTop: 14 }}
            >
              Contact
            </Link>

            <div style={{ borderTop: '1px solid #e5e5e5', marginTop: 8, paddingTop: 12 }}>
              <Link
                href="/ListYourCompany"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0a0a0a',
                  color: '#ffffff',
                  borderRadius: 12,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                List Your Company
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ minWidth: 0, overflowX: 'hidden' }}>{children}</main>

      {/* ── Footer ─── surface-soft #faf5e8, 4-column layout */}
      <footer style={{ backgroundColor: '#faf5e8', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
          <div className="footer-grid" style={{ display: 'grid', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div className="footer-brand">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
                <img src="/logo.svg" alt="FirmsLedger" style={{ height: 32, width: 'auto' }} />
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: '#6a6a6a', maxWidth: 300 }}>
                US manufacturer directory. Find the top verified manufacturers by category and state — bike, electrical, mechanical, and more.
              </p>
            </div>

            {/* Browse by Category */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16, marginTop: 0, fontFamily: '"IBM Plex Mono", monospace' }}>
                Browse by Category
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/categories/bike-manufacturers',       label: 'Bike Manufacturers' },
                  { href: '/categories/electrical-manufacturers', label: 'Electrical Manufacturers' },
                  { href: '/categories/mechanical-manufacturers', label: 'Mechanical Manufacturers' },
                  { href: '/Categories',                          label: 'All Categories' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6a6a6a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse by State */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16, marginTop: 0, fontFamily: '"IBM Plex Mono", monospace' }}>
                Browse by State
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/states/california',  label: 'California' },
                  { href: '/states/texas',        label: 'Texas' },
                  { href: '/states/new-york',     label: 'New York' },
                  { href: '/states/ohio',         label: 'Ohio' },
                  { href: '/states/michigan',     label: 'Michigan' },
                  { href: '/#states',             label: 'All 50 states →' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6a6a6a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* For Companies */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16, marginTop: 0, fontFamily: '"IBM Plex Mono", monospace' }}>
                For Companies
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/ListYourCompany', label: 'List Your Company' },
                  { href: '/contact',         label: 'Contact Us' },
                  { href: '/admin',           label: 'Admin Login' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6a6a6a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#9a9a9a', margin: 0 }}>© 2026 FirmsLedger. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[{ href: '/terms', label: 'Terms' }, { href: '/privacy', label: 'Privacy' }].map(({ href, label }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: '#6a6a6a', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
        .mega-item { background: transparent; transition: background 0.12s; }
        .mega-item:hover { background: #f5f0e0 !important; }
        .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-brand { grid-column: auto; }
        }
      `}</style>
    </div>
  );
}
