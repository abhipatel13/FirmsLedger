'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Package } from 'lucide-react';

const NAV_LINKS = [
  { href: '/marketplace/rfqs', label: 'Browse RFQs' },
  { href: '/marketplace/suppliers', label: 'Suppliers' },
  { href: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img src="/logo.svg" alt="FirmsLedger" className="h-11 sm:h-12 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-semibold text-sm transition-colors ${
                    pathname === href ? 'text-orange-600' : 'text-slate-700 hover:text-orange-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/marketplace/rfqs/new"
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-orange-400 text-slate-700 hover:text-orange-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Post RFQ
              </Link>
              <Link
                href="/marketplace/suppliers/new"
                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Package className="w-4 h-4" />
                List Products
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="lg:hidden p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-700 hover:text-orange-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-orange-50"
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-slate-200 mt-2 pt-3 px-3 flex flex-col gap-2">
                <Link
                  href="/marketplace/rfqs/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Post RFQ
                </Link>
                <Link
                  href="/marketplace/suppliers/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  <Package className="w-4 h-4" />
                  List Products
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="min-w-0 overflow-x-hidden">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1A2E4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center mb-5">
                <img src="/logo-white.svg" alt="FirmsLedger" className="h-10 w-auto" />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Global B2B marketplace. Post RFQs to find suppliers or list your products to reach
                qualified buyers worldwide — free for buyers and suppliers.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">For Buyers</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/marketplace/rfqs/new" className="text-slate-400 hover:text-orange-400 transition-colors">Post an RFQ</Link>
                <Link href="/marketplace/rfqs" className="text-slate-400 hover:text-orange-400 transition-colors">Browse Open RFQs</Link>
                <Link href="/marketplace/suppliers" className="text-slate-400 hover:text-orange-400 transition-colors">Find Suppliers</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">For Suppliers</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/marketplace/suppliers/new" className="text-slate-400 hover:text-orange-400 transition-colors">List Your Products</Link>
                <Link href="/marketplace/rfqs" className="text-slate-400 hover:text-orange-400 transition-colors">Browse RFQs</Link>
                <Link href="/contact" className="text-slate-400 hover:text-orange-400 transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">© 2026 FirmsLedger. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-slate-400 hover:text-orange-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-slate-400 hover:text-orange-400 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
