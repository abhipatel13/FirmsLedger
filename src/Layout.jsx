'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl, getBlogArticleUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Menu, X, Search, ChevronRight, ChevronDown, BookOpen, Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

function MobileCategorySection({ label, parents, getSubs, getHref, onNavigate }) {
  const [open, setOpen] = useState(false);
  if (!parents.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between text-slate-700 hover:text-orange-600 py-3 px-3 font-semibold text-sm rounded-lg hover:bg-orange-50 touch-manipulation w-full text-left"
      >
        {label}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pl-3 pb-2 flex flex-col gap-0.5">
          {parents.map((parent) => {
            const subs = getSubs(parent.id);
            return (
              <div key={parent.id}>
                <Link
                  href={getHref(parent)}
                  onClick={onNavigate}
                  className="flex items-center gap-1.5 py-2 px-3 text-sm font-semibold text-[#1A2E4A] hover:text-orange-600 rounded-lg hover:bg-orange-50"
                >
                  {parent.name}
                </Link>
                {subs.length > 0 && (
                  <div className="pl-5 flex flex-col gap-0.5">
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        href={getHref(sub, parent)}
                        onClick={onNavigate}
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
        </div>
      )}
    </>
  );
}

function MegaMenu({ parents, getSubs, getHref, onClose, rootHref, recentPosts = [] }) {
  const [activeId, setActiveId] = useState(parents[0]?.id ?? null);

  useEffect(() => {
    if (!parents.length) { setActiveId(null); return; }
    if (!parents.find((p) => p.id === activeId)) setActiveId(parents[0].id);
  }, [parents, activeId]);

  const activeParent = parents.find((p) => p.id === activeId) || parents[0];
  const subs = activeParent ? getSubs(activeParent.id) : [];

  if (!parents.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-[420px] max-w-[95vw] p-6 text-sm text-slate-500">
        No categories available yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-[740px] max-w-[calc(100vw-1.5rem)] overflow-hidden">
      <div className="grid grid-cols-[220px_1fr]">
        {/* Left rail — parent categories */}
        <div className="bg-slate-50 border-r border-slate-200 py-3 max-h-[480px] overflow-y-auto flex flex-col">
          <div className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Industries
          </div>
          <div className="flex-1">
            {parents.map((p) => {
              const isActive = p.id === activeParent?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setActiveId(p.id)}
                  onFocus={() => setActiveId(p.id)}
                  onClick={() => setActiveId(p.id)}
                  className={`relative w-full flex items-center justify-between gap-2 px-5 py-2.5 text-sm font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-white text-[#1A2E4A] font-semibold shadow-[inset_2px_0_0_#F5A623]'
                      : 'text-slate-600 hover:bg-white/70 hover:text-[#1A2E4A]'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-[#F5A623]' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Resources / latest posts at bottom of rail */}
          {recentPosts.length > 0 && (
            <div className="mx-3 mt-3 mb-2 p-3 rounded-lg bg-gradient-to-br from-[#1A2E4A] to-[#0F1E33] text-white">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F5A623] mb-2">
                <Sparkles className="w-3 h-3" /> Latest Resources
              </div>
              <div className="flex flex-col gap-2">
                {recentPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    href={getBlogArticleUrl(post.slug)}
                    onClick={onClose}
                    className="group/post block"
                  >
                    <p className="text-[11px] font-semibold leading-snug text-white group-hover/post:text-[#F5A623] transition-colors line-clamp-2">
                      {post.title}
                    </p>
                    {post.category && (
                      <span className="text-[10px] text-slate-400 group-hover/post:text-slate-300 transition-colors">
                        {post.category}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <Link
                href="/blog"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F5A623] hover:gap-1.5 transition-all mt-2"
              >
                View all resources <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Right panel — subcategory list */}
        <div className="p-6 flex flex-col min-h-[420px]">
          {activeParent && (
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-bold text-[#1A2E4A]">
                {activeParent.name}
              </h3>
              <span className="text-[11px] text-slate-400">
                {subs.length} {subs.length === 1 ? 'category' : 'categories'}
              </span>
            </div>
          )}

          {subs.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 content-start flex-1 overflow-y-auto max-h-[360px] pr-1">
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  href={getHref(sub, activeParent)}
                  onClick={onClose}
                  className="group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <span className="font-medium truncate">{sub.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
              No subcategories yet for {activeParent?.name}.
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/blog"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Resources
            </Link>
            <Link
              href={activeParent ? getHref(activeParent) : (rootHref || '/directory')}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#D48E1A] text-[#1A2E4A] font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              View all in {activeParent?.name || 'directory'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // null | 'categories'
  const [menuPos, setMenuPos] = useState(null);
  const catDropdownRef = useRef(null);
  const catButtonRef = useRef(null);
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

  const { data: recentPosts = [] } = useQuery({
    queryKey: ['blog-posts', 'recent'],
    queryFn: () => fetch('/api/blog-posts').then((r) => (r.ok ? r.json() : [])),
    staleTime: 5 * 60 * 1000,
  });

  const parentCategories = useMemo(
    () =>
      categories
        .filter((c) => c.is_parent ?? c.isParent)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [categories]
  );

  const getSubcategories = useCallback(
    (parentId) => categories.filter((c) => (c.parent_id ?? c.parentId) === parentId),
    [categories]
  );

  const getCategoryHref = useCallback((cat, parent) => {
    if (cat.is_parent || cat.isParent) {
      return cat.slug === 'staffing-recruiting' ? getDirectoryStaffingUrl() : getDirectoryUrl(cat.slug);
    }
    const isStaffing = parent?.slug === 'staffing-recruiting';
    return getDirectoryUrl(cat.slug, { underStaffing: isStaffing });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Position mega menu relative to the button, clamped to viewport
  useEffect(() => {
    if (openDropdown !== 'categories') { setMenuPos(null); return; }

    const computePosition = () => {
      if (!catButtonRef.current) return;
      const rect = catButtonRef.current.getBoundingClientRect();
      const menuWidth = 740;
      const gutter = 12;
      const viewportWidth = window.innerWidth;

      let left = rect.left;
      if (left + menuWidth > viewportWidth - gutter) {
        left = viewportWidth - menuWidth - gutter;
      }
      left = Math.max(gutter, left);

      setMenuPos({ top: rect.bottom + 8, left });
    };

    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [openDropdown]);

  const openMenu = (which) => {
    clearTimeout(catTimeoutRef.current);
    setOpenDropdown(which);
  };
  const scheduleClose = () => {
    catTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };
  const closeMenus = () => setOpenDropdown(null);

  const topCountries = [
    { label: 'United States',  value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada',         value: 'Canada' },
    { label: 'Australia',      value: 'Australia' },
    { label: 'India',          value: 'India' },
    { label: 'Germany',        value: 'Germany' },
    { label: 'France',         value: 'France' },
    { label: 'UAE',            value: 'United Arab Emirates' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-8 min-w-0">
            {/* Logo */}
            <Link href={createPageUrl('Home')} className="flex items-center flex-shrink-0">
              <img src="/logo.svg" alt="FirmsLedger" className="h-11 sm:h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              {/* Combined Services + Products mega menu — tabs switch between the two groups */}
              <div
                ref={catDropdownRef}
                className="relative flex items-center"
                onMouseLeave={scheduleClose}
              >
                <button
                  ref={catButtonRef}
                  type="button"
                  onMouseEnter={() => openMenu('categories')}
                  onFocus={() => openMenu('categories')}
                  onClick={() => setOpenDropdown((v) => (v === 'categories' ? null : 'categories'))}
                  className={`flex items-center gap-1 font-semibold transition-colors text-sm ${
                    openDropdown === 'categories' ? 'text-orange-600' : 'text-slate-700 hover:text-orange-600'
                  }`}
                >
                  Browse Categories
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'categories' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'categories' && menuPos && (
                  <div
                    className="fixed z-50"
                    style={{ top: menuPos.top, left: menuPos.left }}
                    onMouseEnter={() => openMenu('categories')}
                  >
                    <MegaMenu
                      parents={parentCategories}
                      getSubs={getSubcategories}
                      getHref={getCategoryHref}
                      onClose={closeMenus}
                      rootHref={getDirectoryUrl()}
                      recentPosts={recentPosts}
                    />
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="text-slate-700 hover:text-orange-600 font-semibold text-sm transition-colors"
              >
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
                  className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
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
                <Button className="bg-[#F5A623] hover:bg-[#D48E1A] text-[#1A2E4A] font-semibold text-sm px-5 rounded-lg shadow-md shadow-[#F5A623]/25 btn-premium">
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
                {/* Mobile Search */}
                <div className="px-3 mb-2">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search agencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className="bg-transparent border-none outline-none text-sm flex-1 text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <MobileCategorySection
                  label="Browse Categories"
                  parents={parentCategories}
                  getSubs={getSubcategories}
                  getHref={getCategoryHref}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
                <Link
                  href={getDirectoryUrl()}
                  className="text-slate-700 hover:text-orange-600 py-3 px-3 font-medium text-sm rounded-lg hover:bg-orange-50 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Agencies
                </Link>
                <Link
                  href="/blog"
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
      <footer className="bg-[#1A2E4A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="relative w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <Link href={createPageUrl('Home')} className="flex items-center mb-6">
                <img src="/logo-white.svg" alt="FirmsLedger" className="h-11 w-auto" />
              </Link>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                The trusted global business directory. Find and compare verified companies across every industry, worldwide. Make confident hiring decisions.
              </p>
              {/* Social links — add real URLs when available */}
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Platform</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href={createPageUrl('Home')} className="text-slate-400 hover:text-orange-400 transition-colors">Home</Link>
                <Link href={getDirectoryUrl()} className="text-slate-400 hover:text-orange-400 transition-colors">Browse Companies</Link>
                <Link href={createPageUrl('ListYourCompany')} className="text-slate-400 hover:text-orange-400 transition-colors">List your company</Link>
                <Link href="/claim-listing" className="text-slate-400 hover:text-orange-400 transition-colors">Claim your listing</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-slate-400 hover:text-orange-400 transition-colors">Admin</Link>
                )}
                <Link href={createPageUrl('Contact')} className="text-slate-400 hover:text-orange-400 transition-colors">Contact us</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Categories</h4>
              <div className="flex flex-col gap-3 text-sm">
                {categories
                  .filter((cat) => cat.is_parent ?? cat.isParent)
                  .slice(0, 6)
                  .map((cat) => (
                    <Link
                      key={cat.id}
                      href={getDirectoryUrl(cat.slug)}
                      className="text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white text-xs uppercase tracking-widest">Top Countries</h4>
              <div className="flex flex-col gap-3 text-sm">
                {topCountries.map(({ label, value }) => (
                  <Link
                    key={value}
                    href={`/CountryPage?country=${encodeURIComponent(value)}`}
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
                <Link href="/terms" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Terms of Service</Link>
                <Link href="/privacy" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Privacy Policy</Link>
                <Link href="/Contact" className="text-slate-400 hover:text-orange-400 transition-colors py-2 min-h-[44px] flex items-center touch-manipulation">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
