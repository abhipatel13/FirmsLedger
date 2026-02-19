'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import CategoryGrid from '@/components/CategoryGrid';
import AgencyCard from '@/components/AgencyCard';
import ReviewCard from '@/components/ReviewCard';
import { ArrowRight, Star, Shield, Zap, Globe, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const { data: featuredAgencies = [] } = useQuery({
    queryKey: ['featured-agencies'],
    queryFn: () => api.entities.Agency.filter({ featured: true, approved: true }, '-avg_rating', 3),
  });

  const { data: topRatedAgencies = [] } = useQuery({
    queryKey: ['top-rated-agencies'],
    queryFn: () => api.entities.Agency.filter({ approved: true }, '-avg_rating', 6),
  });

  const { data: recentReviews = [] } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: () => api.entities.Review.filter({ approved: true }, '-created_date', 3),
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium mb-8 shadow-lg"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                Trusted by 10,000+ businesses
              </span>
              <div className="flex -space-x-1 ml-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight"
            >
              Discover India's Most
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trusted Business Partners
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Connect with verified service providers through authentic reviews, transparent ratings, 
              and data-driven insights. Make confident decisions for your business growth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href={createPageUrl('Directory')}>
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Providers
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:border-white/50 hover:scale-105"
                onClick={() => {
                  const listBtn = document.querySelector('[data-list-agency-btn]');
                  if (listBtn) listBtn.click();
                }}
              >
                List Your Business
              </Button>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
                <SearchBar />
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 max-w-4xl mx-auto"
            >
              <div className="group text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">50+</div>
                </div>
                <div className="text-slate-400 text-sm font-medium">Verified Providers</div>
              </div>
              <div className="group text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">150+</div>
                </div>
                <div className="text-slate-400 text-sm font-medium">Authentic Reviews</div>
              </div>
              <div className="group text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">100+</div>
                </div>
                <div className="text-slate-400 text-sm font-medium">Indian Cities</div>
              </div>
              <div className="group text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-pink-400" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">4.8</div>
                </div>
                <div className="text-slate-400 text-sm font-medium">Average Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Trust FirmsLedger */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Why trust<br />FirmsLedger
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Hear from businesses who found their ideal partners on FirmsLedger.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">All companies on FirmsLedger are verified for authenticity.</h3>
                  <p className="text-slate-600">We verify each company to ensure you connect with legitimate service providers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">FirmsLedger does not manipulate ratings or reviews.</h3>
                  <p className="text-slate-600">All reviews are from verified customers and reflect genuine experiences.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">Company information is regularly updated & accurate.</h3>
                  <p className="text-slate-600">We maintain up-to-date information on all listed companies for your confidence.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">Our research is transparent and unbiased.</h3>
                  <p className="text-slate-600">We use data-driven metrics to rank companies based on performance and quality.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Choose the Right Partner */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Make informed decisions with comprehensive provider profiles, verified reviews, and side-by-side comparisons
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-lg font-bold mb-3 mt-4 text-slate-900">Search by Location</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Find providers in Mumbai, Bangalore, Delhi, Pune, Hyderabad, and 100+ Indian cities
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-purple-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-lg font-bold mb-3 mt-4 text-slate-900">Filter by Service</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Marketing, legal, logistics, consulting, or specialized business services
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-lg font-bold mb-3 mt-4 text-slate-900">Compare & Review</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Read verified reviews, compare ratings, pricing, and success rates side-by-side
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-purple-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-lg font-bold mb-3 mt-4 text-slate-900">Contact Directly</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                View provider contact details and reach out directly to discuss your business needs
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Agencies */}
      {featuredAgencies.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  Featured Providers
                </h2>
                <p className="text-lg text-slate-600">Handpicked top-performing agencies</p>
              </div>
              <Link href={createPageUrl('Directory')}>
                <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  View All 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgencies.map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <AgencyCard agency={agency} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From staffing to consulting, find verified service providers across all business categories
            </p>
          </motion.div>
          <CategoryGrid categories={categories.slice(0, 8)} />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link href={createPageUrl('Directory')}>
              <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Browse All Categories 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Top Rated Agencies */}
      {topRatedAgencies.length > 0 && (
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Find the top-rated companies in every service category
              </h2>
              <p className="text-slate-300 text-lg">
                FirmsLedger helps you connect with top-ranked companies backed by trusted research and verified reviews.
              </p>
            </motion.div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={createPageUrl('Directory') + `?category=${cat.slug}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Company Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedAgencies.slice(0, 9).map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`}>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:bg-slate-750 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-4">
                        {agency.logo_url ? (
                          <img src={agency.logo_url} alt={agency.name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{agency.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-1">{agency.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(agency.avg_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                              ))}
                            </div>
                            <span className="text-white font-semibold">{(agency.avg_rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={createPageUrl('AgencyProfile') + `?id=${agency.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        {agency.review_count || 0} Reviews →
                      </Link>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <Link href={createPageUrl('Directory')}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-3 text-lg font-semibold">
                  View all companies
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                New reviews from verified customers
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{review.title}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating_overall || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      ))}
                      <span className="ml-2 text-sm font-semibold text-slate-900">{(review.rating_overall || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-3">{review.body}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{review.company_name}</p>
                    <p className="text-xs text-slate-500">{review.role_hired}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-3 text-lg font-semibold">
                Write a review
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Top Cities in India */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-purple-900/20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Available Across India
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover top business service providers in major Indian cities
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Chandigarh', 'Kochi'].map((city, index) => (
              <Link 
                key={city}
                href={createPageUrl('Directory') + `?search=${city}`}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{city}</h3>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Ready to Find Your<br />Perfect Partner?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              Browse verified providers across 100+ Indian cities and make the right choice for your business
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={createPageUrl('Directory')}>
                <Button size="lg" className="group bg-white text-blue-600 hover:bg-slate-100 px-10 py-6 text-lg font-bold rounded-xl shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105">
                  Explore All Providers
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-2 border-white/40 hover:bg-white/20 text-white px-10 py-6 text-lg font-bold rounded-xl transition-all duration-300 hover:border-white/60 hover:scale-105"
                onClick={() => {
                  const listBtn = document.querySelector('[data-list-agency-btn]');
                  if (listBtn) listBtn.click();
                }}
              >
                List Your Business
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}