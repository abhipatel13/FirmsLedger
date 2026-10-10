'use client';

import { ExternalLink } from 'lucide-react';
import { websiteDomain } from '@/lib/listingFacts';

export default function VisitWebsiteButton({ href, className = '' }) {
  if (!websiteDomain(href)) return null;
  return (
    <a
      href={/^https?:\/\//i.test(href) ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap rounded-md bg-[#0F172A] px-3.5 py-1.5 text-[13px] font-medium text-white no-underline transition-opacity hover:opacity-90 ${className}`}
    >
      Visit Website
      <ExternalLink size={12} />
    </a>
  );
}
