'use client';

import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AgencyCard from '@/components/AgencyCard';
import CategoryGrid from '@/components/CategoryGrid';
import { MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8" />
            <h1 className="text-4xl font-bold">{country}</h1>
          </div>
          <p className="text-xl text-blue-100">
            Discover top-rated recruitment and staffing agencies in {country}
          </p>
          <div className="mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {agencies.length} Verified Agencies
            </Badge>
          </div>
        </div>
      </div>

      {/* Popular Cities */}
      {popularCities.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-xl font-semibold mb-4">Popular Cities</h2>
            <div className="flex flex-wrap gap-3">
              {popularCities.map((city) => (
                <Link 
                  key={city}
                  to={createPageUrl('Directory') + `?country=${country}&city=${city}`}
                >
                  <Button variant="outline" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {city}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <CategoryGrid categories={categories} />
      </div>

      {/* Agencies List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Top Agencies in {country}</h2>
          <Link href={createPageUrl('Directory') + `?country=${country}`}>
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading agencies...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No agencies found in this country</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAgencies.slice(0, 10).map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}