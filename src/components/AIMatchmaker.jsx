'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowUp, AlertCircle } from 'lucide-react';

const EXAMPLE_QUERIES = [
  { icon: '💻', text: 'IT staffing agency in Bangalore for 10 engineers' },
  { icon: '🏥', text: 'Healthcare staffing for nurses in Australia' },
  { icon: '🏭', text: 'Warehouse workers in Chicago under $20/hr' },
  { icon: '🎯', text: 'Executive search for C-level hiring in the UK' },
];

export default function AIMatchmaker({ compact = false }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (q = query) => {
    const trimmed = (typeof q === 'string' ? q : query).trim();
    if (!trimmed || trimmed.length < 5) {
      setError('Please describe your requirement (at least 5 characters).');
      return;
    }
    router.push(`/ai-match?q=${encodeURIComponent(trimmed)}`);
  };

  const handleExample = (text) => {
    setQuery(text);
    setError('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Textarea + send */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you need — location, team size, budget, timeline…"
          rows={compact ? 2 : 3}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 pt-4 pb-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white leading-relaxed transition-all"
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">Press Enter to search</span>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!query.trim()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/30 disabled:shadow-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find Match
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Examples */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map(({ icon, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => handleExample(text)}
              className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm hover:shadow-orange-100"
            >
              <span>{icon}</span> {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
