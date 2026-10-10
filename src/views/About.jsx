'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, Cpu, ArrowRight, UserCheck, Building } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] relative overflow-hidden" aria-labelledby="about-heading">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-orange-500/10 border border-orange-500/20 tracking-wider uppercase">
              Our Mission
            </span>
            <h1
              id="about-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              Connecting You with America's Leading Manufacturers
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              FirmsLedger is an independent directory built to simplify industrial sourcing, support local commerce, and strengthen domestic supply chains.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORE PILLARS SECTION ─────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="pillars-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="pillars-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why FirmsLedger?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              We are committed to providing the most reliable, transparent, and comprehensive database of US manufacturing capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Zero Paid Placements</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Unlike directories that rank suppliers based on ad spend, FirmsLedger visibility is strictly merit-based. Rankings are based on capability details and quality certifications, never on payment.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Domestic Operations</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We list companies with manufacturing and production facilities in the United States, and owners can claim their profile to confirm and update it.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Granular Capability Sourcing</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our directory breaks down primary industries into 84+ subcategories — from precision CNC machining to custom injection molding — so engineers and buyers can source exact technical capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white border-y border-slate-200" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Simplifying the connection between industrial buyers and American production facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sourcing Path */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">For Sourcing Teams & Buyers</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D1B2A]/5 text-[#0D1B2A] font-bold text-sm flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Discover Capabilities</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Browse through 10 primary sectors and filter down to exact subcategories in your state.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D1B2A]/5 text-[#0D1B2A] font-bold text-sm flex items-center justify-center mt-0.5">2</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Evaluate Suppliers</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Inspect equipment lists, operational parameters, and third-party certifications.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D1B2A]/5 text-[#0D1B2A] font-bold text-sm flex items-center justify-center mt-0.5">3</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Request RFQs Directly</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Contact factories directly with zero platform markup or middleman transaction fees.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link
                  id="btn-about-capabilities"
                  href="/capabilities"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Explore Sourcing Capabilities <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Manufacturer Path */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">For US Manufacturers</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/10 text-orange-600 font-bold text-sm flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Claim Your Profile</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Search for your business in our database and claim your profile to begin managing it.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/10 text-orange-600 font-bold text-sm flex items-center justify-center mt-0.5">2</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">List Machines & Certificates</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Detail your production equipment, materials handled, and ISO/AS9100 quality certifications.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/10 text-orange-600 font-bold text-sm flex items-center justify-center mt-0.5">3</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Get Direct RFQs</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Connect with procurement agents looking for your specific capabilities in your state.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link
                  id="btn-about-list"
                  href="/list-your-company"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Claim & List Your Company <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Build a More Resilient Supply Chain Today
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Discover USA manufacturers or list your manufacturing business on FirmsLedger completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="btn-cta-capabilities"
              href="/capabilities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0D1B2A] hover:bg-[#1A2E44] text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-sm transition-all duration-200"
            >
              Explore Capabilities
            </Link>
            <Link
              id="btn-cta-list"
              href="/list-your-company"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-full shadow-sm transition-all duration-200"
            >
              List Your Company
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
