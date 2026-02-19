import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link 
        href={createPageUrl('Home')} 
        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}