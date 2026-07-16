'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StateCategoryCard({ cat, slug, stateName }) {
  return (
    <Link
      href={`/top/${cat.slug}/${slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        backgroundColor: cat.accent,
        borderRadius: 20,
        padding: 28,
        textDecoration: 'none',
        minHeight: 160,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <h2 style={{ fontSize: 28, fontWeight: 800, color: cat.accentText, margin: 0, lineHeight: 1.0, letterSpacing: '0px', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>
        {cat.name}
      </h2>
      <p style={{ fontSize: 14, color: cat.accentText, opacity: 0.75, margin: 0, lineHeight: 1.5 }}>
        in {stateName}
      </p>
      <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: cat.accentText }}>
        Browse listings <ArrowRight size={13} />
      </div>
    </Link>
  );
}
