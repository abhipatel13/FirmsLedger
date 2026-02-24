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
import { ArrowLeft, Mail, Send, Building2, Loader2, LogOut, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    setEmailSubject("Your listing on FirmsLedger – India's Business Directory");
    setEmailBody(
      `Hi${agency.name ? ` ${agency.name}` : ''},\n\nThank you for registering on FirmsLedger – India's trusted platform for business service providers.\n\nWe're here to help you reach more clients. If you have any questions or want to update your listing, just reply to this email.\n\nBest regards,\nFirmsLedger Team`
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
                    FirmsLedger – India&apos;s Business Directory. Manage and email registered agencies.
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
                  Add <code className="bg-slate-100 px-1 rounded">RESEND_FROM_EMAIL</code> in .env.local to customize sender.
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

        {/* Agencies list */}
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
