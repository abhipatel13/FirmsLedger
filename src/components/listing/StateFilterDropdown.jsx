'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilterDropdown } from './FilterBar';

export default function StateFilterDropdown({ stateCounts, currentState, category, subcategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = stateCounts.find((s) => s.stateSlug === currentState)?.stateLabel ?? 'State';

  const buildHref = (s) => (s ? `/${category}/${subcategory}/${s}` : `/${category}/${subcategory}`);

  return (
    <FilterDropdown
      label={currentLabel}
      activeCount={currentState ? 1 : 0}
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      onClose={() => setIsOpen(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 0' }}>
        <Link
          href={buildHref(null)}
          onClick={() => setIsOpen(false)}
          style={{
            display: 'block',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: !currentState ? 600 : 400,
            color: !currentState ? '#0f172a' : '#475569',
            backgroundColor: !currentState ? '#f1f5f9' : 'transparent',
            textDecoration: 'none',
            marginBottom: 4,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          All States
        </Link>
        {stateCounts.map((s) => {
          const isSelected = s.stateSlug === currentState;
          return (
            <Link
              key={s.stateSlug}
              href={buildHref(s.stateSlug)}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#0f172a' : '#475569',
                backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span>{s.stateLabel}</span>
              <span className="text-xs text-slate-400">({s.count})</span>
            </Link>
          );
        })}
      </div>
    </FilterDropdown>
  );
}
