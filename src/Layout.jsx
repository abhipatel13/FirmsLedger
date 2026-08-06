'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, ChevronDown, ArrowRight, Search, Zap,
} from 'lucide-react';

import { visualsFor } from '@/lib/categoryRegistry';

/* ── Manufacturing categories ──────────────────────────────────────
   Icon + muted accent palette kept in sync with the category cards on
   the homepage (src/views/DirectoryHub.jsx) for a consistent icon
   system across the site — no decorative colored dots. */
const NAV_CATEGORIES = [
  { slug: 'electrical-components',     name: 'Electrical Components',          desc: 'Wiring, switchgear & components' },
  { slug: 'mechanical-components',     name: 'Mechanical Components',          desc: 'CNC machining & precision parts' },
  { slug: 'plastics-packaging',        name: 'Plastics & Packaging',           desc: 'Injection molding & packaging' },
  { slug: 'metal-fabrication',         name: 'Metal Fabrication',              desc: 'Sheet metal, welding & stamping' },
  { slug: 'electronics-semiconductor', name: 'Electronics & Semiconductor',    desc: 'PCBs, chips & assemblies' },
  { slug: 'automotive-parts',          name: 'Automotive Parts',               desc: 'OEM & aftermarket components' },
  { slug: 'textile-apparel',           name: 'Textile & Apparel',              desc: 'Fabric & garment manufacturing' },
  { slug: 'furniture-woodworking',     name: 'Furniture & Woodworking',        desc: 'Custom furniture & cabinetry' },
  { slug: 'food-beverage-processing',  name: 'Food & Beverage Processing',     desc: 'Processing & packaging lines' },
  { slug: 'medical-devices',           name: 'Medical Devices',                desc: 'Diagnostic & surgical equipment' },
];

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
  { href: '/#states',             label: 'All 50 States' },
];

const FOOTER_RESOURCES = [
  { href: '/list-your-company', label: 'List Your Company' },
  { href: '/claim-listing',    label: 'Claim a Listing' },
  { href: '/contact',         label: 'Contact Us' },
];

const FOOTER_COMPANY = [
  // Re-enable once the public-facing admin entry point is ready.
  // { href: '/admin',   label: 'Admin Login' },
  { href: '/terms',   label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [browseOpen, setBrowseOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const pathname  = usePathname();
  const browseRef = useRef(null);
  const browseOpenRef = useRef(false);
  const scrolledRef   = useRef(false);

  // Keep refs in sync so the scroll closure always reads current values
  useEffect(() => { browseOpenRef.current = browseOpen; }, [browseOpen]);
  useEffect(() => { scrolledRef.current   = scrolled;   }, [scrolled]);

  useEffect(() => {
    function onClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
    }
    function onScroll() {
      if (browseOpenRef.current) setBrowseOpen(false);
      const next = window.scrollY > 8;
      if (next !== scrolledRef.current) setScrolled(next);
    }
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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

            {/* Browse mega-menu */}
            <div
              ref={browseRef}
              style={{ position: 'relative' }}
            >

              <button
                onClick={() => setBrowseOpen(v => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  color: browseOpen ? '#0f172a' : '#475569',
                  backgroundColor: browseOpen ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!browseOpen) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
              >
                Browse
                <ChevronDown size={14} style={{ transform: browseOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {/* Mega-menu panel */}
              <div
                className="animate-slide-down"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  boxShadow: '0 16px 48px -8px rgba(15,23,42,0.12), 0 4px 16px -4px rgba(15,23,42,0.06)',
                  width: 560,
                  padding: 16,
                  zIndex: 100,
                  display: browseOpen ? 'block' : 'none',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', margin: '0 8px 12px', fontFamily: 'inherit' }}>
                  Manufacturing Categories
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {NAV_CATEGORIES.map((cat) => {
                    const visuals = visualsFor(cat.slug);
                    const Icon = visuals?.icon || Zap;
                    const hex = visuals?.hex || { bg: '#ffffff', border: '#e2e8f0', color: '#0f172a' };
                    return (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}`}
                        onClick={() => setBrowseOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 8,
                          textDecoration: 'none',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          backgroundColor: hex.bg,
                          border: `1px solid ${hex.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={14} color={hex.color} strokeWidth={2} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.3 }}>{cat.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 12, paddingTop: 12 }}>
                  <Link
                    href="/browse"
                    onClick={() => setBrowseOpen(false)}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#0F172A',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    Browse all categories <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

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

          {/* Search icon */}
          <Link
            href="/search"
            aria-label="Search"
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              color: '#475569',
              textDecoration: 'none',
              transition: 'all 0.12s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Search size={17} />
          </Link>

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

          {/* Mobile search bar */}
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400 }}>Search manufacturers...</span>
          </Link>

          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', padding: '8px 12px 4px', margin: 0 }}>
            Categories
          </p>
           {NAV_CATEGORIES.map(({ slug, name }) => {
            const visuals = visualsFor(slug);
            const Icon = visuals?.icon || Zap;
            const hex = visuals?.hex || { bg: '#ffffff', border: '#e2e8f0', color: '#0f172a' };
            return (
              <Link
                key={slug}
                href={`/${slug}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '9px 12px',
                  borderRadius: 8,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  backgroundColor: hex.bg,
                  border: `1px solid ${hex.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={13} color={hex.color} strokeWidth={2} />
                </span>
                {name}
              </Link>
            );
          })}

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
      <footer style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
        <div className="px-6 lg:px-8" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', paddingTop: 72, paddingBottom: 48 }}>

          {/* Brand row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 64 }}>
            <div style={{ maxWidth: 420 }}>
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
          </div>

          {/* 4-column links */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
            marginBottom: 48,
          }} className="footer-cols">

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
