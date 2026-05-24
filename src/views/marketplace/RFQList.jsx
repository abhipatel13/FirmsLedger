'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, MapPin, Clock, Search, ShoppingCart, ChevronRight } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const ALL_CATEGORIES = [
  'Electronics & Components', 'Food & Beverages', 'Pharmaceuticals & Health',
  'Industrial Equipment', 'Chemicals & Materials', 'Textiles & Apparel',
  'Automotive Parts', 'Medical Devices', 'Other',
];

export default function RFQList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/marketplace/rfqs')
      .then((r) => r.json())
      .then((d) => setRfqs(d.rfqs || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...ALL_CATEGORIES.filter((c) => rfqs.some((r) => r.category === c))];

  const filtered = rfqs.filter((r) => {
    const matchSearch = !search.trim() ||
      r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-600 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1A2E4A]">Open RFQs</h1>
              <p className="text-slate-500 mt-1 text-sm">
                {loading ? '…' : `${rfqs.length} active purchase requests`}
              </p>
            </div>
            <Link
              href="/marketplace/rfqs/new"
              className="inline-flex items-center gap-2 bg-[#1A2E4A] hover:bg-[#243B58] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Post an RFQ
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
            />
          </div>

          {/* Category pills */}
          {categories.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                    activeCategory === cat
                      ? 'bg-[#1A2E4A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/5" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search || activeCategory !== 'All' ? 'No matching RFQs' : 'No open RFQs yet'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {search || activeCategory !== 'All' ? 'Try a different search or category.' : 'Be the first buyer to post a requirement.'}
            </p>
            <Link href="/marketplace/rfqs/new" className="inline-flex items-center gap-2 bg-[#1A2E4A] text-white font-semibold px-6 py-3 rounded-xl text-sm">
              <Plus className="w-4 h-4" /> Post RFQ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rfq) => (
              <Link
                key={rfq.id}
                href={`/marketplace/rfqs/${rfq.id}`}
                className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md p-5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors mt-0.5">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#1A2E4A] group-hover:text-orange-600 transition-colors text-[15px]">
                        {rfq.product_name}
                      </h3>
                      <p className="text-slate-500 text-sm mt-0.5">{rfq.company_name || rfq.contact_name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                    {rfq.category && (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                        {rfq.category}
                      </span>
                    )}
                    {rfq.quantity && (
                      <span className="text-xs text-slate-600 font-medium">
                        Qty: <span className="text-[#1A2E4A]">{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                      </span>
                    )}
                    {rfq.budget_range && (
                      <span className="text-xs text-slate-600 font-medium">
                        Budget: <span className="text-[#1A2E4A]">{rfq.budget_range}</span>
                      </span>
                    )}
                    {rfq.country && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                        <MapPin className="w-3 h-3" />{rfq.country}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{timeAgo(rfq.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
