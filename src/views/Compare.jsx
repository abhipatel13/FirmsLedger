'use client';

import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users, CheckCircle, X, Check, Building2 } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

export default function Compare({ searchParams }) {
  const params = searchParams && typeof searchParams === 'object' ? searchParams : {};
  const idsParam = params.ids ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ids') : null);
  const ids = (typeof idsParam === 'string' ? idsParam.split(',') : []) || [];

  const { data: agencies = [], isLoading } = useQuery({
    queryKey: ['compare-agencies', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const allAgencies = await base44.entities.Agency.list();
      return allAgencies.filter(a => ids.includes(a.id));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading comparison...</p>
      </div>
    );
  }

  if (agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Compare Agencies</h1>
          <p className="text-gray-600 mb-8">Select agencies from the directory to compare side-by-side</p>
          <Link href={createPageUrl('Directory')}>
            <Button>Browse Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const comparisonRows = [
    {
      label: 'Overall Rating',
      getValue: (a) => a.avg_rating ? (
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-lg">{a.avg_rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({a.review_count} reviews)</span>
        </div>
      ) : <span className="text-gray-400">No rating</span>
    },
    {
      label: 'Verified',
      getValue: (a) => a.verified ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Verified</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <X className="w-5 h-5" />
          <span>Not verified</span>
        </div>
      )
    },
    {
      label: 'Location',
      getValue: (a) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{a.hq_city}, {a.hq_state}</span>
        </div>
      )
    },
    {
      label: 'Team Size',
      getValue: (a) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{a.team_size || 'Not specified'}</span>
        </div>
      )
    },
    {
      label: 'Founded',
      getValue: (a) => a.founded_year || 'N/A'
    },
    {
      label: 'Pricing Model',
      getValue: (a) => a.pricing_model || 'Not specified'
    },
    {
      label: 'Min Project Size',
      getValue: (a) => a.min_project_size || 'Not specified'
    },
    {
      label: 'Remote/Offshore',
      getValue: (a) => a.remote_support ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-400" />
      )
    },
    {
      label: 'Services',
      getValue: (a) => (
        <div className="flex flex-wrap gap-1">
          {(a.services_offered || []).map((service, i) => (
            <Badge key={i} variant="outline" className="text-xs">{service}</Badge>
          ))}
        </div>
      )
    },
    {
      label: 'Industries',
      getValue: (a) => (
        <div className="flex flex-wrap gap-1">
          {(a.industries_served || []).map((industry, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{industry}</Badge>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Compare Agencies</h1>
          <p className="text-gray-600">Side-by-side comparison of staffing agencies</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-6 font-semibold text-gray-700 w-48">Feature</th>
                  {agencies.map(agency => (
                    <th key={agency.id} className="p-6 border-l">
                      <div className="text-center">
                        {agency.logo_url ? (
                          <img 
                            src={agency.logo_url} 
                            alt={agency.name}
                            className="w-16 h-16 rounded-lg object-cover mx-auto mb-3"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                            {agency.name.charAt(0)}
                          </div>
                        )}
                        <h3 className="font-semibold text-lg mb-2">{agency.name}</h3>
                        <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`}>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-6 font-medium text-gray-700">{row.label}</td>
                    {agencies.map(agency => (
                      <td key={agency.id} className="p-6 border-l text-center">
                        {row.getValue(agency)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href={createPageUrl('Directory')}>
            <Button variant="outline">Back to Directory</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}