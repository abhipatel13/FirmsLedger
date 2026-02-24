'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send, Loader2, Plus, Trash2 } from 'lucide-react';

function newRow() {
  return { id: Math.random().toString(36).slice(2), email: '', company_name: '' };
}

export default function InviteAgencyPage() {
  const router = useRouter();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState([newRow()]);
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

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invites = rows
      .map((r) => ({ email: r.email.trim(), company_name: r.company_name.trim() || undefined }))
      .filter((r) => r.email);
    if (!invites.length) {
      toast.error('Enter at least one agency email.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invites }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to send invites');
        return;
      }

      toast.success(data.message || 'Invite sent! They’ll receive an email with a link to add their company.');
      setRows([newRow()]);
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
          <p className="text-sm text-slate-600">Add one or more agencies. Each will receive a unique invite link by email.</p>
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex-1 min-w-[180px]">
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                  placeholder="contact@agency.com"
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Company (optional)</Label>
                <Input
                  value={row.company_name}
                  onChange={(e) => updateRow(row.id, 'company_name', e.target.value)}
                  placeholder="Company name"
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                className="shrink-0 text-slate-500 hover:text-red-600"
                aria-label="Remove row"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add another agency
            </Button>
            <Button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : `Send invite${rows.some((r) => r.email.trim()) ? ` (${rows.filter((r) => r.email.trim()).length})` : ''}`}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Each recipient gets a unique link. When they open it and submit the form, their company data is saved in your FirmsLedger database and you can approve it to show on the site.
        </p>
      </div>
    </div>
  );
}
