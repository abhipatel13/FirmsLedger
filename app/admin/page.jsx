'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText, Search, Globe, Building2, Mail,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  RefreshCw, ExternalLink, ArrowRight,
} from 'lucide-react';

const STATUS_COLORS = {
  pending:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  processing: 'bg-blue-900/40   text-blue-300   border-blue-700/40',
  done:       'bg-green-900/40  text-green-300  border-green-700/40',
  failed:     'bg-red-900/40    text-red-300    border-red-700/40',
  published:  'bg-green-900/40  text-green-300  border-green-700/40',
};

function StatCard({ icon: Icon, label, value, sub, color = 'blue', href }) {
  const colorMap = {
    blue:   'bg-blue-600/20   text-blue-400   border-blue-600/30',
    green:  'bg-green-600/20  text-green-400  border-green-600/30',
    yellow: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    red:    'bg-red-600/20    text-red-400    border-red-600/30',
  };
  const card = (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {href && <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />}
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      {status}
    </span>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading stats…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">{error}</div>
        <button onClick={load} className="mt-3 text-sm text-blue-400 hover:underline">Retry</button>
      </div>
    );
  }

  const s = stats;
  const seoScore = s?.seoAudit?.avgScore;

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">FirmsLedger automation dashboard</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Blogs Published"
          value={s?.totalPublished}
          sub={`${s?.topics?.pending ?? 0} topics pending`}
          color="blue"
          href="/admin/blogs"
        />
        <StatCard
          icon={Search}
          label="SEO Avg Score"
          value={seoScore != null ? `${seoScore}%` : 'No data'}
          sub={s?.seoAudit?.lastRun ? `Last run ${new Date(s.seoAudit.lastRun).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : 'Never run'}
          color={seoScore >= 80 ? 'green' : seoScore >= 60 ? 'yellow' : 'red'}
          href="/admin/seo-audit"
        />
        <StatCard
          icon={Globe}
          label="URL Submissions"
          value={s?.submissions?.last7days}
          sub="Last 7 days"
          color="purple"
          href="/admin/submissions"
        />
        <StatCard
          icon={Building2}
          label="Total Agencies"
          value={s?.agencies?.total}
          sub={s?.agencies?.pending > 0 ? `${s.agencies.pending} pending approval` : 'All approved'}
          color={s?.agencies?.pending > 0 ? 'yellow' : 'green'}
          href="/admin/campaigns"
        />
      </div>

      {/* Blog topic queue breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending', value: s?.topics?.pending, icon: Clock, color: 'text-yellow-400' },
          { label: 'Processing', value: s?.topics?.processing, icon: RefreshCw, color: 'text-blue-400' },
          { label: 'Done', value: s?.topics?.done, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Failed', value: s?.topics?.failed, icon: AlertCircle, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Two-column: recent blogs + recent topics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent published posts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-200">Recent Posts</h2>
            <Link href="/admin/blogs" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(s?.recentBlogs ?? []).length === 0 ? (
            <p className="px-5 py-8 text-gray-500 text-sm text-center">No posts yet</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {(s?.recentBlogs ?? []).map((post) => (
                <div key={post.slug} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.category} · {new Date(post.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <a
                    href={`/blogs/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent topic queue */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-200">Recent Topics</h2>
            <Link href="/admin/blogs" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(s?.recentTopics ?? []).length === 0 ? (
            <p className="px-5 py-8 text-gray-500 text-sm text-center">No topics yet</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {(s?.recentTopics ?? []).map((t) => (
                <div key={t.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 truncate">{t.prompt}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(t.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick action links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Blog Topics',     href: '/admin/blogs',       icon: FileText },
          { label: 'Run SEO Audit',       href: '/admin/seo-audit',   icon: Search },
          { label: 'Check Submissions',   href: '/admin/submissions', icon: Globe },
          { label: 'Email Agencies',      href: '/admin/campaigns',   icon: Mail },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <Icon className="w-4 h-4 text-blue-400 shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
