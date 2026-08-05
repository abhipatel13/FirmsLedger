'use client';

import { ExternalLink } from 'lucide-react';

export default function VisitWebsiteButton({ href, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 shrink-0 rounded-md bg-[#0F172A] px-3.5 py-1.5 text-[13px] font-medium text-white no-underline transition-opacity hover:opacity-90 ${className}`}
    >
      Visit Website
      <ExternalLink size={12} />
    </a>
  );
}
