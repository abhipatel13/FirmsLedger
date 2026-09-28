'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderOpen, MapPin, ArrowRight } from 'lucide-react';

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
    height: 48,
    width: '100%',
    padding: '0 28px 0 8px',
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: '#334155', // slate-700
    backgroundColor: 'transparent',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 4px center',
  };

  const optionStyle = {
    color: '#0f172a', // slate-900
    backgroundColor: '#ffffff',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[840px] mx-auto bg-white rounded-2xl md:rounded-full p-2 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-stretch gap-1 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 focus-within:ring-2 focus-within:ring-[#D4A017]/80 transition-all duration-200"
    >
      {/* Search Input Segment */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "CNC machining"...'
          aria-label="Search query"
          className="w-full h-12 border-0 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 text-[14.5px] font-medium"
        />
      </div>

      {/* Category Dropdown Segment */}
      <div className="flex-1 flex items-center gap-2 px-4 py-2 md:py-0">
        <FolderOpen className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={selectStyle}
          className="focus:outline-none cursor-pointer"
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

      {/* State Dropdown Segment */}
      <div className="flex-1 flex items-center gap-2 px-4 py-2 md:py-0">
        <MapPin className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          style={selectStyle}
          className="focus:outline-none cursor-pointer"
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

      {/* Action Button Segment */}
      <div className="p-1 md:pl-2 flex items-center">
        <button
          type="submit"
          className="w-full md:w-auto h-12 md:h-11 px-8 bg-gradient-to-r from-[#D4A017] to-[#E8B84B] hover:from-[#c39215] hover:to-[#d9a93c] text-slate-950 font-bold rounded-xl md:rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-[14px]"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

