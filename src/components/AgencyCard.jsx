import React from 'react';
import Link from 'next/link';
import { getCompanyProfileUrl } from '@/utils';
import { MapPin, Users, CheckCircle, Crown } from 'lucide-react';

export default function AgencyCard({ agency }) {
  return (
    <Link href={getCompanyProfileUrl(agency)}>
      <div className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {agency.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="w-14 h-14 rounded-md object-contain border border-slate-100 bg-white flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-md bg-[#0D1B2A] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {agency.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 break-words">
                {agency.name}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
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
            </div>

            <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {agency.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
              {(agency.hq_city || agency.hq_country) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate">
                    {[agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {agency.team_size && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{agency.team_size} employees</span>
                </div>
              )}
            </div>

            {agency.remote_support && (
              <span className="inline-block mt-3 border border-slate-200 text-slate-500 text-xs font-medium px-2 py-0.5 rounded">
                Remote/Offshore Support
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
