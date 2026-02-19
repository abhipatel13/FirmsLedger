'use client';

import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import AgencyCard from '@/components/AgencyCard';
import { ChevronRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

export default function CategoryPage({ searchParams }) {
  const params = searchParams && typeof searchParams === 'object' ? searchParams : {};
  const categorySlug = params.slug ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('slug') : null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const category = categories.find(c => c.slug === categorySlug);

  const { data: allAgencies = [], isLoading } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => api.entities.Agency.filter({ approved: true }, '-avg_rating', 100),
  });

  const { data: agencyCategories = [] } = useQuery({
    queryKey: ['agency-categories'],
    queryFn: () => api.entities.AgencyCategory.list(),
  });

  const categoryAgencies = category ? allAgencies.filter(agency => {
    return agencyCategories.some(
      ac => ac.agency_id === agency.id && ac.category_id === category.id
    );
  }) : [];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={createPageUrl('Home')} className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-xl text-blue-100 max-w-3xl">{category.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{categoryAgencies.length}</span> agencies in this category
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading agencies...</p>
          </div>
        ) : categoryAgencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No agencies found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {categoryAgencies.map(agency => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}