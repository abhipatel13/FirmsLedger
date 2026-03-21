'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, RefreshCw, CheckCircle2, XCircle, Minus, ExternalLink, Send } from 'lucide-react';

const PLATFORM_COLORS = {
  google:        'bg-blue-900/40   text-blue-300   border-blue-700/40',
  bing:          'bg-green-900/40  text-green-300  border-green-700/40',
  yandex:        'bg-orange-900/40 text-orange-300 border-orange-700/40',
  pingomatic:    'bg-purple-900/40 text-purple-300 border-purple-700/40',
  google_sitemap:'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
  pingmyurl:     'bg-pink-900/40   text-pink-300   border-pink-700/40',
};

const STATUS_ICON = {
  success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  failed:  <XCircle      className="w-4 h-4 text-red-400" />,
  skipped: <Minus        className="w-4 h-4 text-gray-500" />,
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function SubmissionsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');  // 'all' | 'success' | 'failed' | 'skipped'
  const [platformFilter, setPlatformFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, skipped: 0 });
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/submissions', { credentials: 'include' });
      const json = await res.json();
      const rows = json.data ?? [];
      setLogs(rows);
      setStats({
        total:   rows.length,
        success: rows.filter((r) => r.status === 'success').length,
        failed:  rows.filter((r) => r.status === 'failed').length,
        skipped: rows.filter((r) => r.status === 'skipped').length,
      });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerSubmit = async () => {
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await fetch('/api/admin/submissions', { method: 'POST', credentials: 'include' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      setTriggerMsg(d.submitted === 0 ? 'No new URLs to submit.' : `Submitted ${d.submitted} URL${d.submitted !== 1 ? 's' : ''}.`);
      await load();
    } catch (e) {
      setTriggerMsg(`Error: ${e.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const platforms = ['all', ...new Set(logs.map((l) => l.platform))];

  const filtered = logs.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (platformFilter !== 'all' && l.platform !== platformFilter) return false;
    return true;
  });

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">URL Submissions</h1>
          <p className="text-gray-400 text-sm mt-0.5">Log of all URL submissions to search engines and ping services</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={triggerSubmit} disabled={triggering} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {triggering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {triggering ? 'Submitting…' : 'Submit URLs Now'}
          </button>
        </div>
      </div>
      {triggerMsg && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300">
          {triggerMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: stats.total,   color: 'text-white' },
          { label: 'Success', value: stats.success, color: 'text-green-400' },
          { label: 'Failed',  value: stats.failed,  color: 'text-red-400' },
          { label: 'Skipped', value: stats.skipped, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
          {['all', 'success', 'failed', 'skipped'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500 capitalize"
        >
          {platforms.map((p) => (
            <option key={p} value={p}>{p === 'all' ? 'All platforms' : p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Globe className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No submissions found.</p>
            <p className="text-gray-600 text-xs mt-1">Click "Submit URLs Now" above to manually trigger, or wait for the 9 AM UTC cron.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50">
                  {['Status', 'URL', 'Platform', 'Submitted', 'Response'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {STATUS_ICON[log.status] ?? STATUS_ICON.skipped}
                        <span className={`text-xs font-medium capitalize ${
                          log.status === 'success' ? 'text-green-400' :
                          log.status === 'failed'  ? 'text-red-400' : 'text-gray-500'
                        }`}>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-300 text-xs truncate">{new URL(log.url).pathname}</span>
                        <a href={log.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 shrink-0">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${PLATFORM_COLORS[log.platform] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                        {log.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.submitted_at)}</td>
                    <td className="px-4 py-3">
                      {log.response && (
                        <span className="text-gray-500 text-xs font-mono">
                          {log.response.httpStatus ? `HTTP ${log.response.httpStatus}` :
                           log.response.reason    ? log.response.reason :
                           log.response.error     ? log.response.error.slice(0, 40) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
              Showing {filtered.length} of {logs.length} submissions
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
