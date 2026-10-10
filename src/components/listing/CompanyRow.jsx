import Link from 'next/link';
import { ArrowUpRight, CheckCircle, Phone } from 'lucide-react';
import LogoImage from '@/components/LogoImage';
import { Button } from '@/components/ui/button';
import { ALL_US_STATES } from '@/lib/usStates';
import { isProperDescription } from '@/lib/descriptionQuality';
import { companyCity, companySpecialties, companyCertifications, websiteDomain, formatPhone } from '@/lib/listingFacts';

const ABBR = Object.fromEntries(ALL_US_STATES.map((s) => [s.name, s.abbr]));

export default function CompanyRow({ company }) {
  const href = `/company/${company.slug}`;
  const city = companyCity(company);
  const state = ABBR[company.hq_state_label] || company.hq_state_label;
  const domain = websiteDomain(company.website);
  const certs = companyCertifications(company).slice(0, 2);
  const chips = companySpecialties(company, 3);
  const meta = [[city, state].filter(Boolean).join(', '), company.employee_count && `${company.employee_count} employees`, ...certs].filter(Boolean);
  const rated = Number(company.avg_rating) > 0 && company.review_count > 0;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm sm:flex sm:items-start sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {company.logo_url && (
            <LogoImage src={company.logo_url} alt="" width={40} height={40} hideOnError className="size-10 shrink-0 rounded object-contain" />
          )}
          <h3 className="text-lg font-semibold leading-snug text-[#1A2E4A]">
            <Link href={href} className="hover:underline">{company.name}</Link>
          </h3>
          {company.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <CheckCircle className="size-3" /> Verified
            </span>
          )}
        </div>
        {meta.length > 0 && <p className="mt-1 text-sm text-slate-500">{meta.join(' · ')}</p>}
        {rated && <p className="mt-1 text-sm text-slate-600">★ {Number(company.avg_rating).toFixed(1)} · {company.review_count} reviews</p>}
        {isProperDescription(company.description) && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{company.description}</p>
        )}
        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">{c}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 sm:mt-0 sm:w-44 sm:shrink-0 sm:flex-col sm:flex-nowrap sm:items-stretch">
        <Button asChild size="sm" className="bg-[#1A2E4A] text-white hover:bg-[#0f172a]">
          <Link href={href}>View profile</Link>
        </Button>
        {domain && (
          <a href={company.website.startsWith('http') ? company.website : `https://${domain}`} target="_blank" rel="nofollow noopener noreferrer" className="flex min-w-0 items-center gap-1 text-sm text-[#1A2E4A] hover:underline sm:justify-center">
            <span className="truncate">{domain}</span> <ArrowUpRight className="size-3.5 shrink-0" />
          </a>
        )}
        {formatPhone(company.phone) && (
          <a href={`tel:${company.phone}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 sm:justify-center">
            <Phone className="size-3.5" /> {formatPhone(company.phone)}
          </a>
        )}
      </div>
    </article>
  );
}
