import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

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

  return (
    <nav className="flex items-center gap-2 text-sm">
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
