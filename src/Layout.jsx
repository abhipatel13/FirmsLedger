'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl, getDirectoryUrl, getDirectoryStaffingUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Menu, X, Search, ChevronRight, ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

// Parent category slugs treated as "products" (vs default "services").
// Keep this in sync with admin category seeding until a DB-level type column exists.
const PRODUCT_SLUGS = new Set([
  'manufacturing',
  'machinery-equipment',
  'chemicals-materials',
  'retail-e-commerce',
  'retail-ecommerce',
  'products',
]);

function MobileCategorySection({ label, serviceParents, productParents, getSubs, getHref, onNavigate }) {
  const [open, setOpen] = useState(false);
  if (!serviceParents.length && !productParents.length) return null;

  const renderParent = (parent) => {
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
  };

  const renderGroup = (title, parents) => {
    if (!parents.length) return null;
    return (
      <div className="pt-2 first:pt-0">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</div>
        {parents.map(renderParent)}
      </div>
    );
  };

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
          {renderGroup('Services', serviceParents)}
          {renderGroup('Products', productParents)}
        </div>
      )}
    </>
  );
}

function MegaMenu({ serviceParents, productParents, getSubs, getHref, onClose, rootHref }) {
  const [activeTab, setActiveTab] = useState('services');
  const parents = activeTab === 'services' ? serviceParents : productParents;
  const [activeId, setActiveId] = useState(parents[0]?.id ?? null);

  useEffect(() => {
    if (!parents.length) { setActiveId(null); return; }
    if (!parents.find((p) => p.id === activeId)) setActiveId(parents[0].id);
  }, [parents, activeId]);

  const activeParent = parents.find((p) => p.id === activeId) || parents[0];
  const subs = activeParent ? getSubs(activeParent.id) : [];

  const hasAny = serviceParents.length + productParents.length > 0;

  const tabButton = (key, label, count) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`px-5 py-3 text-sm font-semibold transition-colors relative ${
        activeTab === key
          ? 'text-orange-600 bg-white'
          : 'text-slate-600 hover:text-[#1A2E4A]'
      }`}
    >
      {label}
      <span className="ml-1.5 text-xs text-slate-400">{count}</span>
      {activeTab === key && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />
      )}
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-[920px] max-w-[95vw] overflow-hidden">
      <div className="flex items-center border-b border-slate-100 bg-slate-50/70">
        {tabButton('services', 'Services', serviceParents.length)}
        {tabButton('products', 'Products', productParents.length)}
      </div>

      {!hasAny ? (
        <div className="p-6 text-sm text-slate-500">No categories available yet.</div>
      ) : parents.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">No {activeTab} categories yet.</div>
      ) : (
      <div className="grid grid-cols-[260px_1fr] min-h-[420px]">
        {/* Left rail — parent categories */}
        <div className="bg-slate-50/70 border-r border-slate-100 py-2 overflow-y-auto max-h-[480px]">
          {parents.map((p) => {
            const isActive = p.id === activeParent?.id;
            return (
              <button
                key={p.id}
                type="button"
                onMouseEnter={() => setActiveId(p.id)}
                onFocus={() => setActiveId(p.id)}
                onClick={() => setActiveId(p.id)}
                className={`w-full flex items-center justify-between gap-2 px-5 py-3 text-sm font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-700 hover:bg-white hover:text-[#1A2E4A]'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right panel — subcategory cards */}
        <div className="p-5 flex flex-col min-h-full">
          {subs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 content-start flex-1 overflow-y-auto max-h-[440px] pr-1">
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  href={getHref(sub, activeParent)}
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-orange-400 hover:text-orange-600 hover:shadow-sm transition-all"
                >
                  <span className="w-8 h-8 bg-slate-100 group-hover:bg-orange-50 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-500 group-hover:text-orange-600 transition-colors">
                    {sub.name.charAt(0)}
                  </span>
                  <span className="font-medium truncate">{sub.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
              No subcategories yet. Click “Explore” to view {activeParent?.name}.
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {activeParent?.name} · {subs.length} {subs.length === 1 ? 'category' : 'categories'}
            </p>
            <Link
              href={activeParent ? getHref(activeParent) : (rootHref || '/directory')}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#D48E1A] text-[#1A2E4A] font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Explore all categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // null | 'categories'
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

  const { parentCategories, serviceParents, productParents } = useMemo(() => {
    const parents = categories
      .filter((c) => c.is_parent ?? c.isParent)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const products = parents.filter((p) => PRODUCT_SLUGS.has(p.slug));
    const services = parents.filter((p) => !PRODUCT_SLUGS.has(p.slug));
    return { parentCategories: parents, serviceParents: services, productParents: products };
  }, [categories]);

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

                {openDropdown === 'categories' && (
                  <div
                    className="absolute top-full right-0 pt-5 z-50"
                    onMouseEnter={() => openMenu('categories')}
                  >
                    <MegaMenu
                      serviceParents={serviceParents}
                      productParents={productParents}
                      getSubs={getSubcategories}
                      getHref={getCategoryHref}
                      onClose={closeMenus}
                      rootHref={getDirectoryUrl()}
                    />
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="text-slate-700 hover:text-orange-600 font-semibold text-sm transition-colors"
              >
                Blog
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
                {/* Mobile: combined Services + Products */}
                <MobileCategorySection
                  label="Browse Categories"
                  serviceParents={serviceParents}
                  productParents={productParents}
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
                  Blog
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
