'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react';

export default function ListYourCompanyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
    hq_city: '',
    hq_state: '',
    hq_country: 'India',
    team_size: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitListingRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        website: formData.website,
        hq_city: formData.hq_city,
        hq_state: formData.hq_state,
        hq_country: formData.hq_country,
        team_size: formData.team_size || undefined,
        message: formData.message,
      });
      setSubmitted(true);
      if (api.hasSupabase()) {
        toast.success('Your listing has been submitted for review.');
      } else {
        toast.success('Thank you! We will contact you soon.');
      }
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request received</h1>
          <p className="text-slate-600 mb-8">
            {api.hasSupabase()
              ? 'Your company details have been submitted. We’ll review and publish your listing soon. We may contact you at the email you provided.'
              : 'We’ll get in touch with you shortly to complete your listing.'}
          </p>
          <Link href={createPageUrl('Home')}>
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">List your company</h1>
            <p className="text-slate-600">Add your business to FirmsLedger so clients can find you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name">Your name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company_name">Company name *</Label>
            <Input
              id="company_name"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Your Agency or Company"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="hq_city">City</Label>
              <Input
                id="hq_city"
                value={formData.hq_city}
                onChange={(e) => setFormData({ ...formData, hq_city: e.target.value })}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <Label htmlFor="hq_state">State</Label>
              <Input
                id="hq_state"
                value={formData.hq_state}
                onChange={(e) => setFormData({ ...formData, hq_state: e.target.value })}
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <Label htmlFor="hq_country">Country</Label>
              <Input
                id="hq_country"
                value={formData.hq_country}
                onChange={(e) => setFormData({ ...formData, hq_country: e.target.value })}
                placeholder="India"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="team_size">Team size</Label>
            <select
              id="team_size"
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={formData.team_size}
              onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
            >
              <option value="">Select</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>

          <div>
            <Label htmlFor="message">About your company</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Services you offer, industries you serve..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Submitting...' : 'Submit listing request'}
            </Button>
            <Link href={createPageUrl('Home')}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
