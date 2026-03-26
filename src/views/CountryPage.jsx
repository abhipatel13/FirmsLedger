'use client';

import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import AgencyCard from '@/components/AgencyCard';
import CategoryGrid from '@/components/CategoryGrid';
import { MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getDirectoryUrl } from '@/utils';

export default function CountryPage({ searchParams }) {
  const params = searchParams && typeof searchParams === 'object' ? searchParams : {};
  const country = (params.country ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('country') : null)) || 'United States';
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const { data: agencies = [], isLoading } = useQuery({
    queryKey: ['agencies', country],
    queryFn: () => api.entities.Agency.filter({ hq_country: country, approved: true }, '-avg_rating', 50),
  });

  const { data: agencyCategories = [] } = useQuery({
    queryKey: ['agency-categories'],
    queryFn: () => api.entities.AgencyCategory.list(),
  });

  // Get popular cities
  const popularCities = [...new Set(agencies.map(a => a.hq_city).filter(Boolean))].slice(0, 6);

  // Filter by category if selected
  const filteredAgencies = selectedCategory
    ? agencies.filter(agency =>
        agencyCategories.some(ac => (ac.agency_id ?? ac.agencyId) === agency.id && (ac.category_id ?? ac.categoryId) === selectedCategory)
      )
    : agencies;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{country}</h1>
          </div>
          <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
            Discover top-rated recruitment and staffing agencies in {country}
          </p>
          <div className="mt-5">
            <span className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 text-orange-400 text-sm font-semibold px-3 py-1.5 rounded-full">
              {agencies.length} Verified Agencies
            </span>
          </div>
        </div>
      </div>

      {/* Popular Cities */}
      {popularCities.length > 0 && (
        <div className="bg-white border-b border-slate-200">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-7">
            <h2 className="text-base font-bold text-[#0D1B2A] mb-4">Popular Cities</h2>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((city) => (
                <Link
                  key={city}
                  href={getDirectoryUrl() + `?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`}
                >
                  <Button variant="outline" className="flex items-center gap-1.5 border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600 text-sm h-9">
                    <Building2 className="w-3.5 h-3.5" />
                    {city}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-extrabold text-[#0D1B2A] mb-6">Browse by Category</h2>
        <CategoryGrid categories={categories} />
      </div>

      {/* Agencies List */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-extrabold text-[#0D1B2A]">Top Agencies in {country}</h2>
          <Link href={getDirectoryUrl() + `?country=${encodeURIComponent(country)}`}>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600 text-sm h-9">
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500"></div>
            <p className="mt-3 text-slate-500 text-sm">Loading agencies...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No agencies found in this country</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgencies.slice(0, 10).map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
