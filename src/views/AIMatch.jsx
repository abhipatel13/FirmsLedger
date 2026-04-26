'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Star, MapPin, Users, Calendar,
  RotateCcw, CheckCircle2, CheckCircle, AlertCircle,
  ArrowUp, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAgencyLogoUrl, getCompanyProfileUrl } from '@/utils';

/* ── Loading steps ─────────────────────────────────── */
const STEPS = [
  { label: 'Reading your requirement...', sub: 'Parsing intent and keywords' },
  { label: 'Scanning verified agencies...', sub: 'Searching across our database' },
  { label: 'Calculating match scores...', sub: 'Running AI relevance analysis' },
  { label: 'Preparing results...', sub: 'Almost there' },
];

/* ── Loading screen ─────────────────────────────────── */
function LoadingState({ query }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* Header */}
      <div className="bg-[#1A2E4A] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-orange-400/30 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Finding your best matches</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            AI is analysing your requirement: <span className="text-white font-medium">"{query}"</span>
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-sm mx-auto px-4 pt-12 w-full">
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 transition-all duration-500 ${i > step ? 'opacity-30' : 'opacity-100'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                i < step ? 'bg-green-500' : i === step ? 'bg-orange-500' : 'bg-slate-200'
              }`}>
                {i < step
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  : i === step
                  ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  : <div className="w-2 h-2 bg-slate-400 rounded-full" />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${i === step ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</p>
                {i === step && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">Usually takes 3–5 seconds · Powered by GPT-4o</p>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────── */
export default function AIMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newQuery, setNewQuery] = useState(query);
  const inputRef = useRef(null);

  const runMatch = async (q) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 5) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount / query change
  useEffect(() => {
    if (query) {
      setNewQuery(query);
      runMatch(query);
    }
  }, [query]);

  const handleNewSearch = () => {
    const trimmed = newQuery.trim();
    if (!trimmed || trimmed.length < 5) return;
    router.push(`/ai-match?q=${encodeURIComponent(trimmed)}`);
  };

  if (loading) return <LoadingState query={query} />;

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => runMatch(query)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  /* ── No query ── */
  if (!query) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Describe what you need</h2>
        <p className="text-slate-500 text-sm mb-6">Go back to the home page and use the AI Matchmaker.</p>
        <Link href="/" className="text-orange-500 font-semibold hover:text-orange-600 text-sm">← Back to Home</Link>
      </div>
    );
  }

  /* ── Results ── */
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <div className="bg-[#1A2E4A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">AI Match Results</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
            Top matches for your requirement
          </h1>

          {result?.summary && (
            <p className="text-slate-300 text-sm leading-relaxed mb-3 max-w-2xl border-l-2 border-orange-500 pl-3">
              {result.summary}
            </p>
          )}
          {result?.meta && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Searched {result.meta.candidates_searched} verified companies
              </span>
              {result.meta.categories_matched?.slice(0, 3).map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Re-search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                ref={inputRef}
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewSearch()}
                placeholder="Try a different requirement..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white/15"
              />
            </div>
            <button
              onClick={handleNewSearch}
              disabled={!newQuery.trim() || newQuery.trim() === query}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-5 rounded-xl text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Cards — mirror the Directory listing card with AI score + reason */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-3">
        {result?.matches?.map((match, index) => {
          const profileUrl = getCompanyProfileUrl(match);
          const locationText = [match.hq_city, match.hq_country].filter(Boolean).join(', ');
          const scoreColor = match.score >= 85 ? 'bg-green-50 text-green-700 border-green-200'
            : match.score >= 70 ? 'bg-orange-50 text-orange-700 border-orange-200'
            : 'bg-slate-50 text-slate-600 border-slate-200';
          return (
            <div
              key={match.id}
              className={`bg-white rounded-2xl border overflow-hidden card-hover ${
                index === 0 ? 'border-orange-200 shadow-md shadow-orange-500/10' : 'border-slate-100'
              }`}
            >
              {/* Rank banner */}
              {index === 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Best Match</span>
                  <span className="ml-auto text-[10px] text-white/80 font-medium">Highest AI score</span>
                </div>
              )}
              {index === 1 && (
                <div className="bg-slate-700 px-5 py-2 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest"># 2 · Runner Up</span>
                </div>
              )}
              {index === 2 && (
                <div className="bg-slate-100 px-5 py-2 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest"># 3 · Also Consider</span>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Rank + Logo (Directory style) */}
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <div className={`px-2 py-0.5 rounded border text-[11px] font-black flex-shrink-0 mt-0.5 ${scoreColor}`}>
                      {match.score}
                    </div>
                    <img
                      src={getAgencyLogoUrl(match)}
                      alt={match.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name || '?')}&background=1A2E4A&color=fff&size=128&bold=true`;
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-contain border border-slate-100 bg-white"
                    />
                  </div>

                  {/* Main */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Link href={profileUrl}>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 hover:text-orange-600 transition-colors">
                              {match.name}
                            </h3>
                          </Link>
                          {match.verified && (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-green-200">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                          {match.highlight && (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-100">
                              <Sparkles className="w-2.5 h-2.5" /> {match.highlight}
                            </span>
                          )}
                        </div>

                        {/* Rating row */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(match.avg_rating || 0) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-base font-bold text-slate-900">{(match.avg_rating || 0).toFixed(1)}</span>
                          <Link href={profileUrl + '#reviews'} className="text-sm text-slate-500 hover:underline">
                            {match.review_count || 0} Reviews
                          </Link>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-base leading-relaxed line-clamp-2 mb-3">
                          {match.description || `${match.name} is a verified service provider${match.hq_city ? ` based in ${match.hq_city}` : ''}.`}
                        </p>

                        {/* AI reason */}
                        {match.reason && (
                          <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-3">
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Why this match
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">{match.reason}</p>
                          </div>
                        )}

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-2">
                          {match.team_size && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                              <Users className="w-3.5 h-3.5" /> {match.team_size}
                            </span>
                          )}
                          {match.founded_year && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                              <Calendar className="w-3.5 h-3.5" /> Est. {match.founded_year}
                            </span>
                          )}
                          {locationText && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                              <MapPin className="w-3.5 h-3.5" /> {locationText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (no Get Proposal — matches Directory) */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:w-36 flex-shrink-0">
                        <Link href={profileUrl} className="flex-1 lg:flex-none">
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold h-10 rounded-md transition-colors">
                            View Profile
                          </Button>
                        </Link>
                        {match.website && (
                          <a href={match.website} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:border-slate-300 text-sm font-semibold h-10 rounded-md">
                              Website <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            AI-matched from verified agencies · Match scores are indicative and not endorsements
          </p>
          <Link
            href="/directory"
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap"
          >
            Browse all agencies →
          </Link>
        </div>
      </div>
    </div>
  );
}
