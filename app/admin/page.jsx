'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Mail, Send, Building2, Loader2, LogOut,
  Settings, CheckCircle, AlertCircle, BarChart2, Users,
  MousePointerClick, Eye, RefreshCw, Upload, FileText, X,
} from 'lucide-react';
import { toast } from 'sonner';

/** Parse a CSV/TSV text and extract all valid email addresses */
function parseEmailsFromCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  // Detect delimiter
  const delim = lines[0].includes('\t') ? '\t' : ',';

  // Try to find an email column header
  const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const emailColIdx = headers.findIndex((h) => h === 'email' || h === 'e-mail' || h === 'emailaddress' || h === 'email address');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = new Set();

  const dataLines = emailColIdx >= 0 ? lines.slice(1) : lines;

  for (const line of dataLines) {
    const cols = line.split(delim).map((c) => c.trim().replace(/^"|"$/g, ''));
    if (emailColIdx >= 0) {
      const val = cols[emailColIdx];
      if (val && emailRegex.test(val)) emails.add(val.toLowerCase());
    } else {
      // No header found — scan every cell for email-like values
      for (const col of cols) {
        if (emailRegex.test(col)) emails.add(col.toLowerCase());
      }
    }
  }
  return [...emails];
}

export default function AdminPanelPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [mailConfig, setMailConfig] = useState({ configured: false, fromEmail: null });
  const [mailConfigLoading, setMailConfigLoading] = useState(true);

  // ── Campaign state ──────────────────────────────────────────────────────────
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
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) setLoggedIn(true);
        setAuthCheckDone(true);
      })
      .catch(() => setAuthCheckDone(true));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    setError(null);
    fetch('/api/admin/agencies', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          setLoggedIn(false);
          return {};
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) setError(data.error);
        else setAgencies(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Failed to load agencies'))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    setMailConfigLoading(true);
    fetch('/api/admin/email', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : {})
      .then((data) => setMailConfig({ configured: !!data?.configured, fromEmail: data?.fromEmail || null }))
      .catch(() => setMailConfig({ configured: false, fromEmail: null }))
      .finally(() => setMailConfigLoading(false));
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    fetchCampaigns();
  }, [loggedIn]);

  const fetchCampaigns = () => {
    setCampaignsLoading(true);
    fetch('/api/admin/campaigns', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt', 'tsv'].includes(ext)) {
      toast.error('Please upload a .csv or .txt file. For Excel, use File → Save As → CSV.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const emails = parseEmailsFromCSV(text);
      if (emails.length === 0) {
        toast.error('No valid emails found in the file.');
        return;
      }
      setCampaignCustomEmails(emails.join('\n'));
      setCampaignAudience('custom');
      setUploadedFileName(file.name);
      setUploadedEmailCount(emails.length);
      toast.success(`Loaded ${emails.length} emails from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset so same file can be re-uploaded
  };

  const clearUploadedEmails = () => {
    setCampaignCustomEmails('');
    setUploadedFileName('');
    setUploadedEmailCount(0);
  };

  const sendCampaign = async () => {
    if (!campaignName.trim()) { toast.error('Campaign name is required'); return; }
    if (!campaignSubject.trim()) { toast.error('Subject is required'); return; }
    if (!campaignBody.trim()) { toast.error('Email body is required'); return; }
    if (campaignAudience === 'custom' && !campaignCustomEmails.trim()) {
      toast.error('Enter at least one email for custom audience');
      return;
    }

    setCampaignSending(true);
    try {
      const customEmails = campaignAudience === 'custom'
        ? campaignCustomEmails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: campaignName.trim(),
          subject: campaignSubject.trim(),
          body_html: campaignBody.trim().replace(/\n/g, '<br />'),
          audience: campaignAudience,
          custom_emails: customEmails,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Failed to send campaign'); return; }
      toast.success(`Campaign sent to ${data.sent} recipients!`);
      setCampaignFormOpen(false);
      setCampaignName(''); setCampaignSubject(''); setCampaignBody('');
      setCampaignAudience('all_with_email'); setCampaignCustomEmails('');
      setUploadedFileName(''); setUploadedEmailCount(0);
      fetchCampaigns();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCampaignSending(false);
    }
  };

  const openCampaignDetail = async (campaignId) => {
    setCampaignDetailOpen(true);
    setCampaignDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      setCampaignDetail(res.ok ? data : null);
    } catch {
      setCampaignDetail(null);
    } finally {
      setCampaignDetailLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }
      toast.success('Logged in');
      setLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setLoggedIn(false);
    toast.success('Logged out');
  };

  const openEmailModal = (agency) => {
    setSelectedAgency(agency);
    setEmailSubject("Your listing on FirmsLedger – Global Business Directory");
    setEmailBody(
      `Hi${agency.name ? ` ${agency.name}` : ''},\n\nThank you for registering on FirmsLedger – the global platform for verified business service providers.\n\nWe're here to help you reach more clients. If you have any questions or want to update your listing, just reply to this email.\n\nBest regards,\nFirmsLedger Team`
    );
    setEmailModalOpen(true);
  };

  const sendEmail = async () => {
    const email = selectedAgency?.contact_email;
    if (!email) {
      toast.error('This agency has no email on file.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: email,
          subject: emailSubject,
          body: emailBody,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to send email');
        return;
      }
      toast.success('Email sent successfully.');
      setEmailModalOpen(false);
      setSelectedAgency(null);
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  if (!authCheckDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin login</h1>
              <p className="text-slate-600 text-sm">FirmsLedger</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loginSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
              {loginSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <Link href={createPageUrl('Home')} className="block text-center text-sm text-slate-500 hover:text-blue-600 mt-4">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={createPageUrl('Home')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to site
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                  <p className="text-slate-600 text-sm">
                    FirmsLedger – Global Business Directory. Manage and email registered agencies.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Mail Setup & Invite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mail setup</h2>
                <p className="text-slate-600 text-sm">Send invite and transactional emails</p>
              </div>
            </div>
            {mailConfigLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking…
              </div>
            ) : mailConfig.configured ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Email is configured (Resend)</span>
                </div>
                {mailConfig.fromEmail && (
                  <p className="text-slate-500 text-xs">From: {mailConfig.fromEmail}</p>
                )}
                <p className="text-slate-500 text-xs mt-2">
                  To send to <strong>any</strong> email (invites, agencies, etc.), set <code className="bg-slate-100 px-1 rounded">RESEND_FROM_EMAIL</code> to an address at your <strong>verified Resend domain</strong>, e.g. <code>FirmsLedger &lt;noreply@firmsledger.com&gt;</code> in .env.local, then restart the server.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Mail not configured</span>
                </div>
                <p className="text-slate-600 text-sm">
                  Add <code className="bg-slate-100 px-1 rounded">RESEND_API_KEY</code> to <code className="bg-slate-100 px-1 rounded">.env.local</code> (from{' '}
                  <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a>) to send invite and agency emails.
                </p>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invite agency</h2>
                <p className="text-slate-600 text-sm">Send registration invite by email</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Enter an agency&apos;s email and they&apos;ll receive a link to add their company to FirmsLedger. They can submit details and you can approve the listing.
            </p>
            <Link href="/InviteAgency">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                <Send className="w-4 h-4" />
                Send invite email
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Email Campaigns ──────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Email Campaigns</h2>
                <p className="text-slate-500 text-xs">Send bulk emails to agencies and track opens/clicks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCampaigns} className="gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 gap-1"
                onClick={() => setCampaignFormOpen((v) => !v)}
              >
                <Mail className="w-3.5 h-3.5" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Compose form */}
          {campaignFormOpen && (
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 space-y-4">
              <h3 className="font-semibold text-slate-800">Compose campaign</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Campaign name</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. March Outreach – Legal Firms"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Audience</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white"
                    value={campaignAudience}
                    onChange={(e) => setCampaignAudience(e.target.value)}
                  >
                    <option value="all_with_email">All agencies with email</option>
                    <option value="approved">Approved agencies only</option>
                    <option value="pending">Pending agencies only</option>
                    <option value="custom">Custom email list</option>
                  </select>
                </div>
              </div>
              {/* Upload CSV — always visible */}
              <div className="col-span-2">
                <Label>Upload email list (CSV / TXT)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg px-4 py-3 transition-colors w-full">
                    <Upload className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      {uploadedFileName
                        ? <span className="text-blue-700 font-medium">{uploadedFileName}</span>
                        : 'Click to upload .csv or .txt file'}
                    </span>
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {uploadedFileName && (
                    <button
                      type="button"
                      onClick={clearUploadedEmails}
                      className="text-slate-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {uploadedEmailCount > 0 && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {uploadedEmailCount} emails loaded from file
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  CSV columns: <code>email</code>, <code>name</code>, etc. For Excel: File → Save As → CSV first.
                </p>
              </div>

              {campaignAudience === 'custom' && (
                <div className="col-span-2">
                  <Label>Emails list (editable)</Label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
                    rows={4}
                    placeholder="email1@company.com&#10;email2@agency.in"
                    value={campaignCustomEmails}
                    onChange={(e) => setCampaignCustomEmails(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {campaignCustomEmails.split(/[\n,]+/).filter((e) => e.trim()).length} emails
                  </p>
                </div>
              )}
              <div>
                <Label>Subject</Label>
                <Input
                  className="mt-1"
                  placeholder="Email subject line"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                />
              </div>
              <div>
                <Label>Message body</Label>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  rows={7}
                  placeholder="Write your email here... You can use HTML tags for formatting."
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Plain text or HTML. Line breaks are converted to &lt;br&gt;.</p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={sendCampaign}
                  disabled={campaignSending}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  {campaignSending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : <><Send className="w-4 h-4" /> Send Campaign</>
                  }
                </Button>
                <Button variant="outline" onClick={() => setCampaignFormOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Campaigns table */}
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              <BarChart2 className="w-10 h-10 mx-auto text-slate-200 mb-3" />
              No campaigns yet. Create your first one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Audience</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sent</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Total</span>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Opens</span>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />Clicks</span>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const openRate = c.sent_count > 0 ? ((c.opened_count / c.sent_count) * 100).toFixed(1) : '0';
                    const clickRate = c.sent_count > 0 ? ((c.clicked_count / c.sent_count) * 100).toFixed(1) : '0';
                    return (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{c.name}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[200px]">{c.subject}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 capitalize">
                          {c.audience === 'all_with_email' ? 'All' : c.audience}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {c.sent_at ? formatDate(c.sent_at) : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{c.sent_count}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-blue-700">{c.opened_count}</span>
                          <span className="text-slate-400 text-xs ml-1">({openRate}%)</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-green-700">{c.clicked_count}</span>
                          <span className="text-slate-400 text-xs ml-1">({clickRate}%)</span>
                        </td>
                        <td className="px-4 py-3">
                          {c.status === 'sent' && <Badge className="bg-emerald-100 text-emerald-800">Sent</Badge>}
                          {c.status === 'sending' && <Badge className="bg-yellow-100 text-yellow-800">Sending</Badge>}
                          {c.status === 'failed' && <Badge className="bg-red-100 text-red-800">Failed</Badge>}
                          {c.status === 'draft' && <Badge variant="secondary">Draft</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => openCampaignDetail(c.id)}>
                            View logs
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Agencies list ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
            <p className="font-medium">Cannot load agencies</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2">
              Add <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your{' '}
              <code className="bg-amber-100 px-1 rounded">.env.local</code> (from Supabase → Settings → API).
            </p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
            <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No agencies registered yet.</p>
            <p className="text-sm mt-1">Agencies will appear here when they submit via &quot;List your company&quot; or an invite link.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{agency.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{agency.contact_email || '—'}</td>
                      <td className="px-4 py-3">
                        {agency.approved ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Live</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {[agency.hq_city, agency.hq_country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{formatDate(agency.created_at)}</td>
                      <td className="px-4 py-3">
                        {agency.contact_email ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEmailModal(agency)}
                            className="gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send email
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-sm">No email</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Campaign detail modal */}
      <Dialog open={campaignDetailOpen} onOpenChange={setCampaignDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign logs</DialogTitle>
            <DialogDescription>
              {campaignDetail?.campaign?.name}
            </DialogDescription>
          </DialogHeader>

          {campaignDetailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : !campaignDetail ? (
            <p className="text-slate-500 text-sm py-4">Failed to load campaign detail.</p>
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Sent', value: campaignDetail.campaign.sent_count, color: 'text-slate-800' },
                  { label: 'Delivered', value: campaignDetail.campaign.delivered_count, color: 'text-blue-700' },
                  { label: 'Opened', value: campaignDetail.campaign.opened_count, color: 'text-indigo-700' },
                  { label: 'Clicked', value: campaignDetail.campaign.clicked_count, color: 'text-green-700' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-recipient table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Recipient</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Agency</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Opened</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Clicked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaignDetail.logs || []).map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-slate-700">{log.recipient_email}</td>
                        <td className="px-3 py-2 text-slate-500">{log.agency_name || '—'}</td>
                        <td className="px-3 py-2">
                          {log.status === 'clicked'   && <Badge className="bg-green-100 text-green-800">Clicked</Badge>}
                          {log.status === 'opened'    && <Badge className="bg-indigo-100 text-indigo-800">Opened</Badge>}
                          {log.status === 'delivered' && <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>}
                          {log.status === 'sent'      && <Badge variant="secondary">Sent</Badge>}
                          {log.status === 'bounced'   && <Badge className="bg-red-100 text-red-800">Bounced</Badge>}
                          {log.status === 'failed'    && <Badge className="bg-red-100 text-red-800">Failed</Badge>}
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs">
                          {log.opened_at ? formatDate(log.opened_at) : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs">
                          {log.clicked_at ? formatDate(log.clicked_at) : '—'}
                        </td>
                      </tr>
                    ))}
                    {(campaignDetail.logs || []).length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400 text-sm">No logs yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send email to agency</DialogTitle>
            <DialogDescription>
              {selectedAgency?.name && (
                <span className="text-slate-600">
                  Sending to <strong>{selectedAgency.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>To</Label>
              <Input value={selectedAgency?.contact_email || ''} readOnly className="bg-slate-50" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Your message..."
                rows={6}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={sendEmail} disabled={sending} className="bg-blue-600 hover:bg-blue-700 gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send email'}
              </Button>
              <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
