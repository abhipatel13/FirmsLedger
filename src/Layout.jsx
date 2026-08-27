'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, Search,
} from 'lucide-react';

/* ── Footer data ───────────────────────────────────────────────── */
const FOOTER_MANUFACTURERS = [
  { href: '/electrical-components',     label: 'Electrical Components' },
  { href: '/mechanical-components',     label: 'Mechanical Components' },
  { href: '/metal-fabrication',         label: 'Metal Fabrication' },
  { href: '/electronics-semiconductor', label: 'Electronics & Semiconductor' },
  { href: '/automotive-parts',          label: 'Automotive Parts' },
  { href: '/medical-devices',           label: 'Medical Devices' },
  { href: '/browse',                                label: 'View All Categories' },
];

const FOOTER_STATES = [
  { href: '/states/california',   label: 'California' },
  { href: '/states/texas',        label: 'Texas' },
  { href: '/states/new-york',     label: 'New York' },
  { href: '/states/ohio',         label: 'Ohio' },
  { href: '/states/michigan',     label: 'Michigan' },
  { href: '/states/pennsylvania', label: 'Pennsylvania' },
  { href: '/states/illinois',     label: 'Illinois' },
  { href: '/locations',           label: 'All 50 States' },
];

const FOOTER_RESOURCES = [
  { href: '/list-your-company', label: 'List Your Company' },
  { href: '/claim-listing',    label: 'Claim a Listing' },
  { href: '/contact',         label: 'Contact Us' },
];

const FOOTER_COMPANY = [
  // Re-enable once the public-facing admin entry point is ready.
  // { href: '/admin',   label: 'Admin Login' },
  { href: '/about',   label: 'About Us' },
  { href: '/terms',   label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [navQuery, setNavQuery]       = useState('');
  const pathname  = usePathname();
  const router    = useRouter();
  const scrolledRef   = useRef(false);
  const navSearchInputRef = useRef(null);

  // Same target/param convention as the hero search box (src/components/home/HeroSearch.jsx)
  // so both search entry points feed the same /search results.
  function handleNavSearch(e) {
    e.preventDefault();
    const q = navQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setNavSearchOpen(false);
    setNavQuery('');
  }

  // Keep refs in sync so the scroll closure always reads current values
  useEffect(() => { scrolledRef.current   = scrolled;   }, [scrolled]);

  useEffect(() => {
    function onScroll() {
      const next = window.scrollY > 8;
      if (next !== scrolledRef.current) setScrolled(next);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (navSearchOpen) navSearchInputRef.current?.focus();
  }, [navSearchOpen]);

  const isActive = (href) => pathname === href;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <header style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(15,23,42,0.08)' : '1px solid #e2e8f0',
        boxShadow: scrolled ? '0 4px 20px -8px rgba(15,23,42,0.10)' : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 72,
        transition: 'background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}>
        <div className="nav-container" style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>

          {/* Logo */}
          <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 16 }}>
            <img src="/logo.svg" alt="FirmsLedger" style={{ height: 48, width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2">

            {/* Capabilities */}
            <Link
              href="/capabilities"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive('/capabilities') ? '#0f172a' : '#475569',
                textDecoration: 'none',
                padding: '7px 12px',
                borderRadius: 8,
                transition: 'all 0.12s',
                backgroundColor: isActive('/capabilities') ? '#f1f5f9' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!isActive('/capabilities')) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              Capabilities
            </Link>

            {/* Locations */}
            <Link
              href="/locations"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive('/locations') ? '#0f172a' : '#475569',
                textDecoration: 'none',
                padding: '7px 12px',
                borderRadius: 8,
                transition: 'all 0.12s',
                backgroundColor: isActive('/locations') ? '#f1f5f9' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!isActive('/locations')) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              Locations
            </Link>

            {/* About */}
            <Link
              href="/about"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive('/about') ? '#0f172a' : '#475569',
                textDecoration: 'none',
                padding: '7px 12px',
                borderRadius: 8,
                transition: 'all 0.12s',
                backgroundColor: isActive('/about') ? '#f1f5f9' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!isActive('/about')) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              About
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive('/contact') ? '#0f172a' : '#475569',
                textDecoration: 'none',
                padding: '7px 12px',
                borderRadius: 8,
                transition: 'all 0.12s',
                backgroundColor: isActive('/contact') ? '#f1f5f9' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (!isActive('/contact')) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              Contact
            </Link>
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search — inline expanding box, submits to the same /search?q= route as the hero search bar */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', position: 'relative' }}>
            {navSearchOpen ? (
              <form
                onSubmit={handleNavSearch}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setNavSearchOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid #e2e8f0',
                  borderRadius: 9999,
                  padding: '4px 6px 4px 14px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  ref={navSearchInputRef}
                  type="text"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setNavSearchOpen(false); }}
                  placeholder="Search manufacturers..."
                  aria-label="Search"
                  style={{
                    width: 190,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13.5,
                    color: '#0f172a',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 9999,
                    border: 'none',
                    backgroundColor: '#D4A017',
                    color: '#0F172A',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Search size={13} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setNavSearchOpen(true)}
                aria-label="Search"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  background: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Search size={17} />
              </button>
            )}
          </div>

          {/* CTA */}
          <Link
            href="/list-your-company"
            className="hidden lg:inline-flex"
            style={{
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#D4A017',
              color: '#0F172A',
              borderRadius: 9999,
              padding: '9px 22px',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s, box-shadow 0.15s, transform 0.15s',
              fontFamily: 'inherit',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 6px rgba(212,160,23,0.25)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A87A0F'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(212,160,23,0.40)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D4A017'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(212,160,23,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            List Your Company
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden flex nav-hamburger"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
              color: '#0f172a',
              marginLeft: 8,
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '8px 16px 20px',
          display: mobileOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: 1,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}>

          {/* Mobile search bar — same /search?q= target as the desktop and hero search boxes */}
          <form
            onSubmit={(e) => { handleNavSearch(e); setMobileOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search manufacturers..."
              aria-label="Search"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#0f172a',
                fontFamily: 'inherit',
              }}
            />
          </form>

          <Link
            href="/capabilities"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: isActive('/capabilities') ? '#0f172a' : '#475569',
              textDecoration: 'none',
              padding: '9px 12px',
              borderRadius: 8,
              backgroundColor: isActive('/capabilities') ? '#f1f5f9' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { if (!isActive('/capabilities')) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Capabilities
          </Link>

          <Link
            href="/locations"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: isActive('/locations') ? '#0f172a' : '#475569',
              textDecoration: 'none',
              padding: '9px 12px',
              borderRadius: 8,
              backgroundColor: isActive('/locations') ? '#f1f5f9' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { if (!isActive('/locations')) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Locations
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: isActive('/about') ? '#0f172a' : '#475569',
              textDecoration: 'none',
              padding: '9px 12px',
              borderRadius: 8,
              backgroundColor: isActive('/about') ? '#f1f5f9' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { if (!isActive('/about')) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            About
          </Link>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0', paddingTop: 8 }}>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', padding: '9px 12px', borderRadius: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Contact
            </Link>
          </div>

          <div style={{ marginTop: 4 }}>
            <Link
              href="/list-your-company"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D4A017',
                color: '#0F172A',
                borderRadius: 9999,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              List Your Company
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      {/* No overflow-x here: setting only one axis forces the CSS spec to resolve
          the other to `auto`, which would give <main> its own scrollbar in
          addition to the page's. html/body in index.css already clip overflow-x. */}
      <main style={{ minWidth: 0 }}>{children}</main>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ background: '#0F172A' }}>
        <div className="px-6 lg:px-8" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', paddingTop: 72, paddingBottom: 48 }}>

          {/* Brand + links, one row (brand column, then four link columns) */}
          <div className="footer-cols" style={{
            display: 'grid',
            gridTemplateColumns: '1.7fr repeat(4, 1fr)',
            gap: 40,
            marginBottom: 48,
          }}>
            <div style={{ maxWidth: 340 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
                <img src="/logo-white.svg" alt="FirmsLedger" style={{ height: 40, width: 'auto' }} />
              </Link>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#F9FAFB', marginBottom: 8, lineHeight: 1.5 }}>
                Connecting you with America's top manufacturers.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#9CA3AF', marginBottom: 20 }}>
                Discover USA manufacturers across all 50 states and 11 categories — no paid placements, ever.
              </p>
            </div>

            <FooterCol heading="Manufacturers" links={FOOTER_MANUFACTURERS} />
            <FooterCol heading="Browse by State" links={FOOTER_STATES} />
            <FooterCol heading="Resources" links={FOOTER_RESOURCES} />
            <FooterCol heading="Company" links={FOOTER_COMPANY} />
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              {'© 2026 FirmsLedger — All rights reserved\u00a0·\u00a0'}
              <Link href="/terms" className="link-underline" style={{ color: '#6B7280', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A017')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >Terms of Service</Link>
              {'\u00a0·\u00a0'}
              <Link href="/privacy" className="link-underline" style={{ color: '#6B7280', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A017')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >Privacy Policy</Link>
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Made for USA manufacturers
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 480px) {
          .footer-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .nav-container {
            position: relative;
            flex-direction: row-reverse !important;
          }
          .nav-logo {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin-right: 0 !important;
          }
          .nav-hamburger {
            margin-left: 0 !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function FooterCol({ heading, links }) {
  return (
    <div>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: '#F9FAFB', marginBottom: 16, marginTop: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {heading}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(({ href, label }) => (
          <Link
            key={href + label}
            href={href}
            className="link-underline"
            style={{ fontSize: 14, color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.12s', lineHeight: 1.4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A017')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
