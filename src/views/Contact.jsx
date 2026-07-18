'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, ArrowLeft } from 'lucide-react';

const CONTACT_EMAIL = 'abhipatel8675@gmail.com';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      toast.error('Please fill in name, email, and message.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: (formData.subject || 'Contact form').trim(),
          message: formData.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to send message. Please try again.');
        return;
      }
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-slate-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900" style={{ letterSpacing: '-0.025em' }}>Contact us</h1>
          <p className="text-slate-500 mt-2">
            Have a question or feedback? Send us a message and we&apos;ll get back to you.
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#0a0a0a]">Send a message</CardTitle>
            <p className="text-slate-600 text-sm">
              We typically respond within 1–2 business days.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name *</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white focus-visible:ring-orange-400 focus-visible:border-orange-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white focus-visible:ring-orange-400 focus-visible:border-orange-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  type="text"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-white focus-visible:ring-orange-400 focus-visible:border-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[160px] bg-white resize-y focus-visible:ring-orange-400 focus-visible:border-orange-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Sending...' : 'Send message'}
                <Send className="w-4 h-4 ml-2 inline" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Or email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-600 hover:underline font-medium">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
