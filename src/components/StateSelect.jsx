'use client';

import { useRouter } from 'next/navigation';

export default function StateSelect({ basePath, states, currentSlug, placeholder = 'Select a state…' }) {
  const router = useRouter();

  return (
    <select
      value={currentSlug || ''}
      onChange={(e) => {
        const slug = e.target.value;
        if (slug) router.push(`${basePath}/${slug}`);
      }}
      style={{
        width: '100%',
        fontSize: 13,
        fontWeight: 500,
        color: '#0f172a',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {states.map((s) => (
        <option key={s.slug} value={s.slug}>{s.name}</option>
      ))}
    </select>
  );
}
