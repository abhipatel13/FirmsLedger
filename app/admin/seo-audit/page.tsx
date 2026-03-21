'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  ExternalLink, RefreshCw, XCircle, Wrench, FileText,
  ArrowRight, Copy, Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditIssue {
  check: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

interface PageAuditRow {
  id: string;
  page_url: string;
  score: number;
  issues: AuditIssue[];
  checks: Record<string, { passed: boolean; value: unknown; detail: string }>;
  audited_at: string;
}

interface DayAvg { date: string; avgScore: number; }

interface AuditData {
  latest: PageAuditRow[];
  overallTrend: DayAvg[];
  summary: { total: number; green: number; yellow: number; red: number; avgScore: number };
}

// ─── Fix guide per check key ─────────────────────────────────────────────────

const FIX_GUIDE: Record<string, { title: string; how: string; example?: string }> = {
  title_tag: {
    title: 'Fix Page Title',
    how: 'Update the <title> tag in your page metadata. Aim for 50–60 characters and include your primary keyword near the start.',
    example: "export const metadata = { title: 'Top Staffing Agencies in Sydney 2026 | FirmsLedger' }",
  },
  meta_description: {
    title: 'Fix Meta Description',
    how: 'Add or update <meta name="description"> in your page metadata. Write 120–155 characters with a clear benefit and call-to-action.',
    example: "export const metadata = { description: 'Find and compare the top verified staffing agencies in Sydney. Browse 200+ profiles, reviews, and pricing — free on FirmsLedger.' }",
  },
  h1_exists: {
    title: 'Add H1 Tag',
    how: 'Every page must have exactly one <h1> tag that matches the page topic. Place it prominently at the top of the content.',
    example: '<h1>Top Staffing Agencies in Sydney 2026</h1>',
  },
  image_alt_text: {
    title: 'Add Image Alt Text',
    how: 'Add descriptive alt attributes to every <img> tag. Screen readers and search engines rely on this to understand images.',
    example: '<img src="/agency-logo.png" alt="Acme Staffing agency logo" />',
  },
  canonical_url: {
    title: 'Add Canonical URL',
    how: 'Add a canonical link tag to prevent duplicate content penalties. Use the full absolute URL of the preferred version of the page.',
    example: '<link rel="canonical" href="https://firmsledger.com/directory/staffing" />',
  },
  internal_links: {
    title: 'Add Internal Links',
    how: 'Link to other relevant pages within your site. Internal links help search engines crawl your site and distribute link equity.',
    example: '<a href="/directory/staffing">Browse staffing agencies →</a>',
  },
  schema_markup: {
    title: 'Add Schema Markup',
    how: 'Add JSON-LD structured data to help search engines understand your content and qualify for rich results.',
    example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Top Staffing Agencies",
  "url": "https://firmsledger.com/directory/staffing"
}
</script>`,
  },
  seo_friendly_slug: {
    title: 'Fix URL Slug',
    how: 'Rename the route folder/file to use only lowercase letters, numbers, and hyphens. Avoid uppercase, spaces, or special characters.',
    example: '✅ /directory/top-staffing-agencies\n❌ /Directory/TopStaffing_Agencies',
  },
  word_count: {
    title: 'Increase Word Count',
    how: 'Pages with fewer than 300 words rarely rank well. Add meaningful content: FAQs, explanations, comparisons, or lists related to the topic.',
    example: 'Target 600–1200 words for category/landing pages and 1000+ for blog posts.',
  },
  open_graph_tags: {
    title: 'Add Open Graph Tags',
    how: 'Add og:title, og:description, and og:image meta tags for better previews when your pages are shared on social media.',
    example: `export const metadata = {
  openGraph: {
    title: 'Top Staffing Agencies in Sydney',
    description: 'Find verified staffing agencies...',
    images: ['/og-staffing.png'],
  },
}`,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(s: number) { return s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'; }
function scoreBg(s: number) { return s >= 80 ? 'bg-green-900/30 border-green-700/40' : s >= 60 ? 'bg-yellow-900/30 border-yellow-700/40' : 'bg-red-900/30 border-red-700/40'; }
function scoreLabel(s: number) { return s >= 80 ? 'Healthy' : s >= 60 ? 'Needs Review' : 'Critical'; }
function formatCheck(k: string) { return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

function SeverityBadge({ severity }: { severity: AuditIssue['severity'] }) {
  const map = {
    critical: 'bg-red-900/40 text-red-300 border-red-700/40',
    warning:  'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
    info:     'bg-blue-900/40 text-blue-300 border-blue-700/40',
  };
  const icons = {
    critical: <XCircle className="w-3 h-3" />,
    warning:  <AlertTriangle className="w-3 h-3" />,
    info:     <CheckCircle2 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${map[severity]}`}>
      {icons[severity]} {severity}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Issues Tab ──────────────────────────────────────────────────────────────

function IssuesTab({ pages }: { pages: PageAuditRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Collect all unique failing checks across all pages
  const issueMap = new Map<string, { severity: AuditIssue['severity']; affectedPages: { url: string; message: string }[] }>();

  for (const page of pages) {
    for (const issue of page.issues) {
      if (!issueMap.has(issue.check)) {
        issueMap.set(issue.check, { severity: issue.severity, affectedPages: [] });
      }
      issueMap.get(issue.check)!.affectedPages.push({ url: page.page_url, message: issue.message });
    }
  }

  const order = { critical: 0, warning: 1, info: 2 };
  const issues = Array.from(issueMap.entries())
    .sort(([, a], [, b]) => order[a.severity] - order[b.severity]);

  if (issues.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <p className="text-white font-semibold">No issues found</p>
        <p className="text-gray-500 text-sm mt-1">All audited pages passed their checks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map(([checkKey, { severity, affectedPages }]) => {
        const guide = FIX_GUIDE[checkKey];
        const isOpen = expanded === checkKey;
        return (
          <div key={checkKey} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Header row */}
            <button
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : checkKey)}
            >
              <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${
                severity === 'critical' ? 'bg-red-900/40 border-red-700/40' :
                severity === 'warning'  ? 'bg-yellow-900/40 border-yellow-700/40' :
                                          'bg-blue-900/40 border-blue-700/40'
              }`}>
                {severity === 'critical' ? <XCircle className="w-4 h-4 text-red-400" /> :
                 severity === 'warning'  ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                                           <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{guide?.title ?? formatCheck(checkKey)}</span>
                  <SeverityBadge severity={severity} />
                </div>
                <p className="text-gray-500 text-xs mt-0.5">
                  {affectedPages.length} page{affectedPages.length !== 1 ? 's' : ''} affected
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-xs text-blue-400 font-medium">
                  <Wrench className="w-3 h-3" /> How to fix
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>

            {/* Expanded: fix guide + affected pages */}
            {isOpen && (
              <div className="border-t border-gray-800 grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                {/* Fix guide */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">How to fix</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{guide?.how ?? 'Review and fix this check.'}</p>
                  </div>
                  {guide?.example && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Example</p>
                        <CopyButton text={guide.example} />
                      </div>
                      <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap font-mono">
                        {guide.example}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Affected pages */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Affected pages ({affectedPages.length})
                  </p>
                  <div className="space-y-2">
                    {affectedPages.map(({ url, message }) => {
                      let path = url;
                      try { path = new URL(url).pathname; } catch {}
                      return (
                        <div key={url} className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-gray-600 shrink-0 mt-1" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-200 font-mono truncate">{path}</span>
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-400 shrink-0">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Pages Tab ───────────────────────────────────────────────────────────────

function PagesTab({ pages }: { pages: PageAuditRow[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (pages.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500 text-sm">
        No audit data yet. Click "Run Audit Now" above.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="divide-y divide-gray-800">
        {pages.map((row) => {
          const isExpanded = expandedRow === row.id;
          const passedCount = Object.values(row.checks).filter(c => c.passed).length;
          const totalCount = Object.keys(row.checks).length;
          let pathname = row.page_url;
          try { pathname = new URL(row.page_url).pathname || '/'; } catch {}

          return (
            <div key={row.id}>
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedRow(isExpanded ? null : row.id)}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-base ${scoreBg(row.score)} ${scoreColor(row.score)}`}>
                  {row.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-100 truncate">{pathname}</span>
                    <a href={row.page_url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-gray-600 hover:text-blue-400 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-medium ${scoreColor(row.score)}`}>{scoreLabel(row.score)}</span>
                    <span className="text-xs text-gray-600">{passedCount}/{totalCount} checks</span>
                    {row.issues.length > 0 && (
                      <span className="text-xs text-orange-400">{row.issues.length} issue{row.issues.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                {/* Mini check dots */}
                <div className="hidden lg:flex gap-1 shrink-0">
                  {Object.entries(row.checks).map(([k, c]) => (
                    <div key={k} title={`${formatCheck(k)}: ${c.detail}`}
                      className={`w-2 h-2 rounded-full ${c.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                  ))}
                </div>
                <span className="hidden xl:block text-xs text-gray-600 shrink-0 w-20 text-right">
                  {new Date(row.audited_at).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 bg-gray-800/20 border-t border-gray-800">
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {/* All checks */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All Checks</p>
                      <div className="space-y-2">
                        {Object.entries(row.checks).map(([key, check]) => (
                          <div key={key} className="flex items-start gap-2.5 text-sm">
                            {check.passed
                              ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                              : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                            <div>
                              <span className="font-medium text-gray-200">{formatCheck(key)}</span>
                              <span className="text-gray-500 ml-1.5 text-xs">{check.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issues to fix for this page */}
                    {row.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Issues to Fix ({row.issues.length})
                        </p>
                        <div className="space-y-2">
                          {row.issues.map((issue, i) => (
                            <div key={i} className="bg-gray-900 rounded-lg p-3 flex items-start gap-3">
                              {issue.severity === 'critical'
                                ? <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                : issue.severity === 'warning'
                                ? <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                : <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                              <div>
                                <p className="text-sm font-medium text-gray-200">{FIX_GUIDE[issue.check]?.title ?? formatCheck(issue.check)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{issue.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SeoAuditPage() {
  const [data, setData]               = useState<AuditData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [tab, setTab]                 = useState<'issues' | 'pages'>('issues');

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/seo-audit', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function triggerAudit() {
    setTriggerLoading(true);
    try {
      const res = await fetch('/api/admin/seo-audit', { method: 'POST', credentials: 'include' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      await fetchData();
    } catch (e) {
      alert(`Audit failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setTriggerLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-gray-400 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading audit data…
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <p className="text-red-400 font-semibold mb-2">Failed to load</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Retry</button>
      </div>
    </div>
  );

  if (!data) return null;

  const { latest, overallTrend, summary } = data;

  // Count total issues across all pages
  const totalIssues = latest.reduce((n, p) => n + p.issues.length, 0);
  const criticalCount = latest.reduce((n, p) => n + p.issues.filter(i => i.severity === 'critical').length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">SEO Audit</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {latest.length} pages audited
            {totalIssues > 0 && <> · <span className="text-red-400 font-medium">{criticalCount} critical</span> · {totalIssues} total issues</>}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={triggerAudit} disabled={triggerLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {triggerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {triggerLoading ? 'Running…' : 'Run Audit Now'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Avg Score',      value: `${summary.avgScore}%`, color: scoreColor(summary.avgScore) },
          { label: 'Healthy (≥80)',  value: summary.green,          color: 'text-green-400' },
          { label: 'Needs Review',   value: summary.yellow,         color: 'text-yellow-400' },
          { label: 'Critical (<60)', value: summary.red,            color: 'text-red-400' },
          { label: 'Total Issues',   value: totalIssues,            color: totalIssues === 0 ? 'text-green-400' : 'text-orange-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {overallTrend.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">7-Day Score Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={overallTrend} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }}
                tickFormatter={(d: string) => new Date(d).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(v: number) => [`${v}%`, 'Avg Score']} />
              <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit mb-5">
          {([
            { id: 'issues', label: `Issues to Fix (${totalIssues})`, icon: Wrench },
            { id: 'pages',  label: `Page Scores (${latest.length})`,  icon: FileText },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {tab === 'issues' && <IssuesTab pages={latest} />}
        {tab === 'pages'  && <PagesTab  pages={latest} />}
      </div>
    </div>
  );
}
