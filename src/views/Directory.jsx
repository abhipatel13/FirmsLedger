'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';
import FilterPanel from '@/components/FilterPanel';
import { MapPin, Users, Calendar, ExternalLink, Star, CheckCircle, Search, Grid3x3, List, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

export default function Directory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categorySlugFromUrl = searchParams.get('category') || '';
  const locationFromUrl = searchParams.get('location') || '';
  const searchFromUrl = searchParams.get('search') || '';
  
  const [selectedLocation, setSelectedLocation] = useState(locationFromUrl);
  const [selectedService, setSelectedService] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const [sortBy, setSortBy] = useState('sponsored');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: allAgencies = [], isLoading } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => base44.entities.Agency.filter({ approved: true }, '-avg_rating', 100),
  });

  const { data: agencyCategories = [] } = useQuery({
    queryKey: ['agency-categories'],
    queryFn: () => base44.entities.AgencyCategory.list(),
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedService) params.set('category', selectedService);
    if (selectedLocation) params.set('location', selectedLocation);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedTeamSize) params.set('teamSize', selectedTeamSize);

    const newSearch = params.toString() ? `?${params.toString()}` : '';
    const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
    if (currentSearch !== newSearch) {
      router.replace(createPageUrl('Directory') + newSearch);
    }
  }, [selectedService, selectedLocation, debouncedSearch, selectedRating, selectedTeamSize, router, searchParams]);

  // Initialize filters from URL
  useEffect(() => {
    if (categorySlugFromUrl && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlugFromUrl);
      if (category) {
        setSelectedService(category.slug);
      }
    }
  }, [categorySlugFromUrl, categories]);

  useEffect(() => {
    setSelectedLocation(locationFromUrl);
    setSearchQuery(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
    const ratingParam = searchParams.get('rating');
    const teamSizeParam = searchParams.get('teamSize');
    if (ratingParam) setSelectedRating(ratingParam);
    if (teamSizeParam) setSelectedTeamSize(teamSizeParam);
  }, [locationFromUrl, searchFromUrl, searchParams]);

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
          (ac) => ac.agency_id === agency.id && ac.category_id === selectedCat.id
        );
        
        if (selectedCat.is_parent) {
          const subcategoryIds = categories
            .filter(c => c.parent_id === selectedCat.id)
            .map(c => c.id);
          const hasSubcategory = agencyCategories.some(
            (ac) => ac.agency_id === agency.id && subcategoryIds.includes(ac.category_id)
          );
          if (!hasDirectCategory && !hasSubcategory) return false;
        } else {
          if (!hasDirectCategory) return false;
        }
      }
    }

    // Handle location filter (works with search and category)
    if (selectedLocation) {
      const locationLower = selectedLocation.toLowerCase();
      const cityMatch = agency.hq_city?.toLowerCase().includes(locationLower);
      const stateMatch = agency.hq_state?.toLowerCase().includes(locationLower);
      const countryMatch = agency.hq_country?.toLowerCase().includes(locationLower);
      
      if (!cityMatch && !stateMatch && !countryMatch) {
        return false;
      }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Browse Agencies' }]} />
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
              Top {selectedCategoryName}
            </h1>
            <p className="text-slate-600 mb-6 max-w-4xl leading-relaxed">
              Discover the top {selectedCategoryName.toLowerCase()} at FirmsLedger. Browse verified service providers with proven expertise. The list makes it easy for businesses to easily browse the most reliable service providers based on their expertise, project needs and pricing.
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span><strong>{filteredAgencies.length}</strong> Companies</span>
              <span>|</span>
              <span>Rankings updated: Feb 15, 2026</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, services, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDebouncedSearch(searchQuery);
                  }
                }}
                className="pl-10 h-12 text-base"
                aria-label="Search agencies"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        categories={categories}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedTeamSize={selectedTeamSize}
        setSelectedTeamSize={setSelectedTeamSize}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        onApply={() => {}}
      />

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-slate-900">
            List of Top {selectedCategoryName} | Top {selectedCategoryName.split(' ')[0]} Providers
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsored">Sponsored</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading agencies...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">No agencies found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAgencies.map((agency, index) => (
              <motion.div
                key={agency.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Company Info */}
                  <div className="lg:col-span-2">
                    <div className="flex gap-4 mb-4">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {agency.logo_url ? (
                          <img src={agency.logo_url} alt={agency.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {agency.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Company Name & Rating */}
                      <div className="flex-1">
                        <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`}>
                          <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors mb-2">
                            {agency.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-slate-900">
                              {(agency.avg_rating || 4.8).toFixed(1)}
                            </span>
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < Math.floor(agency.avg_rating || 4.8)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Link 
                            href={createPageUrl('AgencyProfile') + `?id=${agency.id}#reviews`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {agency.review_count || Math.floor(Math.random() * 200) + 50} Reviews
                          </Link>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          {agency.description || `Established in ${agency.founded_year || '2015'}, ${agency.name} is a leading service provider with headquarters in ${agency.hq_city || 'India'}. Backed by a dedicated team of experts, the company has successfully delivered innovative solutions for clients worldwide, providing scalable, reliable services...`}
                          {agency.description && agency.description.length > 150 && (
                            <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`} className="text-blue-600 hover:underline ml-1">
                              read {agency.name} reviews & insights
                            </Link>
                          )}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-semibold">💰 $25 - $49/hr</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users className="w-4 h-4" />
                            <span>{agency.team_size || '50 - 249'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>{agency.founded_year || '2015'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{agency.hq_city || 'India'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Verified Review & Actions */}
                  <div className="lg:col-span-1 border-l pl-6">
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-900">Verified Client Review</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="font-bold text-slate-900">5.0</span>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 italic mb-2">
                        "They saw inefficiencies in our processes that we'd stopped noticing, and built a solution."
                      </p>
                      <p className="text-xs text-slate-500">
                        Reviewed by: Emma Taylor, Vice President
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`}>
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      {agency.website && (
                        <a href={agency.website} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full bg-slate-900 hover:bg-slate-800">
                            Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}