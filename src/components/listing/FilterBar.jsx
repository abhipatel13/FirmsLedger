'use client';

import { useEffect, useRef, useState, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectGroup, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel } from '@/components/ui/select';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';
import { ChevronDown, X } from 'lucide-react';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';

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
    <div>
      <div className="filter-bar-row" style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 4,
        scrollbarWidth: 'thin',
      }}>
        {/* Category select */}
        <div style={{ flexShrink: 0 }}>
          <Select
            value={category}
            onValueChange={navigateToCategory}
            open={openDropdown === 'category'}
            onOpenChange={(next) => setOpenDropdown(next ? 'category' : null)}
          >
            <SelectTrigger
              className="w-full bg-white text-sm"
              style={{
                height: 36,
                minHeight: 36,
                minWidth: 180,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 13,
                gap: 6,
              }}
            >
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {MANUFACTURING_CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.shortName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Filter dropdowns */}
        {showStateFilter ? (
          <FilterDropdown
            label="State"
            activeCount={pendingStates.length}
            isOpen={openDropdown === 'state'}
            onToggle={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
            onClose={() => setOpenDropdown((v) => (v === 'state' ? null : v))}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {stateCounts.map((s) => (
                <Field key={s.stateSlug} orientation="horizontal" className="gap-2" style={{ padding: '4px 6px', margin: 0 }}>
                  <Checkbox
                    id={`fb-state-${s.stateSlug}`}
                    checked={pendingStates.includes(s.stateSlug)}
                    onCheckedChange={() => setPendingStates((prev) => toggle(prev, s.stateSlug))}
                  />
                  <FieldLabel htmlFor={`fb-state-${s.stateSlug}`} className="flex-1 text-sm font-normal" style={{ cursor: 'pointer' }}>
                    {s.stateLabel} <span className="text-slate-400">({s.count})</span>
                  </FieldLabel>
                </Field>
              ))}
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

        {/* Subcategory select */}
        {subcategories?.length > 0 ? (
          <div style={{ flexShrink: 0 }}>
            <Select
              value={currentSubcategory ?? '__all__'}
              onValueChange={navigateToSubcategory}
              open={openDropdown === 'subcategory'}
              onOpenChange={(next) => setOpenDropdown(next ? 'subcategory' : null)}
            >
              <SelectTrigger
                className="w-full bg-white text-sm"
                style={{
                  height: 36,
                  minHeight: 36,
                  minWidth: 168,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  gap: 6,
                }}
              >
                <SelectValue placeholder="All subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Subcategories</SelectLabel>
                  <SelectItem value="__all__">All subcategories</SelectItem>
                  {subcategories.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
        @media (max-width: 640px) {
          .filter-bar-row { flex-wrap: wrap !important; overflow-x: visible !important; }
          .filter-bar-spacer { display: none !important; }
        }
      `}</style>
    </div>
  );
}
