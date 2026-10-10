'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const SUB_PREVIEW_COUNT = 6;

export default function OtherCategoriesCard({ categories, activeCategory, state, stateName }) {
  const [expandedSlug, setExpandedSlug] = useState(activeCategory);
  const [expanded, setExpanded] = useState(false);

  const expandedCat = categories.find((c) => c.slug === expandedSlug);
  const subcategories = expandedCat?.subcategories ?? [];
  const visibleSubs = expanded ? subcategories : subcategories.slice(0, SUB_PREVIEW_COUNT);
  const hasMore = subcategories.length > SUB_PREVIEW_COUNT;

  function handleCategoryClick(e, slug, href) {
    e.preventDefault();
    if (slug !== expandedSlug) {
      setExpandedSlug(slug);
      setExpanded(false);
    } else {
      // Same Next 15 + React 18 client-navigation quirk documented in
      // FilterBar.jsx: Link's client-side push silently no-ops on this
      // route, so a full navigation is used instead.
      window.location.href = href;
    }
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {stateName ? `Other Industries in ${stateName}` : 'Other Categories'}
      </h3>
      {state && (
        <Link href={`/states/${state}`} style={{ display: 'block', fontSize: 13, color: '#1A2E4A', fontWeight: 600, padding: '0 10px 8px' }}>
          All {stateName} manufacturers
        </Link>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {categories.map((c) => {
          const isActive = c.slug === activeCategory;
          return (
            <div key={c.slug}>
              <Link
                href={state ? `/${c.slug}/${state}` : `/${c.slug}`}
                onClick={(e) => handleCategoryClick(e, c.slug, state ? `/${c.slug}/${state}` : `/${c.slug}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 13,
                  textDecoration: 'none',
                  transition: 'background 0.1s',
                  color: isActive ? '#0f172a' : '#475569',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                }}
                className={`sidebar-cat-link${isActive ? ' active' : ''}`}
              >
                <span>{stateName ? `${c.name} in ${stateName}` : c.name}</span>
                {isActive && <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Current</span>}
              </Link>

              {c.slug === expandedSlug && subcategories.length > 0 ? (
                <div style={{ padding: '4px 10px 6px 22px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {visibleSubs.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/${c.slug}/${s.slug}`}
                      className="sidebar-sub-link"
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        textDecoration: 'none',
                        padding: '3px 9px',
                        borderRadius: 9999,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.name}
                    </Link>
                  ))}
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#1A2E4A',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '3px 6px',
                        fontFamily: 'inherit',
                      }}
                    >
                      {expanded ? 'View less' : `View ${subcategories.length - SUB_PREVIEW_COUNT} more`}
                      <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <style>{`
        .sidebar-cat-link:not(.active):hover { background-color: #ffffff !important; color: #0f172a !important; }
        .sidebar-sub-link:hover { border-color: #1A2E4A !important; color: #0f172a !important; }
      `}</style>
    </div>
  );
}
