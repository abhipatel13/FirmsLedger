import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { stripLinks } from '@/lib/seoOverrides';

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const linkClass = 'text-[#1A2E4A] underline underline-offset-2';

export function InlineMarkdown({ text }) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(href.startsWith('/')
      ? <Link key={m.index} href={href} className={linkClass}>{label}</Link>
      : <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>{label}</a>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

export function SeoIntro({ paragraphs }) {
  return (
    <div className="mb-6 max-w-3xl space-y-3 text-[15px] leading-relaxed text-slate-600">
      {paragraphs.map((p) => <p key={p}><InlineMarkdown text={p} /></p>)}
    </div>
  );
}

export function SeoFaqs({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: stripLinks(f.a) } })),
      }} />
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className="mb-1.5 text-[15px] font-semibold text-slate-900">{f.q}</h3>
              <p className="text-sm leading-relaxed text-slate-600"><InlineMarkdown text={f.a} /></p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function LastUpdated({ date }) {
  if (!date) return null;
  return (
    <p className="mt-2 text-xs text-slate-500">
      Last updated <time dateTime={date.toISOString().slice(0, 10)}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date)}</time>
    </p>
  );
}
