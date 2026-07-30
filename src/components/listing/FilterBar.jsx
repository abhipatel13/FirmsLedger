'use client';

import { useEffect, useRef, useState, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';
import { ChevronDown, X } from 'lucide-react';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP } from '@/lib/manufacturingCategories';

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function sameSet(a, b) {
  return a.length === b.length && a.every((v) => b.includes(v));
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

function FilterDropdown({ label, activeCount, isOpen, onToggle, onClose, children }) {
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
    <div ref={triggerRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
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
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          transition: 'border-color 0.1s',
        }}
      >
        {label}
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
          }}>
            {activeCount}
          </span>
        ) : null}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {isOpen && coords ? (
        createPortal(
          <div
            ref={dropdownRef}
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
    </div>
  );
}

function OptionButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '8px 12px',
        borderRadius: 6,
        border: 'none',
        backgroundColor: selected ? '#f1f5f9' : 'transparent',
        color: selected ? '#0f172a' : '#475569',
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export default function FilterBar({
  basePath,
  activeStates,
  activeEmployeeRanges,
  stateCounts,
  showStateFilter,
  subcategories,
  category,
  currentSubcategory,
  currentState,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pendingStates, setPendingStates] = useState(activeStates);
  const [pendingEmployeeRanges, setPendingEmployeeRanges] = useState(activeEmployeeRanges);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setPendingStates(activeStates);
    setPendingEmployeeRanges(activeEmployeeRanges);
  }, [activeStates, activeEmployeeRanges]);

  const isDirty = !sameSet(pendingStates, activeStates) || !sameSet(pendingEmployeeRanges, activeEmployeeRanges);
  const hasActiveFilters = activeStates.length > 0 || activeEmployeeRanges.length > 0;

  function navigate(nextStates, nextEmployeeRanges) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStates.length) params.set('states', nextStates.join(',')); else params.delete('states');
    if (nextEmployeeRanges.length) params.set('employees', nextEmployeeRanges.join(',')); else params.delete('employees');
    params.delete('page');
    const query = params.toString();
    const target = query ? `${basePath}?${query}` : basePath;
    // Next 15 + React 18 in this project: router.push/replace silently fails
    // to commit search-param-only navigations on this route (confirmed via
    // direct testing — the RSC fetch succeeds but the URL never updates).
    // A full navigation is the reliable fix until the app moves to React 19.
    window.location.href = target;
  }

  function handleShowResults() {
    setOpenDropdown(null);
    navigate(pendingStates, pendingEmployeeRanges);
  }

  function handleClearFilters() {
    setPendingStates([]);
    setPendingEmployeeRanges([]);
    setOpenDropdown(null);
    navigate([], []);
  }

  function navigateToCategory(value) {
    setOpenDropdown(null);
    const pathState = currentState ? `/${currentState}` : '';
    const newPath = `/${value}${pathState}`;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    const query = params.toString();
    const target = query ? `${newPath}?${query}` : newPath;
    window.location.href = target;
  }

  function navigateToSubcategory(value) {
    setOpenDropdown(null);
    startTransition(() => {
      router.push(value === '__all__' ? `/${category}` : `/${category}/${value}`);
    });
  }

  const dropdowns = [];

  if (showStateFilter) {
    dropdowns.push({ key: 'state', label: 'State', count: pendingStates.length });
  }
  dropdowns.push({ key: 'employees', label: 'Employees', count: pendingEmployeeRanges.length });

  return (
    <div style={{ margin: '16px 0 28px 0' }}>
      <div className="filter-bar-row" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 4,
        scrollbarWidth: 'thin',
      }}>
        {/* Category */}
        <FilterDropdown
          label={CATEGORY_MAP[category]?.shortName ?? 'Select Category'}
          activeCount={0}
          isOpen={openDropdown === 'category'}
          onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
          onClose={() => setOpenDropdown((v) => (v === 'category' ? null : v))}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 0' }}>
            {MANUFACTURING_CATEGORIES.map((c) => (
              <OptionButton
                key={c.slug}
                selected={c.slug === category}
                onClick={() => navigateToCategory(c.slug)}
              >
                {c.shortName}
              </OptionButton>
            ))}
          </div>
        </FilterDropdown>

        {/* Filter dropdowns */}
        {showStateFilter ? (
          <FilterDropdown
            label="State"
            activeCount={currentState ? 1 : 0}
            isOpen={openDropdown === 'state'}
            onToggle={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
            onClose={() => setOpenDropdown((v) => (v === 'state' ? null : v))}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 0' }}>
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('page');
                  params.delete('states');
                  if (pendingEmployeeRanges.length) {
                    params.set('employees', pendingEmployeeRanges.join(','));
                  } else {
                    params.delete('employees');
                  }
                  const query = params.toString();
                  const targetUrl = query ? `/${category}?${query}` : `/${category}`;
                  window.location.href = targetUrl;
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: !currentState ? '#f1f5f9' : 'transparent',
                  color: !currentState ? '#0f172a' : '#475569',
                  fontSize: 13,
                  fontWeight: !currentState ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.1s',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                }}
                onMouseEnter={(e) => {
                  if (currentState) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (currentState) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                All States
              </button>
              {stateCounts.map((s) => {
                const isSelected = s.stateSlug === currentState;
                return (
                  <button
                    key={s.stateSlug}
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('page');
                      params.delete('states');
                      if (pendingEmployeeRanges.length) {
                        params.set('employees', pendingEmployeeRanges.join(','));
                      } else {
                        params.delete('employees');
                      }
                      const query = params.toString();
                      const targetUrl = query ? `/${category}/${s.stateSlug}?${query}` : `/${category}/${s.stateSlug}`;
                      window.location.href = targetUrl;
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                      color: isSelected ? '#0f172a' : '#475569',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{s.stateLabel}</span>
                    <span className="text-xs text-slate-400">({s.count})</span>
                  </button>
                );
              })}
            </div>
          </FilterDropdown>
        ) : null}

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
        {subcategories?.length > 0 ? (
          <FilterDropdown
            label={subcategories.find((s) => s.slug === currentSubcategory)?.name ?? 'All subcategories'}
            activeCount={currentSubcategory ? 1 : 0}
            isOpen={openDropdown === 'subcategory'}
            onToggle={() => setOpenDropdown(openDropdown === 'subcategory' ? null : 'subcategory')}
            onClose={() => setOpenDropdown((v) => (v === 'subcategory' ? null : v))}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 0' }}>
              <OptionButton
                selected={!currentSubcategory}
                onClick={() => navigateToSubcategory('__all__')}
              >
                All subcategories
              </OptionButton>
              {subcategories.map((s) => (
                <OptionButton
                  key={s.slug}
                  selected={s.slug === currentSubcategory}
                  onClick={() => navigateToSubcategory(s.slug)}
                >
                  {s.name}
                </OptionButton>
              ))}
            </div>
          </FilterDropdown>
        ) : null}

        {/* Spacer */}
        <div className="filter-bar-spacer" style={{ flex: 1, minWidth: 8, flexShrink: 0 }} />

        {/* Show results button */}
        <Button
          type="button"
          onClick={handleShowResults}
          disabled={!isDirty}
          className="bg-[#1A2E4A] text-white hover:bg-[#243B58] disabled:opacity-50"
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
        {hasActiveFilters || isDirty ? (
          <button
            type="button"
            onClick={handleClearFilters}
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

      <style>{`
        @media (max-width: 1024px) {
          .filter-bar-row { flex-wrap: wrap !important; overflow-x: visible !important; }
          .filter-bar-spacer { display: none !important; }
        }
      `}</style>
    </div>
  );
}
