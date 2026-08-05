'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseSearchIntent, canonicalPathFor } from '@/lib/searchIntent';
import { Search, ArrowRight, X } from 'lucide-react';
import CompanyCard from '@/components/listing/CompanyCard';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';
import { getCompanyDescription } from '@/utils';

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

/**
 * Splits a raw query into the filters it implies plus the words left over.
 * A category named in the text wins over a stale dropdown selection — typing is
 * the more deliberate act, and otherwise "cnc machines" against a leftover
 * Textile & Apparel filter is a silent zero-result dead end.
 */
function resolveQuery(rawQuery, cat, st) {
  const intent = parseSearchIntent(rawQuery);
  const usedIntent = !!(intent.categorySlug || intent.stateSlug);
  return {
    intent,
    // Words the filters already cover are dropped, so they are not also required
    // to appear in a company's name or description.
    text: usedIntent ? intent.rest : rawQuery,
    cat: intent.categorySlug || cat,
    st: intent.stateSlug || st,
  };
}

function SearchContent() {
  const router = useRouter();
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
    const resolved = resolveQuery(q, cat, st);

    // A query naming both a category and a state has a real page of its own —
    // send it there instead of showing a results list.
    if (resolved.intent.categorySlug && resolved.intent.stateSlug) {
      router.replace(canonicalPathFor(resolved.intent));
      return;
    }

    if (resolved.cat !== cat) setCategory(resolved.cat);
    if (resolved.st !== st) setState(resolved.st);
    if (resolved.text.length >= 2 || resolved.cat || resolved.st) {
      runSearch(resolved.text, resolved.cat, resolved.st);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    const resolved = resolveQuery(query, category, state);

    if (resolved.intent.categorySlug && resolved.intent.stateSlug) {
      router.push(canonicalPathFor(resolved.intent));
      return;
    }

    setCategory(resolved.cat);
    setState(resolved.st);
    runSearch(resolved.text, resolved.cat, resolved.st);
    syncUrl(query, resolved.cat, resolved.st);
  }

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
      // Live results only — the redirect to a canonical page happens on submit,
      // so typing is never interrupted mid-word.
      const resolved = resolveQuery(val, category, state);
      if (resolved.cat !== category) setCategory(resolved.cat);
      if (resolved.st !== state) setState(resolved.st);
      runSearch(resolved.text, resolved.cat, resolved.st);
      syncUrl(val, resolved.cat, resolved.st);
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

          {/* Search input + filters — a real form so Enter submits */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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
                  type="button"
                  aria-label="Clear search"
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
          </form>

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
                <CompanyCard
                  key={company.slug}
                  company={company}
                />
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
