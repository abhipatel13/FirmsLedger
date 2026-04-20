'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-slate-900 text-base leading-snug">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && <p className="text-slate-600 text-base leading-relaxed pb-5">{answer}</p>}
    </div>
  );
}
