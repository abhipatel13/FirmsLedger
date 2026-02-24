'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Link2Off } from 'lucide-react';

export default function JoinPage() {
  const searchParams = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const [invite, setInvite] = useState(null);
  const [linkError, setLinkError] = useState(null); // 'invalid' | 'expired' | 'already_used'
  const [loading, setLoading] = useState(!!token);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLinkError(null);
    fetch(`/api/join?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.invite) {
          setInvite(data.invite);
          setFormData((prev) => ({
            ...prev,
            email: data.invite.email || prev.email,
            company_name: data.invite.company_name || prev.company_name,
          }));
        } else {
          setInvite(null);
          if (data.error === 'expired') setLinkError('expired');
          else if (data.error === 'already_used') setLinkError('already_used');
          else setLinkError('invalid');
        }
      })
      .catch(() => {
        setInvite(null);
        setLinkError('invalid');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!api.hasSupabase()) {
      toast.error('Database is not connected. Use the main List your company form.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitListingRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        website: formData.website,
        message: formData.message,
        invite_id: invite?.id || null,
      });
      setSubmitted(true);
      toast.success('Your listing has been submitted. We’ll review it and get back to you.');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4 flex items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-slate-600 mb-4">This page is for invited companies. Use the link we sent you.</p>
          <Link href={createPageUrl('ListYourCompany')}>
            <Button variant="outline">List your company instead</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!invite && !loading) {
    const isExpired = linkError === 'expired';
    const isUsed = linkError === 'already_used';
    const title = isExpired ? 'Link expired' : isUsed ? 'Link already used' : 'Link not found';
    const message = isExpired
      ? 'This invite link has expired. Ask the sender for a new invite.'
      : isUsed
        ? 'This invite was already used to submit a company. You can list another company below.'
        : 'This invite link wasn’t found—it may have been created in a different environment or the invite may have been removed. You can still add your company using the button below.';
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Link2Off className="w-7 h-7 text-slate-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <Link href={createPageUrl('ListYourCompany')}>
            <Button className="bg-blue-600 hover:bg-blue-700">List your company</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Thank you</h1>
          <p className="text-slate-600 mb-6">Your company details have been submitted. We’ll review and add your listing soon.</p>
          <Link href={createPageUrl('Home')}>
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">You’re invited to list your company</h1>
            <p className="text-slate-600">Complete the form below to add your business to FirmsLedger.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <Label htmlFor="name">Your name *</Label>
            <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" />
          </div>
          <div>
            <Label htmlFor="company_name">Company name *</Label>
            <Input id="company_name" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="Your Company" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div>
            <Label htmlFor="message">About your company</Label>
            <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Services, industries..." rows={3} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
}
