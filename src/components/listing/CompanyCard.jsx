import Link from 'next/link';
import { CheckCircle, MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEmployeeLabel } from '@/lib/employeeCount';

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

  return (
    <Link href={`/company/${company.slug}`} className="block no-underline group">
      <Card className="transition-colors group-hover:border-slate-400 group-hover:shadow-md">
        <CardContent className="flex items-start gap-5 p-7">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${rankBg}`}>
            #{rank + 1}
          </div>

          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="size-16 shrink-0 rounded-xl border border-slate-200 bg-white object-contain"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
              <span className="text-2xl font-bold text-slate-400">{company.name.charAt(0)}</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
              {company.is_verified ? (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <CheckCircle data-icon="inline-start" className="size-2.5" />
                  Verified
                </Badge>
              ) : null}
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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

            {company.description ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{company.description}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center">
            <ArrowRight className="size-4 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
