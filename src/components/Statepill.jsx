'use client';

import Link from 'next/link';

export default function StatePill({ name, slug }) {
  return (
    <Link
      href={`/states/${slug}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 9999,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#475569',
        textDecoration: 'none',
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
    >
      {name}
    </Link>
  );
}
