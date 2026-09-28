'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StateCategoryCard({ cat, slug, stateName }) {
  return (
    <Link
      href={`/${cat.slug}/${slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 24,
        textDecoration: 'none',
        minHeight: 140,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(15,23,42,0.07)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {cat.dot && (
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.dot || cat.accent, display: 'block' }} />
      )}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
        {cat.name}
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
        in {stateName}
      </p>
      <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1A2E4A' }}>
        Browse listings <ArrowRight size={13} />
      </div>
    </Link>
  );
}
