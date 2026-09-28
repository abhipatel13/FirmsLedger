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
import { Mail, Send, ArrowLeft, Clock, MessageSquare } from 'lucide-react';

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
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `[FirmsLedger Contact] ${(formData.subject || 'Contact form').trim()}`,
          message: formData.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to send message. Please try again.');
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-200/60 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-orange-400/10 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <Link
          href={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
          {/* Left Column: Copy & Info */}
          <div className="lg:col-span-5 space-y-10 lg:pr-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 mb-6 shadow-sm">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Contact Support
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Let's talk about your business.
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Whether you're looking to update your company's listing, inquire about premium verification services, or report an issue, our dedicated support team is here to help.
              </p>
            </div>

            <div className="space-y-8 pt-4 border-t border-slate-200/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Fast response</h3>
                  <p className="text-slate-500 mt-1 text-sm leading-relaxed">Fill out the form and our team will get back to you within 1–2 business days.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Support hours</h3>
                  <p className="text-slate-500 mt-1 text-sm leading-relaxed">
                    Monday – Friday<br />
                    9:00 AM – 5:00 PM EST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-7 lg:pl-10 relative">
            {/* Soft decorative shadow block behind the card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-300/40 to-slate-200/40 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10 hidden sm:block" />

            <Card className="border-0 bg-white shadow-2xl shadow-slate-200/60 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-900 px-8 py-8 border-b border-slate-800">
                <CardTitle className="text-2xl text-white font-semibold">Send a message</CardTitle>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  For urgent matters regarding your account access or payment processing, please indicate "Urgent" in your subject line.
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="contact-name" className="text-slate-700 font-medium">Name *</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="contact-email" className="text-slate-700 font-medium">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="contact-subject" className="text-slate-700 font-medium">Subject</Label>
                    <Input
                      id="contact-subject"
                      type="text"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="contact-message" className="text-slate-700 font-medium">Message *</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[160px] bg-slate-50/50 border-slate-200 rounded-xl resize-y focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all placeholder:text-slate-400 p-4"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : 'Send message'}
                      <Send className="w-4 h-4 ml-2 inline-block" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
