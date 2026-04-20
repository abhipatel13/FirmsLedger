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
        <div className="pl-3 sm:pl-5 pr-1 sm:pr-2 flex items-center pointer-events-none shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI to find the right companies"
          className="flex-1 min-w-0 py-3.5 sm:py-4 px-1 sm:px-2 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
        />

        {/* Search button */}
        <div className="pr-1.5 sm:pr-2 shrink-0">
          <button
            type="submit"
            disabled={!query.trim()}
            aria-label="Search"
            className="p-2.5 sm:px-6 sm:py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-full transition-colors flex items-center justify-center"
          >
            <Search className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center text-xs sm:text-sm text-slate-300/80 mt-4 px-2">
        Try: &quot;IT staffing agencies in New York&quot; or &quot;marketing firms under 50 employees&quot;
      </p>
    </form>
  );
}
