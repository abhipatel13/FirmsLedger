'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseSearchIntent, canonicalPathFor } from '@/lib/searchIntent';
import { Search, ArrowRight, X } from 'lucide-react';
import CompanyCard from '@/components/listing/CompanyCard';
import FilterBar from '@/components/listing/FilterBar';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';
import { getCompanyDescription } from '@/utils';

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

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const state = searchParams.get('state') || '';
  const employees = searchParams.get('employees') || '';

  const [queryInput, setQueryInput] = useState(query);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Sync input value with URL when URL changes
  useEffect(() => {
    setQueryInput(query);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const resolved = resolveQuery(query, category, state);

    // If query resolves to a single canonical category + state, redirect to it
    // But ONLY if the user typed it (i.e. we have a search query)
    if (query && resolved.intent.categorySlug && resolved.intent.stateSlug) {
      router.replace(canonicalPathFor(resolved.intent));
      return;
    }

    runSearch(resolved.text, category, state, subcategory, employees);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, state, subcategory, employees]);

  async function runSearch(q, cat, st, sub, emp) {
    const hasQuery = q && q.trim().length >= 2;
    const hasFilter = !!cat || !!st || !!sub || !!emp;
    if (!hasQuery && !hasFilter) { setResults(null); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hasQuery) params.set('q', q.trim());
      if (cat) params.set('category', cat);
      if (sub) params.set('subcategory', sub);
      if (st) params.set('state', st);
      if (emp) params.set('employees', emp);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function syncUrl(q, cat, st, sub, emp) {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (cat) params.set('category', cat);
    if (sub) params.set('subcategory', sub);
    if (st) params.set('state', st);
    if (emp) params.set('employees', emp);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : '/search');
  }

  function handleSubmit(e) {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    const resolved = resolveQuery(queryInput, category, state);

    if (queryInput && resolved.intent.categorySlug && resolved.intent.stateSlug) {
      router.push(canonicalPathFor(resolved.intent));
      return;
    }

    syncUrl(queryInput, resolved.cat || category, resolved.st || state, subcategory, employees);
  }

  function handleChange(e) {
    const val = e.target.value;
    setQueryInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const resolved = resolveQuery(val, category, state);
      syncUrl(val, resolved.cat || category, resolved.st || state, subcategory, employees);
    }, 400);
  }

  function handleClear() {
    setQueryInput('');
    syncUrl('', '', '', '', '');
    setResults(null);
    inputRef.current?.focus();
  }

  const hasActiveSearch = query.trim().length >= 2 || !!category || !!subcategory || !!state || !!employees;
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
        <div className="mx-auto max-w-[var(--max-width)] px-4 pt-6 pb-5 sm:px-6 sm:pt-10 sm:pb-9">
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: 6, marginTop: 0 }}>
                Search Manufacturers
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                Find verified US manufacturers by name, category, and state.
              </p>
            </div>
            
            {results !== null && results.length > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 9999,
                padding: '8px 16px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                flexShrink: 0,
                height: 'fit-content'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{results.length}</span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>listings</span>
                </div>
              </div>
            )}
          </div>

          {/* Search input - real form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginTop: 24, maxWidth: 640 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                value={queryInput}
                onChange={handleChange}
                placeholder="Search by company name, city, or keyword…"
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 48,
                  paddingRight: queryInput ? 48 : 16,
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
              {queryInput && (
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
          </form>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="mx-auto max-w-[var(--max-width)] px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
        <FilterBar
          activeEmployeeRanges={employees ? employees.split(',') : []}
          stateCounts={ALL_US_STATES.map((s) => ({ stateSlug: s.slug, stateLabel: s.name, count: undefined }))}
          showStateFilter={true}
          subcategories={activeCategory?.subcategories || []}
          category={category}
          currentSubcategory={subcategory}
          currentState={state}
        />

        <div style={{ marginTop: 24 }}>
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
                {results.map((company, i) => (
                  <CompanyCard
                    key={company.slug}
                    company={company}
                    rank={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
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
