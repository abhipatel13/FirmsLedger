'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';
import { Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPost({ searchParams }) {
  const params = searchParams && typeof searchParams === 'object' ? searchParams : {};
  const postId = typeof params.id === 'string' ? params.id : (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null);

  // Mock blog post data
  const post = {
    id: postId,
    title: 'How to Choose the Right Business Service Provider in 2026',
    content: `
      <p class="text-lg leading-relaxed mb-6">Choosing the right business service provider is one of the most critical decisions you'll make for your company's success. In this comprehensive guide, we'll walk you through the key factors to consider when evaluating potential partners.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Define Your Requirements</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Before you start your search, clearly outline what you need from a service provider. Consider your budget, timeline, scope of work, and expected outcomes. This will help you narrow down your options and find providers that align with your goals.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Research and Shortlist</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Use platforms like FirmsLedger to discover verified service providers. Look at their portfolios, client reviews, industry expertise, and team size. Create a shortlist of 3-5 providers that seem like good fits.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Verify Credentials and Reviews</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Don't just rely on what providers say about themselves. Check verified reviews from real clients, ask for references, and validate their credentials. Look for consistent patterns in feedback about their work quality, communication, and reliability.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Evaluate Communication</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Pay attention to how potential providers communicate during the evaluation process. Are they responsive? Do they ask thoughtful questions about your business? Good communication is essential for a successful partnership.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Compare Proposals</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Request detailed proposals from your shortlisted providers. Compare not just pricing, but also their approach, methodology, deliverables, and timelines. The cheapest option isn't always the best value.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Conclusion</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Taking the time to thoroughly evaluate service providers will pay dividends in the long run. Use data-driven platforms like FirmsLedger to make informed decisions backed by verified information and authentic reviews.</p>
    `,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    category: 'Guides',
    author: 'Priya Sharma',
    date: '2026-02-10',
    readTime: '8 min read'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[
            { label: 'Blog', href: createPageUrl('Blogs') },
            { label: post.title }
          ]} />
        </div>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold mb-6">
          {post.category}
        </span>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{new Date(post.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-xl">
          <img src={post.image} alt={post.title} className="w-full h-auto" />
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-3 mb-12 pb-8 border-b">
          <span className="text-slate-600 font-medium flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share:
          </span>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Facebook className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Twitter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Linkedin className="w-4 h-4" />
          </Button>
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-extrabold mb-4">Ready to Find Your Perfect Partner?</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Browse verified providers and make confident business decisions
          </p>
          <Link href={createPageUrl('Directory')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg font-bold rounded-xl">
              Explore Providers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}