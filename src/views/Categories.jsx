'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Search, ChevronRight, Building2 } from 'lucide-react';

const CAT_ICONS = {
  'staffing-companies': '👥',
  'it-staffing': '💻',
  'healthcare-staffing': '🏥',
  'digital-marketing': '📣',
  'seo': '🔍',
  'web-development': '🌐',
  'mobile-app-development': '📱',
  'accounting': '📊',
  'legal': '⚖️',
  'public-relations': '📰',
  'graphic-design': '🎨',
  'it-services': '🖥️',
};

export default function Categories() {
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const parents = categories
    .filter(c => (c.is_parent ?? c.isParent))
    .filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );

  const getChildren = (parentId) =>
    categories.filter(c => (c.parent_id ?? c.parentId) === parentId);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <div className="bg-[#0D1B2A] text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Categories</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Browse All Service Categories
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Discover verified companies across every business service category — staffing, IT, marketing, legal, and more.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : parents.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No categories found{search ? ` for "${search}"` : ''}.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parents.map((parent) => {
              const children = getChildren(parent.id);
              const icon = CAT_ICONS[parent.slug] || '🏢';
              const parentHref = parent.slug === 'staffing-companies'
                ? getDirectoryStaffingUrl()
                : getDirectoryUrl(parent.slug);
              return (
                <div key={parent.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <Link href={parentHref}>
                        <h2 className="font-bold text-[#0D1B2A] text-lg hover:text-orange-600 transition-colors leading-snug">
                          {parent.name}
                        </h2>
                      </Link>
                      {parent.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{parent.description}</p>
                      )}
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                      {children.map((child) => {
                        const isStaffing = parent.slug === 'staffing-companies';
                        const childHref = isStaffing
                          ? getDirectoryUrl(child.slug, { underStaffing: true })
                          : getDirectoryUrl(child.slug);
                        return (
                          <Link
                            key={child.id}
                            href={childHref}
                            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors"
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <Link href={parentHref} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 mt-4 transition-colors">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
