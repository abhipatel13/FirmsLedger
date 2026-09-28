'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';
import { ChevronDown, X } from 'lucide-react';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function useClickOutside(refs, handler) {
  useEffect(() => {
    function onMouseDown(e) {
      const inside = refs.some((r) => r.current && r.current.contains(e.target));
      if (!inside) handler();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [refs, handler]);
}

export function FilterDropdown({ label, activeCount, isOpen, onToggle, onClose, children }) {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState(null);
  useClickOutside([triggerRef, dropdownRef], onClose);

  useEffect(() => {
    if (!isOpen) return;

    function updateCoords() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = 240;
      const left = Math.min(rect.left, window.innerWidth - panelWidth - 12);
      setCoords({ top: rect.bottom + 6, left: Math.max(12, left) });
    }

    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  return (
    <div ref={triggerRef} className="filter-dropdown-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={onToggle}
        className="filter-dropdown-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid',
          borderColor: isOpen ? '#0f172a' : '#e2e8f0',
          backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
          color: '#0f172a',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.1s',
          minWidth: 0,
        }}
      >
        <span className="truncate text-left flex-1" style={{ minWidth: 0 }}>
          {label}
        </span>
        {activeCount > 0 ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            borderRadius: 9999,
            backgroundColor: '#D4A017',
            color: '#0f172a',
            fontSize: 10,
            fontWeight: 700,
            padding: '0 5px',
            flexShrink: 0,
          }}>
            {activeCount}
          </span>
        ) : null}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
      </button>

      {isOpen && coords ? (
        createPortal(
          <div
            ref={dropdownRef}
            className="filter-dropdown-panel"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
              minWidth: 220,
              maxWidth: 240,
              maxHeight: 300,
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              boxShadow: '0 8px 24px -4px rgba(15,23,42,0.12)',
              padding: 8,
            }}
          >
            {children}
          </div>,
          document.body
        )
      ) : null}

      <style>{`
        @media (max-width: 1024px) {
          .filter-dropdown-wrapper {
            width: 100%;
            min-width: 0;
          }
          .filter-dropdown-trigger {
            width: 100% !important;
            min-width: 0 !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function FilterBar({
  activeEmployeeRanges,
  stateCounts,
  showStateFilter,
  subcategories,
  category,
  currentSubcategory,
  currentState,
}) {
  const searchParams = useSearchParams();

  const [pendingCategory, setPendingCategory] = useState(category || '');
  const [pendingSubcategory, setPendingSubcategory] = useState(currentSubcategory || '');
  const [pendingState, setPendingState] = useState(currentState || '');
  const [pendingEmployeeRanges, setPendingEmployeeRanges] = useState(activeEmployeeRanges);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Local search query states
  const [catSearch, setCatSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  useEffect(() => {
    setPendingCategory(category || '');
    setPendingSubcategory(currentSubcategory || '');
    setPendingState(currentState || '');
    setPendingEmployeeRanges(activeEmployeeRanges);
  }, [category, currentSubcategory, currentState, activeEmployeeRanges]);

  // Reset local search inputs when dropdown changes
  useEffect(() => {
    setCatSearch('');
    setStateSearch('');
    setSubSearch('');
  }, [openDropdown]);

  const showClear = !!pendingCategory || !!pendingSubcategory || !!pendingState || pendingEmployeeRanges.length > 0 ||
                    !!category || !!currentSubcategory || !!currentState || activeEmployeeRanges.length > 0;

  function handleShowResults() {
    setOpenDropdown(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (pendingEmployeeRanges.length) {
      params.set('employees', pendingEmployeeRanges.join(','));
    } else {
      params.delete('employees');
    }

    const isSearchPage = window.location.pathname === '/search';

    if (isSearchPage) {
      if (pendingCategory) params.set('category', pendingCategory);
      else params.delete('category');

      if (pendingState) params.set('state', pendingState);
      else params.delete('state');

      if (pendingSubcategory) params.set('subcategory', pendingSubcategory);
      else params.delete('subcategory');

      const query = params.toString();
      window.location.href = query ? `/search?${query}` : '/search';
    } else {
      // Canonical pathing redirect
      let path = `/${pendingCategory}`;
      if (pendingSubcategory) path += `/${pendingSubcategory}`;
      if (pendingState)       path += `/${pendingState}`;

      params.delete('category');
      params.delete('state');
      params.delete('subcategory');

      const query = params.toString();
      // Category/state pages are prebuilt at deploy and ignore query params, so
      // a leftover filter (employees, etc.) would silently do nothing there.
      // Send those to /search, which is dynamic and handles them.
      // See HISTORY.md 2026-09-05.
      if (query) {
        const searchParamsOut = new URLSearchParams(query);
        if (pendingCategory) searchParamsOut.set('category', pendingCategory);
        if (pendingSubcategory) searchParamsOut.set('subcategory', pendingSubcategory);
        if (pendingState) searchParamsOut.set('state', pendingState);
        window.location.href = `/search?${searchParamsOut.toString()}`;
      } else {
        window.location.href = path;
      }
    }
  }

  function handleClearFilters() {
    setPendingCategory('');
    setPendingState('');
    setPendingSubcategory('');
    setPendingEmployeeRanges([]);
    setOpenDropdown(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    params.delete('employees');
    params.delete('category');
    params.delete('subcategory');
    params.delete('state');

    const q = params.get('q');
    const isSearchPage = window.location.pathname === '/search';

    if (isSearchPage) {
      const query = q ? `q=${encodeURIComponent(q)}` : '';
      window.location.href = query ? `/search?${query}` : '/search';
    } else {
      const pathnameParts = window.location.pathname.split('/').filter(Boolean);
      const rootCategory = pathnameParts[0] || category || '';
      const path = rootCategory ? `/${rootCategory}` : '/search';
      window.location.href = q ? `${path}?q=${encodeURIComponent(q)}` : path;
    }
  }

  function selectCategory(slug) {
    setPendingCategory(slug);
    setPendingSubcategory(''); // Reset subcategory when category changes
    setOpenDropdown(null);
  }

  // Gather subcategories for the selected category
  const activeCatObj = CATEGORY_MAP[pendingCategory];
  const subList = activeCatObj?.subcategories || subcategories || [];

  // Filtered dropdown options based on local search inputs
  const filteredCategories = MANUFACTURING_CATEGORIES.filter((c) =>
    c.shortName.toLowerCase().includes(catSearch.toLowerCase())
  );

  // Merge stateCounts with ALL_US_STATES so all states are always available to filter,
  // but those with results appear at the top.
  const stateCountsMap = new Map(stateCounts?.map((s) => [s.stateSlug, s]) || []);
  const mergedStates = [
    ...(stateCounts || []),
    ...ALL_US_STATES.filter((s) => !stateCountsMap.has(s.slug)).map((s) => ({
      stateSlug: s.slug,
      stateLabel: s.name,
      count: 0,
    })),
  ];

  const filteredStates = mergedStates.filter((s) =>
    s.stateLabel.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredSubcategories = subList.filter((s) =>
    s.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <div style={{ margin: '16px 0 28px 0' }}>
      <div className="filter-bar-row">
        <div className="filter-triggers-group">
          {/* Category */}
          <div>
            <FilterDropdown
              label={CATEGORY_MAP[pendingCategory]?.shortName ?? 'Select Category'}
              activeCount={0}
              isOpen={openDropdown === 'category'}
              onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              onClose={() => setOpenDropdown((v) => (v === 'category' ? null : v))}
            >
              <div style={{ display: 'flex', gap: 6, padding: '4px 6px 8px', borderBottom: '1px solid #e2e8f0', marginBottom: 6 }}>
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search categories..."
                  style={{
                    flex: 1,
                    height: 32,
                    padding: '0 8px',
                    fontSize: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => selectCategory('')}
                  className={`filter-option-btn${!pendingCategory ? ' selected' : ''}`}
                >
                  All Categories
                </button>
                {filteredCategories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => selectCategory(c.slug)}
                    className={`filter-option-btn${c.slug === pendingCategory ? ' selected' : ''}`}
                  >
                    {c.shortName}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                    No matches
                  </div>
                )}
              </div>
            </FilterDropdown>
          </div>

          {/* State Filter */}
          {showStateFilter ? (
            <FilterDropdown
              label={stateCounts.find((s) => s.stateSlug === pendingState)?.stateLabel ?? 'State'}
              activeCount={pendingState ? 1 : 0}
              isOpen={openDropdown === 'state'}
              onToggle={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
              onClose={() => setOpenDropdown((v) => (v === 'state' ? null : v))}
            >
              <div style={{ display: 'flex', gap: 6, padding: '4px 6px 8px', borderBottom: '1px solid #e2e8f0', marginBottom: 6 }}>
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder="Search states..."
                  style={{
                    flex: 1,
                    height: 32,
                    padding: '0 8px',
                    fontSize: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPendingState('');
                    setOpenDropdown(null);
                  }}
                  className={`filter-option-btn${!pendingState ? ' selected' : ''}`}
                >
                  All States
                </button>
                {filteredStates.map((s) => {
                  const isSelected = s.stateSlug === pendingState;
                  return (
                    <button
                      key={s.stateSlug}
                      type="button"
                      onClick={() => {
                        setPendingState(s.stateSlug);
                        setOpenDropdown(null);
                      }}
                      className={`filter-option-btn${isSelected ? ' selected' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{s.stateLabel}</span>
                        {s.count !== null && s.count !== undefined && s.count > 0 && (
                          <span className="text-xs text-slate-400">({s.count})</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredStates.length === 0 && (
                  <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                    No matches
                  </div>
                )}
              </div>
            </FilterDropdown>
          ) : null}

          {/* Employees */}
          <FilterDropdown
            label="Employees"
            activeCount={pendingEmployeeRanges.length}
            isOpen={openDropdown === 'employees'}
            onToggle={() => setOpenDropdown(openDropdown === 'employees' ? null : 'employees')}
            onClose={() => setOpenDropdown((v) => (v === 'employees' ? null : v))}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {EMPLOYEE_BUCKETS.map((b) => (
                <Field key={b.key} orientation="horizontal" className="gap-2" style={{ padding: '4px 6px', margin: 0 }}>
                  <Checkbox
                    id={`fb-emp-${b.key}`}
                    checked={pendingEmployeeRanges.includes(b.key)}
                    onCheckedChange={() => setPendingEmployeeRanges((prev) => toggle(prev, b.key))}
                  />
                  <FieldLabel htmlFor={`fb-emp-${b.key}`} className="text-sm font-normal" style={{ cursor: 'pointer' }}>
                    {b.label}
                  </FieldLabel>
                </Field>
              ))}
            </div>
          </FilterDropdown>

          {/* Subcategory */}
          {subList?.length > 0 ? (
            <FilterDropdown
              label={subList.find((s) => s.slug === pendingSubcategory)?.name ?? 'All subcategories'}
              activeCount={pendingSubcategory ? 1 : 0}
              isOpen={openDropdown === 'subcategory'}
              onToggle={() => setOpenDropdown(openDropdown === 'subcategory' ? null : 'subcategory')}
              onClose={() => setOpenDropdown((v) => (v === 'subcategory' ? null : v))}
            >
              <div style={{ display: 'flex', gap: 6, padding: '4px 6px 8px', borderBottom: '1px solid #e2e8f0', marginBottom: 6 }}>
                <input
                  type="text"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Search subcategories..."
                  style={{
                    flex: 1,
                    height: 32,
                    padding: '0 8px',
                    fontSize: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPendingSubcategory('');
                    setOpenDropdown(null);
                  }}
                  className={`filter-option-btn${!pendingSubcategory ? ' selected' : ''}`}
                >
                  All subcategories
                </button>
                {filteredSubcategories.map((s) => {
                  const isSelected = s.slug === pendingSubcategory;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => {
                        setPendingSubcategory(s.slug);
                        setOpenDropdown(null);
                      }}
                      className={`filter-option-btn${isSelected ? ' selected' : ''}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
                {filteredSubcategories.length === 0 && (
                  <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                    No matches
                  </div>
                )}
              </div>
            </FilterDropdown>
          ) : null}
        </div>

        {/* Spacer */}
        <div className="filter-bar-spacer" style={{ flex: 1, minWidth: 8, flexShrink: 0 }} />

        {/* Actions */}
        <div className="filter-actions-group">
          {/* Show results button */}
          <Button
            type="button"
            onClick={handleShowResults}
            className="filter-submit-btn bg-[#1A2E4A] text-white hover:bg-[#243B58] disabled:opacity-50"
            style={{
              height: 36,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
              fontFamily: 'inherit',
            }}
          >
            Show results
          </Button>

          {/* Clear filters */}
          {showClear ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="filter-clear-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '6px 4px',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <X size={14} />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <style>{`
        /* Desktop layouts */
        .filter-bar-row {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .filter-triggers-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .filter-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-option-btn {
          display: block;
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.1s;
          margin-bottom: 2px;
        }
        .filter-option-btn.selected {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
        }
        .filter-option-btn:not(.selected) {
          background-color: transparent;
          color: #475569;
          font-weight: 400;
        }
        .filter-option-btn:not(.selected):hover {
          background-color: #f8fafc;
        }

        /* Mobile / Tablet layouts */
        @media (max-width: 1024px) {
          .filter-bar-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .filter-triggers-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }
          .filter-bar-spacer {
            display: none !important;
          }
          .filter-actions-group {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .filter-submit-btn {
            flex: 1;
            height: 42px !important;
            font-size: 14px !important;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .filter-clear-btn {
            height: 42px !important;
            padding: 0 8px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
