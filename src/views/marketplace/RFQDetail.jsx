'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Package, CreditCard, Calendar, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function RFQDetail({ rfqId }) {
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    responder_name: '',
    responder_email: '',
    responder_company: '',
    message: '',
  });

  useEffect(() => {
    fetch(`/api/marketplace/rfqs/${rfqId}`)
      .then((r) => r.json())
      .then((d) => setRfq(d.rfq || null))
      .finally(() => setLoading(false));
  }, [rfqId]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!form.responder_name.trim() || !form.responder_email.trim() || !form.message.trim()) {
      toast.error('Name, email, and message are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfq_id: rfqId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send response.');
        return;
      }
      toast.success('Response sent! The buyer has been notified.');
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-32" />
            <div className="h-10 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700 mb-2">RFQ not found</h2>
          <Link href="/marketplace/rfqs" className="text-orange-600 hover:underline">← Back to RFQs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/marketplace/rfqs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RFQs
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main RFQ info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {rfq.category && (
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">{rfq.category}</span>
                )}
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">Open</span>
              </div>
              <h1 className="text-3xl font-extrabold text-[#1A2E4A]">{rfq.product_name}</h1>
              {rfq.company_name && (
                <p className="text-slate-600 mt-1 text-lg">{rfq.company_name}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {rfq.country && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {rfq.country}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Posted {timeAgo(rfq.created_at)}
                </span>
              </div>
            </div>

            {rfq.specifications && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#1A2E4A]">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{rfq.specifications}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1A2E4A]">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {rfq.quantity && (
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Quantity</p>
                        <p className="font-semibold text-[#1A2E4A]">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                      </div>
                    </div>
                  )}
                  {rfq.budget_range && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 mt-0.5 text-sm">$</span>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Budget</p>
                        <p className="font-semibold text-[#1A2E4A]">{rfq.budget_range}</p>
                      </div>
                    </div>
                  )}
                  {rfq.payment_terms && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Payment Terms</p>
                        <p className="font-semibold text-[#1A2E4A]">{rfq.payment_terms}</p>
                      </div>
                    </div>
                  )}
                  {rfq.delivery_deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Delivery</p>
                        <p className="font-semibold text-[#1A2E4A]">{rfq.delivery_deadline}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response form */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-[#1A2E4A] flex items-center gap-2">
                  <Send className="w-4 h-4 text-orange-500" />
                  Respond as Supplier
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl font-bold">✓</span>
                    </div>
                    <p className="font-semibold text-[#1A2E4A] mb-1">Response sent!</p>
                    <p className="text-sm text-slate-600">The buyer has been notified and will contact you.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRespond} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Your Name *</Label>
                      <Input
                        placeholder="Jane Smith"
                        value={form.responder_name}
                        onChange={(e) => set('responder_name', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Email *</Label>
                      <Input
                        type="email"
                        placeholder="sales@company.com"
                        value={form.responder_email}
                        onChange={(e) => set('responder_email', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Company</Label>
                      <Input
                        placeholder="Your company name"
                        value={form.responder_company}
                        onChange={(e) => set('responder_company', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Message *</Label>
                      <Textarea
                        placeholder="Share your pricing, MOQ, lead time, and why you're a good fit..."
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400 text-sm min-h-[100px]"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      {submitting ? 'Sending...' : 'Send Response'}
                    </Button>
                    <p className="text-xs text-slate-500 text-center">
                      Buyer will receive your contact details via email.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
