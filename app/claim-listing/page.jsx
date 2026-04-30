'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CheckCircle, Building2, Shield, ArrowRight, Crown,
  Star, Mail, Phone, Globe, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth';

const PLANS = {
  pro: {
    name: 'Pro',
    price: '$49/mo',
    features: ['Verified badge', 'Priority search placement', 'Analytics dashboard', 'Lead notifications', 'Respond to reviews'],
  },
  featured: {
    name: 'Featured',
    price: '$149/mo',
    features: ['Everything in Pro', 'Featured badge', 'Homepage spotlight', 'Top of category', 'Dedicated account manager'],
  },
};

export default function ClaimListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agencySlug = searchParams.get('agency') || '';
  const planParam = searchParams.get('plan') || 'pro';
  const selectedPlan = PLANS[planParam] || PLANS.pro;

  const { user, loading: sessionLoading } = useSession();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(!!agencySlug);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    company_name: '',
    plan: planParam === 'featured' ? 'featured' : 'pro',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auth gate: redirect to /auth if not signed in
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      const params = new URLSearchParams();
      if (agencySlug) params.set('agency', agencySlug);
      if (planParam) params.set('plan', planParam);
      const claimUrl = `/claim-listing${params.toString() ? `?${params}` : ''}`;
      router.replace(`/auth?reason=claim&next=${encodeURIComponent(claimUrl)}`);
    }
  }, [sessionLoading, user, agencySlug, planParam, router]);

  // Pre-fill email + name from session user once loaded
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email || '',
      name: f.name || user.user_metadata?.full_name || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!agencySlug) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }

    fetch(`${supabaseUrl}/rest/v1/agencies?slug=eq.${encodeURIComponent(agencySlug)}&select=id,name,slug,hq_city,hq_state,logo_url,verified&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setAgency(data[0]);
          setForm((f) => ({ ...f, company_name: data[0].name }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agencySlug]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          agency_id: agency?.id || null,
          agency_slug: agencySlug || null,
          user_id: user?.id || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      toast.success('Claim request submitted!');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Block render until auth resolves; redirect handled in effect above
  if (sessionLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A2E4A] mb-3">Claim request received!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We'll verify your identity and contact you at <strong className="text-slate-700">{form.email}</strong> within
            1 business day to complete your {PLANS[form.plan]?.name || 'Pro'} setup{form.plan !== 'free' ? ' and payment' : ''}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/directory">
              <Button className="bg-[#1A2E4A] hover:bg-[#1a2f4a] text-white font-semibold px-6 h-11 rounded-lg">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <div className="bg-[#1A2E4A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 mb-5">
              <Crown className="w-3.5 h-3.5 text-[#F5A623]" /> Claim & upgrade your listing
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              {agency ? `Claim ${agency.name}` : 'Claim Your Staffing Agency Listing'}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Take ownership of your profile, get verified, and unlock premium features to attract more clients.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-start max-w-5xl mx-auto">

          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#1A2E4A]">Verify your ownership</h2>
              <p className="text-slate-500 text-sm mt-1">Fill in your details. We'll verify you're authorized to manage this listing.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-6">
                {/* Agency info */}
                {agency && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {agency.logo_url ? (
                      <img src={agency.logo_url} alt={agency.name} className="w-12 h-12 rounded-lg object-contain border border-slate-100" />
                    ) : (
                      <div className="w-12 h-12 bg-[#1A2E4A] rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-400">{agency.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#1A2E4A]">{agency.name}</p>
                      <p className="text-xs text-slate-500">{[agency.hq_city, agency.hq_state].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-orange-500">*</span></label>
                      <input className={INPUT} required placeholder="Jane Doe" value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Work Email <span className="text-orange-500">*</span></label>
                      <input className={INPUT} type="email" required placeholder="you@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
                      <input className={INPUT} type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Your Role <span className="text-orange-500">*</span></label>
                      <select className={INPUT} required value={form.role} onChange={(e) => set('role', e.target.value)}>
                        <option value="">Select...</option>
                        <option value="owner">Owner / CEO</option>
                        <option value="marketing">Marketing / BD</option>
                        <option value="operations">Operations</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Company name (if no agency pre-selected) */}
                {!agency && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Company Name <span className="text-orange-500">*</span></label>
                    <input className={INPUT} required placeholder="Your Staffing Agency" value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
                  </div>
                )}

                {/* Plan selection */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Select Plan</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(PLANS).map(([key, plan]) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          form.plan === key
                            ? 'border-orange-400 bg-orange-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={key}
                          checked={form.plan === key}
                          onChange={() => set('plan', key)}
                          className="mt-1 accent-orange-500"
                        />
                        <div>
                          <p className="font-bold text-[#1A2E4A] text-sm">{plan.name} — {plan.price}</p>
                          <ul className="mt-1.5 space-y-0.5">
                            {plan.features.slice(0, 3).map((f) => (
                              <li key={f} className="text-xs text-slate-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit Claim Request <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-[#1A2E4A] mb-4">How claiming works</h3>
              <div className="space-y-4">
                {[
                  { title: 'Submit your claim', desc: 'Tell us who you are and which listing is yours.' },
                  { title: 'We verify your identity', desc: 'We confirm you work at the company via email or phone.' },
                  { title: 'Set up payment', desc: 'Complete Stripe checkout for your chosen plan.' },
                  { title: 'Take control', desc: 'Update your profile, respond to reviews, and track leads.' },
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

            <div className="bg-[#1A2E4A] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#F5A623]" />
                <span className="font-bold text-sm">Secure & verified</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                All claim requests are manually reviewed. We never give access to unauthorized individuals. Your payment is processed securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT = 'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors';
