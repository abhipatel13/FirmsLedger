'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Send, Loader2, Settings, CheckCircle, AlertCircle,
  BarChart2, RefreshCw, Upload, X, Eye, FileText, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

function parseEmailsFromCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const emailColIdx = headers.findIndex((h) => ['email', 'e-mail', 'emailaddress', 'email address'].includes(h));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = new Set();
  const dataLines = emailColIdx >= 0 ? lines.slice(1) : lines;
  for (const line of dataLines) {
    const cols = line.split(delim).map((c) => c.trim().replace(/^"|"$/g, ''));
    if (emailColIdx >= 0) {
      const val = cols[emailColIdx];
      if (val && emailRegex.test(val)) emails.add(val.toLowerCase());
    } else {
      for (const col of cols) if (emailRegex.test(col)) emails.add(col.toLowerCase());
    }
  }
  return [...emails];
}

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const INPUT = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500';

export default function CampaignsPage() {
  const [mailConfig, setMailConfig] = useState({ configured: false, fromEmail: null });
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const DEFAULT_SUBJECT = "List Your Business on FirmsLedger — It's Free";
  const DEFAULT_BODY = `Hi there,

We'd like to invite you to list your business on FirmsLedger — the global business directory trusted by companies worldwide.

✅ It's completely free
✅ Get discovered by clients looking for your services
✅ Build trust with verified reviews and a professional profile

If you have any questions, feel free to reply to this email.

Best regards,
The FirmsLedger Team`;
  const DEFAULT_BTN_LABEL = 'List Your Company Free →';
  const DEFAULT_BTN_URL   = 'https://firmsledger.com/ListYourCompany';

  // Compose form
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [btnLabel, setBtnLabel] = useState(DEFAULT_BTN_LABEL);
  const [btnUrl, setBtnUrl]     = useState(DEFAULT_BTN_URL);
  const [emails, setEmails] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);

  // Campaign detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/email', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : {})
      .then((d) => setMailConfig({ configured: !!d?.configured, fromEmail: d?.fromEmail || null }))
      .catch(() => {});
    fetchCampaigns();
  }, []);

  const fetchCampaigns = () => {
    setCampaignsLoading(true);
    fetch('/api/admin/campaigns', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setCampaigns(Array.isArray(d) ? d : []))
      .catch(() => setCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt', 'tsv'].includes(ext)) {
      toast.error('Please upload a .csv or .txt file');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseEmailsFromCSV(ev.target.result);
      if (!parsed.length) { toast.error('No valid emails found in file'); return; }
      setEmails(parsed);
      setFileName(file.name);
      toast.success(`${parsed.length} emails loaded from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearEmails = () => { setEmails([]); setFileName(''); };

  const resetForm = () => {
    setName(''); setSubject(DEFAULT_SUBJECT); setBody(DEFAULT_BODY);
    setBtnLabel(DEFAULT_BTN_LABEL); setBtnUrl(DEFAULT_BTN_URL);
    setEmails([]); setFileName(''); setPreview(false);
  };

  const buildHtml = () => {
    const textHtml = body.trim().replace(/\n/g, '<br />');
    const btnHtml = btnLabel.trim() && btnUrl.trim()
      ? `<div style="margin:24px 0;"><a href="${btnUrl.trim()}" style="display:inline-block;padding:13px 30px;background:#F97316;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${btnLabel.trim()}</a></div>`
      : '';
    return `${textHtml}${btnHtml ? `<br />${btnHtml}` : ''}`;
  };

  const sendCampaign = async () => {
    if (!name.trim())    { toast.error('Campaign name is required'); return; }
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!body.trim())    { toast.error('Email body is required'); return; }
    if (emails.length === 0) { toast.error('Upload an email list first'); return; }

    setSending(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name:         name.trim(),
          subject:      subject.trim(),
          body_html:    buildHtml(),
          btn_url:      btnUrl.trim(),
          audience:     'custom',
          custom_emails: emails,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Failed to send campaign'); return; }
      toast.success(`Campaign sent to ${data.sent} recipients!`);
      setFormOpen(false);
      resetForm();
      fetchCampaigns();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSending(false);
    }
  };

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { credentials: 'include' });
      setDetail(res.ok ? await res.json() : null);
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  return (
    <div className="p-6 w-full space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Email Campaigns</h1>
          <p className="text-gray-400 text-sm mt-0.5">Upload a list and send bulk emails</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => { setFormOpen((v) => !v); if (formOpen) resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm text-white font-medium transition-colors"
          >
            <Mail className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Mail config status */}
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
        mailConfig.configured
          ? 'bg-green-950/30 border-green-800/40 text-green-400'
          : 'bg-yellow-950/30 border-yellow-800/40 text-yellow-400'
      }`}>
        {mailConfig.configured
          ? <><CheckCircle className="w-4 h-4 shrink-0" /> Resend configured{mailConfig.fromEmail ? ` · Sending from ${mailConfig.fromEmail}` : ''}</>
          : <><AlertCircle className="w-4 h-4 shrink-0" /> Mail not configured — add RESEND_API_KEY to .env</>
        }
      </div>

      {/* Compose form */}
      {formOpen && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">Compose Campaign</h2>
            <button onClick={() => { setFormOpen(false); resetForm(); }} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Campaign Name + Subject */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
                <input className={INPUT} placeholder="March Outreach 2026" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject Line <span className="text-red-400">*</span></label>
                <input className={INPUT} placeholder="List your business on FirmsLedger — it's free" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            </div>

            {/* Email Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Email Body <span className="text-red-400">*</span></label>
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> {preview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {preview ? (
                /* ── Preview panel ── */
                <div className="w-full bg-white rounded-xl border border-gray-700 px-8 py-6 min-h-[300px]">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{body}</p>
                  {btnLabel.trim() && btnUrl.trim() && (
                    <div className="mt-6">
                      <span
                        style={{ background: '#F97316', color: '#fff', padding: '13px 30px', borderRadius: 8, fontWeight: 600, fontSize: 15, display: 'inline-block', textDecoration: 'none' }}
                      >
                        {btnLabel}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Edit mode ── */
                <>
                  <textarea
                    className={`${INPUT} resize-none leading-relaxed`}
                    rows={10}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />

                  {/* CTA Button */}
                  <div className="mt-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Call-to-Action Button</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Button Label</label>
                        <input
                          className={INPUT}
                          value={btnLabel}
                          onChange={(e) => setBtnLabel(e.target.value)}
                          placeholder="List Your Company Free →"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Button URL</label>
                        <input
                          className={INPUT}
                          value={btnUrl}
                          onChange={(e) => setBtnUrl(e.target.value)}
                          placeholder="https://firmsledger.com/ListYourCompany"
                        />
                      </div>
                    </div>
                    {/* live mini-preview of button */}
                    {btnLabel.trim() && (
                      <div className="pt-1">
                        <span
                          style={{ background: '#F97316', color: '#fff', padding: '10px 22px', borderRadius: 7, fontWeight: 600, fontSize: 13, display: 'inline-block' }}
                        >
                          {btnLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Email Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Recipients <span className="text-red-400">*</span></label>
                {emails.length > 0 && (
                  <button onClick={clearEmails} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {emails.length === 0 ? (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-800 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl px-6 py-8 transition-colors group">
                  <Upload className="w-6 h-6 text-gray-500 group-hover:text-orange-400 transition-colors" />
                  <div className="text-center">
                    <p className="text-sm text-gray-300 font-medium">Upload email list</p>
                    <p className="text-xs text-gray-500 mt-0.5">CSV, TXT or TSV — one email per row or an "email" column</p>
                  </div>
                  <input type="file" accept=".csv,.txt,.tsv" className="hidden" ref={fileRef} onChange={handleFileUpload} />
                </label>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white font-medium">{fileName}</span>
                    </div>
                    <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                      {emails.length} recipients
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto px-4 py-2">
                    {emails.slice(0, 50).map((email, i) => (
                      <p key={i} className="text-xs text-gray-400 py-0.5 font-mono">{email}</p>
                    ))}
                    {emails.length > 50 && (
                      <p className="text-xs text-gray-600 py-1">…and {emails.length - 50} more</p>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-700">
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" /> Replace with a different file
                      <input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-800">
              <p className="text-xs text-gray-600">
                {emails.length > 0 ? `Ready to send to ${emails.length} recipients` : 'Upload an email list to continue'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFormOpen(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendCampaign}
                  disabled={sending || emails.length === 0 || !subject.trim() || !body.trim() || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? `Sending to ${emails.length}…` : `Send to ${emails.length} recipients`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign history */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-purple-900/40 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Campaign History</h2>
            <p className="text-xs text-gray-500">Sent campaigns and delivery stats</p>
          </div>
        </div>

        {campaignsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No campaigns yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50">
                  {['Campaign', 'Sent', 'Total', 'Opens', 'Clicks', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const openRate  = c.sent_count > 0 ? ((c.opened_count  / c.sent_count) * 100).toFixed(1) : '0';
                  const clickRate = c.sent_count > 0 ? ((c.clicked_count / c.sent_count) * 100).toFixed(1) : '0';
                  return (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-100">{c.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{c.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.sent_at ? formatDate(c.sent_at) : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-white">{c.sent_count}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-semibold">{c.opened_count}</span>
                        <span className="text-gray-500 text-xs ml-1">({openRate}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-semibold">{c.clicked_count}</span>
                        <span className="text-gray-500 text-xs ml-1">({clickRate}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          c.status === 'sent'    ? 'bg-green-900/40 text-green-300' :
                          c.status === 'sending' ? 'bg-yellow-900/40 text-yellow-300' :
                          c.status === 'failed'  ? 'bg-red-900/40 text-red-300' :
                                                   'bg-gray-800 text-gray-400'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(c.id)} className="text-xs text-blue-400 hover:underline">
                          View logs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign detail modal */}
      {detailOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDetailOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Campaign Logs</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
              ) : !detail ? (
                <p className="text-gray-500 text-sm">Failed to load campaign detail.</p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Sent',      value: detail.campaign.sent_count },
                      { label: 'Delivered', value: detail.campaign.delivered_count },
                      { label: 'Opened',    value: detail.campaign.opened_count },
                      { label: 'Clicked',   value: detail.campaign.clicked_count },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">{value}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-800 border-b border-gray-700">
                          {['Recipient', 'Agency', 'Status', 'Opened', 'Clicked'].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.logs || []).map((log) => (
                          <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="px-3 py-2.5 text-gray-300 font-mono text-xs">{log.recipient_email}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{log.agency_name || '—'}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                log.status === 'clicked'   ? 'bg-green-900/40 text-green-300' :
                                log.status === 'opened'    ? 'bg-blue-900/40 text-blue-300' :
                                log.status === 'delivered' ? 'bg-indigo-900/40 text-indigo-300' :
                                log.status === 'bounced' || log.status === 'failed' ? 'bg-red-900/40 text-red-300' :
                                'bg-gray-800 text-gray-400'
                              }`}>{log.status}</span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{log.opened_at  ? formatDate(log.opened_at)  : '—'}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{log.clicked_at ? formatDate(log.clicked_at) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
