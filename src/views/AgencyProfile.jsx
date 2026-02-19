'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RatingDisplay from '@/components/RatingDisplay';
import ReviewCard from '@/components/ReviewCard';
import { 
  MapPin, Users, Calendar, Globe, DollarSign, 
  CheckCircle, Crown, Star, MessageSquare 
} from 'lucide-react';

export default function AgencyProfile({ searchParams }) {
  const params = searchParams && typeof searchParams === 'object' ? searchParams : {};
  const agencyId = params.id ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null);

  const { data: agency, isLoading } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: async () => {
      const agencies = await api.entities.Agency.filter({ id: agencyId });
      return agencies[0];
    },
    enabled: !!agencyId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['agency-reviews', agencyId],
    queryFn: () => api.entities.Review.filter({ agency_id: agencyId, approved: true }, '-created_date', 50),
    enabled: !!agencyId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['agency-categories', agencyId],
    queryFn: async () => {
      const agencyCats = await api.entities.AgencyCategory.filter({ agency_id: agencyId });
      const catIds = agencyCats.map(ac => ac.category_id);
      const allCats = await api.entities.Category.list();
      return allCats.filter(c => catIds.includes(c.id));
    },
    enabled: !!agencyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading agency profile...</p>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Agency not found</p>
          <Link href={createPageUrl('Directory')}>
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate rating breakdowns
  const avgQuality = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating_quality, 0) / reviews.length 
    : 0;
  const avgCommunication = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating_communication, 0) / reviews.length 
    : 0;
  const avgValue = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating_value, 0) / reviews.length 
    : 0;
  const avgTimeliness = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating_timeliness, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            {agency.logo_url ? (
              <img 
                src={agency.logo_url} 
                alt={agency.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                {agency.name.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
                {agency.verified && (
                  <Badge className="bg-blue-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {agency.featured && (
                  <Badge className="bg-yellow-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {agency.avg_rating > 0 && (
                <RatingDisplay rating={agency.avg_rating} size="lg" count={agency.review_count} />
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                {agency.hq_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {agency.hq_city}, {agency.hq_country}
                  </div>
                )}
                {agency.team_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {agency.team_size} employees
                  </div>
                )}
                {agency.founded_year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Founded {agency.founded_year}
                  </div>
                )}
                {agency.website && (
                  <a 
                    href={agency.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Link href={createPageUrl('RequestProposal') + `?agency=${agency.id}`}>
                  <Button size="lg">
                    Request Proposal
                  </Button>
                </Link>
                <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`}>
                  <Button size="lg" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <p className="text-gray-600 whitespace-pre-line">{agency.description}</p>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Rating Breakdown</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Quality</p>
                      <RatingDisplay rating={avgQuality} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Communication</p>
                      <RatingDisplay rating={avgCommunication} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Value</p>
                      <RatingDisplay rating={avgValue} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Timeliness</p>
                      <RatingDisplay rating={avgTimeliness} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No reviews yet</p>
                    <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`}>
                      <Button>Be the first to review</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat.id} variant="secondary">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Agency Details</h3>
                <div className="space-y-3 text-sm">
                  {agency.pricing_model && (
                    <div>
                      <p className="text-gray-500">Pricing Model</p>
                      <p className="font-medium">{agency.pricing_model}</p>
                    </div>
                  )}
                  {agency.min_project_size && (
                    <div>
                      <p className="text-gray-500">Min. Project Size</p>
                      <p className="font-medium">{agency.min_project_size}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Remote/Offshore Support</p>
                    <p className="font-medium">{agency.remote_support ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industries */}
            {agency.industries_served?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Industries Served</h3>
                  <div className="flex flex-wrap gap-2">
                    {agency.industries_served.map((industry, idx) => (
                      <Badge key={idx} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}