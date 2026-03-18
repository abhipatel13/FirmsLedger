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
import { MapPin, Users, Calendar, ExternalLink, Star, CheckCircle, Search } from 'lucide-react';
import { debounce } from 'lodash';

export default function Directory({ initialCategorySlug, underStaffing: underStaffingProp, initialAgencies, initialAgencyCategories }) {
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
  const searchFromUrl = searchParams.get('search') || '';

  const initialCategory = initialCategorySlug || categoryFromPath || '';
  const [selectedCountry, setSelectedCountry] = useState(countryFromUrl);
  const [selectedState, setSelectedState] = useState(stateFromUrl);
  const [selectedService, setSelectedService] = useState(initialCategory);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const [sortBy, setSortBy] = useState('sponsored');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });
  // Dedupe by slug so filter dropdown has unique options and doesn't cause URL flip
  const categories = React.useMemo(() => {
    const seen = new Set();
    return categoriesRaw.filter((c) => {
      if (seen.has(c.slug)) return false;
      seen.add(c.slug);
      return true;
    });
  }, [categoriesRaw]);

  const staffingParentId = React.useMemo(() => categories.find((c) => c.slug === 'staffing-companies')?.id, [categories]);
  const staffingSubcategorySlugs = React.useMemo(
    () => new Set(categories.filter((c) => (c.parent_id ?? c.parentId) === staffingParentId).map((c) => c.slug)),
    [categories, staffingParentId]
  );
  const useStaffingPath = isStaffingPath || (!!selectedService && staffingSubcategorySlugs.has(selectedService));

  const { data: allAgencies = [], isLoading } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => api.entities.Agency.filter({ approved: true }, '-avg_rating', 100),
    initialData: initialAgencies?.length ? initialAgencies : undefined,
  });

  const { data: agencyCategories = [] } = useQuery({
    queryKey: ['agency-categories'],
    queryFn: () => api.entities.AgencyCategory.list(),
    initialData: initialAgencyCategories?.length ? initialAgencyCategories : undefined,
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

  // Update URL when filters change – /directory, /directory/staffing, /directory/staffing/xxx, or /directory/xxx + query
  useEffect(() => {
    const base =
      selectedService === 'staffing-companies' || selectedService === 'staffing'
        ? getDirectoryStaffingUrl()
        : getDirectoryUrl(selectedService, { underStaffing: useStaffingPath });
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedState) params.set('state', selectedState);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedTeamSize) params.set('teamSize', selectedTeamSize);
    const query = params.toString();
    const newPath = query ? `${base}?${query}` : base;
    if (typeof window !== 'undefined' && (window.location.pathname + window.location.search) !== newPath) {
      router.replace(newPath);
    }
  }, [selectedService, selectedCountry, selectedState, debouncedSearch, selectedRating, selectedTeamSize, useStaffingPath, router]);

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
    setSearchQuery(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
    const ratingParam = searchParams.get('rating');
    const teamSizeParam = searchParams.get('teamSize');
    if (ratingParam) setSelectedRating(ratingParam);
    if (teamSizeParam) setSelectedTeamSize(teamSizeParam);
  }, [countryFromUrl, stateFromUrl, searchFromUrl, searchParams]);

  // Get selected category name
  const selectedCategoryName = categories.find(c => c.slug === selectedService || c.id === selectedService)?.name || 'Business Service Providers';

  // Filter agencies with proper search logic
  const filteredAgencies = allAgencies.filter((agency) => {
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

    // Handle service/category filter (works with search)
    if (selectedService) {
      const selectedCat = categories.find(c => c.slug === selectedService);
      if (selectedCat) {
        // Check if agency has this category or any of its subcategories
        const hasDirectCategory = agencyCategories.some(
          (ac) => (ac.agency_id ?? ac.agencyId) === agency.id && (ac.category_id ?? ac.categoryId) === selectedCat.id
        );
        
        if (selectedCat.is_parent ?? selectedCat.isParent) {
          const subcategoryIds = categories
            .filter(c => (c.parent_id ?? c.parentId) === selectedCat.id)
            .map(c => c.id);
          const hasSubcategory = agencyCategories.some(
            (ac) => (ac.agency_id ?? ac.agencyId) === agency.id && subcategoryIds.includes(ac.category_id ?? ac.categoryId)
          );
          if (!hasDirectCategory && !hasSubcategory) return false;
        } else {
          if (!hasDirectCategory) return false;
        }
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

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Page Header */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7">
          <Breadcrumb items={selectedService ? [{ label: 'Directory', href: getDirectoryUrl() }, { label: selectedCategoryName }] : [{ label: 'Directory' }]} dark />

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-4 mb-2 text-white tracking-tight">
            Top {selectedCategoryName}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed mb-4">
            Discover verified {selectedCategoryName.toLowerCase()} — ranked by authentic client reviews and real outcomes.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span><strong className="text-white">{filteredAgencies.length}</strong> Companies Listed</span>
            <span>·</span>
            <span>Rankings updated: Feb 15, 2026</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedTeamSize={selectedTeamSize}
        setSelectedTeamSize={setSelectedTeamSize}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        onApply={() => {}}
      />

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-slate-500">
            Showing <strong className="text-slate-800">{filteredAgencies.length}</strong> {selectedCategoryName}
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
            {filteredAgencies.map((agency, index) => (
              <div
                key={agency.id}
                className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all duration-150"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* Rank + Logo */}
                    <div className="flex items-start gap-3 flex-shrink-0">
                      <div className="w-7 h-7 rounded bg-[#0D1B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-white">{index + 1}</span>
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
      </div>
    </div>
  );
}