'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Star, ArrowLeft, ArrowRight, CheckCircle, Loader2, Building2 } from 'lucide-react';
import { useSession } from '@/lib/auth';

const INPUT =
  'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors';

const TEXTAREA =
  'w-full min-h-[140px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors resize-y';

function StarInput({ value, onChange, label, required }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-orange-500"> *</span>}
      </p>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                n <= active ? 'fill-orange-400 text-orange-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500 min-w-[2ch]">{value || ''}</span>
      </div>
    </div>
  );
}

export default function WriteReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agencyParam = searchParams.get('agency') || '';

  const { user, loading: sessionLoading } = useSession();

  const [agency, setAgency] = useState(null);
  const [agencyLoading, setAgencyLoading] = useState(!!agencyParam);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    rating_overall: 0,
    rating_quality: 0,
    rating_communication: 0,
    rating_value: 0,
    rating_timeliness: 0,
    title: '',
    body: '',
    role_hired: '',
    company_name: '',
    work_duration: '',
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      const next = `/WriteReview${agencyParam ? `?agency=${encodeURIComponent(agencyParam)}` : ''}`;
      router.replace(`/auth?reason=review&next=${encodeURIComponent(next)}`);
    }
  }, [sessionLoading, user, agencyParam, router]);

  useEffect(() => {
    if (!agencyParam) { setAgencyLoading(false); return; }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setAgencyLoading(false); return; }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agencyParam);
    const filter = isUuid
      ? `id=eq.${encodeURIComponent(agencyParam)}`
      : `slug=eq.${encodeURIComponent(agencyParam)}`;

    fetch(`${supabaseUrl}/rest/v1/agencies?${filter}&select=id,name,slug,hq_city,hq_state,logo_url&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) setAgency(data[0]);
      })
      .catch(() => {})
      .finally(() => setAgencyLoading(false));
  }, [agencyParam]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agency?.id) {
      toast.error('Agency not found. Pick one from the directory first.');
      return;
    }
    if (!form.rating_overall) {
      toast.error('Please give an overall rating.');
      return;
    }
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and review body are required.');
      return;
    }
    if (form.body.trim().length < 30) {
      toast.error('Review body must be at least 30 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          agency_id: agency.id,
          user_id: user.id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit review.');
        return;
      }
      setSubmitted(true);
      toast.success('Review submitted! Pending approval.');
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-extrabold text-[#1A2E4A] mb-3">Review submitted!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thanks for sharing your experience. Your review is pending moderation and will appear
            on {agency?.name || 'the agency'}'s profile once approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {agency?.slug && (
              <Link href={`/agency/${agency.slug}`}>
                <button className="bg-[#1A2E4A] hover:bg-[#142339] text-white font-semibold px-6 h-11 rounded-lg w-full sm:w-auto">
                  Back to {agency.name}
                </button>
              </Link>
            )}
            <Link href="/directory">
              <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 h-11 rounded-lg w-full sm:w-auto">
                Browse Directory
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link
          href={agency?.slug ? `/agency/${agency.slug}` : '/directory'}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {agency?.slug ? `Back to ${agency.name}` : 'Back to directory'}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E4A] mb-2">Write a review</h1>
          <p className="text-slate-600">
            Share an honest, detailed experience to help others choose the right agency.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {agencyLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : !agency ? (
            <div className="px-6 sm:px-8 py-10 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold mb-1">No agency selected</p>
              <p className="text-slate-500 text-sm mb-5">
                Pick an agency from the directory to write a review.
              </p>
              <Link href="/directory">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 h-10 rounded-lg">
                  Browse Agencies
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-7">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {agency.logo_url ? (
                  <img
                    src={agency.logo_url}
                    alt={agency.name}
                    className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#1A2E4A] rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-400">
                      {agency.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#1A2E4A]">{agency.name}</p>
                  <p className="text-xs text-slate-500">
                    {[agency.hq_city, agency.hq_state].filter(Boolean).join(', ') || 'Reviewing this agency'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                  Your Ratings
                </p>
                <div className="space-y-4">
                  <StarInput
                    label="Overall"
                    required
                    value={form.rating_overall}
                    onChange={(v) => set('rating_overall', v)}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StarInput
                      label="Quality of work"
                      value={form.rating_quality}
                      onChange={(v) => set('rating_quality', v)}
                    />
                    <StarInput
                      label="Communication"
                      value={form.rating_communication}
                      onChange={(v) => set('rating_communication', v)}
                    />
                    <StarInput
                      label="Value for money"
                      value={form.rating_value}
                      onChange={(v) => set('rating_value', v)}
                    />
                    <StarInput
                      label="Timeliness"
                      value={form.rating_timeliness}
                      onChange={(v) => set('rating_timeliness', v)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Your Review
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Title <span className="text-orange-500">*</span>
                    </label>
                    <input
                      className={INPUT}
                      required
                      maxLength={120}
                      placeholder="Summarize your experience"
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Review <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      className={TEXTAREA}
                      required
                      minLength={30}
                      maxLength={4000}
                      placeholder="What did they do well? What could improve? Be specific."
                      value={form.body}
                      onChange={(e) => set('body', e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {form.body.length} / 4000 — minimum 30 characters
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Engagement Details (optional)
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Role hired for
                    </label>
                    <input
                      className={INPUT}
                      placeholder="e.g. Senior React Developer"
                      value={form.role_hired}
                      onChange={(e) => set('role_hired', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Work duration
                    </label>
                    <input
                      className={INPUT}
                      placeholder="e.g. 6 months"
                      value={form.work_duration}
                      onChange={(e) => set('work_duration', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Your company
                    </label>
                    <input
                      className={INPUT}
                      placeholder="Company you worked at"
                      value={form.company_name}
                      onChange={(e) => set('company_name', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
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
                    <>
                      Submit review <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-500 sm:ml-2 sm:self-center">
                  Reviews are moderated before publishing.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
