'use client';

import Link from 'next/link';

export default function StatePill({ name, slug }) {
  return (
    <Link
      href={`/states/${slug}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#f5f0e0',
        border: '1px solid #e5e5e5',
        borderRadius: 9999,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#3a3a3a',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ebe6d6'; e.currentTarget.style.borderColor = '#0a0a0a'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f5f0e0'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
    >
      {name}
    </Link>
  );
}
