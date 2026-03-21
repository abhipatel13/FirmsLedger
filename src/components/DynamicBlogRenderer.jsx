'use client';

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

/**
 * DynamicBlogRenderer
 *
 * Supports both the legacy schema (v1) and the improved schema (v2).
 *
 * v1 (old):  intro.heading + intro.paragraphs[], why_section.items[], services[],
 *            how_to_choose[], trends[], faq[{q,a}], conclusion.paragraphs[]
 *
 * v2 (new):  intro[] (string array), why_section.points[], services.items[],
 *            how_to_choose.steps[], trends.points[], faq[{question,answer}],
 *            conclusion.body + conclusion.cta
 */

// ── Normalise content to v2 shape ──────────────────────────────────────────
function normalise(c) {
  if (!c) return {};

  // intro: v1 = { heading, paragraphs[] } → v2 = string[]
  let intro = c.intro;
  if (intro && !Array.isArray(intro)) {
    intro = intro.paragraphs || [];
  }

  // why_section: v1 items[{title,text}] → v2 points[{title,description}]
  let why = c.why_section;
  if (why?.items && !why.points) {
    why = { ...why, points: why.items.map((i) => ({ title: i.title, description: i.text })) };
  }

  // services: v1 = [{title,text}] → v2 = { heading, items[{name,description}] }
  let services = c.services;
  if (Array.isArray(services)) {
    services = {
      heading: 'Key Services',
      items: services.map((s) => ({ name: s.title, description: s.text })),
    };
  }

  // how_to_choose: v1 = [{title,text}] → v2 = { heading, steps[{step,detail}] }
  let how = c.how_to_choose;
  if (Array.isArray(how)) {
    how = {
      heading: 'How to Choose the Right Partner',
      steps: how.map((h) => ({ step: h.title, detail: h.text })),
    };
  }

  // trends: v1 = [{title,text}] → v2 = { heading, points[] }
  let trends = c.trends;
  if (Array.isArray(trends)) {
    trends = {
      heading: 'Industry Trends in 2026',
      points: trends.map((t) => `${t.title}: ${t.text}`),
    };
  }

  // faq: v1 = [{q,a}] → v2 = [{question,answer}]
  const faq = (c.faq || []).map((f) => ({
    question: f.question || f.q,
    answer: f.answer || f.a,
  }));

  // conclusion: v1 = { paragraphs[] } → v2 = { body, cta }
  let conclusion = c.conclusion;
  if (conclusion?.paragraphs && !conclusion.body) {
    conclusion = { body: conclusion.paragraphs.join('\n\n'), cta: null };
  }

  return { intro, why, services, how, trends, faq, conclusion };
}

export default function DynamicBlogRenderer({ post }) {
  const directoryUrl = getDirectoryUrl();
  const { intro, why, services, how, trends, faq, conclusion } = normalise(post.content);

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

  const companies = post.content?.companies || [];

  return (
    <article className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
      <header className="bg-[#0D1B2A] text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            {post.title}
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl">{post.meta_description}</p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-400">
            <span>Last Updated: {new Date(post.created_at).getFullYear()}</span>
            <span>{post.read_time}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Introduction */}
        {intro?.length > 0 && (
          <section className="mb-12">
            {intro.map((p, i) => (
              <p key={i} className="text-slate-600 text-lg leading-relaxed mb-4">{p}</p>
            ))}
          </section>
        )}

        {/* Why Section */}
        {why?.points?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{why.heading}</h2>
            <div className="divide-y divide-slate-200">
              {why.points.map((item, i) => (
                <div key={i} className="py-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Companies */}
        {companies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Companies</h2>
            <div className="divide-y divide-slate-200">
              {companies.map((co, idx) => (
                <div key={co.name} className="py-10">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-extrabold text-slate-200 leading-none">#{idx + 1}</span>
                    <h3 className="text-2xl font-bold text-slate-900">{co.name}</h3>
                  </div>
                  {co.location && (
                    <p className="text-slate-500 text-sm mb-1"><strong>Location:</strong> {co.location}</p>
                  )}
                  {co.specialization && (
                    <p className="text-slate-500 text-sm mb-1"><strong>Specialization:</strong> {co.specialization}</p>
                  )}
                  {co.founded && (
                    <p className="text-slate-500 text-sm mb-3"><strong>Founded:</strong> {co.founded}</p>
                  )}
                  {/* v1 compat */}
                  {(co.certifications || co.industries) && (
                    <p className="text-slate-500 text-sm mb-4">
                      {co.certifications && <><strong>Certifications:</strong> {co.certifications}</>}
                      {co.certifications && co.industries && ' · '}
                      {co.industries && <><strong>Industries:</strong> {co.industries}</>}
                    </p>
                  )}
                  <p className="text-slate-700 text-lg leading-relaxed mb-5">{co.description}</p>
                  {/* v1: services array */}
                  {co.services?.length > 0 && (
                    <>
                      <h4 className="text-base font-bold text-slate-800 mb-3">Key Services</h4>
                      <ul className="space-y-2 mb-5">
                        {co.services.map((s, si) => (
                          <li key={si} className="text-slate-700 text-base flex gap-2">
                            <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {co.strength && (
                    <p className="text-base font-semibold text-slate-800">
                      <span className="text-slate-500 font-normal">Unique Strength: </span>
                      {co.strength}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services?.items?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{services.heading || 'Services & Products'}</h2>
            <div className="divide-y divide-slate-200">
              {services.items.map((svc, i) => (
                <div key={i} className="py-5">
                  <strong className="text-slate-900 text-lg">{svc.name}</strong>
                  <p className="text-slate-700 text-base mt-2 leading-relaxed">{svc.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How to Choose */}
        {how?.steps?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{how.heading || 'How to Choose the Right Partner'}</h2>
            <ol className="space-y-4">
              {how.steps.map((tip, i) => (
                <li key={i} className="flex gap-4 py-4 border-b border-slate-100 last:border-b-0">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D1B2A] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-slate-900 text-base">{tip.step}</strong>
                    <p className="text-slate-600 text-base mt-1">{tip.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Trends */}
        {trends?.points?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{trends.heading || 'Industry Trends 2026'}</h2>
            <ul className="space-y-3">
              {trends.points.map((point, i) => (
                <li key={i} className="flex gap-3 text-slate-700 text-base leading-relaxed">
                  <span className="text-orange-500 font-bold flex-shrink-0">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {faq?.length > 0 && (
          <section className="mb-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-0 divide-y divide-slate-200">
              {faq.map((item, i) => (
                <div key={i} className="py-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-3">{item.question}</h3>
                  <p className="text-slate-700 text-base leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Conclusion */}
        {conclusion?.body && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Conclusion</h2>
            {conclusion.body.split('\n\n').map((p, i) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-4">{p}</p>
            ))}
            {conclusion.cta && (
              <p className="text-slate-700 font-medium mt-4">{conclusion.cta.replace(/→.*$/, '')}
                <Link href={directoryUrl} className="text-orange-600 hover:underline font-semibold ml-1">
                  Browse verified companies on FirmsLedger →
                </Link>
              </p>
            )}
          </section>
        )}

        {/* CTA block */}
        <div className="bg-[#0D1B2A] text-white rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Find Verified Service Providers</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Browse verified manufacturing, engineering, and business service providers on FirmsLedger.
            Compare by expertise, reviews, and location.
          </p>
          <Link
            href={directoryUrl}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Browse Service Providers →
          </Link>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
          <p>
            Last Updated: {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
            This article is for informational purposes. Verify current details directly with each provider.
          </p>
        </footer>
      </main>
    </article>
  );
}
