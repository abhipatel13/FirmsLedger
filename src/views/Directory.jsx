'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl, getDirectoryUrlWithParams, getCompanyProfileUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';
import FilterPanel from '@/components/FilterPanel';
import { MapPin, Users, Calendar, ExternalLink, Star, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { debounce } from 'lodash';

const PAGE_SIZE = 10;

export default function Directory({ initialCategorySlug, initialCategoryData, underStaffing: underStaffingProp, initialAgencies, initialCategories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathWithoutQuery = pathname?.replace(/\?.*$/, '') || '';
  const isStaffingHubOnly = pathWithoutQuery === '/directory/staffing';
  const staffingMatch = pathname && pathname.match(/^\/directory\/staffing\/([^/?#]+)/);
  const categoryFromPath = isStaffingHubOnly
    ? 'staffing-companies'
    : staffingMatch?.[1] || (pathname && pathname.match(/^\/directory\/([^/?#]+)/))?.[1] || '';
  const isStaffingPath = !!staffingMatch || underStaffingProp;
  const categorySlugFromUrl = initialCategorySlug || searchParams.get('category') || categoryFromPath || '';
  const countryFromUrl = searchParams.get('country') || '';
  const stateFromUrl = searchParams.get('state') || '';
  const cityFromUrl = searchParams.get('city') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const initialCategory = initialCategorySlug || categoryFromPath || '';
  const [selectedCountry, setSelectedCountry] = useState(countryFromUrl);
  const [selectedState, setSelectedState] = useState(stateFromUrl);
  const [selectedCity, setSelectedCity] = useState(cityFromUrl);
  const [selectedService, setSelectedService] = useState(initialCategory);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const [sortBy, setSortBy] = useState('sponsored');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl);

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
    initialData: initialCategories?.length ? initialCategories : undefined,
  });
  // Dedupe by slug, and ensure the specific page category is always present even if beyond the 10k fetch limit
  const categories = React.useMemo(() => {
    const seen = new Set();
    const deduped = categoriesRaw.filter((c) => {
      if (seen.has(c.slug)) return false;
      seen.add(c.slug);
      return true;
    });
    if (initialCategoryData && !seen.has(initialCategoryData.slug)) {
      return [initialCategoryData, ...deduped];
    }
    return deduped;
  }, [categoriesRaw, initialCategoryData]);

  const staffingParentId = React.useMemo(() => categories.find((c) => c.slug === 'staffing-companies')?.id, [categories]);
  const staffingSubcategorySlugs = React.useMemo(
    () => new Set(categories.filter((c) => (c.parent_id ?? c.parentId) === staffingParentId).map((c) => c.slug)),
    [categories, staffingParentId]
  );
  const useStaffingPath = isStaffingPath || (!!selectedService && staffingSubcategorySlugs.has(selectedService));

  // Category > SubCategory navigation
  const selectedCat = React.useMemo(() => categories.find((c) => c.slug === selectedService), [categories, selectedService]);
  const subcategoriesOfSelected = React.useMemo(
    () => selectedCat ? categories.filter((c) => (c.parent_id ?? c.parentId) === selectedCat.id) : [],
    [categories, selectedCat]
  );
  const parentOfSelected = React.useMemo(
    () => selectedCat?.parent_id ? categories.find((c) => c.id === selectedCat.parent_id) : null,
    [categories, selectedCat]
  );

  const { data: allAgencies = [], isLoading } = useQuery({
    queryKey: ['agencies', selectedService || ''],
    queryFn: () => selectedService
      ? api.entities.Agency.filterByCategory(selectedService, '-avg_rating', 200)
      : api.entities.Agency.filter({ approved: true }, '-avg_rating', 100),
    initialData: initialAgencies?.length ? initialAgencies : undefined,
  });


  // Debounce search input
  useEffect(() => {
    const debouncedUpdate = debounce((value) => {
      setDebouncedSearch(value);
    }, 300);

    debouncedUpdate(searchQuery);

    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchQuery]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedService, selectedCountry, selectedState, selectedCity, debouncedSearch, selectedRating, selectedTeamSize, sortBy]);

  // Update URL when filters or page change
  useEffect(() => {
    const base =
      selectedService === 'staffing-companies' || selectedService === 'staffing'
        ? getDirectoryStaffingUrl()
        : getDirectoryUrl(selectedService, { underStaffing: useStaffingPath });
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedState) params.set('state', selectedState);
    if (selectedCity) params.set('city', selectedCity);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedTeamSize) params.set('teamSize', selectedTeamSize);
    if (currentPage > 1) params.set('page', currentPage);
    const query = params.toString();
    const newPath = query ? `${base}?${query}` : base;
    if (typeof window !== 'undefined' && (window.location.pathname + window.location.search) !== newPath) {
      router.replace(newPath);
    }
  }, [selectedService, selectedCountry, selectedState, selectedCity, debouncedSearch, selectedRating, selectedTeamSize, currentPage, useStaffingPath, router]);

  // Initialize filters from URL (only when URL has a category and state is not already in sync)
  useEffect(() => {
    if (!categorySlugFromUrl || categories.length === 0) return;
    const slugExists = categories.some((c) => c.slug === categorySlugFromUrl);
    if (slugExists && selectedService !== categorySlugFromUrl) {
      setSelectedService(categorySlugFromUrl);
    }
  }, [categorySlugFromUrl, categories, selectedService]);

  // Sync other URL params to state (country, state, search, rating, teamSize)
  useEffect(() => {
    setSelectedCountry(countryFromUrl);
    setSelectedState(stateFromUrl);
    setSelectedCity(cityFromUrl);
    setSearchQuery(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
    const ratingParam = searchParams.get('rating');
    const teamSizeParam = searchParams.get('teamSize');
    if (ratingParam) setSelectedRating(ratingParam);
    if (teamSizeParam) setSelectedTeamSize(teamSizeParam);
  }, [countryFromUrl, stateFromUrl, searchFromUrl, searchParams]);

  // Get selected category name and description
  const selectedCat_ = categories.find(c => c.slug === selectedService || c.id === selectedService);
  const selectedCategoryName = selectedCat_?.name || 'Businesses';
  const selectedCategoryDesc = selectedCat_?.description || '';

  // Filter agencies with proper search logic
  const sortedAgencies = [...allAgencies].sort((a, b) => {
    if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0);
    // 'sponsored' / default — featured first, then by rating
    const aFeat = a.featured ? 1 : 0;
    const bFeat = b.featured ? 1 : 0;
    if (bFeat !== aFeat) return bFeat - aFeat;
    return (b.avg_rating || 0) - (a.avg_rating || 0);
  });

  const filteredAgencies = sortedAgencies.filter((agency) => {
    // Handle search query across all fields
    if (debouncedSearch) {
      const searchLower = debouncedSearch.trim().toLowerCase();
      const nameMatch = agency.name?.toLowerCase().includes(searchLower);
      const descMatch = agency.description?.toLowerCase().includes(searchLower);
      const cityMatch = agency.hq_city?.toLowerCase().includes(searchLower);
      const stateMatch = agency.hq_state?.toLowerCase().includes(searchLower);
      const countryMatch = agency.hq_country?.toLowerCase().includes(searchLower);
      const servicesMatch = agency.services_offered?.some(s => s.toLowerCase().includes(searchLower));
      
      if (!nameMatch && !descMatch && !cityMatch && !stateMatch && !countryMatch && !servicesMatch) {
        return false;
      }
    }

    // Handle country filter
    if (selectedCountry) {
      const countryMatch = agency.hq_country?.toLowerCase() === selectedCountry.toLowerCase();
      if (!countryMatch) return false;
    }

    // Handle state / region filter
    if (selectedState) {
      const stateLower = selectedState.trim().toLowerCase();
      const stateMatch = agency.hq_state?.toLowerCase().includes(stateLower);
      if (!stateMatch) return false;
    }

    // Handle city filter
    if (selectedCity) {
      const cityLower = selectedCity.trim().toLowerCase();
      const cityMatch = agency.hq_city?.toLowerCase().includes(cityLower);
      if (!cityMatch) return false;
    }

    // Handle rating filter
    if (selectedRating && agency.avg_rating < parseFloat(selectedRating)) {
      return false;
    }

    // Handle team size filter
    if (selectedTeamSize && agency.team_size !== selectedTeamSize) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAgencies.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedAgencies = filteredAgencies.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goToPage(p) {
    const next = Math.max(1, Math.min(p, totalPages));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Page Header */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 pb-7">
          <Breadcrumb
            items={
              selectedService
                ? parentOfSelected
                  ? [
                      { label: 'Directory', href: getDirectoryUrl() },
                      { label: parentOfSelected.name, href: getDirectoryUrl(parentOfSelected.slug) },
                      { label: selectedCategoryName },
                    ]
                  : [{ label: 'Directory', href: getDirectoryUrl() }, { label: selectedCategoryName }]
                : [{ label: 'Directory' }]
            }
            dark
          />

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-4 mb-2 text-white tracking-tight">
            Top {selectedCategoryName} Companies
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed mb-4">
            {selectedCategoryDesc
              ? selectedCategoryDesc
              : `Find and compare the best ${selectedCategoryName.toLowerCase()} companies worldwide. Browse verified providers, read real client reviews, and shortlist the right ${selectedCategoryName.toLowerCase()} partner for your business.`}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span><strong className="text-white">{filteredAgencies.length}</strong> Companies Listed</span>
            <span>·</span>
            <span>Rankings updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Subcategory pills */}
          {subcategoriesOfSelected.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Browse by Subcategory</p>
              <div className="flex flex-wrap gap-2">
                {subcategoriesOfSelected.map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => setSelectedService(sub.slug)}
                    className="text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parent category link */}
          {parentOfSelected && (
            <div className="mt-3">
              <button
                onClick={() => setSelectedService(parentOfSelected.slug)}
                className="text-xs text-slate-400 hover:text-white transition-colors underline"
              >
                ← Back to {parentOfSelected.name}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, services, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setDebouncedSearch(searchQuery); }}
              className="pl-9 h-10 text-sm border-slate-200 focus:border-orange-400 focus:ring-orange-400"
              aria-label="Search agencies"
            />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        categories={categories}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedTeamSize={selectedTeamSize}
        setSelectedTeamSize={setSelectedTeamSize}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
      />

      {/* Results */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {/* Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-slate-500">
            Showing <strong className="text-slate-800">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredAgencies.length)}</strong> of <strong className="text-slate-800">{filteredAgencies.length}</strong> {selectedCategoryName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 bg-white border-slate-200 text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsored">Best Match</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500"></div>
            <p className="mt-3 text-slate-500 text-sm">Loading...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No companies found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagedAgencies.map((agency, index) => (
              <div
                key={agency.id}
                className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all duration-150"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* Rank + Logo */}
                    <div className="flex items-start gap-3 flex-shrink-0">
                      <div className="w-7 h-7 rounded bg-[#0D1B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-white">{(safePage - 1) * PAGE_SIZE + index + 1}</span>
                      </div>
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-contain border border-slate-100 bg-white" />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 flex-shrink-0">
                          <span className="text-xl font-bold text-slate-400">{agency.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                        {/* Left info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link href={getCompanyProfileUrl(agency)}>
                              <h3 className="text-base font-bold text-slate-900 hover:text-orange-600 transition-colors">
                                {agency.name}
                              </h3>
                            </Link>
                            {agency.verified && (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                                <CheckCircle className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>

                          {/* Rating row */}
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(agency.avg_rating || 0) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{(agency.avg_rating || 0).toFixed(1)}</span>
                            <Link href={getCompanyProfileUrl(agency) + '#reviews'} className="text-xs text-slate-500 hover:underline">
                              {agency.review_count || 0} Reviews
                            </Link>
                          </div>

                          {/* Description */}
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">
                            {agency.description || `${agency.name} is a verified service provider${agency.hq_city ? ` based in ${agency.hq_city}` : ''}. Connect to learn about their expertise, pricing, and client outcomes.`}
                          </p>

                          {/* Meta chips */}
                          <div className="flex flex-wrap gap-2">
                            {agency.team_size && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                <Users className="w-3 h-3" /> {agency.team_size}
                              </span>
                            )}
                            {agency.founded_year && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                <Calendar className="w-3 h-3" /> Est. {agency.founded_year}
                              </span>
                            )}
                            {(agency.hq_city || agency.hq_country) && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                <MapPin className="w-3 h-3" />
                                {[agency.hq_city, agency.hq_country].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 lg:w-36 flex-shrink-0">
                          <Link href={getCompanyProfileUrl(agency)} className="flex-1 lg:flex-none">
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9 rounded-md transition-colors">
                              View Profile
                            </Button>
                          </Link>
                          {agency.website && (
                            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                              <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-semibold h-9 rounded-md">
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

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 mb-2">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {getPaginationPages(safePage, totalPages).map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 py-2 text-slate-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
                    item === safePage
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getPaginationPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}