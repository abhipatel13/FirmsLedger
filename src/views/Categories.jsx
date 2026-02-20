'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { 
  Stethoscope, Laptop, Briefcase, FileText, 
  UserCheck, Globe, Megaphone, Monitor,
  TrendingUp, Target, Palette, Users, Share2,
  Calculator, Award, Receipt, Shield, Scale,
  Building2, FileCheck, FileSignature, ShieldCheck,
  DollarSign, Users2, Truck, Ship,
  Package, Warehouse, Factory, Cog, Settings,
  Bot, Box, Lightbulb, Map, BarChart3,
  MessageSquare, Workflow, Leaf, Wind, Sprout, TreePine
} from 'lucide-react';

const iconMap = {
  healthcare: Stethoscope,
  tech: Laptop,
  executive: Briefcase,
  contract: FileText,
  permanent: UserCheck,
  offshore: Globe,
  general: Building,
  Megaphone, Monitor, TrendingUp, Target, Palette, Users, Share2,
  Calculator, Award, Receipt, Shield, Scale,
  Building2, FileCheck, FileSignature, ShieldCheck,
  DollarSign, Search, Users2, Truck, Ship,
  Package, Warehouse, Factory, Cog, Settings,
  Bot, Box, Lightbulb, Map, BarChart3,
  MessageSquare, Workflow, Leaf, Wind, Sprout, TreePine
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  // Filter categories by search term
  const filteredCategories = categories
    .filter(cat => (cat.is_parent ?? cat.isParent) || !(cat.parent_id ?? cat.parentId))
    .filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Categories</h1>
          <p className="text-xl text-emerald-100 max-w-3xl">
            Discover service providers across all business categories in India
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-white shadow-lg text-lg"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No categories found matching "{searchTerm}"</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const staffingId = categories.find((c) => c.slug === 'staffing-companies')?.id;
                return filteredCategories.map((category) => {
                const Icon = iconMap[category.icon] || Building;
                const underStaffing = (category.parent_id ?? category.parentId) === staffingId;
                return (
                  <Link 
                    key={category.id}
                    href={category.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(category.slug, { underStaffing })}
                  >
                    <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full border-emerald-100">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              });
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}