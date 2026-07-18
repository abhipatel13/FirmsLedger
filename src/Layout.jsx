'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ArrowRight, Search } from 'lucide-react';

/* ── Manufacturing categories ──────────────────────────────────── */
const NAV_CATEGORIES = [
  { slug: 'electrical-components',     name: 'Electrical Components',          desc: 'Wiring, switchgear & components',      dot: '#eab308' },
  { slug: 'mechanical-components',     name: 'Mechanical Components',          desc: 'CNC machining & precision parts',       dot: '#64748b' },
  { slug: 'plastics-packaging',        name: 'Plastics & Packaging',           desc: 'Injection molding & packaging',         dot: '#22c55e' },
  { slug: 'metal-fabrication',         name: 'Metal Fabrication',              desc: 'Sheet metal, welding & stamping',       dot: '#3b82f6' },
  { slug: 'electronics-semiconductor', name: 'Electronics & Semiconductor',    desc: 'PCBs, chips & assemblies',              dot: '#6366f1' },
  { slug: 'automotive-parts',          name: 'Automotive Parts',               desc: 'OEM & aftermarket components',          dot: '#ef4444' },
  { slug: 'textile-apparel',           name: 'Textile & Apparel',              desc: 'Fabric & garment manufacturing',        dot: '#ec4899' },
  { slug: 'furniture-woodworking',     name: 'Furniture & Woodworking',        desc: 'Custom furniture & cabinetry',          dot: '#a16207' },
  { slug: 'food-beverage-processing',  name: 'Food & Beverage Processing',     desc: 'Processing & packaging lines',          dot: '#f59e0b' },
  { slug: 'medical-devices',           name: 'Medical Devices',                desc: 'Diagnostic & surgical equipment',       dot: '#14b8a6' },
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
  { href: '/admin',   label: 'Admin Login' },
  { href: '/terms',   label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const SOCIAL_LINKS = [
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/firmsledger',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/firmsledger',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [browseOpen, setBrowseOpen]   = useState(false);
  const pathname  = usePathname();
  const browseRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
    }
    function onScroll() { setBrowseOpen(false); }
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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
      }}>
        <div style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 16 }}>
            <img src="/logo.svg" alt="FirmsLedger" style={{ height: 44, width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="nav-desktop">

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
              {browseOpen && (
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
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', margin: '0 8px 12px', fontFamily: 'inherit' }}>
                    Manufacturing Categories
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {NAV_CATEGORIES.map((cat) => (
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
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: cat.dot,
                          flexShrink: 0,
                          marginTop: 5,
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.3 }}>{cat.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 12, paddingTop: 12 }}>
                    <Link
                      href="/browse"
                      onClick={() => setBrowseOpen(false)}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#1A2E4A',
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
              )}
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

            {/* Search icon */}
            <Link
              href="/search"
              aria-label="Search"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                color: '#475569',
                textDecoration: 'none',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Search size={17} />
            </Link>
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* CTA */}
          <Link
            href="/list-your-company"
            className="nav-desktop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#F5A623',
              color: '#1A2E4A',
              borderRadius: 9999,
              padding: '9px 22px',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 6px rgba(245,166,35,0.25)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D48E1A'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,166,35,0.40)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(245,166,35,0.25)'; }}
          >
            List Your Company
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="nav-mobile"
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
              color: '#0f172a',
              marginLeft: 8,
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '8px 16px 20px',
            display: 'flex',
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
            {NAV_CATEGORIES.map(({ slug, name, dot }) => (
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
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: dot, flexShrink: 0 }} />
                {name}
              </Link>
            ))}

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
                  backgroundColor: '#F5A623',
                  color: '#1A2E4A',
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
        )}
      </header>

      {/* Main content */}
      <main style={{ minWidth: 0, overflowX: 'hidden' }}>{children}</main>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '72px 24px 48px' }}>

          {/* Brand row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 64 }}>
            <div style={{ maxWidth: 420 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
                <img src="/logo.svg" alt="FirmsLedger" style={{ height: 40, width: 'auto' }} />
              </Link>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 8, lineHeight: 1.5 }}>
                Connecting you with America's top manufacturers.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginBottom: 20 }}>
                Discover verified US manufacturers across all 50 states and 11 categories. Ranked by real reviews — no paid placements, ever.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {SOCIAL_LINKS.map(({ label, href, path }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1A2E4A'; e.currentTarget.style.backgroundColor = '#1A2E4A'; e.currentTarget.querySelector('svg path').setAttribute('fill', '#ffffff'); }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.querySelector('svg path').setAttribute('fill', '#64748b'); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
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
            borderTop: '1px solid #e2e8f0',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              {'© 2026 FirmsLedger — All rights reserved\u00a0·\u00a0'}
              <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#64748b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >Terms of Service</Link>
              {'\u00a0·\u00a0'}
              <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#64748b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >Privacy Policy</Link>
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              Made for US manufacturers
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .nav-mobile  { display: none !important; }
          .nav-desktop { display: flex !important; }
        }
        @media (max-width: 768px) {
          .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 480px) {
          .footer-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function FooterCol({ heading, links }) {
  return (
    <div>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 16, marginTop: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {heading}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(({ href, label }) => (
          <Link
            key={href + label}
            href={href}
            style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', transition: 'color 0.12s', lineHeight: 1.4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
