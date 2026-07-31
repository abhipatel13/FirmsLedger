import React from 'react';
import Link from 'next/link';
import { getCompanyProfileUrl } from '@/utils';
import { MapPin, Users, Calendar, DollarSign, ArrowUpRight, Crown } from 'lucide-react';
import { pickAgencyIcon, colorFor } from '@/lib/categoryIcon';

export default function AgencyCard({ agency, rank }) {
  const profileUrl = getCompanyProfileUrl(agency);
  const location = [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ');
  const Icon = pickAgencyIcon(agency);
  const { bg: bgClass, border: borderClass, text: textClass } = colorFor(agency.slug || agency.name || '');
  const hasLogo = !!agency.logo_url;

  const detailRows = [
    agency.hourly_rate && { Icon: DollarSign, text: agency.hourly_rate },
    agency.team_size   && { Icon: Users,      text: agency.team_size },
    agency.founded_year && { Icon: Calendar,  text: String(agency.founded_year) },
    location           && { Icon: MapPin,     text: location },
  ].filter(Boolean);

  const isTopThree = rank && rank <= 3;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-5 lg:gap-6">

        {/* LEFT — rank, logo, name, rating, description */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {rank ? (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black font-mono ${
                  rank === 1
                    ? 'bg-orange-500 text-white'
                    : isTopThree
                    ? 'bg-[#1A2E4A] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
                aria-label={`Ranked #${rank}`}
              >
                {rank}
              </div>
            ) : null}

            {hasLogo ? (
              <img
                src={agency.logo_url}
                alt=""
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-14 h-14 rounded-lg object-contain border border-slate-100 bg-white flex-shrink-0"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-lg border flex items-center justify-center flex-shrink-0 ${bgClass} ${borderClass} ${textClass}`}
                aria-hidden="true"
              >
                <Icon className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={profileUrl} className="font-bold text-base sm:text-lg text-slate-900 hover:text-orange-600 transition-colors break-words">
                  {agency.name}
                </Link>
                {agency.featured && (
                  <span className="inline-flex items-center gap-1 text-orange-600 text-[10px] font-semibold uppercase tracking-wide">
                    <Crown className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {agency.description && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
              {agency.description}
            </p>
          )}
        </div>

        {/* MIDDLE — quick facts */}
        {detailRows.length > 0 && (
          <div className="lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center gap-2 min-w-[160px]">
            {detailRows.map(({ Icon: RowIcon, text }, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-600">
                <RowIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* RIGHT — CTA + optional testimonial */}
        <div className="flex flex-col items-stretch gap-2 lg:min-w-[180px]">
          {agency.website ? (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Visit Website <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <Link
              href={profileUrl}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              View Profile <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
