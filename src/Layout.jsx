'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, ArrowRight, Search } from 'lucide-react';

/* ── All 11 categories with colored dots ─────────────────────── */
const NAV_CATEGORIES = [
  { slug: 'bike-manufacturers',                  name: 'Bike Manufacturers',           desc: 'Road, mountain & BMX',               dot: '#ffb084' },
  { slug: 'electrical-manufacturers',            name: 'Electrical Manufacturers',     desc: 'Wiring, switchgear & components',    dot: '#e8b94a' },
  { slug: 'mechanical-manufacturers',            name: 'Mechanical Manufacturers',     desc: 'CNC machining & precision parts',    dot: '#2d5a5a' },
  { slug: 'plastics-packaging-manufacturers',    name: 'Plastics & Packaging',         desc: 'Injection molding & packaging',      dot: '#6b9080' },
  { slug: 'metal-fabrication-machining',         name: 'Metal Fabrication',            desc: 'Sheet metal, welding & stamping',    dot: '#4a6fa5' },
  { slug: 'electronics-semiconductor-manufacturers', name: 'Electronics & Semiconductor', desc: 'PCBs, chips & assemblies',        dot: '#5b8db8' },
  { slug: 'automotive-parts-manufacturers',      name: 'Automotive Parts',             desc: 'OEM & aftermarket components',       dot: '#c0563c' },
  { slug: 'textile-apparel-manufacturers',       name: 'Textile & Apparel',            desc: 'Fabric & garment manufacturing',     dot: '#c9848d' },
  { slug: 'furniture-woodworking-manufacturers', name: 'Furniture & Woodworking',      desc: 'Custom furniture & cabinetry',       dot: '#a97452' },
  { slug: 'food-beverage-processing',            name: 'Food & Beverage',              desc: 'Processing & packaging lines',       dot: '#d4a843' },
  { slug: 'medical-device-manufacturers',        name: 'Medical Devices',              desc: 'Diagnostic & surgical equipment',    dot: '#5fa894' },
];

const NAV_STATES = [
  { name: 'California',     slug: 'california'     },
  { name: 'Texas',          slug: 'texas'           },
  { name: 'New York',       slug: 'new-york'        },
  { name: 'Ohio',           slug: 'ohio'            },
  { name: 'Michigan',       slug: 'michigan'        },
  { name: 'Pennsylvania',   slug: 'pennsylvania'    },
  { name: 'Illinois',       slug: 'illinois'        },
  { name: 'North Carolina', slug: 'north-carolina'  },
  { name: 'Georgia',        slug: 'georgia'         },
  { name: 'Florida',        slug: 'florida'         },
  { name: 'Tennessee',      slug: 'tennessee'       },
  { name: 'Indiana',        slug: 'indiana'         },
];

/* ── All 50 US states for nav search ─────────────────────────── */
const SEARCH_STATES = [
  { name: 'Alabama', slug: 'alabama' }, { name: 'Alaska', slug: 'alaska' },
  { name: 'Arizona', slug: 'arizona' }, { name: 'Arkansas', slug: 'arkansas' },
  { name: 'California', slug: 'california' }, { name: 'Colorado', slug: 'colorado' },
  { name: 'Connecticut', slug: 'connecticut' }, { name: 'Delaware', slug: 'delaware' },
  { name: 'Florida', slug: 'florida' }, { name: 'Georgia', slug: 'georgia' },
  { name: 'Hawaii', slug: 'hawaii' }, { name: 'Idaho', slug: 'idaho' },
  { name: 'Illinois', slug: 'illinois' }, { name: 'Indiana', slug: 'indiana' },
  { name: 'Iowa', slug: 'iowa' }, { name: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', slug: 'kentucky' }, { name: 'Louisiana', slug: 'louisiana' },
  { name: 'Maine', slug: 'maine' }, { name: 'Maryland', slug: 'maryland' },
  { name: 'Massachusetts', slug: 'massachusetts' }, { name: 'Michigan', slug: 'michigan' },
  { name: 'Minnesota', slug: 'minnesota' }, { name: 'Mississippi', slug: 'mississippi' },
  { name: 'Missouri', slug: 'missouri' }, { name: 'Montana', slug: 'montana' },
  { name: 'Nebraska', slug: 'nebraska' }, { name: 'Nevada', slug: 'nevada' },
  { name: 'New Hampshire', slug: 'new-hampshire' }, { name: 'New Jersey', slug: 'new-jersey' },
  { name: 'New Mexico', slug: 'new-mexico' }, { name: 'New York', slug: 'new-york' },
  { name: 'North Carolina', slug: 'north-carolina' }, { name: 'North Dakota', slug: 'north-dakota' },
  { name: 'Ohio', slug: 'ohio' }, { name: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Oregon', slug: 'oregon' }, { name: 'Pennsylvania', slug: 'pennsylvania' },
  { name: 'Rhode Island', slug: 'rhode-island' }, { name: 'South Carolina', slug: 'south-carolina' },
  { name: 'South Dakota', slug: 'south-dakota' }, { name: 'Tennessee', slug: 'tennessee' },
  { name: 'Texas', slug: 'texas' }, { name: 'Utah', slug: 'utah' },
  { name: 'Vermont', slug: 'vermont' }, { name: 'Virginia', slug: 'virginia' },
  { name: 'Washington', slug: 'washington' }, { name: 'West Virginia', slug: 'west-virginia' },
  { name: 'Wisconsin', slug: 'wisconsin' }, { name: 'Wyoming', slug: 'wyoming' },
];

/* ── Footer data ─────────────────────────────────────────────── */
const FOOTER_CATEGORIES = [
  { href: '/top/bike-manufacturers/california',                      label: 'Bike Manufacturers' },
  { href: '/top/electrical-manufacturers/california',                label: 'Electrical Manufacturers' },
  { href: '/top/mechanical-manufacturers/california',                label: 'Mechanical Manufacturers' },
  { href: '/top/metal-fabrication-machining/california',             label: 'Metal Fabrication' },
  { href: '/top/electronics-semiconductor-manufacturers/california', label: 'Electronics & Semiconductor' },
  { href: '/top/automotive-parts-manufacturers/california',          label: 'Automotive Parts' },
  { href: '/Categories',                                             label: 'View All Categories' },
];

const FOOTER_STATES = [
  { href: '/top/bike-manufacturers/california',   label: 'California' },
  { href: '/top/bike-manufacturers/texas',        label: 'Texas' },
  { href: '/top/bike-manufacturers/new-york',     label: 'New York' },
  { href: '/top/bike-manufacturers/ohio',         label: 'Ohio' },
  { href: '/top/bike-manufacturers/michigan',     label: 'Michigan' },
  { href: '/top/bike-manufacturers/pennsylvania', label: 'Pennsylvania' },
  { href: '/top/bike-manufacturers/illinois',     label: 'Illinois' },
  { href: '/#states',                             label: 'All 50 States' },
];

const FOOTER_RESOURCES = [
  { href: '/WriteReview',     label: 'Write a Review' },
  { href: '/ListYourCompany', label: 'List Your Company' },
  { href: '/claim-listing',   label: 'Claim a Listing' },
  { href: '/contact',         label: 'Contact Us' },
];

const FOOTER_COMPANY = [
  { href: '/admin',   label: 'Admin Login' },
  { href: '/terms',   label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const SOCIAL_LINKS = [
  {
    label: 'X / Twitter', href: 'https://twitter.com/firmsledger',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z',
  },
  {
    label: 'LinkedIn', href: 'https://linkedin.com/company/firmsledger',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseTab, setBrowseTab] = useState('category');
  const [navCategory, setNavCategory] = useState('');
  const [navState, setNavState] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const browseRef = useRef(null);
  const browseCloseTimer = useRef(null);

  function handleNavSearch(e) {
    e.preventDefault();
    if (navCategory && navState) {
      router.push(`/top/${navCategory}/${navState}`);
    }
  }

  function openBrowse() {
    if (browseCloseTimer.current) clearTimeout(browseCloseTimer.current);
    setBrowseOpen(true);
  }
  function scheduleBrowseClose() {
    browseCloseTimer.current = setTimeout(() => setBrowseOpen(false), 150);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (browseCloseTimer.current) clearTimeout(browseCloseTimer.current);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href) => pathname === href;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

      {/* ══ NAVIGATION ══════════════════════════════════════════════ */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E8E8E8',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 72,
      }}>
        <div style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '0 28px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>

          {/* Logo — 52px, bigger */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 20 }}>
            <img src="/logo.svg" alt="FirmsLedger" style={{ height: 52, width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">

            {/* Browse mega-menu */}
            <div
              ref={browseRef}
              style={{ position: 'relative' }}
              onMouseEnter={openBrowse}
              onMouseLeave={scheduleBrowseClose}
            >
              {/* Invisible bridge so mouse moving into dropdown gap doesn't trigger close */}
              <div style={{ position: 'absolute', bottom: -8, left: 0, right: 0, height: 8 }} />
              <button
                onClick={() => setBrowseOpen(v => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 15,
                  fontWeight: 500,
                  color: browseOpen ? '#1A2E4A' : '#4B5563',
                  backgroundColor: 'transparent',
                  border: '1px solid',
                  borderColor: browseOpen ? '#1A2E4A' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1A2E4A';
                  e.currentTarget.style.borderColor = '#1A2E4A';
                }}
                onMouseLeave={(e) => {
                  if (!browseOpen) {
                    e.currentTarget.style.color = '#4B5563';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Browse
                <ChevronDown
                  size={15}
                  style={{ transform: browseOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                />
              </button>

              {/* Mega-menu panel — 640px wide, 2-col categories */}
              {/* paddingBottom on parent bridges the 8px gap so mouse stays within hover zone */}
              {browseOpen && (
                <div
                  onMouseEnter={openBrowse}
                  onMouseLeave={scheduleBrowseClose}
                  style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 20,
                  boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15), 0 4px 20px -4px rgba(0,0,0,0.08)',
                  width: 640,
                  padding: 20,
                  zIndex: 100,
                }}>

                  {/* Tab toggle — dark active tab like image 6 */}
                  <div style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 16,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 12,
                    padding: 4,
                  }}>
                    {[{ id: 'category', label: 'By Category' }, { id: 'state', label: 'By State' }].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setBrowseTab(id)}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          borderRadius: 9,
                          border: 'none',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          backgroundColor: browseTab === id ? '#111827' : 'transparent',
                          color: browseTab === id ? '#ffffff' : '#6B7280',
                          fontFamily: 'inherit',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Category tab — all 11 in 2 columns with colored dots */}
                  {browseTab === 'category' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {NAV_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/top/${cat.slug}/california`}
                            onClick={() => setBrowseOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              padding: '9px 10px',
                              borderRadius: 10,
                              textDecoration: 'none',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: cat.dot,
                              flexShrink: 0,
                              marginTop: 5,
                            }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                              <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: '2px 0 0', lineHeight: 1.3 }}>{cat.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 12, paddingTop: 12 }}>
                        <Link
                          href="/Categories"
                          onClick={() => setBrowseOpen(false)}
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: '#1A2E4A',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#F5A623')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                        >
                          Browse all categories <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* State tab — 3-column grid */}
                  {browseTab === 'state' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                        {NAV_STATES.map((st) => (
                          <Link
                            key={st.slug}
                            href={`/top/bike-manufacturers/${st.slug}`}
                            onClick={() => setBrowseOpen(false)}
                            style={{
                              display: 'block',
                              padding: '9px 12px',
                              borderRadius: 9,
                              textDecoration: 'none',
                              fontSize: 14,
                              fontWeight: 500,
                              color: '#111827',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {st.name}
                          </Link>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 12, paddingTop: 12 }}>
                        <Link
                          href="/#states"
                          onClick={() => setBrowseOpen(false)}
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: '#1A2E4A',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#F5A623')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                        >
                          Browse all 50 states <ArrowRight size={13} />
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
                fontSize: 15,
                fontWeight: 500,
                color: isActive('/contact') ? '#111827' : '#4B5563',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                transition: 'all 0.12s',
                backgroundColor: isActive('/contact') ? '#F3F4F6' : 'transparent',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive('/contact')) { e.currentTarget.style.color = '#111827'; e.currentTarget.style.backgroundColor = '#F9FAFB'; } }}
              onMouseLeave={(e) => { if (!isActive('/contact')) { e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              Contact
            </Link>
          </nav>

          {/* Compact nav search */}
          <form
            onSubmit={handleNavSearch}
            className="hidden-mobile nav-search"
            style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, margin: '0 16px', minWidth: 0 }}
          >
            <select
              value={navCategory}
              onChange={(e) => setNavCategory(e.target.value)}
              style={{
                flex: '1 1 130px',
                maxWidth: 200,
                height: 38,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '0 10px',
                fontSize: 13,
                color: navCategory ? '#0F172A' : '#9CA3AF',
                backgroundColor: '#F9FAFB',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              <option value="" disabled>Category</option>
              {NAV_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              value={navState}
              onChange={(e) => setNavState(e.target.value)}
              style={{
                flex: '1 1 110px',
                maxWidth: 180,
                height: 38,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '0 10px',
                fontSize: 13,
                color: navState ? '#0F172A' : '#9CA3AF',
                backgroundColor: '#F9FAFB',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              <option value="" disabled>State</option>
              {SEARCH_STATES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!navCategory || !navState}
              aria-label="Search manufacturers"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: 'none',
                backgroundColor: navCategory && navState ? '#F5A623' : '#F3F4F6',
                color: navCategory && navState ? '#1A2E4A' : '#9CA3AF',
                cursor: navCategory && navState ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <Search size={15} />
            </button>
          </form>

          {/* Desktop CTA — gold pill, like GoodFirms "Get Listed" */}
          <Link
            href="/ListYourCompany"
            className="hidden-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#F5A623',
              color: '#1A2E4A',
              borderRadius: 9999,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(245,166,35,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D48E1A'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,166,35,0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,166,35,0.3)'; }}
          >
            List Your Company
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
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
              color: '#111827',
              marginLeft: 'auto',
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #E8E8E8',
            padding: '12px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            {/* Mobile search */}
            <form onSubmit={(e) => { handleNavSearch(e); setMobileOpen(false); }} style={{ display: 'flex', gap: 6, padding: '8px 0 12px', flexWrap: 'wrap' }}>
              <select
                value={navCategory}
                onChange={(e) => setNavCategory(e.target.value)}
                style={{ flex: '1 1 120px', height: 40, border: '1px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: 13, color: navCategory ? '#0F172A' : '#9CA3AF', backgroundColor: '#F9FAFB', fontFamily: 'inherit', outline: 'none' }}
              >
                <option value="" disabled>Category</option>
                {NAV_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <select
                value={navState}
                onChange={(e) => setNavState(e.target.value)}
                style={{ flex: '1 1 110px', height: 40, border: '1px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: 13, color: navState ? '#0F172A' : '#9CA3AF', backgroundColor: '#F9FAFB', fontFamily: 'inherit', outline: 'none' }}
              >
                <option value="" disabled>State</option>
                {SEARCH_STATES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
              <button
                type="submit"
                disabled={!navCategory || !navState}
                style={{ height: 40, paddingInline: 16, borderRadius: 8, border: 'none', backgroundColor: navCategory && navState ? '#F5A623' : '#F3F4F6', color: navCategory && navState ? '#1A2E4A' : '#9CA3AF', fontWeight: 700, fontSize: 13, cursor: navCategory && navState ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Search size={14} /> Find
              </button>
            </form>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9CA3AF', padding: '8px 12px 4px', margin: 0 }}>
              Categories
            </p>
            {NAV_CATEGORIES.map(({ slug, name, dot }) => (
              <Link
                key={slug}
                href={`/top/${slug}/california`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#111827',
                  textDecoration: 'none',
                  padding: '10px 12px',
                  borderRadius: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dot, flexShrink: 0 }} />
                {name}
              </Link>
            ))}

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9CA3AF', padding: '12px 12px 4px', margin: 0 }}>
              Top States
            </p>
            {NAV_STATES.slice(0, 6).map(({ slug, name }) => (
              <Link
                key={slug}
                href={`/top/bike-manufacturers/${slug}`}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#111827', textDecoration: 'none', padding: '10px 12px', borderRadius: 10 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {name}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid #E8E8E8', marginTop: 10, paddingTop: 12 }}>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#4B5563', textDecoration: 'none', padding: '10px 12px', borderRadius: 10 }}
              >
                Contact
              </Link>
            </div>

            <div style={{ marginTop: 8 }}>
              <Link
                href="/ListYourCompany"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F5A623',
                  color: '#1A2E4A',
                  borderRadius: 9999,
                  padding: '13px 20px',
                  fontSize: 15,
                  fontWeight: 700,
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

      {/* ══ FOOTER — light gray, Sortlist-style ══════════════════════ */}
      <footer style={{ backgroundColor: '#F4F4F5', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '64px 28px 40px' }}>

          {/* Brand block — logo + tagline + description + socials */}
          <div style={{ marginBottom: 56 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 20 }}>
              <img src="/logo.svg" alt="FirmsLedger" style={{ height: 52, width: 'auto' }} />
            </Link>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 10, lineHeight: 1.4, maxWidth: 480 }}>
              Connecting you with America's top manufacturers.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#6B7280', maxWidth: 420, marginBottom: 24 }}>
              Discover verified US manufacturers across all 50 states and 11 categories. Ranked by real reviews — no paid placements, ever.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIAL_LINKS.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: '#E5E7EB',
                    border: '1px solid #D1D5DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1A2E4A'; e.currentTarget.style.borderColor = '#1A2E4A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E5E7EB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#4B5563">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* 4-column link grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
            marginBottom: 48,
          }} className="footer-cols">

            {/* Manufacturers */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 18, marginTop: 0 }}>
                Manufacturers
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {FOOTER_CATEGORIES.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse by State */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 18, marginTop: 0 }}>
                Browse by State
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {FOOTER_STATES.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 18, marginTop: 0 }}>
                Resources
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {FOOTER_RESOURCES.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 18, marginTop: 0 }}>
                Company
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {FOOTER_COMPANY.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E4A')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              {'© 2026 FirmsLedger \u2014 All rights reserved\u00a0\u00b7\u00a0'}
              <Link href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >Terms of Service</Link>
              {'\u00a0\u00b7\u00a0'}
              <Link href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >Privacy Policy</Link>
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              Made for US manufacturers
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
        @media (max-width: 1280px) {
          .nav-search { display: none !important; }
        }
        @media (max-width: 768px) {
          .footer-cols {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-cols {
            grid-template-columns: 1fr !important;
          }
        }
        select option { color: #0F172A; }
      `}</style>
    </div>
  );
}
