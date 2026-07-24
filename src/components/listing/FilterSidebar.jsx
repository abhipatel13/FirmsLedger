'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Field, FieldSet, FieldLegend, FieldLabel } from '@/components/ui/field';
import { Select, SelectGroup, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel } from '@/components/ui/select';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function sameSet(a, b) {
  return a.length === b.length && a.every((v) => b.includes(v));
}

export default function FilterSidebar({
  basePath,
  activeStates,
  activeEmployeeRanges,
  stateCounts,
  showStateFilter,
  subcategories,
  category,
  currentSubcategory,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Checkbox selections are staged locally and only applied to the URL on
  // "Show results" — mirrors ensun's filter-panel UX (check boxes, then apply).
  const [pendingStates, setPendingStates] = useState(activeStates);
  const [pendingEmployeeRanges, setPendingEmployeeRanges] = useState(activeEmployeeRanges);

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
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  function handleShowResults() {
    navigate(pendingStates, pendingEmployeeRanges);
  }

  function handleClearFilters() {
    setPendingStates([]);
    setPendingEmployeeRanges([]);
    navigate([], []);
  }

  function navigateToSubcategory(value) {
    startTransition(() => {
      router.push(value === '__all__' ? `/${category}` : `/${category}/${value}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {(hasActiveFilters || isDirty) ? (
        <button
          type="button"
          onClick={handleClearFilters}
          className="self-start text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-900"
        >
          Clear filters
        </button>
      ) : null}

      {subcategories?.length > 0 ? (
        <FieldSet>
          <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Subcategories</FieldLegend>
          <Select value={currentSubcategory ?? '__all__'} onValueChange={navigateToSubcategory}>
            <SelectTrigger className="w-full bg-white text-sm">
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
        </FieldSet>
      ) : null}

      {showStateFilter ? (
        <FieldSet>
          <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Filter by State</FieldLegend>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {stateCounts.map((s) => (
              <Field key={s.stateSlug} orientation="horizontal" className="gap-2">
                <Checkbox
                  id={`state-${s.stateSlug}`}
                  checked={pendingStates.includes(s.stateSlug)}
                  onCheckedChange={() => setPendingStates((prev) => toggle(prev, s.stateSlug))}
                />
                <FieldLabel htmlFor={`state-${s.stateSlug}`} className="flex-1 text-sm font-normal">
                  {s.stateLabel} <span className="text-slate-400">({s.count})</span>
                </FieldLabel>
              </Field>
            ))}
          </div>
        </FieldSet>
      ) : null}

      <FieldSet>
        <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Employees</FieldLegend>
        <div className="flex flex-col gap-1">
          {EMPLOYEE_BUCKETS.map((b) => (
            <Field key={b.key} orientation="horizontal" className="gap-2">
              <Checkbox
                id={`emp-${b.key}`}
                checked={pendingEmployeeRanges.includes(b.key)}
                onCheckedChange={() => setPendingEmployeeRanges((prev) => toggle(prev, b.key))}
              />
              <FieldLabel htmlFor={`emp-${b.key}`} className="text-sm font-normal">
                {b.label}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </FieldSet>

      <Button
        type="button"
        onClick={handleShowResults}
        disabled={!isDirty}
        className="mt-1 bg-[#1A2E4A] text-white hover:bg-[#243B58] disabled:opacity-50"
      >
        Show results
      </Button>
    </div>
  );
}
