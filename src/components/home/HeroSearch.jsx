'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearch({ categories = [], states = [] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (state) params.set('state', state);
    router.push(params.toString() ? `/search?${params.toString()}` : '/search');
  }

  const selectStyle = {
    height: 52,
    padding: '0 36px 0 14px',
    border: '1.5px solid rgba(255,255,255,0.14)',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: '#F9FAFB',
    backgroundColor: 'rgba(255,255,255,0.06)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23F9FAFB' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  const optionStyle = {
    color: '#F9FAFB',
    backgroundColor: '#0F172A',
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[720px] mx-auto space-y-4">
      {/* Search Input and Button Group */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try "CNC machining"'
            aria-label="Search query"
            className="w-full h-[52px] pl-12 pr-4 rounded-xl border border-[rgba(255,255,255,0.14)] text-[#F9FAFB] placeholder-slate-400 bg-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-all text-sm font-medium"
          />
        </div>
        <button
          type="submit"
          className="h-[52px] px-8 bg-[#D4A017] hover:bg-[#c39215] text-[#0F172A] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-sm flex-shrink-0"
        >
          Find Firms <span className="text-base">→</span>
        </button>
      </div>

      {/* Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
            className="w-full focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]"
            aria-label="Filter by Category"
          >
            <option value="" style={optionStyle}>All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug} style={optionStyle}>
                {cat.shortName || cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={selectStyle}
            className="w-full focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]"
            aria-label="Filter by State"
          >
            <option value="" style={optionStyle}>All States</option>
            {states.map((s) => (
              <option key={s.slug} value={s.slug} style={optionStyle}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
