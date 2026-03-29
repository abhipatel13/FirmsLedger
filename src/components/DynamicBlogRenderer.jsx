'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

function normalise(c) {
  if (!c) return {};

  let intro = c.intro;
  if (intro && !Array.isArray(intro)) intro = intro.paragraphs || [];

  let why = c.why_section;
  if (why?.items && !why.points) {
    why = { ...why, points: why.items.map((i) => ({ title: i.title, description: i.text })) };
  }

  let services = c.services;
  if (Array.isArray(services)) {
    services = { heading: 'Key Services', items: services.map((s) => ({ name: s.title, description: s.text })) };
  }

  let how = c.how_to_choose;
  if (Array.isArray(how)) {
    how = { heading: 'How to Choose', steps: how.map((h) => ({ step: h.title, detail: h.text, questions_to_ask: [] })) };
  }

  let trends = c.trends;
  if (Array.isArray(trends)) {
    trends = { heading: 'Industry Trends 2026', points: trends.map((t) => ({ title: t.title || '', description: `${t.title ? t.title + ': ' : ''}${t.text || t}` })) };
  }
  // normalise trends.points to objects
  if (trends?.points && typeof trends.points[0] === 'string') {
    trends = { ...trends, points: trends.points.map((p) => ({ title: '', description: p })) };
  }

  const faq = (c.faq || []).map((f) => ({ question: f.question || f.q, answer: f.answer || f.a }));

  let conclusion = c.conclusion;
  if (conclusion?.paragraphs && !conclusion.body) {
    conclusion = { body: conclusion.paragraphs.join('\n\n'), cta: null };
  }

  return { intro, why, services, how, trends, faq, conclusion };
}

// Collapsible FAQ item
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-slate-900 text-base leading-snug">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && <p className="text-slate-600 text-base leading-relaxed pb-5">{answer}</p>}
    </div>
  );
}

export default function DynamicBlogRenderer({ post, relatedPosts = [] }) {
  const directoryUrl = getDirectoryUrl();
  const { intro, why, services, how, trends, faq, conclusion } = normalise(post.content);

  const companies        = post.content?.companies || [];
  const compTable        = post.content?.comparison_table;
  const keyTakeaways     = post.content?.key_takeaways || [];
  const buyingGuide      = post.content?.buying_guide;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: 'FirmsLedger' },
    publisher: { '@type': 'Organization', name: 'FirmsLedger', url: 'https://firmsledger.com' },
    ...(post.image_url && { image: { '@type': 'ImageObject', url: post.image_url, width: 1200, height: 630 } }),
  };

  const faqJsonLd = faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  return (
    <article className="min-h-screen bg-white">
      <Script id="article-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(articleJsonLd)}
      </Script>
      {faqJsonLd && (
        <Script id="faq-schema" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(faqJsonLd)}
        </Script>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: 'Blog', href: createPageUrl('Blogs') },
              { label: post.title },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <header className="bg-[#0D1B2A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <span className="inline-block bg-orange-500 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-5">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl">
            {post.title}
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl leading-relaxed">{post.meta_description}</p>
          <div className="flex flex-wrap items-center gap-5 mt-7 text-sm text-slate-400">
            <span>Updated: {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            <span>·</span>
            <span>{post.read_time}</span>
            <span>·</span>
            <span>By FirmsLedger Editorial</span>
          </div>
        </div>

        {/* Hero image */}
        {post.image_url && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
            <div className="rounded-t-2xl overflow-hidden">
              <img
                src={post.image_url}
                alt={post.image_alt || post.title}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Key Takeaways box */}
        {keyTakeaways.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-12">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">Key Takeaways</p>
            <ul className="space-y-2.5">
              {keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-800 text-sm leading-relaxed">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Introduction */}
        {intro?.length > 0 && (
          <section className="mb-12">
            {intro.map((p, i) => (
              <p key={i} className="text-slate-700 text-lg leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: p.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}" class="text-orange-600 hover:underline font-medium">${url}</a>`) }} />
            ))}
          </section>
        )}

        {/* Why Section */}
        {why?.points?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-7">{why.heading}</h2>
            <div className="space-y-0 divide-y divide-slate-100">
              {why.points.map((item, i) => (
                <div key={i} className="py-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-2.5">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comparison Table */}
        {compTable?.rows?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{compTable.heading || 'Quick Comparison'}</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1B2A] text-white">
                    {(compTable.headers || []).map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compTable.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-4 py-3 text-slate-700 align-top ${ci === 0 ? 'font-semibold text-slate-900' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Companies */}
        {companies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Top Companies</h2>
            <div className="space-y-10">
              {companies.map((co, idx) => (
                <div key={co.name || idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Company header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-start gap-4">
                    <span className="text-4xl font-extrabold text-slate-200 leading-none flex-shrink-0 pt-1">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900">{co.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                        {co.location     && <span>📍 {co.location}</span>}
                        {co.founded      && <span>🏛 Est. {co.founded}</span>}
                        {co.team_size    && <span>👥 {co.team_size}</span>}
                      </div>
                    </div>
                    {co.pricing_hint && (
                      <span className="flex-shrink-0 text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                        {co.pricing_hint}
                      </span>
                    )}
                  </div>

                  <div className="px-6 py-6">
                    <p className="text-slate-700 leading-relaxed mb-5">{co.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                      {co.specialization && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Specialization</p>
                          <p className="text-sm text-slate-800">{co.specialization}</p>
                        </div>
                      )}
                      {co.certifications && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Certifications</p>
                          <p className="text-sm text-slate-800">{co.certifications}</p>
                        </div>
                      )}
                      {co.industries_served?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Industries Served</p>
                          <p className="text-sm text-slate-800">{co.industries_served.join(', ')}</p>
                        </div>
                      )}
                      {co.ideal_for && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ideal For</p>
                          <p className="text-sm text-slate-800">{co.ideal_for}</p>
                        </div>
                      )}
                    </div>

                    {co.services?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Services</p>
                        <div className="flex flex-wrap gap-2">
                          {co.services.map((s, si) => (
                            <span key={si} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {co.key_strength && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Why They Stand Out</p>
                        <p className="text-sm text-slate-800 font-medium">{co.key_strength}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services?.items?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-7">{services.heading || 'Services & Products'}</h2>
            <div className="divide-y divide-slate-100">
              {services.items.map((svc, i) => (
                <div key={i} className="py-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{svc.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{svc.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How to Choose */}
        {how?.steps?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-7">{how.heading || 'How to Choose the Right Partner'}</h2>
            <ol className="space-y-6">
              {how.steps.map((tip, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0D1B2A] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{tip.step}</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">{tip.detail}</p>
                    {tip.questions_to_ask?.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ask vendors:</p>
                        {tip.questions_to_ask.map((q, qi) => (
                          <p key={qi} className="text-sm text-slate-700 italic">"{q}"</p>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Buying Guide */}
        {buyingGuide?.criteria?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-7">{buyingGuide.heading || "Buyer's Evaluation Checklist"}</h2>
            <div className="space-y-5">
              {buyingGuide.criteria.map((c, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-slate-900">{c.name}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed ml-8 mb-3">{c.description}</p>
                  {c.questions_to_ask?.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {c.questions_to_ask.map((q, qi) => (
                        <p key={qi} className="text-sm text-slate-500 italic">→ "{q}"</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trends */}
        {trends?.points?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-7">{trends.heading || 'Industry Trends 2026'}</h2>
            <div className="space-y-4">
              {trends.points.map((point, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-orange-500 font-bold text-lg flex-shrink-0 leading-none">→</span>
                  <div>
                    {point.title && <p className="font-semibold text-slate-900 mb-1">{point.title}</p>}
                    <p className="text-slate-600 text-sm leading-relaxed">{point.description || point}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq?.length > 0 && (
          <section className="mb-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-200 px-4 sm:px-6">
              {faq.map((item, i) => (
                <FaqItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </section>
        )}

        {/* Conclusion */}
        {conclusion?.body && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Conclusion</h2>
            {conclusion.body.split('\n\n').map((p, i) => (
              <p key={i} className="text-slate-700 leading-relaxed mb-4 text-lg">{p}</p>
            ))}
            {conclusion.cta && (
              <p className="text-slate-700 font-medium mt-4">
                {conclusion.cta.replace(/→.*$/, '').replace(/Browse.*FirmsLedger.*/, '')}
                <Link href={directoryUrl} className="text-orange-600 hover:underline font-semibold ml-1">
                  Browse verified companies on FirmsLedger →
                </Link>
              </p>
            )}
          </section>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blogs/${rp.slug}`}
                  className="group border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug mb-2">
                    {rp.title}
                  </h3>
                  {rp.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{rp.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA block */}
        <div className="bg-[#0D1B2A] text-white rounded-2xl p-8 md:p-10 text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">Find Verified Service Providers</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            Browse verified manufacturing, engineering, and business service providers on FirmsLedger.
            Compare by expertise, reviews, and location — for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={directoryUrl}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Browse Service Providers →
            </Link>
            <Link
              href="/ListYourCompany"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/20"
            >
              List Your Company Free
            </Link>
          </div>
        </div>

        <footer className="pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
          <p>
            Last Updated: {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
            This article is for informational purposes. Verify current details directly with each provider.
          </p>
        </footer>
      </main>
    </article>
  );
}
