'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Search, ChevronRight, Building2, ArrowRight } from 'lucide-react';

const CAT_ICONS = {
  'staffing-companies': '👥',
  'it-staffing': '💻',
  'healthcare-staffing': '🏥',
  'digital-marketing': '📣',
  'seo': '🔍',
  'web-development': '🌐',
  'mobile-app-development': '📱',
  'accounting': '📊',
  'legal-services': '⚖️',
  'legal': '⚖️',
  'public-relations': '📰',
  'pr-communications': '📰',
  'graphic-design': '🎨',
  'it-services': '🖥️',
  'business-consulting': '💼',
  'gst-tax-consultants': '🧾',
  'content-writing-services': '✍️',
};

export default function Categories() {
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  // Build hierarchy
  const { parentCategories, standaloneCategories } = useMemo(() => {
    const parents = categories.filter((c) => c.is_parent || c.isParent);
    const standalone = categories.filter(
      (c) => !(c.is_parent || c.isParent) && !(c.parent_id || c.parentId)
    );
    return { parentCategories: parents, standaloneCategories: standalone };
  }, [categories]);

  const getChildren = (parentId) =>
    categories.filter((c) => (c.parent_id ?? c.parentId) === parentId);

  const searchLower = search.toLowerCase();

  // Filter parents: show if parent matches or any child matches
  const filteredParents = parentCategories.filter((p) => {
    if (!search) return true;
    if (p.name.toLowerCase().includes(searchLower)) return true;
    if (p.description?.toLowerCase().includes(searchLower)) return true;
    const children = getChildren(p.id);
    return children.some((c) => c.name.toLowerCase().includes(searchLower));
  });

  // Filter standalone
  const filteredStandalone = standaloneCategories.filter((c) => {
    if (!search) return true;
    return c.name.toLowerCase().includes(searchLower) || c.description?.toLowerCase().includes(searchLower);
  });

  const getCategoryHref = (cat, parent) => {
    if (cat.is_parent || cat.isParent) {
      return cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug);
    }
    const isStaffing = parent?.slug === 'staffing-companies';
    return getDirectoryUrl(cat.slug, { underStaffing: isStaffing });
  };

  const totalCategories = parentCategories.length + standaloneCategories.length;
  const totalSubcategories = categories.length - parentCategories.length - standaloneCategories.length;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <div className="bg-[#0D1B2A] text-white py-14 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Categories</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Browse All Categories
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-4">
            Discover verified companies across every category — manufacturers, suppliers, staffing agencies, IT, marketing, legal, and more.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span><strong className="text-white">{totalCategories}</strong> Categories</span>
            <span>·</span>
            <span><strong className="text-white">{totalSubcategories}</strong> Subcategories</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 shadow-sm"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : filteredParents.length === 0 && filteredStandalone.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No categories found{search ? ` for "${search}"` : ''}.</p>
        ) : (
          <>
            {/* Parent categories with subcategories */}
            {filteredParents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {filteredParents.map((parent) => {
                  const children = getChildren(parent.id);
                  const icon = CAT_ICONS[parent.slug] || '🏢';
                  const parentHref = getCategoryHref(parent);

                  // If searching, highlight matching children
                  const filteredChildren = search
                    ? children.filter((c) => c.name.toLowerCase().includes(searchLower))
                    : children;
                  const displayChildren = search && filteredChildren.length > 0 ? filteredChildren : children;

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
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{parent.description}</p>
                          )}
                        </div>
                      </div>

                      {displayChildren.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {children.length} Subcategories
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {displayChildren.slice(0, 10).map((child) => (
                              <Link
                                key={child.id}
                                href={getCategoryHref(child, parent)}
                                className="flex items-center justify-between group text-sm text-slate-600 hover:text-orange-600 py-1.5 px-2 rounded-lg hover:bg-orange-50 transition-colors"
                              >
                                <span>{child.name}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-400 transition-colors" />
                              </Link>
                            ))}
                            {displayChildren.length > 10 && (
                              <Link href={parentHref} className="text-xs px-2 py-1 text-orange-500 hover:text-orange-600 font-semibold">
                                +{displayChildren.length - 10} more
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      <Link href={parentHref} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 mt-4 transition-colors">
                        View all {parent.name} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Standalone categories (no parent, not a parent themselves) */}
            {filteredStandalone.length > 0 && (
              <div>
                {filteredParents.length > 0 && (
                  <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">All Services & Products</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredStandalone.map((cat) => {
                    const icon = CAT_ICONS[cat.slug] || '🏷️';
                    return (
                      <Link
                        key={cat.id}
                        href={getDirectoryUrl(cat.slug)}
                        className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:shadow-sm hover:border-orange-300 transition-all group"
                      >
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#0D1B2A] group-hover:text-orange-600 transition-colors truncate">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 truncate">{cat.description}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
