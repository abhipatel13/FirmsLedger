'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
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

export default function PostSupplier() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    product_name: '',
    description: '',
    certifications: '',
    min_order_qty: '',
    lead_time: '',
    price_range: '',
    category: '',
    contact_name: '',
    contact_email: '',
    website: '',
    country: '',
    patents: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.product_name.trim() || !form.contact_name.trim() || !form.contact_email.trim()) {
      toast.error('Company name, product name, your name, and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit listing.');
        return;
      }
      toast.success('Listing submitted! Buyers can now find you.');
      router.push(`/marketplace/suppliers/${data.supplier.id}`);
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
          href="/marketplace/suppliers"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A2E4A]">List Your Products</h1>
          <p className="text-slate-600 mt-2">Get discovered by buyers looking for exactly what you supply.</p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#1A2E4A]">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="Lianyungang Jinkang Hexin Pharmaceutical Co."
                    value={form.company_name}
                    onChange={(e) => set('company_name', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country / Region *</Label>
                  <Input
                    placeholder="China"
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product / Ingredient Name *</Label>
                <Input
                  placeholder="e.g. Magnafolate® C (6S)-5-Methyltetrahydrofolate Calcium"
                  value={form.product_name}
                  onChange={(e) => set('product_name', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Product Description</Label>
                <Textarea
                  placeholder="Describe your product, its advantages, applications, stability, safety profile, etc."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400 min-h-[120px]"
                />
              </div>

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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min. Order Qty</Label>
                  <Input
                    placeholder="e.g. 1 kg"
                    value={form.min_order_qty}
                    onChange={(e) => set('min_order_qty', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lead Time</Label>
                  <Input
                    placeholder="e.g. 7–14 days"
                    value={form.lead_time}
                    onChange={(e) => set('lead_time', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Input
                    placeholder="e.g. $20–50/kg"
                    value={form.price_range}
                    onChange={(e) => set('price_range', e.target.value)}
                    className="bg-white focus-visible:ring-orange-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications (comma-separated)</Label>
                <Input
                  placeholder="e.g. GRAS, FDA, ISO22000, ISO9001, Halal, KOSHER, HACCP"
                  value={form.certifications}
                  onChange={(e) => set('certifications', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label>Patents (optional)</Label>
                <Input
                  placeholder="e.g. 40+ global granted patents, applied for 100+"
                  value={form.patents}
                  onChange={(e) => set('patents', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  className="bg-white focus-visible:ring-orange-400"
                />
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-[#1A2E4A] mb-4">Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name *</Label>
                    <Input
                      placeholder="Rosie Li"
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
                      placeholder="rosie@yourcompany.com"
                      value={form.contact_email}
                      onChange={(e) => set('contact_email', e.target.value)}
                      className="bg-white focus-visible:ring-orange-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-base"
              >
                {submitting ? 'Submitting...' : 'List Products — Free'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
