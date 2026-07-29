'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Star, MapPin, CheckCircle, ArrowRight, X } from 'lucide-react';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';
import { getCompanyDescription } from '@/utils';

function StarRow({ rating }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} style={{ width: 12, height: 12, fill: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0', color: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0' }} />
      ))}
    </span>
  );
}

const selectStyle = {
  height: 52,
  padding: '0 36px 0 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 500,
  color: '#0f172a',
  backgroundColor: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

function SearchContent() {
  const searchParams = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    const st = searchParams.get('state') || '';
    if (q.length >= 2 || cat || st) {
      runSearch(q, cat, st);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(q, cat, st) {
    const hasQuery = q && q.trim().length >= 2;
    const hasFilter = !!cat || !!st;
    if (!hasQuery && !hasFilter) { setResults(null); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hasQuery) params.set('q', q.trim());
      if (cat) params.set('category', cat);
      if (st) params.set('state', st);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function syncUrl(q, cat, st) {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (cat) params.set('category', cat);
    if (st) params.set('state', st);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/search?${qs}` : '/search');
  }

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(val, category, state);
      syncUrl(val, category, state);
    }, 300);
  }

  function handleCategoryChange(e) {
    const val = e.target.value;
    setCategory(val);
    runSearch(query, val, state);
    syncUrl(query, val, state);
  }

  function handleStateChange(e) {
    const val = e.target.value;
    setState(val);
    runSearch(query, category, val);
    syncUrl(query, category, val);
  }

  function handleClear() {
    setQuery('');
    setCategory('');
    setState('');
    setResults(null);
    window.history.replaceState(null, '', '/search');
    inputRef.current?.focus();
  }

  const hasActiveSearch = query.trim().length >= 2 || !!category || !!state;
  const activeCategory = MANUFACTURING_CATEGORIES.find((c) => c.slug === category);
  const activeState = ALL_US_STATES.find((s) => s.slug === state);

  const summaryParts = [];
  if (query.trim()) summaryParts.push(`"${query.trim()}"`);
  if (activeCategory) summaryParts.push(activeCategory.shortName);
  if (activeState) summaryParts.push(activeState.name);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 40px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: 6, marginTop: 0 }}>
            Search Manufacturers
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
            Find verified US manufacturers by name, category, and state.
          </p>

          {/* Search input + filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
              <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search by company name, city, or keyword…"
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 48,
                  paddingRight: query ? 48 : 16,
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: 15,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#1A2E4A'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              {query && (
                <button
                  onClick={handleClear}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>

            <select value={category} onChange={handleCategoryChange} style={{ ...selectStyle, flex: '1 1 180px' }}>
              <option value="">All categories</option>
              {MANUFACTURING_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.shortName}</option>
              ))}
            </select>

            <select value={state} onChange={handleStateChange} style={{ ...selectStyle, flex: '1 1 160px' }}>
              <option value="">All states</option>
              {ALL_US_STATES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>

          {(category || state) && (
            <button
              onClick={handleClear}
              style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 72px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>
            Searching…
          </div>
        )}

        {/* No query yet — show category shortcuts */}
        {!loading && results === null && !hasActiveSearch && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Browse by category
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {MANUFACTURING_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none', backgroundColor: '#ffffff', transition: 'border-color 0.12s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.accent || '#e2e8f0', flexShrink: 0, border: '2px solid', borderColor: cat.accentText || '#64748b' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{cat.shortName}</span>
                  <ArrowRight style={{ width: 13, height: 13, color: '#cbd5e1', marginLeft: 'auto', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && results !== null && results.length === 0 && hasActiveSearch && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              No results for {summaryParts.join(' · ')}
            </p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Try different filters, or browse by category.</p>
            <Link href="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#ffffff', backgroundColor: '#1A2E4A', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
              Browse all categories
            </Link>
          </div>
        )}

        {/* Results list */}
        {!loading && results !== null && results.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for {summaryParts.join(' · ')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((company) => (
                <Link
                  key={company.slug}
                  href={`/company/${company.slug}`}
                  style={{ display: 'block', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(15,23,42,0.07)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#94a3b8' }}>{company.name.charAt(0)}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{company.name}</span>
                        {company.is_verified && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: 9999 }}>
                            <CheckCircle style={{ width: 9, height: 9 }} /> Verified
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: company.description ? 6 : 0 }}>
                        <StarRow rating={parseFloat(company.avg_rating) || 0} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{(parseFloat(company.avg_rating) || 0).toFixed(1)}</span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{company.review_count || 0} reviews</span>
                        {(company.hq_city || company.hq_state_label) && (
                          <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin style={{ width: 11, height: 11 }} />
                            {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {getCompanyDescription(company)}
                      </p>
                    </div>
                    <ArrowRight style={{ width: 15, height: 15, color: '#cbd5e1', flexShrink: 0, marginTop: 2 }} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
