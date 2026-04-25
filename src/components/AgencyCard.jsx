import React from 'react';
import Link from 'next/link';
import { getCompanyProfileUrl, getAgencyLogoUrl } from '@/utils';
import { MapPin, Users, Calendar, DollarSign, Star, ArrowUpRight, CheckCircle, Crown } from 'lucide-react';

function StarRow({ rating = 0 }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < full ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

export default function AgencyCard({ agency }) {
  const profileUrl = getCompanyProfileUrl(agency);
  const location = [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ');
  const rating = Number(agency.avg_rating || 0);
  const reviewCount = Number(agency.review_count || 0);
  const topReview = agency.top_review; // optional — { quote, author, role, company }

  const detailRows = [
    agency.hourly_rate && { Icon: DollarSign, text: agency.hourly_rate },
    agency.team_size   && { Icon: Users,      text: agency.team_size },
    agency.founded_year && { Icon: Calendar,  text: String(agency.founded_year) },
    location           && { Icon: MapPin,     text: location },
  ].filter(Boolean);

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-5 sm:p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-6 lg:gap-8">

        {/* LEFT — logo, name, rating, description */}
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <img
              src={getAgencyLogoUrl(agency)}
              alt={agency.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.name || '?')}&background=1A2E4A&color=fff&size=128&bold=true`;
              }}
              className="w-16 h-16 rounded-lg object-contain border border-slate-100 bg-white flex-shrink-0"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={profileUrl} className="font-bold text-lg text-slate-900 hover:text-orange-600 transition-colors break-words">
                  {agency.name}
                </Link>
                {agency.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {agency.featured && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-orange-200">
                    <Crown className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>
              {(rating > 0 || reviewCount > 0) && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-semibold text-slate-900 text-sm">{rating.toFixed(1)}</span>
                  <StarRow rating={rating} />
                  {reviewCount > 0 && (
                    <span className="text-slate-300">|</span>
                  )}
                  {reviewCount > 0 && (
                    <Link href={profileUrl} className="text-sm text-blue-600 hover:underline">
                      {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {agency.description && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-4">
              {agency.description}{' '}
              <Link href={profileUrl} className="text-blue-600 hover:underline whitespace-nowrap">
                read {agency.name} reviews &amp; insights
              </Link>
            </p>
          )}
        </div>

        {/* MIDDLE — quick facts */}
        {detailRows.length > 0 && (
          <div className="lg:border-l lg:border-slate-200 lg:pl-8 flex flex-col justify-center gap-3 min-w-[180px]">
            {detailRows.map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-700">
                <Icon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* RIGHT — CTA + optional testimonial */}
        <div className="flex flex-col items-stretch gap-3 lg:min-w-[240px]">
          {agency.website ? (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              Visit Website <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <Link
              href={profileUrl}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              View Profile <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}

          {topReview && (
            <blockquote className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold">&ldquo;{topReview.quote}&rdquo;</span>
              {(topReview.author || topReview.company) && (
                <span className="block mt-1.5 text-slate-500">
                  — {[topReview.author, topReview.role, topReview.company].filter(Boolean).join(', ')}
                </span>
              )}
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}
