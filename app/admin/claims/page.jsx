'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BadgeCheck, ShieldQuestion, CheckCircle2, XCircle, Clock,
  ExternalLink, RefreshCw, Inbox,
} from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, FilterTabs, Field,
  Skeleton, EmptyState, Notice, INPUT,
} from '@/components/admin/ui';

const STATUS = {
  pending:  { tone: 'amber', icon: Clock,        label: 'pending' },
  approved: { tone: 'green', icon: CheckCircle2, label: 'approved' },
  rejected: { tone: 'red',   icon: XCircle,      label: 'rejected' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ClaimsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null); // claim id with the note field open
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/claims', { credentials: 'include' });
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      setMsg({ tone: 'red', text: 'Could not load claims.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (id, action, reviewNote = '') => {
    setBusyId(id);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, note: reviewNote }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
      setMsg({ tone: 'green', text: `Claim ${d.status}.` });
      setRejecting(null);
      setNote('');
      await load();
    } catch (e) {
      setMsg({ tone: 'red', text: e.message });
    } finally {
      setBusyId(null);
    }
  };

  const counts = {
    pending:  rows.filter((r) => r.status === 'pending').length,
    approved: rows.filter((r) => r.status === 'approved').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
    all:      rows.length,
  };
  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader
        title="Listing Claims"
        subtitle="Business owners requesting ownership of an existing listing. Approving one makes that account the owner and lets it edit the listing."
      >
        <Button icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
      </PageHeader>

      {msg && <div className="mb-4"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="mb-5">
        <FilterTabs
          options={['pending', 'approved', 'rejected', 'all']}
          value={filter}
          onChange={setFilter}
          counts={counts}
        />
      </div>

      {loading ? (
        <Skeleton rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === 'pending' ? 'Nothing waiting on you' : `No ${filter === 'all' ? '' : filter} claims`}
        >
          {filter === 'pending'
            ? 'Claims submitted from /claim-listing land here for review. Check the domain signal, then approve or reject.'
            : 'Switch filters to see claims in another state.'}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const s = STATUS[r.status] ?? STATUS.pending;
            const matched = r.verification === 'domain_match';
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/company/${r.company_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[15px] font-semibold text-[#E8EDF5] hover:text-[#F5A623] transition-colors duration-150 inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
                      >
                        {r.company_name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden />
                      </a>
                      <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
                      <Badge tone={matched ? 'green' : 'neutral'} icon={matched ? BadgeCheck : ShieldQuestion}>
                        {matched ? 'domain matches' : 'needs checking'}
                      </Badge>
                    </div>

                    {/* The reviewer's actual job: compare the claimant's email
                        against what the listing already says. Those four fields
                        are grouped together for that reason. */}
                    <dl className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
                      <Field label="Claimant" value={`${r.contact_name || '—'}${r.role ? ` · ${r.role}` : ''}`} />
                      <Field label="Account" value={r.account_email} />
                      <Field label="Work email" value={r.contact_email} />
                      <Field label="Phone" value={r.phone} />
                      <Field label="Listing website" value={r.company_website} />
                      <Field label="Listing email" value={r.company_contact_email} />
                      <Field label="Submitted" value={formatDate(r.created_at)} />
                      {r.reviewed_at && <Field label="Reviewed" value={formatDate(r.reviewed_at)} />}
                    </dl>

                    {r.review_note && (
                      <p className="mt-3 text-xs text-[#94A3B8]">
                        <span className="text-[#64748B]">Note:</span> {r.review_note}
                      </p>
                    )}
                  </div>

                  {r.status === 'pending' && rejecting !== r.id && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="success"
                        icon={CheckCircle2}
                        loading={busyId === r.id}
                        onClick={() => review(r.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button variant="danger" onClick={() => { setRejecting(r.id); setNote(''); }}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Inline, not window.prompt: the reason stays visible while
                    it's typed and the claim's details are still on screen. */}
                {rejecting === r.id && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08]">
                    <label htmlFor={`note-${r.id}`} className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Reason for rejection <span className="text-[#64748B]">(optional — shown to the claimant)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        id={`note-${r.id}`}
                        className={`${INPUT} flex-1 min-w-[220px]`}
                        placeholder="Could not verify you work at this company."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        autoFocus
                      />
                      <Button
                        variant="danger"
                        icon={XCircle}
                        loading={busyId === r.id}
                        onClick={() => review(r.id, 'reject', note)}
                      >
                        Confirm rejection
                      </Button>
                      <Button variant="ghost" onClick={() => { setRejecting(null); setNote(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
