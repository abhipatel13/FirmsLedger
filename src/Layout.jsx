'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Menu, X, Search, ChevronDown, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-8 min-w-0">
            {/* Logo */}
            <Link href={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#0D1B2A] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-black text-base sm:text-lg leading-none tracking-tight">FL</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-xl font-extrabold text-[#0D1B2A] leading-tight tracking-tight truncate">
                  FirmsLedger
                </span>
                <span className="text-[9px] sm:text-[10px] text-orange-500 font-semibold leading-tight tracking-widest hidden sm:block uppercase">
                  AI Matchmaker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 text-slate-700 hover:text-orange-600 font-semibold transition-colors text-sm"
                  aria-label="Find Services Menu"
                >
                  Find Services
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[620px] p-5" align="start">
                  <div className="grid grid-cols-2 gap-1">
                    {categories
                      .filter(cat => (cat.is_parent ?? cat.isParent))
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((cat) => {
                        const children = categories
                          .filter(c => (c.parent_id ?? c.parentId) === cat.id)
                          .slice(0, 4);
                        const parentHref = cat.slug === 'staffing-companies'
                          ? getDirectoryStaffingUrl()
                          : getDirectoryUrl(cat.slug);
                        const isStaffing = cat.slug === 'staffing-companies';
                        return (
                          <div key={cat.id} className="flex flex-col rounded-xl hover:bg-slate-50 transition-colors p-2.5 group">
                            <Link
                              href={parentHref}
                              className="flex items-center gap-2.5 mb-2"
                              onClick={(e) => { e.currentTarget.blur(); document.activeElement?.blur(); }}
                            >
                              <div className="w-7 h-7 rounded-md bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-orange-400">{cat.name.charAt(0)}</span>
                              </div>
                              <span className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                                {cat.name}
                              </span>
                            </Link>
                            {children.length > 0 && (
                              <div className="pl-9 flex flex-col gap-0.5">
                                {children.map(child => (
                                  <Link
                                    key={child.id}
                                    href={isStaffing
                                      ? getDirectoryUrl(child.slug, { underStaffing: true })
                                      : getDirectoryUrl(child.slug)
                                    }
                                    className="text-[11px] text-slate-500 hover:text-orange-500 transition-colors py-0.5 leading-snug"
                                    onClick={(e) => { e.currentTarget.blur(); document.activeElement?.blur(); }}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={getDirectoryUrl()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                      onClick={(e) => { e.currentTarget.blur(); document.activeElement?.blur(); }}
                    >
                      Browse all agencies →
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 py-2">Find a Service</div>
                <div className="pl-2 flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                  {categories
                    .filter(cat => (cat.is_parent ?? cat.isParent))
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((cat) => {
                      const isStaffing = cat.slug === 'staffing-companies';
                      const children = categories.filter(c => (c.parent_id ?? c.parentId) === cat.id);
                      return (
                        <div key={cat.id}>
                          <Link
                            href={isStaffing ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug)}
                            className="text-slate-800 font-semibold hover:text-orange-600 py-2.5 px-3 text-sm rounded-lg hover:bg-orange-50 active:bg-orange-100 touch-manipulation flex items-center gap-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="w-5 h-5 rounded bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-black text-orange-400">{cat.name.charAt(0)}</span>
                            </div>
                            {cat.name}
                          </Link>
                          {children.length > 0 && (
                            <div className="pl-10 flex flex-col">
                              {children.map(child => (
                                <Link
                                  key={child.id}
                                  href={isStaffing
                                    ? getDirectoryUrl(child.slug, { underStaffing: true })
                                    : getDirectoryUrl(child.slug)
                                  }
                                  className="text-slate-500 hover:text-orange-600 py-1.5 px-2 text-xs rounded hover:bg-orange-50 touch-manipulation"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <Link href={createPageUrl('Home')} className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-base leading-none tracking-tight">FL</span>
                </div>
                <span className="text-xl font-extrabold text-white">
                  FirmsLedger
                </span>
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
