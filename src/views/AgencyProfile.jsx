'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import RatingDisplay from '@/components/RatingDisplay';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  MapPin, Users, Calendar, Globe, CheckCircle, Crown, Star,
  MessageSquare, ArrowRight, Phone, ChevronDown, ChevronUp, User,
  DollarSign,
} from 'lucide-react';

// ─── Colour palette for donut chart ──────────────────────────────────────────
const DONUT_COLORS = ['#B08D57', '#8B6E42', '#D4A96A', '#6B5230', '#E8C88A', '#4A3820', '#C9A96A'];

// ─── Social media icons (inline SVGs — no extra dep) ─────────────────────────
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

// ─── Star row ─────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'text-[#B08D57] fill-[#B08D57]' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

// ─── Donut chart label ────────────────────────────────────────────────────────
function DonutLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-slate-700 font-bold text-base">
      <tspan x={cx} dy="-6" fontSize="22" fontWeight="700" fill="#0D1B2A">{total}%</tspan>
      <tspan x={cx} dy="20" fontSize="11" fill="#64748B">total</tspan>
    </text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AgencyProfile({ companySlug }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryId = searchParams?.get('id') ?? null;
  const identifier = companySlug || queryId;

  const [expandedReview, setExpandedReview] = useState(null);
  const [activeService, setActiveService] = useState(0);

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

  // Canonical redirect
  React.useEffect(() => {
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
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500 mb-3" />
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

  // ── Derived data ────────────────────────────────────────────────────────────
  const serviceFocus   = Array.isArray(agency.service_focus)  ? agency.service_focus  : [];
  const industryFocus  = Array.isArray(agency.industry_focus) ? agency.industry_focus : [];
  const clientFocus    = agency.client_focus && typeof agency.client_focus === 'object' ? agency.client_focus : {};

  // Group service_focus by top-level service name for the left tab list
  const serviceCategories = [...new Set(serviceFocus.map(s => s.category || s.service))];
  const activeCategory = serviceCategories[activeService] ?? null;
  const donutData = activeCategory
    ? serviceFocus.filter(s => (s.category || s.service) === activeCategory)
    : serviceFocus;

  const avgQuality       = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating_quality       || 0), 0) / reviews.length : 0;
  const avgCommunication = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating_communication || 0), 0) / reviews.length : 0;
  const avgTimeliness    = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating_timeliness    || 0), 0) / reviews.length : 0;
  const avgOverall       = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating_overall       || 0), 0) / reviews.length : 0;

  const recentReviews = reviews.slice(0, 3);
  const totalDonut = donutData.reduce((s, d) => s + (d.percentage || 0), 0);

  const socialLinks = [
    { url: agency.linkedin_url, Icon: LinkedInIcon, color: 'text-[#0A66C2]' },
    { url: agency.facebook_url, Icon: FacebookIcon, color: 'text-[#1877F2]' },
    { url: agency.twitter_url,  Icon: XIcon,        color: 'text-slate-800' },
    { url: agency.instagram_url,Icon: InstagramIcon, color: 'text-[#E1306C]' },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt={agency.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border border-slate-200 bg-white flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[#0D1B2A] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                {agency.name.charAt(0)}
              </div>
            )}

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
                    {agency.hq_city}{agency.hq_country ? `, ${agency.hq_country}` : ''}
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
                  <a href={agency.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Link href={createPageUrl('RequestProposal') + `?agency=${agency.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 h-11 rounded-md transition-colors">
                    Request Proposal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:border-slate-300 font-semibold px-6 h-11 rounded-md transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" /> Write Review
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-[1fr_220px_160px] divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Description + social */}
            <div className="p-6">
              {agency.tagline && (
                <p className="text-[#B08D57] text-sm font-medium mb-2">{agency.tagline}</p>
              )}
              <ExpandableText text={agency.description} />
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map(({ url, Icon, color }, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className={`${color} hover:opacity-70 transition-opacity`}>
                      <Icon />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="p-6 space-y-2">
              {agency.hq_country && (
                <div className="flex items-center gap-2 font-semibold text-[#0D1B2A] text-sm">
                  <span className="text-lg">{countryFlag(agency.hq_country)}</span>
                  {agency.hq_country}
                </div>
              )}
              {agency.address && (
                <p className="text-slate-600 text-sm leading-relaxed">{agency.address}</p>
              )}
              {!agency.address && agency.hq_city && (
                <p className="text-slate-600 text-sm">{agency.hq_city}{agency.hq_state ? `, ${agency.hq_state}` : ''}</p>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 text-slate-600 text-sm hover:text-orange-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {agency.phone}
                </a>
              )}
            </div>

            {/* Key metrics */}
            <div className="p-6 space-y-4">
              {agency.hourly_rate && (
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                  <DollarSign className="w-4 h-4 text-[#B08D57]" />
                  {agency.hourly_rate}
                </div>
              )}
              {agency.team_size && (
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                  <Users className="w-4 h-4 text-[#B08D57]" />
                  {agency.team_size}
                </div>
              )}
              {agency.founded_year && (
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                  <Calendar className="w-4 h-4 text-[#B08D57]" />
                  {agency.founded_year}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Service Focus ─────────────────────────────────────────────────── */}
        {serviceFocus.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-5">Service Focus</h2>
            <div className="grid md:grid-cols-[200px_1fr_1fr] gap-6 items-center">
              {/* Category tabs */}
              <div className="space-y-2">
                {serviceCategories.length > 0 ? serviceCategories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => setActiveService(i)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded border text-sm font-medium text-left transition-colors ${
                      activeService === i
                        ? 'bg-[#FDF6EC] border-[#B08D57] text-[#7A5C2E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat} <span className="text-slate-400">›</span>
                  </button>
                )) : (
                  <div className="px-4 py-3 rounded border border-[#B08D57] bg-[#FDF6EC] text-sm font-medium text-[#7A5C2E]">
                    Services
                  </div>
                )}
              </div>

              {/* Donut chart */}
              <div className="flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="percentage"
                      nameKey="service"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                      label={false}
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${v}%`, n]}
                      contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div>
                {activeCategory && (
                  <p className="font-semibold text-[#0D1B2A] text-sm mb-3">
                    Focus of {activeCategory}
                  </p>
                )}
                <div className="space-y-2">
                  {donutData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-slate-700">{item.service || item.name}</span>
                      <span className="text-slate-500 ml-auto">- {item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Industry Focus ────────────────────────────────────────────────── */}
        {industryFocus.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">Industry Focus</h2>
            <div className="flex flex-wrap gap-2">
              {industryFocus.map((item, i) => (
                <span key={i} className="inline-flex items-center border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700">
                  {item.industry || item.name} - {item.percentage}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Client Focus ──────────────────────────────────────────────────── */}
        {(clientFocus.small_business || clientFocus.medium_business || clientFocus.large_business) && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-5">Client Focus</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Small Business',  key: 'small_business' },
                { label: 'Large Business',  key: 'large_business' },
                { label: 'Medium Business', key: 'medium_business' },
              ].filter(({ key }) => clientFocus[key]).map(({ label, key }) => (
                <div key={key}>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-[#B08D57] h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(clientFocus[key], 100)}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#0D1B2A]">
                    {clientFocus[key]}% {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Review Analytics ──────────────────────────────────────────────── */}
        {reviews.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-5">
              Review Analytics of {agency.name}
            </h2>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Reviews',   value: reviews.length },
                { label: 'Overall Rating',  value: `${avgOverall.toFixed(1)}/5` },
                { label: 'Recent Reviews',  value: Math.min(reviews.length, 80) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#FDF6EC] border-b-2 border-[#B08D57] rounded-lg p-5">
                  <p className="text-2xl font-extrabold text-[#0D1B2A]">{value}</p>
                  <p className="text-sm font-semibold text-[#0D1B2A] mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* User quotes */}
            {recentReviews.some(r => r.body) && (
              <>
                <p className="text-sm font-semibold text-[#0D1B2A] mb-3">What Users Say</p>
                <div className="space-y-4">
                  {recentReviews.filter(r => r.body).map((r) => (
                    <div key={r.id}>
                      <p className="text-slate-700 text-sm">"{r.body.slice(0, 120)}{r.body.length > 120 ? '…' : ''}"</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{r.company_name || 'Anonymous'}</span>
                        {r.verified && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Detailed Reviews ──────────────────────────────────────────────── */}
        <div id="reviews">
          {reviews.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-[#0D1B2A]">{avgOverall.toFixed(1)}</span>
                <Stars rating={avgOverall} />
                <span className="text-slate-500 text-sm">{reviews.length} Reviews</span>
              </div>
              <Link href={createPageUrl('WriteReview') + `?agency=${agency.id}`}>
                <Button className="bg-[#0D1B2A] hover:bg-[#1a2e47] text-white font-semibold px-5 h-9 rounded-md text-sm">
                  Write a Review
                </Button>
              </Link>
            </div>
          )}

          <h2 className="text-xl font-extrabold text-[#0D1B2A] mb-4">
            Detailed Reviews of {agency.name}
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
                <DetailedReviewCard
                  key={review.id}
                  review={review}
                  expanded={expandedReview === review.id}
                  onToggle={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Expandable description ───────────────────────────────────────────────────
function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const short = text.length > 300;
  const displayed = short && !expanded ? text.slice(0, 300) + '…' : text;
  return (
    <div>
      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{displayed}</p>
      {short && (
        <button onClick={() => setExpanded(!expanded)} className="text-[#B08D57] text-sm font-medium mt-2 hover:underline">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// ─── Detailed review card (matching the images) ───────────────────────────────
function DetailedReviewCard({ review, expanded, onToggle }) {
  const ago = timeAgo(review.created_date);
  const ratings = [
    { label: 'Quality',            value: review.rating_quality       || 0 },
    { label: 'Schedule & Timing',  value: review.rating_timeliness    || 0 },
    { label: 'Communication',      value: review.rating_communication || 0 },
    { label: 'Overall Rating',     value: review.rating_overall       || 0 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Top: reviewer */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-[#0D1B2A] text-sm">{review.company_name || 'Anonymous'}</p>
            <p className="text-xs text-slate-500">Posted {ago}</p>
          </div>
        </div>
      </div>

      {/* Quote */}
      {review.title && (
        <p className="px-5 pb-3 font-semibold text-[#0D1B2A] text-base leading-snug">"{review.title}"</p>
      )}

      {/* Body + rating breakdown */}
      <div className="border-t border-slate-100 grid md:grid-cols-[1fr_220px] divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            {expanded ? review.body : (review.body?.slice(0, 200) + (review.body?.length > 200 ? '…' : ''))}
          </p>
          {review.body?.length > 200 && (
            <button
              onClick={onToggle}
              className="mt-3 flex items-center gap-1 border border-slate-200 rounded px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {expanded ? 'Show Less' : 'Show Full Review'}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating Breakdown</p>
          {ratings.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">{label}</span>
              <Stars rating={value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

function countryFlag(country) {
  const flags = {
    'United States': '🇺🇸', 'Australia': '🇦🇺', 'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦', 'India': '🇮🇳', 'Germany': '🇩🇪', 'France': '🇫🇷',
    'Netherlands': '🇳🇱', 'Singapore': '🇸🇬', 'UAE': '🇦🇪',
  };
  return flags[country] || '🌐';
}
