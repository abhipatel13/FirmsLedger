'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Search, ChevronRight, ArrowRight, Grid3X3, List, X } from 'lucide-react';

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
  'food-beverage': '🍽️',
  'chemicals-petrochemicals': '🧪',
  'pharmaceuticals-healthcare': '💊',
  'construction-building-materials': '🏗️',
  'automotive-transportation': '🚗',
  'electronics-electrical': '⚡',
  'textiles-apparel': '👔',
  'agriculture-farming': '🌾',
  'packaging-printing': '📦',
  'metals-mining': '⛏️',
  'energy-power': '🔋',
  'plastics-rubber': '♻️',
  'machinery-equipment': '⚙️',
  'paper-pulp': '📄',
  'water-treatment': '💧',
  'oil-gas': '🛢️',
  'logistics-supply-chain': '🚛',
  'real-estate': '🏠',
  'education-training': '📚',
  'hospitality-tourism': '🏨',
  'media-entertainment': '🎬',
  'financial-services': '💰',
  'telecommunications': '📡',
  'environmental-services': '🌿',
  'aerospace-defense': '✈️',
  'marine-shipping': '🚢',
};

const CAT_COLORS = [
  { bg: 'bg-orange-50', border: 'border-orange-100', accent: 'text-orange-600', hoverBorder: 'hover:border-orange-300' },
  { bg: 'bg-blue-50', border: 'border-blue-100', accent: 'text-blue-600', hoverBorder: 'hover:border-blue-300' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
  { bg: 'bg-violet-50', border: 'border-violet-100', accent: 'text-violet-600', hoverBorder: 'hover:border-violet-300' },
  { bg: 'bg-rose-50', border: 'border-rose-100', accent: 'text-rose-600', hoverBorder: 'hover:border-rose-300' },
  { bg: 'bg-amber-50', border: 'border-amber-100', accent: 'text-amber-600', hoverBorder: 'hover:border-amber-300' },
  { bg: 'bg-cyan-50', border: 'border-cyan-100', accent: 'text-cyan-600', hoverBorder: 'hover:border-cyan-300' },
  { bg: 'bg-pink-50', border: 'border-pink-100', accent: 'text-pink-600', hoverBorder: 'hover:border-pink-300' },
];

export default function Categories() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [expandedIds, setExpandedIds] = useState(new Set());

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

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

  const filteredParents = parentCategories.filter((p) => {
    if (!search) return true;
    if (p.name.toLowerCase().includes(searchLower)) return true;
    if (p.description?.toLowerCase().includes(searchLower)) return true;
    return getChildren(p.id).some((c) => c.name.toLowerCase().includes(searchLower));
  });

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

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-[#0D1B2A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-20 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
              {totalCategories} Industries · {totalSubcategories}+ Subcategories
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Explore All Industries
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Find verified companies across every industry — manufacturing, IT, staffing, marketing, and more.
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR (floating) ────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-7 mb-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-slate-200">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories, industries, services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-transparent rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Showing {filteredParents.length + filteredStandalone.length} results for "<span className="font-semibold text-slate-700">{search}</span>"
            </p>
          )}
        </div>
      </div>

      {/* ── VIEW TOGGLE ──────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-[#0D1B2A]">
            {search ? 'Search Results' : 'All Industries'}
          </h2>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#0D1B2A] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#0D1B2A] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading categories...</p>
            </div>
          ) : filteredParents.length === 0 && filteredStandalone.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-bold text-[#0D1B2A] text-lg mb-1">No categories found</h3>
              <p className="text-sm text-slate-500">
                {search ? `No results for "${search}". Try a different search term.` : 'No categories available.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Parent Categories */}
              {filteredParents.length > 0 && (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12'
                    : 'flex flex-col gap-4 mb-12'
                }>
                  {filteredParents.map((parent, idx) => {
                    const children = getChildren(parent.id);
                    const icon = CAT_ICONS[parent.slug] || '🏢';
                    const parentHref = getCategoryHref(parent);
                    const color = CAT_COLORS[idx % CAT_COLORS.length];
                    const filteredChildren = search
                      ? children.filter((c) => c.name.toLowerCase().includes(searchLower))
                      : children;
                    const displayChildren = search && filteredChildren.length > 0 ? filteredChildren : children;
                    const isExpanded = expandedIds.has(parent.id);
                    const visibleCount = viewMode === 'list' ? 6 : 5;
                    const showChildren = isExpanded ? displayChildren : displayChildren.slice(0, visibleCount);

                    if (viewMode === 'list') {
                      return (
                        <div key={parent.id} className={`bg-white border border-slate-200 rounded-xl p-5 ${color.hoverBorder} hover:shadow-sm transition-all`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-1">
                                <Link href={parentHref}>
                                  <h2 className="font-bold text-[#0D1B2A] text-lg hover:text-orange-600 transition-colors">
                                    {parent.name}
                                  </h2>
                                </Link>
                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full flex-shrink-0">
                                  {children.length} subcategories
                                </span>
                              </div>
                              {parent.description && (
                                <p className="text-sm text-slate-500 line-clamp-1 mb-3">{parent.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                {showChildren.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={getCategoryHref(child, parent)}
                                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                                {displayChildren.length > visibleCount && !isExpanded && (
                                  <button
                                    onClick={() => toggleExpand(parent.id)}
                                    className="text-xs px-3 py-1.5 text-orange-500 hover:text-orange-600 font-semibold"
                                  >
                                    +{displayChildren.length - visibleCount} more
                                  </button>
                                )}
                                {isExpanded && displayChildren.length > visibleCount && (
                                  <button
                                    onClick={() => toggleExpand(parent.id)}
                                    className="text-xs px-3 py-1.5 text-slate-400 hover:text-slate-600 font-semibold"
                                  >
                                    Show less
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={parent.id} className={`bg-white border border-slate-200 rounded-2xl overflow-hidden ${color.hoverBorder} hover:shadow-md transition-all group`}>
                        {/* Card header with colored accent */}
                        <div className={`${color.bg} px-6 py-5 border-b ${color.border}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/80 border border-white flex items-center justify-center text-xl shadow-sm">
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link href={parentHref}>
                                <h2 className="font-bold text-[#0D1B2A] text-base hover:text-orange-600 transition-colors leading-snug">
                                  {parent.name}
                                </h2>
                              </Link>
                              <p className={`text-xs font-medium ${color.accent} mt-0.5`}>
                                {children.length} subcategories
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Subcategories list */}
                        <div className="px-6 py-4">
                          {displayChildren.length > 0 ? (
                            <div className="flex flex-col">
                              {showChildren.map((child) => (
                                <Link
                                  key={child.id}
                                  href={getCategoryHref(child, parent)}
                                  className="flex items-center justify-between text-sm text-slate-600 hover:text-orange-600 py-2 px-2 -mx-2 rounded-lg hover:bg-orange-50/50 transition-colors group/item"
                                >
                                  <span>{child.name}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-orange-400 transition-colors" />
                                </Link>
                              ))}
                              {displayChildren.length > visibleCount && !isExpanded && (
                                <button
                                  onClick={() => toggleExpand(parent.id)}
                                  className="text-xs py-2 text-orange-500 hover:text-orange-600 font-semibold text-left"
                                >
                                  +{displayChildren.length - visibleCount} more subcategories
                                </button>
                              )}
                              {isExpanded && displayChildren.length > visibleCount && (
                                <button
                                  onClick={() => toggleExpand(parent.id)}
                                  className="text-xs py-2 text-slate-400 hover:text-slate-600 font-semibold text-left"
                                >
                                  Show less
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 py-2">No subcategories</p>
                          )}
                        </div>

                        {/* Card footer */}
                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                          <Link
                            href={parentHref}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                          >
                            Browse all {parent.name} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Standalone Categories */}
              {filteredStandalone.length > 0 && (
                <div>
                  {filteredParents.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-lg font-bold text-[#0D1B2A]">All Services & Products</h2>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-medium">{filteredStandalone.length} categories</span>
                    </div>
                  )}
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
                      : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                  }>
                    {filteredStandalone.map((cat, idx) => {
                      const icon = CAT_ICONS[cat.slug] || '🏷️';
                      const color = CAT_COLORS[idx % CAT_COLORS.length];
                      return (
                        <Link
                          key={cat.id}
                          href={getDirectoryUrl(cat.slug)}
                          className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:shadow-sm ${color.hoverBorder} transition-all group`}
                        >
                          <div className={`w-9 h-9 rounded-lg ${color.bg} ${color.border} border flex items-center justify-center text-base flex-shrink-0`}>
                            {icon}
                          </div>
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
    </div>
  );
}
