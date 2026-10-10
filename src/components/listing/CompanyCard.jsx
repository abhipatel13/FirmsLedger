import LogoImage from '@/components/LogoImage';
import Link from 'next/link';
import { CheckCircle, MapPin, Phone, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VisitWebsiteButton from './VisitWebsiteButton';
import { getCompanyDescription } from '@/utils';
import { formatPhone } from '@/lib/listingFacts';
import { cleanFacets } from '@/lib/cleanFacets';

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

export default function CompanyCard({ company }) {
  const rating = parseFloat(company.avg_rating) || 0;
  const phone = formatPhone(company.phone);
  const location = [company.hq_city, company.hq_state_label].filter(Boolean).join(', ');

  // Scraped `capabilities`/`products` are mostly real capability labels mixed
  // with nav text and testimonials — cleanFacets drops the junk. 4 rather than
  // the default 6: a card has less room than a profile.
  const facets = cleanFacets([...(company.capabilities || []), ...(company.products || [])], 4);

  const certifications = Array.isArray(company.certifications)
    // The scrape produced duplicates that differ only by whitespace — "ISO9001"
    // and "ISO\n9001" rendered as two near-identical chips on the same card.
    ? [...new Map(
        company.certifications
          .map((c) => String(c).replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .map((c) => [c.replace(/\s+/g, '').toLowerCase(), c])
      ).values()].slice(0, 3)
    : [];

  return (
    <div className="group relative">
      <Card className="relative transition-all duration-300 border-slate-200 hover:border-slate-300 hover:shadow-lg bg-white">
        {/* Stretched link: covers the whole card for click/navigation, but sits
            behind (z-0) the real content so nested interactive elements (like
            VisitWebsiteButton's own <a>) aren't nested inside this anchor —
            an <a> cannot legally contain another <a>. */}
        <Link
          href={`/company/${company.slug}`}
          aria-label={company.name}
          className="absolute inset-0 z-10"
        />

        <CardContent className="relative p-5 sm:p-7">
          <div className="grid grid-cols-[84px_1fr] gap-4 sm:grid-cols-[168px_minmax(0,1fr)_208px] sm:gap-7">

            {/* ── Logo column ──────────────────────────────────────────
                No border, fill or padding: the old 72px framed box spent
                most of its area on chrome and object-contain letterboxing,
                leaving ~40px of actual mark. The fixed size stays so logos
                of different aspect ratios line up down the list. */}
            <div className="grid size-[84px] sm:size-[168px] place-items-center">
              {company.logo_url ? (
                <LogoImage
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="size-full object-contain"
                />
              ) : (
                /* Sized well below the cell rather than size-full: a 168px
                   bordered square holding one letter read as a broken image,
                   and most companies have no logo. The cell keeps its size so
                   real logos stay aligned down the list. */
                <div className="grid size-[68px] sm:size-[88px] place-items-center rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-2xl font-semibold text-slate-400">{company.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* ── Middle column ────────────────────────────────────── */}
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{company.name}</h3>
                {company.is_verified ? (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <CheckCircle data-icon="inline-start" className="size-2.5" />
                    Verified
                  </Badge>
                ) : null}
              </div>

              {rating > 0 && company.review_count > 0 ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <StarRow rating={rating} />
                  <span className="font-mono font-semibold tabular-nums text-slate-900">{rating.toFixed(1)}</span>
                  <span className="tabular-nums">· {company.review_count} reviews</span>
                </div>
              ) : null}

              <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                {getCompanyDescription(company)}
              </p>

              {facets.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {facets.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}

              {certifications.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Mobile meta + actions. The rail below is desktop-only, so without
                  this a phone user never sees where the company is — the single
                  most important fact in a location directory. The website button
                  is inline here rather than a full-width slab, which outweighed
                  the company name itself. */}
              <div className="mt-1 flex flex-col gap-2 sm:hidden">
                {location ? (
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-600">
                    <MapPin className="size-[14px] shrink-0 opacity-60" />
                    <span className="truncate">{location}</span>
                  </div>
                ) : null}
                {phone || company.website ? (
                  <div className="relative z-20 flex flex-wrap items-center gap-2">
                    {phone ? (
                      <a
                        href={`tel:${String(company.phone).replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 no-underline"
                      >
                        <Phone className="size-[13px] shrink-0 opacity-60" />
                        <span className="tabular-nums">{phone}</span>
                      </a>
                    ) : null}
                    {company.website ? <VisitWebsiteButton href={company.website} className="py-1.5" /> : null}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ── Right rail ───────────────────────────────────────────
                Centred, not top-aligned: the rail always holds less than
                the description column, so anything pinned to the top left
                an obvious gap beneath the button. */}
            <div className="hidden sm:flex flex-col justify-center gap-3.5 border-l border-slate-200 pl-6">
              {location ? (
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                  <MapPin className="size-[15px] shrink-0 opacity-60" />
                  <span className="truncate">{location}</span>
                </div>
              ) : null}
              {phone ? (
                <a
                  href={`tel:${String(company.phone).replace(/[^\d+]/g, '')}`}
                  className="relative z-20 flex items-center gap-2 text-[13px] text-slate-600 hover:text-[#1A2E4A]"
                >
                  <Phone className="size-[15px] shrink-0 opacity-60" />
                  <span className="tabular-nums">{phone}</span>
                </a>
              ) : null}
              {company.website ? (
                <div className="relative z-20">
                  <VisitWebsiteButton href={company.website} className="w-full justify-center" />
                </div>
              ) : null}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
