'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function AISearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) return;
    router.push(`/ai-match?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center bg-white rounded-full shadow-[0_4px_40px_rgba(0,0,0,0.15)] border border-white/20 hover:shadow-[0_4px_50px_rgba(0,0,0,0.2)] transition-shadow">
        {/* Search icon */}
        <div className="pl-5 pr-2 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask our AI to find the right companies"
          className="flex-1 py-4 px-2 text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
        />

        {/* Search button */}
        <div className="pr-2">
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-full transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center text-sm text-slate-400 mt-4">
        Try: "IT staffing agencies in New York" or "marketing firms under 50 employees"
      </p>
    </form>
  );
}
