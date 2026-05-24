'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Globe, Award, Package, Send, ExternalLink } from 'lucide-react';
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

export default function SupplierDetail({ supplierId }) {
  const [supplier, setSupplier] = useState(null);
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
    fetch(`/api/marketplace/suppliers/${supplierId}`)
      .then((r) => r.json())
      .then((d) => setSupplier(d.supplier || null))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleInquiry = async (e) => {
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
        body: JSON.stringify({ supplier_id: supplierId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send inquiry.');
        return;
      }
      toast.success('Inquiry sent! The supplier has been notified.');
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
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700 mb-2">Supplier not found</h2>
          <Link href="/marketplace/suppliers" className="text-orange-600 hover:underline">← Back to Suppliers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/marketplace/suppliers"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {supplier.category && (
                  <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full">
                    {supplier.category}
                  </span>
                )}
                {supplier.certifications?.length > 0 && (
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Certified
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-[#1A2E4A]">{supplier.company_name}</h1>
              <p className="text-slate-600 mt-1 text-lg">{supplier.product_name}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {supplier.country && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {supplier.country}</span>
                )}
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-orange-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Listed {timeAgo(supplier.created_at)}</span>
              </div>
            </div>

            {supplier.description && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#1A2E4A]">About This Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{supplier.description}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1A2E4A]">Supply Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {supplier.min_order_qty && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Min. Order Qty</p>
                      <p className="font-semibold text-[#1A2E4A] mt-0.5">{supplier.min_order_qty}</p>
                    </div>
                  )}
                  {supplier.lead_time && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Lead Time</p>
                      <p className="font-semibold text-[#1A2E4A] mt-0.5">{supplier.lead_time}</p>
                    </div>
                  )}
                  {supplier.price_range && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Price Range</p>
                      <p className="font-semibold text-[#1A2E4A] mt-0.5">{supplier.price_range}</p>
                    </div>
                  )}
                  {supplier.patents && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Patents</p>
                      <p className="font-semibold text-[#1A2E4A] mt-0.5">{supplier.patents}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {supplier.certifications?.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#1A2E4A] flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-lg border border-blue-100"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Inquiry form */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-[#1A2E4A] flex items-center gap-2">
                  <Send className="w-4 h-4 text-orange-500" />
                  Send Inquiry
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl font-bold">✓</span>
                    </div>
                    <p className="font-semibold text-[#1A2E4A] mb-1">Inquiry sent!</p>
                    <p className="text-sm text-slate-600">The supplier has been notified and will contact you.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Your Name *</Label>
                      <Input
                        placeholder="Chris Brant"
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
                        placeholder="purchasing@company.com"
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
                        placeholder="Include your requirements, quantity needed, desired pricing, and any questions..."
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
                      {submitting ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                    <p className="text-xs text-slate-500 text-center">
                      Supplier will receive your contact details via email.
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
