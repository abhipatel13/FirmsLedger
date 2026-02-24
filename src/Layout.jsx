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
  const [_selectedLocation, _setSelectedLocation] = useState('');
  const [_selectedParentId, _setSelectedParentId] = useState(null);
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

  const topLocations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

  const _handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (_selectedLocation) params.append('location', _selectedLocation);
    router.push(getDirectoryUrl() + (params.toString() ? '?' + params.toString() : ''));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-8 min-w-0">
                {/* Modern Logo */}
                <Link href={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="currentColor" opacity="0.3"/>
                        <path d="M8 8h3v3M16 8h3v3M8 19h3v3M16 19h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight truncate">
                      FirmsLedger
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold leading-tight tracking-wide hidden sm:block">
                      BUSINESS DIRECTORY
                    </span>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
                  <DropdownMenu>
                            <DropdownMenuTrigger 
                              className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold transition-colors text-sm"
                              aria-label="Find Services Menu"
                            >
                              Find Services
                              <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[600px] p-4" align="start">
                              <div className="grid grid-cols-1 gap-4">
                                {/* Staffing Companies with Subcategories */}
                                {categories
                                  .filter(cat => (cat.is_parent ?? cat.isParent) && cat.slug === 'staffing-companies')
                                  .map((parent) => {
                                    const subcats = categories.filter(c => (c.parent_id ?? c.parentId) === parent.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                                    return (
                                      <div key={parent.id} className="border-b pb-4">
                                        <Link
                                          href={parent.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(parent.slug)}
                                          className="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-2"
                                          onClick={(e) => {
                                            e.currentTarget.blur();
                                            document.activeElement?.blur();
                                          }}
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-blue-600">{parent.name.charAt(0)}</span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{parent.name}</span>
                                            <span className="text-xs text-slate-500">{parent.description}</span>
                                          </div>
                                        </Link>
                                        {subcats.length > 0 && (
                                          <div className="grid grid-cols-2 gap-2 pl-3 mt-2">
                                            {subcats.map(subcat => (
                                              <Link
                                                key={subcat.id}
                                                href={getDirectoryUrl(subcat.slug, { underStaffing: true })}
                                                className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                  e.currentTarget.blur();
                                                  document.activeElement?.blur();
                                                }}
                                              >
                                                {subcat.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                {/* Other Parent Categories */}
                                <div className="grid grid-cols-2 gap-2">
                                  {categories
                                    .filter(cat => (cat.is_parent ?? cat.isParent) && cat.slug !== 'staffing-companies')
                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                    .map((cat) => (
                                      <Link
                                        key={cat.id}
                                        href={cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug, { underStaffing: cat.slug !== 'staffing-companies' && categories.some((p) => (p.is_parent ?? p.isParent) && p.slug === 'staffing-companies' && p.id === (cat.parent_id ?? cat.parentId)) })}
                                        className="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        onClick={(e) => {
                                          e.currentTarget.blur();
                                          document.activeElement?.blur();
                                        }}
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs font-bold text-blue-600">{cat.name.charAt(0)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-slate-900">{cat.name}</span>
                                          <span className="text-xs text-slate-500 line-clamp-1">{cat.description}</span>
                                        </div>
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                  <Link href={createPageUrl('Blogs')} className="text-slate-700 hover:text-blue-600 font-semibold transition-colors text-sm">
                    Resources
                  </Link>

                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && router.push(getDirectoryUrl() + (searchQuery ? '?search=' + encodeURIComponent(searchQuery) : ''))}
                      className="bg-transparent border-none outline-none text-sm w-32"
                    />
                  </div>

                  <Button 
                    variant="ghost"
                    onClick={() => router.push(createPageUrl('WriteReview'))}
                    className="text-slate-700 hover:text-blue-600 font-semibold"
                  >
                    Write a Review
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => api.auth.redirectToLogin()}
                    className="border-slate-300 text-slate-700 hover:text-blue-600 font-semibold"
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
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

          {/* Mobile Menu - visible when hamburger is shown (below lg) */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t overflow-y-auto max-h-[calc(100vh-5rem)]">
              <div className="flex flex-col gap-1">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-1 py-2">Find a Service</div>
                <div className="pl-2 flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                  {categories.filter(cat => (cat.is_parent ?? cat.isParent) || !(cat.parent_id ?? cat.parentId)).map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug, { underStaffing: cat.slug !== 'staffing-companies' && categories.some((p) => (p.is_parent ?? p.isParent) && p.slug === 'staffing-companies' && p.id === (cat.parent_id ?? cat.parentId)) })}
                      className="text-slate-700 hover:text-blue-600 py-3 px-3 text-sm rounded-lg hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link 
                  href={getDirectoryUrl()} 
                  className="text-slate-700 hover:text-blue-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Agencies
                </Link>
                <Link 
                  href={createPageUrl('Blogs')} 
                  className="text-slate-700 hover:text-blue-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
                <Link 
                  href={createPageUrl('WriteReview')} 
                  className="text-slate-700 hover:text-blue-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Write a Review
                </Link>
                <div className="border-t border-slate-200 mt-2 pt-3 px-3 flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    className="w-full justify-center border-slate-300 text-slate-700"
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

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-white mt-12 sm:mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <Link href={createPageUrl('Home')} className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="currentColor" opacity="0.3"/>
                    <path d="M8 8h3v3M16 8h3v3M8 19h3v3M16 19h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FirmsLedger
                </span>
              </Link>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                India's most trusted platform to discover and connect with verified business service providers. Make confident decisions for your business growth.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Platform</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href={createPageUrl('Home')} className="text-slate-400 hover:text-blue-400 transition-colors">Home</Link>
                <Link href={getDirectoryUrl()} className="text-slate-400 hover:text-blue-400 transition-colors">Browse Agencies</Link>
                <Link href={createPageUrl('ListYourCompany')} className="text-slate-400 hover:text-blue-400 transition-colors">List your company</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-slate-400 hover:text-blue-400 transition-colors">Admin</Link>
                )}
                <Link href={createPageUrl('Blogs')} className="text-slate-400 hover:text-blue-400 transition-colors">Blog</Link>
                <Link href={createPageUrl('Contact')} className="text-slate-400 hover:text-blue-400 transition-colors">Contact us</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Top Categories</h4>
              <div className="flex flex-col gap-3 text-sm">
                {categories.slice(0, 5).map((cat) => (
                  <Link key={cat.id} href={cat.slug === 'staffing-companies' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug, { underStaffing: cat.slug !== 'staffing-companies' && categories.some((p) => (p.is_parent ?? p.isParent) && p.slug === 'staffing-companies' && p.id === (cat.parent_id ?? cat.parentId)) })} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Top Locations</h4>
              <div className="flex flex-col gap-3 text-sm">
                {topLocations.map((loc) => (
                  <Link key={loc} href={getDirectoryUrl() + '?location=' + encodeURIComponent(loc)} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-slate-500 text-xs sm:text-sm order-2 sm:order-1">
                © 2026 FirmsLedger. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-sm order-1 sm:order-2">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}