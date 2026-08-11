import Link from 'next/link';
import { CheckCircle, MapPin, Star, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEmployeeLabel } from '@/lib/employeeCount';
import VisitWebsiteButton from './VisitWebsiteButton';
import { getCompanyDescription } from '@/utils';

function StarRow({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          fill={n <= Math.round(rating) ? '#F5A623' : '#e2e8f0'}
          color={n <= Math.round(rating) ? '#F5A623' : '#e2e8f0'}
        />
      ))}
    </span>
  );
}

export default function CompanyCard({ company, rank }) {
  const employeeLabel = formatEmployeeLabel(company.employee_count);
  const rankBg =
    rank === 0 ? 'bg-[#1A2E4A] text-white' : rank === 1 ? 'bg-[#243B58] text-white' : rank === 2 ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-500';

  const certifications = company.certifications && Array.isArray(company.certifications)
    ? company.certifications.slice(0, 3)
    : [];

  return (
    <div className="group relative">
      <Card className="relative transition-colors group-hover:border-slate-400 group-hover:shadow-md">
        {/* Stretched link: covers the whole card for click/navigation, but sits
            behind (z-0) the real content so nested interactive elements (like
            VisitWebsiteButton's own <a>) aren't nested inside this anchor —
            an <a> cannot legally contain another <a>. */}
        <Link
          href={`/company/${company.slug}`}
          aria-label={company.name}
          className="absolute inset-0 z-10"
        />

        <CardContent className="relative p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            
            {/* Rank, Logo, and Mobile Header Info */}
            <div className="flex items-center sm:items-start gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
              {/* Rank badge */}
              {typeof rank === 'number' && (
                <div className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg text-[11px] sm:text-xs font-bold tabular-nums ${rankBg}`}>
                  #{rank + 1}
                </div>
              )}

              {/* Logo */}
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo-icon.svg';
                  }}
                  className="size-14 sm:size-[72px] shrink-0 rounded-xl border border-slate-200 bg-white object-contain"
                />
              ) : (
                <div className="flex size-14 sm:size-[72px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                  <span className="text-xl sm:text-2xl font-bold text-slate-400">{company.name.charAt(0)}</span>
                </div>
              )}

              {/* Mobile-only Header Title & Stars */}
              <div className="flex flex-col min-w-0 sm:hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-base font-semibold text-slate-900 truncate">{company.name}</h3>
                  {company.is_verified ? (
                    <Badge variant="secondary" className="gap-0.5 px-1 py-0.5 text-[9px] shrink-0">
                      <CheckCircle data-icon="inline-start" className="size-2" />
                      Verified
                    </Badge>
                  ) : null}
                </div>
                
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                  <StarRow rating={parseFloat(company.avg_rating) || 0} />
                  <span className="font-semibold tabular-nums text-slate-900">
                    {(parseFloat(company.avg_rating) || 0).toFixed(1)}
                  </span>
                  <span className="tabular-nums">({company.review_count || 0})</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1 w-full">
              
              {/* Desktop-only Title Row */}
              <div className="hidden sm:flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                  {company.is_verified ? (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <CheckCircle data-icon="inline-start" className="size-2.5" />
                      Verified
                    </Badge>
                  ) : null}
                </div>

                {company.website ? (
                  <span className="relative z-20">
                    <VisitWebsiteButton href={company.website} />
                  </span>
                ) : null}
              </div>

              {/* Desktop-only metadata row */}
              <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <StarRow rating={parseFloat(company.avg_rating) || 0} />
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {(parseFloat(company.avg_rating) || 0).toFixed(1)}
                  </span>
                </span>
                <span className="tabular-nums">{company.review_count || 0} reviews</span>
                {employeeLabel ? (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {employeeLabel}
                  </span>
                ) : null}
                {company.hq_city || company.hq_state_label ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                  </span>
                ) : null}
              </div>

              {/* Mobile-only location/meta row */}
              <div className="flex sm:hidden flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2.5">
                {employeeLabel ? (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {employeeLabel}
                  </span>
                ) : null}
                {company.hq_city || company.hq_state_label ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                  </span>
                ) : null}
              </div>

              {/* Company Description */}
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                {getCompanyDescription(company)}
              </p>

              {/* Certifications and Action Row */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {certifications.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                ) : <div className="hidden sm:block" />}

                {/* Mobile-only Visit Website Button */}
                {company.website ? (
                  <div className="sm:hidden relative z-20 w-full mt-1">
                    <VisitWebsiteButton href={company.website} className="w-full py-2.5 text-sm font-semibold" />
                  </div>
                ) : null}
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
