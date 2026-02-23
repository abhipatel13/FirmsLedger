import React from 'react';
import Link from 'next/link';
import { getCompanyProfileUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, CheckCircle, Crown } from 'lucide-react';

export default function AgencyCard({ agency }) {
  // Generate unique gradient colors based on agency name
  const getGradientColors = (name) => {
    const gradients = [
      'from-emerald-500 to-teal-600',
      'from-teal-500 to-cyan-600',
      'from-emerald-600 to-green-700',
      'from-cyan-500 to-blue-600',
      'from-green-500 to-emerald-600',
      'from-teal-600 to-emerald-700',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <Link href={getCompanyProfileUrl(agency)}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {agency.logo_url ? (
              <img 
                src={agency.logo_url} 
                alt={agency.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getGradientColors(agency.name)} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                {agency.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1 break-words">
                  {agency.name}
                </h3>
                <div className="flex gap-1">
                  {agency.verified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {agency.featured && (
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {agency.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                {agency.hq_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{agency.hq_city}, {agency.hq_country}</span>
                  </div>
                )}
                
                {agency.team_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{agency.team_size} employees</span>
                  </div>
                )}
              </div>
              
              {agency.remote_support && (
                <Badge variant="outline" className="mt-3">
                  Remote/Offshore Support
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}