'use client';

/**
 * Layout — Clay.com design system
 * Nav:    canvas #fffaf0 bg · 64px height · near-black CTA #0a0a0a
 * Footer: surface-soft #faf5e8 bg · warm cream (NOT dark) per Clay system
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/Directory', label: 'Browse Directory' },
  { href: '/Categories', label: 'Categories' },
  { href: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffaf0', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

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
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: pathname === href ? '#0a0a0a' : '#6a6a6a',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  transition: 'color 0.15s, background 0.15s',
                  backgroundColor: pathname === href ? '#f5f0e0' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA — primary button: #0a0a0a bg */}
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
            gap: 4,
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#3a3a3a',
                  textDecoration: 'none',
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: pathname === href ? '#f5f0e0' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
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

      {/* ── Footer ─── surface-soft #faf5e8, cream (NOT dark — Clay system) */}
      <footer style={{ backgroundColor: '#faf5e8', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div style={{ gridColumn: 'span 2', maxWidth: 360 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
                <img src="/logo.svg" alt="FirmsLedger" style={{ height: 32, width: 'auto' }} />
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: '#6a6a6a', maxWidth: 320 }}>
                US manufacturer directory. Find the top verified manufacturers by category and state — bike, electrical, mechanical, and more.
              </p>
            </div>

            {/* Browse by Category */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16 }}>
                Browse by Category
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/top/bike-manufacturers/california', label: 'Bike Manufacturers' },
                  { href: '/top/electrical-manufacturers/texas', label: 'Electrical Manufacturers' },
                  { href: '/top/mechanical-manufacturers/new-york', label: 'Mechanical Manufacturers' },
                  { href: '/Categories', label: 'All Categories' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ fontSize: 14, color: '#6a6a6a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0a0a0a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6a6a6a'}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse by State */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16 }}>
                Browse by State
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/top/bike-manufacturers/california', label: 'California' },
                  { href: '/top/bike-manufacturers/texas', label: 'Texas' },
                  { href: '/top/bike-manufacturers/new-york', label: 'New York' },
                  { href: '/top/bike-manufacturers/florida', label: 'Florida' },
                  { href: '/contact', label: 'Contact Us' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ fontSize: 14, color: '#6a6a6a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0a0a0a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6a6a6a'}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#9a9a9a' }}>© 2026 FirmsLedger. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[{ href: '/terms', label: 'Terms' }, { href: '/privacy', label: 'Privacy' }].map(({ href, label }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: '#6a6a6a', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive helpers — mobile-first without Tailwind on layout */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
