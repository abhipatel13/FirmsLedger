'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, Send, Building2, Loader2, Settings,
  CheckCircle, AlertCircle, BarChart2, Users,
  MousePointerClick, Eye, RefreshCw, Upload, FileText, X,
} from 'lucide-react';
import { toast } from 'sonner';

function parseEmailsFromCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const emailColIdx = headers.findIndex((h) => ['email','e-mail','emailaddress','email address'].includes(h));
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

export default function CampaignsPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  // Mail config
  const [mailConfig, setMailConfig] = useState({ configured: false, fromEmail: null });

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('all_with_email');
  const [campaignCustomEmails, setCampaignCustomEmails] = useState('');
  const [campaignSending, setCampaignSending] = useState(false);
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [campaignDetailLoading, setCampaignDetailLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedEmailCount, setUploadedEmailCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/agencies', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setAgencies(Array.isArray(d) ? d : []))
      .catch(() => setError('Failed to load agencies'))
      .finally(() => setLoading(false));

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
    if (!['csv', 'txt', 'tsv'].includes(ext)) { toast.error('Please upload a .csv or .txt file'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const emails = parseEmailsFromCSV(ev.target.result);
      if (!emails.length) { toast.error('No valid emails found'); return; }
      setCampaignCustomEmails(emails.join('\n'));
      setCampaignAudience('custom');
      setUploadedFileName(file.name);
      setUploadedEmailCount(emails.length);
      toast.success(`Loaded ${emails.length} emails from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sendCampaign = async () => {
    if (!campaignName.trim()) { toast.error('Campaign name required'); return; }
    if (!campaignSubject.trim()) { toast.error('Subject required'); return; }
    if (!campaignBody.trim()) { toast.error('Body required'); return; }
    if (campaignAudience === 'custom' && !campaignCustomEmails.trim()) { toast.error('Enter at least one email'); return; }
    setCampaignSending(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: campaignName.trim(),
          subject: campaignSubject.trim(),
          body_html: campaignBody.trim().replace(/\n/g, '<br />'),
          audience: campaignAudience,
          custom_emails: campaignAudience === 'custom'
            ? campaignCustomEmails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
            : [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Failed to send'); return; }
      toast.success(`Campaign sent to ${data.sent} recipients!`);
      setCampaignFormOpen(false);
      setCampaignName(''); setCampaignSubject(''); setCampaignBody('');
      setCampaignAudience('all_with_email'); setCampaignCustomEmails('');
      setUploadedFileName(''); setUploadedEmailCount(0);
      fetchCampaigns();
    } catch { toast.error('Something went wrong'); }
    finally { setCampaignSending(false); }
  };

  const openCampaignDetail = async (id) => {
    setCampaignDetailOpen(true); setCampaignDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { credentials: 'include' });
      setCampaignDetail(res.ok ? await res.json() : null);
    } catch { setCampaignDetail(null); }
    finally { setCampaignDetailLoading(false); }
  };

  const openEmailModal = (agency) => {
    setSelectedAgency(agency);
    setEmailSubject('Your listing on FirmsLedger – Global Business Directory');
    setEmailBody(`Hi${agency.name ? ` ${agency.name}` : ''},\n\nThank you for registering on FirmsLedger.\n\nBest regards,\nFirmsLedger Team`);
    setEmailModalOpen(true);
  };

  const sendEmail = async () => {
    if (!selectedAgency?.contact_email) { toast.error('No email on file'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ to: selectedAgency.contact_email, subject: emailSubject, body: emailBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Failed to send'); return; }
      toast.success('Email sent!');
      setEmailModalOpen(false);
    } catch { toast.error('Something went wrong'); }
    finally { setSending(false); }
  };

  return (
    <div className="p-6 w-full space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Agencies & Email</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage registered agencies and email campaigns</p>
      </div>

      {/* Mail setup */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="font-semibold text-white">Mail setup</h2>
          </div>
          {mailConfig.configured ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Resend configured {mailConfig.fromEmail ? `· ${mailConfig.fromEmail}` : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Mail not configured — add RESEND_API_KEY to .env</span>
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="font-semibold text-white">Invite agency</h2>
          </div>
          <Link href="/InviteAgency">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Send invite email
            </button>
          </Link>
        </div>
      </div>

      {/* Email Campaigns */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/40 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Email Campaigns</h2>
              <p className="text-xs text-gray-500">Bulk emails with open/click tracking</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCampaigns} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={() => setCampaignFormOpen((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs text-white font-medium transition-colors">
              <Mail className="w-3 h-3" /> New Campaign
            </button>
          </div>
        </div>

        {campaignFormOpen && (
          <div className="px-5 py-5 border-b border-gray-800 bg-gray-950/50 space-y-4">
            <h3 className="text-sm font-semibold text-gray-200">Compose campaign</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Campaign name</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="March Outreach" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Audience</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)}>
                  <option value="all_with_email">All agencies with email</option>
                  <option value="approved">Approved only</option>
                  <option value="pending">Pending only</option>
                  <option value="custom">Custom list</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Upload email list (CSV/TXT)</label>
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800 border border-dashed border-gray-700 hover:border-blue-500 rounded-lg px-4 py-3 transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">{uploadedFileName || 'Click to upload .csv or .txt'}</span>
                <input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFileUpload} />
              </label>
              {uploadedEmailCount > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-green-400">{uploadedEmailCount} emails loaded</p>
                  <button onClick={() => { setCampaignCustomEmails(''); setUploadedFileName(''); setUploadedEmailCount(0); }} className="text-gray-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
            {campaignAudience === 'custom' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email list</label>
                <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500" rows={4} placeholder="email@company.com" value={campaignCustomEmails} onChange={(e) => setCampaignCustomEmails(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Subject</label>
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Email subject" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Message body</label>
              <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" rows={6} placeholder="Write your email..." value={campaignBody} onChange={(e) => setCampaignBody(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={sendCampaign} disabled={campaignSending} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {campaignSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {campaignSending ? 'Sending…' : 'Send Campaign'}
              </button>
              <button onClick={() => setCampaignFormOpen(false)} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {campaignsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">No campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50">
                  {['Campaign', 'Audience', 'Sent', 'Total', 'Opens', 'Clicks', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const openRate = c.sent_count > 0 ? ((c.opened_count / c.sent_count) * 100).toFixed(1) : '0';
                  const clickRate = c.sent_count > 0 ? ((c.clicked_count / c.sent_count) * 100).toFixed(1) : '0';
                  return (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-100">{c.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[180px]">{c.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs capitalize">{c.audience === 'all_with_email' ? 'All' : c.audience}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.sent_at ? formatDate(c.sent_at) : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-white">{c.sent_count}</td>
                      <td className="px-4 py-3"><span className="text-blue-400 font-semibold">{c.opened_count}</span><span className="text-gray-500 text-xs ml-1">({openRate}%)</span></td>
                      <td className="px-4 py-3"><span className="text-green-400 font-semibold">{c.clicked_count}</span><span className="text-gray-500 text-xs ml-1">({clickRate}%)</span></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          c.status === 'sent' ? 'bg-green-900/40 text-green-300' :
                          c.status === 'sending' ? 'bg-yellow-900/40 text-yellow-300' :
                          c.status === 'failed' ? 'bg-red-900/40 text-red-300' : 'bg-gray-800 text-gray-400'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openCampaignDetail(c.id)} className="text-xs text-blue-400 hover:underline">View logs</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agencies table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Registered Agencies</h2>
            <p className="text-xs text-gray-500">{agencies.length} total</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
        ) : error ? (
          <div className="px-5 py-6 text-red-400 text-sm">{error}</div>
        ) : agencies.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">No agencies yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50">
                  {['Company', 'Email', 'Status', 'Location', 'Registered', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agencies.map((a) => (
                  <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-gray-100">{a.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{a.contact_email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.approved ? 'bg-green-900/40 text-green-300' : 'bg-yellow-900/40 text-yellow-300'}`}>
                        {a.approved ? 'Live' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{[a.hq_city, a.hq_country].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      {a.contact_email ? (
                        <button onClick={() => openEmailModal(a)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
                          <Send className="w-3 h-3" /> Send email
                        </button>
                      ) : <span className="text-gray-600 text-xs">No email</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign detail modal */}
      {campaignDetailOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setCampaignDetailOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Campaign logs</h2>
              <button onClick={() => setCampaignDetailOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {campaignDetailLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
              ) : !campaignDetail ? (
                <p className="text-gray-500 text-sm">Failed to load campaign detail.</p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Sent', value: campaignDetail.campaign.sent_count },
                      { label: 'Delivered', value: campaignDetail.campaign.delivered_count },
                      { label: 'Opened', value: campaignDetail.campaign.opened_count },
                      { label: 'Clicked', value: campaignDetail.campaign.clicked_count },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">{value}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-800 border-b border-gray-700">
                        {['Recipient','Agency','Status','Opened','Clicked'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {(campaignDetail.logs || []).map((log) => (
                          <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="px-3 py-2.5 text-gray-300">{log.recipient_email}</td>
                            <td className="px-3 py-2.5 text-gray-500">{log.agency_name || '—'}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                log.status === 'clicked'   ? 'bg-green-900/40 text-green-300' :
                                log.status === 'opened'    ? 'bg-blue-900/40 text-blue-300' :
                                log.status === 'delivered' ? 'bg-indigo-900/40 text-indigo-300' :
                                log.status === 'bounced' || log.status === 'failed' ? 'bg-red-900/40 text-red-300' :
                                'bg-gray-800 text-gray-400'
                              }`}>{log.status}</span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{log.opened_at ? formatDate(log.opened_at) : '—'}</td>
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

      {/* Send email modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEmailModalOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Send email to agency</h2>
              <button onClick={() => setEmailModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">To</label>
                <input value={selectedAgency?.contact_email || ''} readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Subject</label>
                <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Message</label>
                <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={sendEmail} disabled={sending} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send email'}
                </button>
                <button onClick={() => setEmailModalOpen(false)} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
