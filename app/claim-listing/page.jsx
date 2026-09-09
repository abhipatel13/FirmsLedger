'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle, Shield, ArrowRight, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth';

const ROLES = [
  { value: 'owner',      label: 'Owner / CEO' },
  { value: 'marketing',  label: 'Marketing / BD' },
  { value: 'operations', label: 'Operations' },
  { value: 'other',      label: 'Other' },
];

export default function ClaimListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    }>
      <ClaimListingContent />
    </Suspense>
  );
}

function ClaimListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agencySlug = searchParams.get('agency') || '';

  const { user, loading: sessionLoading } = useSession();

  // The company being claimed. Locked when it came from the URL, otherwise
  // chosen through the typeahead below.
  const [company, setCompany] = useState(null);
  const [lookingUp, setLookingUp] = useState(!!agencySlug);

  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auth gate: a claim is tied to an account, so sign in first.
  useEffect(() => {
    if (sessionLoading || user) return;
    const claimUrl = `/claim-listing${agencySlug ? `?agency=${encodeURIComponent(agencySlug)}` : ''}`;
    router.replace(`/auth?reason=claim&next=${encodeURIComponent(claimUrl)}`);
  }, [sessionLoading, user, agencySlug, router]);

  // Prefill from the signed-in account.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email || '',
      name: f.name || user.full_name || '',
    }));
  }, [user]);

  // Resolve ?agency=<slug> to a real listing.
  useEffect(() => {
    if (!agencySlug) return;
    let alive = true;
    fetch(`/api/search?slug=${encodeURIComponent(agencySlug)}`)
      .then((r) => r.json())
      .then((rows) => { if (alive && rows?.[0]) setCompany(rows[0]); })
      .catch(() => {})
      .finally(() => { if (alive) setLookingUp(false); });
    return () => { alive = false; };
  }, [agencySlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) {
      toast.error('Please find and select your company first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_slug: company.slug,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to submit your claim.');
      setSubmitted(true);
      toast.success('Claim submitted for review.');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A2E4A] mb-3">Claim submitted</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Our team reviews every claim by hand to make sure listings only go to the people who run
            them. We&apos;ll email <strong className="text-slate-700">{form.email}</strong> once
            <strong className="text-slate-700"> {company?.name}</strong> has been reviewed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button className="bg-[#1A2E4A] hover:bg-[#1a2f4a] text-white font-semibold px-6 h-11 rounded-lg w-full sm:w-auto">
                Go to your dashboard
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" className="font-semibold px-6 h-11 rounded-lg w-full sm:w-auto">
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
      <div className="text-white" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 mb-5">
              <Shield className="w-3.5 h-3.5 text-[#F5A623]" /> Claim your listing
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              {company ? `Claim ${company.name}` : 'Claim Your Company Listing'}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Take ownership of your profile so you control how your company appears to buyers.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-start max-w-5xl mx-auto">

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#1A2E4A]">Verify your ownership</h2>
              <p className="text-slate-500 text-sm mt-1">
                Find your existing listing and tell us who you are. We&apos;ll confirm you&apos;re
                authorised before handing over control.
              </p>
            </div>

            {sessionLoading || lookingUp ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : !user ? (
              <div className="px-6 sm:px-8 py-16 text-center">
                <p className="text-slate-600 text-sm mb-4">Sign in to claim this listing.</p>
                <Button
                  onClick={() => router.push(`/auth?reason=claim&next=${encodeURIComponent('/claim-listing')}`)}
                  className="bg-[#1A2E4A] hover:bg-[#1a2f4a] text-white font-semibold px-6 h-11 rounded-lg"
                >
                  Sign In to Continue
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Your Company
                  </p>
                  <CompanyPicker
                    company={company}
                    locked={!!agencySlug && !!company}
                    onSelect={setCompany}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="claim-name" className="block text-xs font-medium text-slate-600 mb-1.5">
                        Full Name <span className="text-orange-500">*</span>
                      </label>
                      <input
                        id="claim-name" className={INPUT} required placeholder="Jane Doe"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="claim-email" className="block text-xs font-medium text-slate-600 mb-1.5">
                        Work Email <span className="text-orange-500">*</span>
                      </label>
                      <input
                        id="claim-email" className={INPUT} type="email" required placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        An email at your company&apos;s own domain speeds up review.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="claim-phone" className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
                      <input
                        id="claim-phone" className={INPUT} type="tel" placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="claim-role" className="block text-xs font-medium text-slate-600 mb-1.5">
                        Your Role <span className="text-orange-500">*</span>
                      </label>
                      <select
                        id="claim-role" className={INPUT} required value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      >
                        <option value="">Select...</option>
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting || !company}
                    className="flex items-center justify-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <>Submit Claim <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-[#1A2E4A] mb-4">How claiming works</h3>
              <div className="space-y-4">
                {[
                  { title: 'Find your listing', desc: 'Search the directory and select the company that’s yours.' },
                  { title: 'Submit your claim', desc: 'Tell us who you are and how to reach you.' },
                  { title: 'We verify you', desc: 'Our team checks you’re authorised to manage the listing.' },
                  { title: 'Take control', desc: 'Once approved, you can keep your profile accurate and up to date.' },
                ].map(({ title, desc }, i) => (
                  <div key={title} className="flex gap-3">
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

            <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#F5A623]" />
                <span className="font-bold text-sm">Secure &amp; verified ownership</span>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300 text-xs leading-relaxed">
                  Every claim is reviewed by a person. We check email domains and cross-reference the
                  details on the listing, so control is never handed to someone who isn&apos;t authorised.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Once verified, you can keep your capabilities, certifications and contact details
                  accurate — the information buyers use to shortlist you.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Claiming your listing is free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Company picker. Searches the EXISTING directory rather than letting anyone
 * type a free-text company name — a claim must attach to a listing we already
 * have, otherwise we get duplicate companies. People who genuinely aren't
 * listed are sent to /list-your-company instead.
 */
function CompanyPicker({ company, locked, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [touched, setTouched] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    if (company) return;
    const q = query.trim();
    clearTimeout(debounce.current);
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const rows = await res.json();
        setResults(Array.isArray(rows) ? rows.slice(0, 8) : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
        setTouched(true);
      }
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [query, company]);

  if (company) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        {company.logo_url ? (
          <img src={company.logo_url} alt="" width={48} height={48}
               className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-white" />
        ) : (
          <div className="w-12 h-12 bg-[#1A2E4A] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-orange-400">{company.name?.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#1A2E4A] truncate">{company.name}</p>
          <p className="text-xs text-slate-500 truncate">
            {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ') || 'Location not listed'}
          </p>
        </div>
        {!locked && (
          <button
            type="button"
            onClick={() => { onSelect(null); setQuery(''); setResults([]); setTouched(false); }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" /> Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="claim-company-search" className="block text-xs font-medium text-slate-600 mb-1.5">
        Search for your company <span className="text-orange-500">*</span>
      </label>
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="claim-company-search"
          className={`${INPUT} pl-9`}
          placeholder="Start typing your company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {searching && (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {results.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <p className="text-sm font-semibold text-[#1A2E4A]">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {[c.hq_city, c.hq_state_label].filter(Boolean).join(', ') || 'Location not listed'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {touched && !searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">
          No listing matches that name.{' '}
          <Link href="/list-your-company" className="font-semibold text-orange-600 hover:underline">
            Add your company instead
          </Link>.
        </p>
      )}
    </div>
  );
}

const INPUT = 'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors';
