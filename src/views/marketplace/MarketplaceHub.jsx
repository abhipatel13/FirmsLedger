'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Globe, Shield, Zap, ArrowRight, MapPin, Clock, ChevronRight } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MarketplaceHub() {
  const [stats, setStats] = useState({ rfqs: 0, suppliers: 0 });
  const [recentRfqs, setRecentRfqs] = useState([]);
  const [recentSuppliers, setRecentSuppliers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/marketplace/rfqs').then((r) => r.json()).catch(() => ({ rfqs: [] })),
      fetch('/api/marketplace/suppliers').then((r) => r.json()).catch(() => ({ suppliers: [] })),
    ]).then(([rfqData, supplierData]) => {
      const rfqs = rfqData.rfqs || [];
      const suppliers = supplierData.suppliers || [];
      setStats({ rfqs: rfqs.length, suppliers: suppliers.length });
      setRecentRfqs(rfqs.slice(0, 4));
      setRecentSuppliers(suppliers.slice(0, 4));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-[#0D1B2A] text-white overflow-hidden">
        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* glow blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 bg-orange-500/15 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-orange-500/25 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Global B2B Marketplace
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
            Where Buyers Meet<br />
            <span className="text-orange-400">Suppliers</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Post a purchase requirement, get quotes from global suppliers. Or list your products and reach thousands of buyers — free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/marketplace/rfqs/new"
              className="group inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-all text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-5 h-5" />
              Post an RFQ
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
            <Link
              href="/marketplace/suppliers/new"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 text-white font-bold px-8 py-4 rounded-xl transition-all text-base border border-white/15 hover:border-white/30 hover:-translate-y-0.5"
            >
              <Package className="w-5 h-5" />
              List Your Products
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/10">
            {[
              { label: 'Open RFQs', value: stats.rfqs || '—' },
              { label: 'Active Suppliers', value: stats.suppliers || '—' },
              { label: 'Countries', value: '50+' },
              { label: 'Industries', value: '200+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 px-6 py-5 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{value}</div>
                <div className="text-slate-400 text-xs mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">How it works</p>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="absolute top-6 left-[16.67%] right-[16.67%] h-px bg-slate-100 hidden sm:block" />
            {[
              { n: '1', title: 'Post your need', desc: 'Buyer submits RFQ with specs, quantity, and payment terms in 2 minutes.', color: 'bg-blue-500' },
              { n: '2', title: 'Suppliers respond', desc: 'Qualified suppliers worldwide see your RFQ and send competitive quotes.', color: 'bg-orange-500' },
              { n: '3', title: 'Close the deal', desc: 'Compare quotes, pick the best fit, connect directly — no platform cut.', color: 'bg-green-500' },
            ].map(({ n, title, desc, color }) => (
              <div key={n} className="relative text-center">
                <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center text-lg font-extrabold mx-auto mb-4 relative z-10 shadow-lg`}>
                  {n}
                </div>
                <h3 className="font-bold text-[#1A2E4A] text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Buyer / Supplier cards ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Buyer card */}
          <div className="relative bg-gradient-to-br from-[#0D1B2A] to-[#1A3A5C] rounded-2xl overflow-hidden p-8 text-white group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/15">
                <ShoppingCart className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2">I&apos;m a Buyer</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Post your purchase requirement once. Get quotes from multiple suppliers globally — no cold calling, no middlemen.
              </p>
              <ul className="space-y-2 mb-8">
                {['Free to post RFQs', 'Reach 50+ countries', 'Email alerts on responses'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="w-4 h-4 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300 text-[10px] font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Link href="/marketplace/rfqs/new" className="flex-1 bg-orange-500 hover:bg-orange-400 font-bold py-3 rounded-xl text-center text-sm transition-colors">
                  Post RFQ Free →
                </Link>
                <Link href="/marketplace/rfqs" className="flex-1 bg-white/10 hover:bg-white/18 font-semibold py-3 rounded-xl text-center text-sm transition-colors border border-white/15">
                  Browse RFQs
                </Link>
              </div>
            </div>
          </div>

          {/* Supplier card */}
          <div className="relative bg-gradient-to-br from-[#2D1206] to-[#4A1E0A] rounded-2xl overflow-hidden p-8 text-white group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-400/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/15">
                <Package className="w-6 h-6 text-orange-300" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2">I&apos;m a Supplier</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                List your products once. Get discovered by buyers actively searching — and respond to open RFQs that match what you supply.
              </p>
              <ul className="space-y-2 mb-8">
                {['Free product listings', 'Browse matching RFQs', 'Buyers contact you directly'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="w-4 h-4 rounded-full bg-orange-500/30 border border-orange-400/40 flex items-center justify-center text-orange-300 text-[10px] font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Link href="/marketplace/suppliers/new" className="flex-1 bg-orange-500 hover:bg-orange-400 font-bold py-3 rounded-xl text-center text-sm transition-colors">
                  List Products Free →
                </Link>
                <Link href="/marketplace/suppliers" className="flex-1 bg-white/10 hover:bg-white/18 font-semibold py-3 rounded-xl text-center text-sm transition-colors border border-white/15">
                  Browse Suppliers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent RFQs ──────────────────────────────────────────── */}
      {recentRfqs.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1A2E4A]">Latest RFQs</h2>
                <p className="text-slate-500 text-sm mt-1">Buyers looking for suppliers right now</p>
              </div>
              <Link href="/marketplace/rfqs" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentRfqs.map((rfq) => (
                <Link
                  key={rfq.id}
                  href={`/marketplace/rfqs/${rfq.id}`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md bg-white transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2E4A] text-sm truncate group-hover:text-orange-600 transition-colors">{rfq.product_name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{rfq.company_name || rfq.contact_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {rfq.quantity && <span className="font-medium text-slate-600">Qty: {rfq.quantity.toLocaleString()}</span>}
                      {rfq.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{rfq.country}</span>}
                      <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{timeAgo(rfq.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Suppliers ─────────────────────────────────────── */}
      {recentSuppliers.length > 0 && (
        <section className="bg-[#F7F8FA]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1A2E4A]">New Suppliers</h2>
                <p className="text-slate-500 text-sm mt-1">Recently listed products available to order</p>
              </div>
              <Link href="/marketplace/suppliers" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentSuppliers.map((s) => (
                <Link
                  key={s.id}
                  href={`/marketplace/suppliers/${s.id}`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md bg-white transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2E4A] text-sm truncate group-hover:text-orange-600 transition-colors">{s.company_name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{s.product_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {s.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.country}</span>}
                      {s.certifications?.length > 0 && (
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{s.certifications[0]}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why section ──────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-extrabold text-[#1A2E4A] text-center mb-12">Why FirmsLedger?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Globe, color: 'text-blue-600 bg-blue-50', title: 'Global Reach', desc: 'Buyers and suppliers across 50+ countries in every product category.' },
              { icon: Zap, color: 'text-orange-600 bg-orange-50', title: 'Fast & Free', desc: 'Post RFQs or listings in 2 minutes. No subscription. No commission.' },
              { icon: Shield, color: 'text-green-600 bg-green-50', title: 'Transparent', desc: 'All listings are public. No hidden fees, no pay-to-rank. Buyers contact you directly.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#1A2E4A] mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0D1B2A] to-[#1A2E4A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to trade globally?</h2>
          <p className="text-slate-400 mb-8">Join buyers and suppliers already using FirmsLedger to close deals.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/marketplace/rfqs/new" className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-all">
              <ShoppingCart className="w-5 h-5" /> Post an RFQ
            </Link>
            <Link href="/marketplace/suppliers/new" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20">
              <Package className="w-5 h-5" /> List Products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
