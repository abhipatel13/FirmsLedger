import Link from 'next/link';
import { MapPin, Users, Calendar, ExternalLink, Star, CheckCircle } from 'lucide-react';
import { getCompanyProfileUrl } from '@/utils';

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.floor(rating || 0) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

function CompanyListItem({ company, rank }) {
  const profileUrl = getCompanyProfileUrl(company);
  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all duration-150">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Rank + Logo */}
          <div className="flex items-start gap-3 flex-shrink-0">
            <div className="w-7 h-7 rounded bg-[#0D1B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-white">{rank}</span>
            </div>
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-contain border border-slate-100 bg-white"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 flex-shrink-0">
                <span className="text-xl font-bold text-slate-400">{company.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Left info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link href={profileUrl}>
                    <h3 className="text-base font-bold text-slate-900 hover:text-orange-600 transition-colors">
                      {company.name}
                    </h3>
                  </Link>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <RatingStars rating={company.avg_rating} />
                  <span className="text-sm font-bold text-slate-900">{(company.avg_rating || 0).toFixed(1)}</span>
                  <Link href={`${profileUrl}#reviews`} className="text-xs text-slate-500 hover:underline">
                    {company.review_count || 0} Reviews
                  </Link>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">
                  {company.description || `${company.name} is a verified service provider${company.hq_city ? ` based in ${company.hq_city}` : ''}. Connect to learn about their expertise, pricing, and client outcomes.`}
                </p>

                <div className="flex flex-wrap gap-2">
                  {company.team_size && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      <Users className="w-3 h-3" /> {company.team_size}
                    </span>
                  )}
                  {company.founded_year && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3" /> Est. {company.founded_year}
                    </span>
                  )}
                  {(company.hq_city || company.hq_country) && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3" />
                      {[company.hq_city, company.hq_country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-2 lg:w-36 flex-shrink-0">
                <Link href={profileUrl} className="flex-1 lg:flex-none">
                  <span className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9 rounded-md transition-colors leading-9">
                    View Profile
                  </span>
                </Link>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                    <span className="flex items-center justify-center gap-1 w-full border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-semibold h-9 rounded-md transition-colors">
                      Website <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared layout for all /search/ pages.
 * Matches the Directory component's visual style.
 *
 * Props:
 *   breadcrumbs   [{ label, href? }]
 *   h1            string
 *   description   string
 *   pills         [{ label, bg, text, border }]
 *   subcategories [{ name, href }]
 *   companies     agency[]
 *   categoryName  string
 *   locationName  string  (short: "Mumbai", "Maharashtra", "India")
 *   children      JSX — navigation / related-links section rendered below company list
 *   ctaTitle      string
 *   ctaDescription string
 */
export default function SearchPageLayout({
  breadcrumbs = [],
  h1,
  description,
  pills = [],
  subcategories = [],
  companies = [],
  categoryName,
  locationName,
  children,
  ctaTitle,
  ctaDescription,
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Dark header — matches Directory */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 pb-7">
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400 mb-4">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-600">/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-white font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-2 mb-2 text-white tracking-tight">
            {h1}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed mb-4">
            {description}
          </p>

          {/* Pills */}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pills.map((pill, i) => (
                <span
                  key={i}
                  className={`text-sm px-3 py-1 rounded-full font-medium border ${pill.bg} ${pill.text} ${pill.border}`}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-400">
            <strong className="text-white">{companies.length}</strong> Companies Listed
            <span className="mx-2">·</span>
            Rankings updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Subcategory pills */}
          {subcategories.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Browse by Subcategory</p>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company list */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {companies.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 mb-5">
              Showing <strong className="text-slate-800">1–{Math.min(companies.length, 10)}</strong> of{' '}
              <strong className="text-slate-800">{companies.length}</strong> {categoryName} companies in {locationName}
            </p>
            <div className="space-y-3">
              {companies.slice(0, 10).map((company, i) => (
                <CompanyListItem key={company.id} company={company} rank={i + 1} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No companies listed yet in {locationName}
            </h2>
            <p className="text-slate-500 mb-6">
              Be the first {categoryName.toLowerCase()} company in {locationName}.
            </p>
            <Link
              href="/ListYourCompany"
              className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              List Your Company
            </Link>
          </div>
        )}

        {/* Navigation / related links passed from each page */}
        {children}

        {/* CTA banner */}
        <div className="mt-10 bg-[#0D1B2A] text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{ctaTitle}</h2>
          <p className="text-slate-300 mb-5">{ctaDescription}</p>
          <Link
            href="/ListYourCompany"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            List Your Company — It&apos;s Free
          </Link>
        </div>
      </div>
    </div>
  );
}
