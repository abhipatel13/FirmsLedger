import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InlineMarkdown, SeoFaqs } from '@/components/seo/SeoBlocks';
import CompanyRow from './CompanyRow';
import ListingSidebar from './ListingSidebar';
import CtaBand from './CtaBand';

export default function StateListingPage({ breadcrumbs, h1, stats, lead, listTitle, companies, sidebar, cta, aboutTitle, about = [], faqs = [] }) {
  return (
    <div className="bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[var(--max-width)] px-4 py-8 sm:px-6 sm:py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            {breadcrumbs.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">/</span>}
                <Link href={b.href} className="hover:text-slate-900">{b.label}</Link>
              </span>
            ))}
          </nav>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">{h1}</h1>
              <p className="mt-2 text-sm text-slate-500">{stats.filter(Boolean).join(' · ')}</p>
              {lead && <p className="mt-4 text-[15px] leading-relaxed text-slate-600"><InlineMarkdown text={lead} /></p>}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild className="bg-[#1A2E4A] text-white hover:bg-[#0f172a]"><Link href="/RequestProposal">Request quotes</Link></Button>
              <Button asChild variant="outline"><Link href="/list-your-company">List your company</Link></Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[var(--max-width)] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="order-2 lg:order-1">
          <ListingSidebar {...sidebar} />
        </div>
        <main className="order-1 min-w-0 lg:order-2">
          <h2 className="mb-4 text-lg font-semibold text-[#1A2E4A]">{listTitle}</h2>
          {companies.length > 0 ? (
            <div className="space-y-3">
              {companies.map((c) => <CompanyRow key={c.slug} company={c} />)}
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
              No listings yet. <Link href="/list-your-company" className="font-medium text-[#1A2E4A] underline">Be the first to list your company.</Link>
            </p>
          )}

          <CtaBand {...cta} />

          {about.length > 0 && (
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="mb-3 text-lg font-bold text-slate-900">{aboutTitle}</h2>
              <div className="max-w-3xl space-y-3 text-[15px] leading-relaxed text-slate-600">
                {about.map((p) => <p key={p}><InlineMarkdown text={p} /></p>)}
              </div>
            </section>
          )}

          {faqs.length > 0 && <div className="mt-8"><SeoFaqs faqs={faqs} /></div>}
        </main>
      </div>
    </div>
  );
}
