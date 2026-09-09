'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, ShieldQuestion, CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_STYLE = {
  pending:  'bg-amber-900/40 text-amber-300 border-amber-700/40',
  approved: 'bg-green-900/40 text-green-300 border-green-700/40',
  rejected: 'bg-red-900/40   text-red-300   border-red-700/40',
};

const STATUS_ICON = {
  pending:  <Clock        className="w-4 h-4 text-amber-400" />,
  approved: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  rejected: <XCircle      className="w-4 h-4 text-red-400" />,
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ClaimsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/claims', { credentials: 'include' });
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (id, action) => {
    const note = action === 'reject'
      ? window.prompt('Reason for rejection (optional, shown in the log):') ?? ''
      : '';
    setBusyId(id);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, note }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      setMsg(`Claim ${d.status}.`);
      await load();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const counts = {
    all:      rows.length,
    pending:  rows.filter((r) => r.status === 'pending').length,
    approved: rows.filter((r) => r.status === 'approved').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
  };
  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Listing Claims</h1>
          <p className="text-sm text-slate-400 mt-1">
            Business owners requesting ownership of an existing listing. Approving one makes that
            account the owner.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 h-9 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {msg && (
        <div className="text-sm px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 h-8 rounded-lg text-xs font-semibold capitalize border transition-colors ${
              filter === k
                ? 'bg-slate-100 text-slate-900 border-slate-100'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {k} ({counts[k]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-slate-500 text-sm py-16 text-center">No {filter === 'all' ? '' : filter} claims.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`/company/${r.company_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-white hover:text-orange-300 inline-flex items-center gap-1"
                    >
                      {r.company_name} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${STATUS_STYLE[r.status]}`}>
                      {STATUS_ICON[r.status]} {r.status}
                    </span>
                    {r.verification === 'domain_match' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-green-700/40 bg-green-900/30 text-green-300 text-[11px] font-semibold">
                        <BadgeCheck className="w-3.5 h-3.5" /> domain matches
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 text-[11px] font-semibold">
                        <ShieldQuestion className="w-3.5 h-3.5" /> needs checking
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-xs">
                    <div><dt className="inline text-slate-500">Claimant: </dt><dd className="inline text-slate-200">{r.contact_name || '—'} ({r.role || '—'})</dd></div>
                    <div><dt className="inline text-slate-500">Account: </dt><dd className="inline text-slate-200">{r.account_email}</dd></div>
                    <div><dt className="inline text-slate-500">Work email: </dt><dd className="inline text-slate-200">{r.contact_email || '—'}</dd></div>
                    <div><dt className="inline text-slate-500">Phone: </dt><dd className="inline text-slate-200">{r.phone || '—'}</dd></div>
                    <div><dt className="inline text-slate-500">Listing website: </dt><dd className="inline text-slate-200">{r.company_website || '—'}</dd></div>
                    <div><dt className="inline text-slate-500">Listing email: </dt><dd className="inline text-slate-200">{r.company_contact_email || '—'}</dd></div>
                    <div><dt className="inline text-slate-500">Submitted: </dt><dd className="inline text-slate-200">{formatDate(r.created_at)}</dd></div>
                    {r.reviewed_at && (
                      <div><dt className="inline text-slate-500">Reviewed: </dt><dd className="inline text-slate-200">{formatDate(r.reviewed_at)}</dd></div>
                    )}
                  </dl>

                  {r.review_note && (
                    <p className="mt-2 text-xs text-slate-400 italic">Note: {r.review_note}</p>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => review(r.id, 'approve')}
                      disabled={busyId === r.id}
                      className="px-3 h-9 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      {busyId === r.id ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => review(r.id, 'reject')}
                      disabled={busyId === r.id}
                      className="px-3 h-9 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 text-sm font-semibold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
