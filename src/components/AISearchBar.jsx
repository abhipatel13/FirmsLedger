'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export default function AISearchBar({ withLocation = false }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    const q = query.trim();
    const loc = location.trim();
    if (!q || q.length < 3) return;

    const params = new URLSearchParams({ q });
    if (loc) params.set('location', loc);
    router.push(`/ai-match?${params.toString()}`);
  };

  // Single-input variant (legacy)
  if (!withLocation) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className="relative flex items-center bg-white rounded-full shadow-[0_4px_40px_rgba(0,0,0,0.15)] border border-white/20 hover:shadow-[0_4px_50px_rgba(0,0,0,0.2)] transition-shadow">
          <div className="pl-3 sm:pl-5 pr-1 sm:pr-2 flex items-center pointer-events-none shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to find the right companies"
            className="flex-1 min-w-0 py-3.5 sm:py-4 px-1 sm:px-2 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
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
        <p className="text-center text-xs sm:text-sm text-slate-300/80 mt-4 px-2">
          Try: &quot;IT staffing agencies in New York&quot; or &quot;marketing firms under 50 employees&quot;
        </p>
      </form>
    );
  }

  // Dual-input variant: service + location
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 sm:bg-white sm:rounded-full sm:shadow-[0_4px_40px_rgba(0,0,0,0.18)] sm:border sm:border-white/20 sm:p-1.5">
        {/* Service field */}
        <div className="flex-1 flex items-center bg-white rounded-full sm:rounded-full px-4 sm:px-5 sm:border-r sm:border-slate-100 min-w-0">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What service are you looking for?"
            className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
        </div>

        {/* Location field */}
        <div className="flex-1 flex items-center bg-white rounded-full sm:rounded-full px-4 sm:px-5 min-w-0">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (city or country)"
            className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-7 py-3 sm:py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-full transition-colors whitespace-nowrap"
        >
          Get Started
        </button>
      </div>

      <p className="text-center text-xs sm:text-sm text-slate-300/80 mt-4 px-2">
        Try: &quot;IT staffing&quot; in New York · &quot;marketing&quot; in London · &quot;web design&quot; in Toronto
      </p>
    </form>
  );
}
