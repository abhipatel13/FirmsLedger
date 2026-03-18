'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Star, MapPin, Users, Building2,
  ChevronRight, RotateCcw, CheckCircle2, AlertCircle,
  ArrowUp, ExternalLink, FileText,
} from 'lucide-react';

/* ── Loading steps ─────────────────────────────────── */
const STEPS = [
  { label: 'Reading your requirement...', sub: 'Parsing intent and keywords' },
  { label: 'Scanning verified agencies...', sub: 'Searching across our database' },
  { label: 'Calculating match scores...', sub: 'Running AI relevance analysis' },
  { label: 'Preparing results...', sub: 'Almost there' },
];

/* ── Score ring ─────────────────────────────────────── */
function ScoreRing({ score }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f97316' : '#94a3b8';
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair';
  const r = 26;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
          <circle
            cx="30" cy="30" r={r} fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

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
      <div className="bg-[#0D1B2A] text-white py-12 px-4">
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
      <div className="bg-[#0D1B2A] text-white">
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
            <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-2xl border-l-2 border-orange-500 pl-3">
              {result.summary}
            </p>
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

      {/* Cards */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {result?.matches?.map((match, index) => (
          <div
            key={match.id}
            className={`bg-white rounded-2xl border overflow-hidden transition-all ${
              index === 0
                ? 'border-orange-200 shadow-md shadow-orange-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {/* Best match banner */}
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
                {/* Score ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={match.score} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + highlight badge */}
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <Link
                      href={match.slug ? `/companies/${match.slug}` : '#'}
                      className="text-lg font-extrabold text-slate-900 hover:text-orange-600 transition-colors leading-tight"
                    >
                      {match.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100 flex-shrink-0 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {match.highlight}
                    </span>
                  </div>

                  {/* Rating */}
                  {match.avg_rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(match.avg_rating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{Number(match.avg_rating).toFixed(1)}</span>
                      <span className="text-xs text-slate-400">· {match.review_count} reviews</span>
                    </div>
                  )}

                  {/* AI Reason */}
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Why this match
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">{match.reason}</p>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.location && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {match.location}
                      </span>
                    )}
                    {match.team_size && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {match.team_size} employees
                      </span>
                    )}
                    {match.services?.slice(0, 2).map(s => (
                      <span key={s} className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {s}
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-2">
                    <Link href={match.slug ? `/companies/${match.slug}` : '#'}>
                      <button className="flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#162840] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                        View Full Profile <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={match.slug ? `/RequestProposal?agency=${match.slug}` : '#'}>
                      <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                        <FileText className="w-4 h-4" /> Get Proposal
                      </button>
                    </Link>
                    {match.website && (
                      <a href={match.website} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                          Website <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

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
