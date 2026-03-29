import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export default function Breadcrumb({ items, dark = false }) {
  const homeClass = dark
    ? 'flex items-center gap-1 text-slate-300 hover:text-white transition-colors'
    : 'flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors';

  const chevronClass = dark ? 'w-4 h-4 text-slate-500' : 'w-4 h-4 text-slate-400';

  const linkClass = dark
    ? 'text-slate-300 hover:text-white transition-colors font-medium'
    : 'text-slate-600 hover:text-orange-600 transition-colors font-medium';

  const currentClass = dark
    ? 'text-white font-semibold'
    : 'text-slate-900 font-semibold';

  // Build BreadcrumbList JSON-LD
  const breadcrumbItems = [
    { name: 'Home', url: `${SITE_URL}/` },
    ...items.map((item) => ({
      name: item.label,
      url: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href={createPageUrl('Home')} className={homeClass}>
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className={chevronClass} />
          {item.href ? (
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ) : (
            <span className={currentClass}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
