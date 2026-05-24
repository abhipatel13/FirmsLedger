'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CATEGORIES = [
  'Electronics & Components', 'Food & Beverages', 'Pharmaceuticals & Health',
  'Industrial Equipment', 'Chemicals & Materials', 'Textiles & Apparel',
  'Agriculture & Food Processing', 'Automotive Parts', 'Construction Materials',
  'Packaging & Paper', 'Medical Devices', 'IT & Technology', 'Other',
];

const PAYMENT_TERMS = ['Net 30', 'Net 60', 'Net 90', 'Prepayment', 'Letter of Credit (LC)', 'Open Account', 'Other'];

export default function PostRFQ() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    product_name: '',
    specifications: '',
    quantity: '',
    unit: 'units',
    budget_range: '',
    payment_terms: '',
    delivery_deadline: '',
    category: '',
    contact_name: '',
    contact_email: '',
    company_name: '',
    country: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_name.trim() || !form.contact_name.trim() || !form.contact_email.trim()) {
      toast.error('Product name, your name, and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to post RFQ.');
        return;
      }
      toast.success('RFQ posted! Suppliers will reach out to you.');
      router.push(`/marketplace/rfqs/${data.rfq.id}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/marketplace/rfqs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RFQs
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#243B58] to-[#1A2E4A] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShoppingCart className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A2E4A]">Post an RFQ</h1>
          <p className="text-slate-600 mt-2">Tell suppliers exactly what you need and get competitive quotes.</p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#1A2E4A]">Purchase Requirement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product */}
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g. Air Fryer 2400W / 6.5L Extra Large"
                  value={form.product_name}
                  onChange={(e) => set('product_name', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Specifications</Label>
                <Textarea
                  placeholder="Include dimensions, certifications, performance specs, or any special requirements..."
                  value={form.specifications}
                  onChange={(e) => set('specifications', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity Needed</Label>
                  <Input
                    type="number"
                    placeholder="1500"
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="units / kg / MT / pcs"
                    value={form.unit}
                    onChange={(e) => set('unit', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Range</Label>
                  <Input
                    placeholder="e.g. $50–$80 per unit"
                    value={form.budget_range}
                    onChange={(e) => set('budget_range', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Deadline</Label>
                  <Input
                    placeholder="e.g. Within 60 days"
                    value={form.delivery_deadline}
                    onChange={(e) => set('delivery_deadline', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <select
                    value={form.payment_terms}
                    onChange={(e) => set('payment_terms', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    <option value="">Select terms</option>
                    {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-[#1A2E4A] mb-4">Your Contact Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Your Name *</Label>
                      <Input
                        placeholder="Chris Brant"
                        value={form.contact_name}
                        onChange={(e) => set('contact_name', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="purchasing@company.com"
                        value={form.contact_email}
                        onChange={(e) => set('contact_email', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        placeholder="Dot Foods Inc."
                        value={form.company_name}
                        onChange={(e) => set('company_name', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        placeholder="United States"
                        value={form.country}
                        onChange={(e) => set('country', e.target.value)}
                        className="bg-white focus-visible:ring-orange-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1A2E4A] hover:bg-[#243B58] text-white font-bold py-3 text-base"
              >
                {submitting ? 'Posting...' : 'Post RFQ — Free'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
