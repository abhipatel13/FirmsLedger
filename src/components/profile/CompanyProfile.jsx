import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle, MapPin, Phone } from 'lucide-react';
import LogoImage from '@/components/LogoImage';
import { getCategoryHref } from '@/utils';
import { isProperDescription } from '@/lib/descriptionQuality';
import { companyCity, companySpecialties, companyCertifications, websiteDomain, formatPhone } from '@/lib/listingFacts';
import { ALL_US_STATES } from '@/lib/usStates';

const card = 'rounded-lg border border-slate-200 bg-white p-6';
const h2 = 'mb-3 text-lg font-semibold text-[#1A2E4A]';
const btnPrimary = 'block rounded-md bg-[#1A2E4A] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f172a]';
const btnOutline = 'block rounded-md border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50';

function RailCard({ title, text, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-center">
      <h2 className="text-base font-semibold text-[#1A2E4A]">{title}</h2>
      {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

export default function CompanyProfile({ company, categories = [], similar = [], reviews = [] }) {
  const state = ALL_US_STATES.find((s) => s.name === company.hq_state_label) || null;
  const primary = categories[0] || null;
  const city = companyCity(company);
  const place = [city, state?.name].filter(Boolean).join(', ');
  const domain = websiteDomain(company.website);
  const siteHref = domain && (/^https?:\/\//i.test(company.website) ? company.website : `https://${domain}`);
  const phone = formatPhone(company.phone);
  const about = isProperDescription(company.description) ? company.description.trim() : null;
  const capabilities = companySpecialties(company, 12);
  const certs = companyCertifications(company);
  const details = [
    ['Location', place],
    ['Address', company.address],
    ['Employees', company.employee_count],
    ['Founded', company.founded_year],
    ['Certifications', certs.join(', ')],
    ['Phone', phone],
    ['Website', domain],
  ].filter(([, v]) => v);
  const what = primary ? primary.name.toLowerCase() : 'manufacturing';
  const faqs = [
    place && { q: `Where is ${company.name} located?`, a: `${company.name} is headquartered in ${company.address || place}.` },
    (phone || domain) && { q: `How do I contact ${company.name}?`, a: [phone && `Call ${phone}`, domain && `visit ${domain}`].filter(Boolean).join(' or ') + ', or send a request through FirmsLedger.' },
  ].filter(Boolean);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[var(--max-width)] px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          {primary && (<><span className="text-slate-300">/</span><Link href={getCategoryHref(primary)} className="hover:text-slate-900">{primary.name}</Link></>)}
          {primary && state && (<><span className="text-slate-300">/</span><Link href={getCategoryHref(primary, state.slug)} className="hover:text-slate-900">{primary.name} in {state.name}</Link></>)}
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{company.name}</span>
        </nav>

        <header className={`${card} mb-6`}>
          <div className="flex items-start gap-4">
            {company.logo_url && (
              <LogoImage src={company.logo_url} alt={`${company.name} logo`} width={64} height={64} hideOnError className="size-16 shrink-0 rounded border border-slate-100 object-contain" />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">{company.name}</h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="size-3" /> Verified</span>
                )}
              </div>
              {(company.address || place) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="size-4 text-slate-400" /> {company.address || place}</p>
              )}
              {categories.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <li key={c.id}><Link href={getCategoryHref(c, state?.slug)} className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-200">{c.name}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <aside className="space-y-4 lg:order-2 lg:sticky lg:top-24 lg:self-start">
            <RailCard title="Request a quote" text="Send your part or project details to this company.">
              <Link href={`/RequestProposal?agency=${company.id}`} className={btnPrimary}>Request a quote</Link>
            </RailCard>
            {(phone || domain) && (
              <RailCard title="Contact" text="Prefer to reach out directly?">
                {phone && <a href={`tel:${company.phone}`} className={`${btnOutline} inline-flex w-full items-center justify-center gap-1.5`}><Phone className="size-4" /> {phone}</a>}
                {domain && <a href={siteHref} target="_blank" rel="nofollow noopener noreferrer" className={`${btnOutline} inline-flex w-full items-center justify-center gap-1.5`}>{domain} <ArrowUpRight className="size-4" /></a>}
              </RailCard>
            )}
            {!company.is_verified && (
              <RailCard title="Is this your company?" text="Claim the listing for free to update its details and receive buyer requests.">
                <Link href={`/claim-listing?agency=${company.slug}`} className={btnOutline}>Claim this listing</Link>
              </RailCard>
            )}
            <RailCard title="Worked with this company?" text="Share your experience to help other buyers.">
              <Link href={`/WriteReview?agency=${company.id}`} className={btnOutline}>Write a review</Link>
            </RailCard>
          </aside>

          <main className="min-w-0 space-y-6 lg:order-1">
            <section className={card}>
              <h2 className={h2}>About {company.name}</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">
                {about || `${company.name} is listed on FirmsLedger under ${what}${place ? ` in ${place}` : ''}. Contact details are on this page.`}
              </p>
            </section>

            {capabilities.length > 0 && (
              <section className={card}>
                <h2 className={h2}>Capabilities</h2>
                <ul className="flex flex-wrap gap-2">
                  {capabilities.map((c) => <li key={c} className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">{c}</li>)}
                </ul>
              </section>
            )}

            {details.length > 0 && (
              <section className={card}>
                <h2 className={h2}>Company details</h2>
                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {details.map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                      <dd className="mt-1 break-words text-sm text-slate-900">
                        {label === 'Website' ? <a href={siteHref} target="_blank" rel="nofollow noopener noreferrer" className="text-[#1A2E4A] hover:underline">{value}</a>
                          : label === 'Phone' ? <a href={`tel:${company.phone}`} className="hover:underline">{value}</a>
                          : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {reviews.length > 0 && (
              <section className={card}>
                <h2 className={h2}>Reviews</h2>
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900">{r.title || r.reviewer_company || 'Review'} · ★ {r.rating_overall}</p>
                      {r.body && <p className="mt-1 text-sm text-slate-600">{r.body}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {faqs.length > 0 && <section className={card}>
              <h2 className={h2}>Frequently asked questions</h2>
              <dl className="space-y-4">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="text-sm font-semibold text-slate-900">{f.q}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-slate-600">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>}

            {similar.length > 0 && (
              <section className={card}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-[#1A2E4A]">{state && primary ? `More ${primary.name} in ${state.name}` : `Similar ${primary?.name || 'companies'}`}</h2>
                  {primary && (
                    <Link href={getCategoryHref(primary, state?.slug)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A2E4A] hover:underline">
                      {state ? `All ${primary.name} in ${state.name}` : 'View all'} <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {similar.map((c) => (
                    <li key={c.id}>
                      <Link href={`/company/${c.slug}`} className="block rounded-md border border-slate-200 p-3 hover:border-slate-300 hover:bg-slate-50">
                        <span className="block truncate text-sm font-semibold text-slate-900">{c.name}</span>
                        {companyCity(c) && <span className="text-xs text-slate-500">{companyCity(c)}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
