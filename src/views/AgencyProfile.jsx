'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import RatingDisplay from '@/components/RatingDisplay';
import ReviewCard from '@/components/ReviewCard';
import {
  MapPin, Users, Calendar, Globe,
  CheckCircle, Crown, Star, MessageSquare, ArrowRight
} from 'lucide-react';

export default function AgencyProfile({ companySlug }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryId = searchParams?.get('id') ?? null;
  const identifier = companySlug || queryId;

  const { data: agency, isLoading } = useQuery({
    queryKey: ['agency', identifier],
    queryFn: async () => {
      if (companySlug) {
        const bySlug = await api.entities.Agency.filter({ slug: companySlug });
        return bySlug[0];
      }
      const byId = await api.entities.Agency.filter({ id: queryId });
      return byId[0];
    },
    enabled: !!identifier,
  });

  const agencyId = agency?.id ?? null;

  const { data: reviews = [] } = useQuery({
    queryKey: ['agency-reviews', agencyId],
    queryFn: () => api.entities.Review.filter({ agency_id: agencyId, approved: true }, '-created_date', 50),
    enabled: !!agencyId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['agency-categories', agencyId],
    queryFn: async () => {
      const agencyCats = await api.entities.AgencyCategory.filter({ agency_id: agencyId });
      const catIds = agencyCats.map(ac => ac.category_id ?? ac.categoryId);
      const allCats = await api.entities.Category.list();
      return allCats.filter(c => catIds.includes(c.id));
    },
    enabled: !!agencyId,
  });

  // Canonical redirect: /AgencyProfile?id=xxx → /companies/slug when agency has slug
  useEffect(() => {
    if (!agency?.slug || !pathname?.startsWith('/AgencyProfile')) return;
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    if (search === `?id=${agency.id}` || (searchParams?.get('id') === agency.id && !searchParams.get('slug'))) {
      router.replace(`/companies/${encodeURIComponent(agency.slug)}`);
    }
  }, [agency?.id, agency?.slug, pathname, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500 mb-3"></div>
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Agency not found</p>
          <Link href={getDirectoryUrl()}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 h-10 rounded-md">
              Back to Directory
            </Button>
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
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6">
            {/* Logo */}
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border border-slate-200 bg-white flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[#0D1B2A] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                {agency.name.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] break-words tracking-tight">{agency.name}</h1>
                {agency.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded border border-green-200 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                {agency.featured && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-1 rounded border border-orange-200 mt-0.5">
                    <Crown className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              {agency.avg_rating > 0 && (
                <RatingDisplay rating={agency.avg_rating} size="lg" count={agency.review_count} />
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                {agency.hq_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {agency.hq_city}, {agency.hq_country}
                  </div>
                )}
                {agency.team_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    {agency.team_size} employees
                  </div>
                )}
                {agency.founded_year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Founded {agency.founded_year}
                  </div>
                )}
                {agency.website && (
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Link href={createPageUrl('RequestProposal') + `?agency=${agency.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 h-11 rounded-md transition-colors touch-manipulation">
                    Request Proposal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:border-slate-300 font-semibold px-6 h-11 rounded-md transition-colors touch-manipulation">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">
            {/* Overview */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#0D1B2A] mb-3">Overview</h2>
              <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">{agency.description}</p>
            </div>

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
                <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">Rating Breakdown</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Quality', value: avgQuality },
                    { label: 'Communication', value: avgCommunication },
                    { label: 'Value', value: avgValue },
                    { label: 'Timeliness', value: avgTimeliness },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-slate-500 mb-1.5">{label}</p>
                      <RatingDisplay rating={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div id="reviews">
              <h2 className="text-xl font-extrabold text-[#0D1B2A] mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                  <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4 text-sm">No reviews yet</p>
                  <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 h-9 rounded-md text-sm">
                      Be the first to review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="font-bold text-[#0D1B2A] mb-3 text-sm">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat.id} className="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded border border-orange-200">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-bold text-[#0D1B2A] mb-4 text-sm">Agency Details</h3>
              <div className="space-y-3 text-sm">
                {agency.pricing_model && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Pricing Model</p>
                    <p className="font-semibold text-slate-800">{agency.pricing_model}</p>
                  </div>
                )}
                {agency.min_project_size && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Min. Project Size</p>
                    <p className="font-semibold text-slate-800">{agency.min_project_size}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Remote/Offshore Support</p>
                  <p className="font-semibold text-slate-800">{agency.remote_support ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Industries */}
            {agency.industries_served?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="font-bold text-[#0D1B2A] mb-3 text-sm">Industries Served</h3>
                <div className="flex flex-wrap gap-2">
                  {agency.industries_served.map((industry, idx) => (
                    <span key={idx} className="inline-block border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
