'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { getCompanyProfileUrl, getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import {
  Search, MapPin, Users, Star, CheckCircle, ExternalLink,
  ArrowRight, Building2, X, SlidersHorizontal, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-orange-100 text-orange-700 rounded px-0.5 not-italic font-semibold">{part}</mark>
      : part
  );
}

const POPULAR_CATEGORIES = [
  { label: 'Staffing Companies', slug: 'staffing-companies', staffing: true },
  { label: 'IT Services', slug: 'it-services' },
  { label: 'Business Consulting', slug: 'business-consulting' },
  { label: 'Legal Services', slug: 'legal-services' },
  { label: 'Marketing Agencies', slug: 'marketing-agencies' },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState('');
  const inputRef = useRef(null);

  // Sync URL param → state when navigating
  useEffect(() => {
    setInputValue(initialQ);
    setActiveQuery(initialQ);
  }, [initialQ]);

  const { data: allAgencies = [], isLoading: agenciesLoading } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => api.entities.Agency.filter({ approved: true }, '-avg_rating', 200),
  });

  const { data: agencyCategories = [] } = useQuery({
    queryKey: ['agency-categories'],
    queryFn: () => api.entities.AgencyCategory.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const handleSearch = (q = inputValue) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setActiveQuery(trimmed);
    setActiveCategory('');
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearCategory = () => setActiveCategory('');

  // Filter logic
  const results = React.useMemo(() => {
    if (!activeQuery && !activeCategory) return [];
    const q = activeQuery.trim().toLowerCase();

    return allAgencies.filter((agency) => {
      // Text search
      if (q) {
        const fields = [
          agency.name,
          agency.description,
          agency.hq_city,
          agency.hq_state,
          agency.hq_country,
          ...(agency.services_offered || []),
        ];
        const matches = fields.some(f => f?.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category chip filter
      if (activeCategory) {
        const cat = categories.find(c => c.slug === activeCategory);
        if (cat) {
          const catIds = [cat.id, ...categories.filter(c => (c.parent_id ?? c.parentId) === cat.id).map(c => c.id)];
          const hasCategory = agencyCategories.some(
            ac => (ac.agency_id ?? ac.agencyId) === agency.id && catIds.includes(ac.category_id ?? ac.categoryId)
          );
          if (!hasCategory) return false;
        }
      }

      return true;
    });
  }, [activeQuery, activeCategory, allAgencies, categories, agencyCategories]);

  const isLoading = agenciesLoading;
  const hasQuery = !!activeQuery;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero Search Bar */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-2">Search Results</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 tracking-tight">
            {hasQuery ? (
              <>Results for <span className="text-orange-400">"{activeQuery}"</span></>
            ) : (
              'Search agencies & services'
            )}
          </h1>

          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, service, location..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {inputValue && (
                <button
                  onClick={() => { setInputValue(''); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories
            .filter(c => c.is_parent ?? c.isParent)
            .slice(0, 8)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(prev => prev === cat.slug ? '' : cat.slug)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          {activeCategory && (
            <button
              onClick={handleClearCategory}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-slate-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            <p className="text-slate-500 text-sm">Searching...</p>
          </div>
        )}

        {/* No query yet */}
        {!isLoading && !hasQuery && !activeCategory && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Start your search</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
              Find verified agencies by name, service type, or location.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['IT staffing in Bangalore', 'Healthcare recruiters UK', 'Marketing agencies NYC', 'Business consultants Australia'].map(s => (
                <button
                  key={s}
                  onClick={() => { setInputValue(s); handleSearch(s); }}
                  className="text-sm text-orange-600 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && (hasQuery || activeCategory) && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">{results.length}</strong> {results.length === 1 ? 'result' : 'results'} found
                {activeQuery && <> for <span className="text-orange-600 font-semibold">"{activeQuery}"</span></>}
              </p>
              {results.length > 0 && (
                <Link
                  href={getDirectoryUrl() + (activeQuery ? `?search=${encodeURIComponent(activeQuery)}` : '')}
                  className="text-xs text-slate-500 hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
                >
                  View in directory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {results.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">No results found</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  We couldn't find any agencies matching <strong>"{activeQuery}"</strong>. Try different keywords or browse by category.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      href={cat.staffing ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug)}
                      className="text-sm text-orange-600 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((agency, index) => (
                  <div
                    key={agency.id}
                    className="bg-white border border-slate-200 rounded-xl hover:border-orange-200 hover:shadow-sm transition-all duration-150"
                  >
                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Rank + Logo */}
                        <div className="flex items-start gap-3 flex-shrink-0">
                          <div className="w-6 h-6 rounded bg-[#0D1B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[9px] font-black text-white">{index + 1}</span>
                          </div>
                          {agency.logo_url ? (
                            <img
                              src={agency.logo_url}
                              alt={agency.name}
                              className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-white flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                              <span className="text-lg font-bold text-slate-400">{agency.name?.charAt(0)}</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Name + verified */}
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Link href={getCompanyProfileUrl(agency)}>
                                  <h3 className="text-base font-bold text-slate-900 hover:text-orange-600 transition-colors">
                                    {highlight(agency.name, activeQuery)}
                                  </h3>
                                </Link>
                                {agency.verified && (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                                  </span>
                                )}
                              </div>

                              {/* Rating */}
                              {agency.avg_rating > 0 && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(agency.avg_rating) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">{agency.avg_rating.toFixed(1)}</span>
                                  <span className="text-xs text-slate-400">· {agency.review_count || 0} reviews</span>
                                </div>
                              )}

                              {/* Description */}
                              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">
                                {highlight(
                                  agency.description || `${agency.name} is a verified business service provider${agency.hq_city ? ` based in ${agency.hq_city}` : ''}.`,
                                  activeQuery
                                )}
                              </p>

                              {/* Meta chips */}
                              <div className="flex flex-wrap gap-2">
                                {(agency.hq_city || agency.hq_country) && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                    <MapPin className="w-3 h-3" />
                                    {highlight([agency.hq_city, agency.hq_country].filter(Boolean).join(', '), activeQuery)}
                                  </span>
                                )}
                                {agency.team_size && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                    <Users className="w-3 h-3" /> {agency.team_size}
                                  </span>
                                )}
                                {agency.founded_year && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                    <Calendar className="w-3 h-3" /> Est. {agency.founded_year}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 sm:w-32 flex-shrink-0">
                              <Link href={getCompanyProfileUrl(agency)} className="flex-1 sm:flex-none">
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9 rounded-lg">
                                  View Profile
                                </Button>
                              </Link>
                              {agency.website && (
                                <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-semibold h-9 rounded-lg">
                                    Website <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
