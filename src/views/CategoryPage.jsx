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
      ac => (ac.agency_id ?? ac.agencyId) === agency.id && (ac.category_id ?? ac.categoryId) === category.id
    );
  }) : [];

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-slate-500">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href={createPageUrl('Home')} className="hover:text-orange-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-semibold">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white">{category.name}</h1>
          {category.description && (
            <p className="text-slate-300 max-w-2xl text-base leading-relaxed">{category.description}</p>
          )}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-5">
          <p className="text-slate-500 text-sm">
            <span className="font-semibold text-slate-900">{categoryAgencies.length}</span> agencies in this category
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500"></div>
            <p className="mt-3 text-slate-500 text-sm">Loading agencies...</p>
          </div>
        ) : categoryAgencies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No agencies found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {categoryAgencies.map(agency => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
