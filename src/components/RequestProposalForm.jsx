'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Building2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function RequestProposalForm() {
  const searchParams = useSearchParams();
  const agencyParam = searchParams.get('agency') || '';

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(!!agencyParam);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    if (!agencyParam) { setCompanyLoading(false); return; }
    fetch(`/api/companies/${encodeURIComponent(agencyParam)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data && !data.error) setCompany(data); })
      .catch(() => {})
      .finally(() => setCompanyLoading(false));
  }, [agencyParam]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.id) {
      toast.error('Company not found. Go back and pick one from the directory.');
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Name, email, and message are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to send your request.');
        return;
      }

      setSubmitted(true);
      toast.success('Request sent!');
    } catch {
      toast.error('Failed to send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A2E4A] mb-3">Request sent!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {company?.name || 'The company'} has been notified and will reach out to you directly.
          </p>
          {company?.slug && (
            <Link href={`/company/${company.slug}`}>
              <Button className="bg-[#1A2E4A] hover:bg-[#142339] text-white font-semibold px-6 h-11 rounded-lg">
                Back to {company.name}
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-14">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <Link
          href={company?.slug ? `/company/${company.slug}` : '/browse'}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {company?.slug ? `Back to ${company.name}` : 'Back to directory'}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E4A] mb-2">Request a Proposal</h1>
          <p className="text-slate-600">Tell them what you need — they'll respond directly.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {companyLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : !company ? (
            <div className="px-6 sm:px-8 py-10 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold mb-1">No company selected</p>
              <p className="text-slate-500 text-sm mb-5">Pick a company from the directory first.</p>
              <Link href="/browse">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 h-10 rounded-lg">
                  Browse Companies
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-white" />
                ) : (
                  <div className="w-12 h-12 bg-[#1A2E4A] rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-400">{company.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#1A2E4A]">{company.name}</p>
                  <p className="text-xs text-slate-500">
                    {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ') || 'Requesting a proposal'}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input id="name" required autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Doe" />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required autoComplete="email" spellCheck={false} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 123-4567" />
              </div>

              <div>
                <Label htmlFor="message">Project Details *</Label>
                <Textarea id="message" required minLength={10} rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="What do you need? Include quantity, timeline, and budget if known…" />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-lg">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Request <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
