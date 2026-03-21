'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { toast } from 'sonner';
import {
  CheckCircle, Building2, Globe, Users, TrendingUp,
  Star, Shield, ArrowRight, ChevronRight, Zap,
} from 'lucide-react';

const TEAM_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Reach More Clients',
    desc: 'Get discovered by thousands of businesses actively searching for your services every month.',
  },
  {
    icon: Shield,
    title: 'Build Trust & Credibility',
    desc: 'A verified listing with reviews and ratings signals reliability to potential clients.',
  },
  {
    icon: Zap,
    title: 'Free to Get Started',
    desc: 'Create your basic listing at no cost. Upgrade to Featured for even more visibility.',
  },
];

const STATS = [
  { value: '10,000+', label: 'Companies Listed' },
  { value: '50+',     label: 'Countries' },
  { value: '200K+',   label: 'Monthly Visitors' },
];

const STEPS = [
  { n: '1', label: 'Submit your details' },
  { n: '2', label: 'We review your profile' },
  { n: '3', label: 'Go live in the directory' },
];

export default function ListYourCompanyPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company_name: '',
    website: '', hq_city: '', hq_state: '', hq_country: '',
    team_size: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitListingRequest({
        ...form,
        team_size: form.team_size || undefined,
      });
      setSubmitted(true);
      toast.success('Your listing request has been submitted!');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1B2A] mb-3">You're on the list!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We've received your submission and will review your company profile within 1–2 business days.
            We'll reach out at <strong className="text-slate-700">{form.email}</strong> once your listing is live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={createPageUrl('Directory')}>
              <button className="px-6 py-3 bg-[#0D1B2A] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2e47] transition-colors">
                Browse Directory
              </button>
            </Link>
            <Link href={createPageUrl('Home')}>
              <button className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0D1B2A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 mb-6">
              <Star className="w-3.5 h-3.5 text-[#F5A623]" /> Free to list · No credit card required
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Get your company in front of<br />
              <span className="text-[#F5A623]">thousands of buyers</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              FirmsLedger is the global directory where businesses find verified service providers.
              Submit your listing today and start winning new clients.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Process steps ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-0">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.n}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0D1B2A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block mx-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 xl:gap-16 items-start">

          {/* ── Left: Benefits + form ──────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-[#0D1B2A] text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-[#0D1B2A]">Tell us about your company</h2>
                <p className="text-slate-500 text-sm mt-1">All fields marked * are required. We'll review your listing within 1–2 business days.</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-6">

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Your Name" required>
                      <input className={INPUT} required placeholder="Jane Doe"
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </Field>
                    <Field label="Work Email" required>
                      <input className={INPUT} type="email" required placeholder="you@company.com"
                        value={form.email} onChange={e => set('email', e.target.value)} />
                    </Field>
                    <Field label="Phone">
                      <input className={INPUT} type="tel" placeholder="+1 234 567 8900"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Company Information</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Company Name" required>
                      <input className={INPUT} required placeholder="Acme Agency"
                        value={form.company_name} onChange={e => set('company_name', e.target.value)} />
                    </Field>
                    <Field label="Website">
                      <input className={INPUT} type="url" placeholder="https://yourcompany.com"
                        value={form.website} onChange={e => set('website', e.target.value)} />
                    </Field>
                    <Field label="Team Size">
                      <select className={INPUT} value={form.team_size} onChange={e => set('team_size', e.target.value)}>
                        <option value="">Select…</option>
                        {TEAM_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Location</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Field label="City">
                      <input className={INPUT} placeholder="New York"
                        value={form.hq_city} onChange={e => set('hq_city', e.target.value)} />
                    </Field>
                    <Field label="State / Region">
                      <input className={INPUT} placeholder="NY"
                        value={form.hq_state} onChange={e => set('hq_state', e.target.value)} />
                    </Field>
                    <Field label="Country">
                      <input className={INPUT} placeholder="United States"
                        value={form.hq_country} onChange={e => set('hq_country', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* About */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">About Your Company</p>
                  <textarea
                    className={`${INPUT} resize-none`}
                    rows={4}
                    placeholder="Describe the services you offer, industries you serve, and what makes your company stand out…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>Submit Listing <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="text-xs text-slate-400 self-center">
                    By submitting, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right: Sidebar info ────────────────────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {/* What happens next */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-[#0D1B2A] mb-4">What happens next?</h3>
              <div className="space-y-4">
                {[
                  { title: 'We review your submission', desc: 'Our team checks your details within 1–2 business days.' },
                  { title: 'Profile goes live', desc: 'Your company appears in the directory and starts receiving visibility.' },
                  { title: 'Clients find you', desc: 'Businesses searching for your services can discover and contact you.' },
                  { title: 'Collect reviews', desc: 'Ask satisfied clients to leave reviews to boost your ranking.' },
                ].map(({ title, desc }, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included in free listing */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-[#0D1B2A] mb-4">Included in your free listing</h3>
              <ul className="space-y-2.5">
                {[
                  'Company profile page',
                  'Search & filter visibility',
                  'Collect client reviews',
                  'Direct contact button',
                  'Location & service tags',
                  'Shareable profile URL',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust note */}
            <div className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#F5A623]" />
                <span className="font-bold text-sm">Verified directory</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Every listing is manually reviewed before going live. We ensure only legitimate businesses are featured, so clients can trust the results they find.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const INPUT = 'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
