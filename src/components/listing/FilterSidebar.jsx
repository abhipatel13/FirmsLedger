'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldSet, FieldLegend, FieldLabel } from '@/components/ui/field';
import { EMPLOYEE_BUCKETS } from '@/lib/employeeCount';

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterSidebar({ basePath, activeStates, activeEmployeeRanges, stateCounts, showStateFilter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {showStateFilter ? (
        <FieldSet>
          <FieldLegend className="text-xs uppercase tracking-wide text-slate-900">Filter by State</FieldLegend>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {stateCounts.map((s) => (
              <Field key={s.stateSlug} orientation="horizontal" className="gap-2">
                <Checkbox
                  id={`state-${s.stateSlug}`}
                  checked={activeStates.includes(s.stateSlug)}
                  onCheckedChange={() => navigate(toggle(activeStates, s.stateSlug), activeEmployeeRanges)}
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
                checked={activeEmployeeRanges.includes(b.key)}
                onCheckedChange={() => navigate(activeStates, toggle(activeEmployeeRanges, b.key))}
              />
              <FieldLabel htmlFor={`emp-${b.key}`} className="text-sm font-normal">
                {b.label}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </FieldSet>
    </div>
  );
}
