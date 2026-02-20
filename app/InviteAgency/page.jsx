'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send, Loader2 } from 'lucide-react';

export default function InviteAgencyPage() {
  const router = useRouter();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) setIsAdmin(true);
        else router.replace('/admin');
        setAdminChecked(true);
      })
      .catch(() => {
        router.replace('/admin');
        setAdminChecked(true);
      });
  }, [router]);

  useEffect(() => {
    if (adminChecked && !isAdmin) router.replace('/admin');
  }, [adminChecked, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), company_name: companyName.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to send invite');
        return;
      }

      toast.success(data.message || 'Invite sent! They’ll receive an email with a link to add their company.');
      setEmail('');
      setCompanyName('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p className="text-slate-600">Admin only. Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invite an agency</h1>
            <p className="text-slate-600">
              Send an email with a link so they can add their company details to FirmsLedger. Data will be collected in your directory.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <Label htmlFor="email">Agency contact email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@agency.com"
            />
          </div>
          <div>
            <Label htmlFor="company_name">Company name (optional)</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Their company name"
            />
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2 inline" />
            {sending ? 'Sending...' : 'Send invite email'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          They will receive an email with a unique link. When they open it and submit the form, their company data is saved in your FirmsLedger database (Supabase) and you can approve it to show on the site.
        </p>
      </div>
    </div>
  );
}
