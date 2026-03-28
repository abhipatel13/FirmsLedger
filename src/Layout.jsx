'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Menu, X, Search, Facebook, Twitter, Linkedin, Instagram, ChevronRight, ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const catDropdownRef = useRef(null);
  const catTimeoutRef = useRef(null);
  const router = useRouter();

  React.useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => res.ok && setIsAdmin(true))
      .catch(() => {});
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const { parentCategories, standaloneCategories } = useMemo(() => {
    const parents = categories.filter((c) => c.is_parent || c.isParent);
    const standalone = categories.filter(
      (c) => !(c.is_parent || c.isParent) && !(c.parent_id || c.parentId)
    );
    return { parentCategories: parents, standaloneCategories: standalone };
  }, [categories]);

  const getSubcategories = useCallback(
    (parentId) => categories.filter((c) => (c.parent_id ?? c.parentId) === parentId),
    [categories]
  );

  const getCategoryHref = useCallback((cat, parent) => {
    if (cat.is_parent || cat.isParent) {
      return cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug);
    }
    const isStaffing = parent?.slug === 'staffing-companies';
    return getDirectoryUrl(cat.slug, { underStaffing: isStaffing });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCatMouseEnter = () => {
    clearTimeout(catTimeoutRef.current);
    setCatDropdownOpen(true);
  };
  const handleCatMouseLeave = () => {
    catTimeoutRef.current = setTimeout(() => setCatDropdownOpen(false), 200);
  };

  const topLocations = [
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Singapore', value: 'Singapore' },
    { label: 'UAE', value: 'United Arab Emirates' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-8 min-w-0">
            {/* Logo */}
            <Link href={createPageUrl('Home')} className="flex items-center flex-shrink-0">
              <img src="/logo.svg" alt="FirmsLedger" className="h-11 sm:h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              {/* Browse Categories with mega dropdown */}
              <div
                ref={catDropdownRef}
                className="relative"
                onMouseEnter={handleCatMouseEnter}
                onMouseLeave={handleCatMouseLeave}
              >
                <button
                  onClick={() => setCatDropdownOpen((v) => !v)}
                  className="flex items-center gap-1 text-slate-700 hover:text-orange-600 font-semibold transition-colors text-sm"
                >
                  Browse Categories
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {catDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-[700px] max-h-[70vh] overflow-y-auto p-5">
                    {/* Parent categories with subcategories */}
                    {parentCategories.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {parentCategories.map((parent) => {
                          const subs = getSubcategories(parent.id);
                          return (
                            <div key={parent.id}>
                              <Link
                                href={getCategoryHref(parent)}
                                onClick={() => setCatDropdownOpen(false)}
                                className="text-sm font-bold text-[#0D1B2A] hover:text-orange-600 transition-colors flex items-center gap-1.5"
                              >
                                {parent.name}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </Link>
                              {subs.length > 0 && (
                                <div className="mt-1.5 ml-0.5 flex flex-col gap-1">
                                  {subs.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={getCategoryHref(sub, parent)}
                                      onClick={() => setCatDropdownOpen(false)}
                                      className="text-xs text-slate-500 hover:text-orange-600 transition-colors py-0.5 pl-2 border-l-2 border-transparent hover:border-orange-400"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Standalone categories */}
                    {standaloneCategories.length > 0 && (
                      <>
                        {parentCategories.length > 0 && <div className="border-t border-slate-100 my-4" />}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Other Categories</p>
                          <div className="flex flex-wrap gap-1.5">
                            {standaloneCategories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={getDirectoryUrl(cat.slug)}
                                onClick={() => setCatDropdownOpen(false)}
                                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors"
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* View All link */}
                    <div className="border-t border-slate-100 mt-4 pt-3 text-center">
                      <Link
                        href="/Categories"
                        onClick={() => setCatDropdownOpen(false)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        View All Categories <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href={createPageUrl('Blogs')} className="text-slate-700 hover:text-orange-600 font-semibold transition-colors text-sm">
                Resources
              </Link>

              <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-2 border border-slate-200 hover:border-orange-300 transition-colors">
                <button
                  type="button"
                  onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                  className="flex-shrink-0"
                >
                  <Search className="w-4 h-4 text-slate-400 hover:text-orange-500 transition-colors" />
                </button>
                <input
                  type="text"
                  placeholder="Search agencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                  className="bg-transparent border-none outline-none text-sm w-32 text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <Button
                variant="ghost"
                onClick={() => router.push(createPageUrl('WriteReview'))}
                className="text-slate-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm"
              >
                Write a Review
              </Button>

              <Button
                variant="outline"
                onClick={() => api.auth.redirectToLogin()}
                className="border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600 font-semibold text-sm"
              >
                Sign In
              </Button>

              <Link href="/ListYourCompany">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5">
                  Get Listed — It's Free
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 overflow-y-auto max-h-[calc(100vh-5rem)]">
              <div className="flex flex-col gap-1">
                {/* Mobile: Browse Categories with expandable subcategories */}
                <button
                  onClick={() => setMobileCatOpen((v) => !v)}
                  className="flex items-center justify-between text-slate-700 hover:text-orange-600 py-3 px-3 font-semibold text-sm rounded-lg hover:bg-orange-50 touch-manipulation w-full text-left"
                >
                  Browse Categories
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCatOpen && (
                  <div className="pl-3 pb-2 flex flex-col gap-0.5">
                    {parentCategories.map((parent) => {
                      const subs = getSubcategories(parent.id);
                      return (
                        <div key={parent.id}>
                          <Link
                            href={getCategoryHref(parent)}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-1.5 py-2 px-3 text-sm font-semibold text-[#0D1B2A] hover:text-orange-600 rounded-lg hover:bg-orange-50"
                          >
                            {parent.name}
                          </Link>
                          {subs.length > 0 && (
                            <div className="pl-5 flex flex-col gap-0.5">
                              {subs.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={getCategoryHref(sub, parent)}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="py-1.5 px-3 text-xs text-slate-500 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {standaloneCategories.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-slate-100">
                        {standaloneCategories.slice(0, 10).map((cat) => (
                          <Link
                            key={cat.id}
                            href={getDirectoryUrl(cat.slug)}
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-1.5 px-3 text-xs text-slate-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 block"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/Categories"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 text-xs font-semibold text-orange-500 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                    >
                      View All Categories →
                    </Link>
                  </div>
                )}
                <Link
                  href={getDirectoryUrl()}
                  className="text-slate-700 hover:text-orange-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-orange-50 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Agencies
                </Link>
                <Link
                  href={createPageUrl('Blogs')}
                  className="text-slate-700 hover:text-orange-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-orange-50 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
                <Link
                  href={createPageUrl('WriteReview')}
                  className="text-slate-700 hover:text-orange-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-orange-50 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Write a Review
                </Link>
                <div className="border-t border-slate-200 mt-2 pt-3 px-3 flex flex-col gap-2">
                  <Link href="/ListYourCompany" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                      Get Listed — It's Free
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600"
                    onClick={() => { setMobileMenuOpen(false); api.auth.redirectToLogin(); }}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-w-0 overflow-x-hidden">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <Link href={createPageUrl('Home')} className="flex items-center mb-6">
                <img src="/logo-white.svg" alt="FirmsLedger" className="h-11 w-auto" />
              </Link>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                The trusted global platform to discover and connect with verified business service providers worldwide. Make confident decisions for your business growth.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Platform</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href={createPageUrl('Home')} className="text-slate-400 hover:text-orange-400 transition-colors">Home</Link>
                <Link href={getDirectoryUrl()} className="text-slate-400 hover:text-orange-400 transition-colors">Browse Agencies</Link>
                <Link href={createPageUrl('ListYourCompany')} className="text-slate-400 hover:text-orange-400 transition-colors">List your company</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-slate-400 hover:text-orange-400 transition-colors">Admin</Link>
                )}
                <Link href={createPageUrl('Blogs')} className="text-slate-400 hover:text-orange-400 transition-colors">Blog</Link>
                <Link href={createPageUrl('Contact')} className="text-slate-400 hover:text-orange-400 transition-colors">Contact us</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Top Categories</h4>
              <div className="flex flex-col gap-3 text-sm">
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug, { underStaffing: cat.slug !== 'staffing-companies' && categories.some((p) => (p.is_parent ?? p.isParent) && p.slug === 'staffing-companies' && p.id === (cat.parent_id ?? cat.parentId)) })}
                    className="text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Top Locations</h4>
              <div className="flex flex-col gap-3 text-sm">
                {topLocations.map(({ label, value }) => (
                  <Link
                    key={value}
                    href={getDirectoryUrl() + '?country=' + encodeURIComponent(value)}
                    className="text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-slate-500 text-xs sm:text-sm order-2 sm:order-1">
                © 2026 FirmsLedger. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-sm order-1 sm:order-2">
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
