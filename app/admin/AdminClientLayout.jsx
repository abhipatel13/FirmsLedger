'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, FolderTree, BadgeCheck,
  LogOut, PanelLeftClose, PanelLeftOpen, Menu, X, Loader2, ArrowLeft,
} from 'lucide-react';
import { Button, INPUT, Notice } from '@/components/admin/ui';

/**
 * Only sections that actually work are listed.
 *
 * Removed 2026-09-09:
 *  - "Blog Automation" -> /admin/blogs, a route that does not exist (404).
 *  - "SEO Audit" and "Email Campaigns" -> their APIs still build a Supabase
 *    client from env vars that are not set, so both return errors. Supabase is
 *    no longer this project's database (see CLAUDE.md).
 *  - "URL Submissions" -> the feature cannot run. getUnsubmittedUrls() reads
 *    submission_logs WHERE submitted = false, but the only INSERT into that
 *    table happens in urlSubmitter.ts AFTER a submission succeeds. Nothing ever
 *    seeds it from companies or the sitemap, so the table is permanently empty
 *    and createSubmissionLog() has zero callers. Needs a seeding step before
 *    the page means anything.
 *
 * Re-add each one when its data path actually works, not before — a nav link to
 * a broken page is worse than no link, because it costs a click to find out.
 */
const NAV = [
  { label: 'Overview',        href: '/admin',             icon: LayoutDashboard },
  { label: 'Listing Claims',  href: '/admin/claims',      icon: BadgeCheck },
  { label: 'Companies',       href: '/admin/agencies',    icon: Building2 },
  { label: 'Categories',      href: '/admin/categories',  icon: FolderTree },
];

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Invalid email or password.'); return; }
      onLogin();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <HidePublicChrome />
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo-white.svg" alt="FirmsLedger" className="h-10 w-auto" />
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#111C2E] p-6">
          <h1 className="text-base font-semibold text-[#E8EDF5]">Admin sign in</h1>
          <p className="text-sm text-[#94A3B8] mt-1 mb-5">Manage listings, claims and categories.</p>

          {error && <div className="mb-4"><Notice tone="red">{error}</Notice></div>}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Email
              </label>
              <input
                id="admin-email" type="email" required autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={INPUT} placeholder="admin@firmsledger.com"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Password
              </label>
              <input
                id="admin-password" type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={INPUT} placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="primary" loading={loading} className="w-full h-10">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
        <Link
          href="/"
          className={`mt-4 flex items-center justify-center gap-1.5 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors duration-150 rounded ${FOCUS}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden /> Back to site
        </Link>
      </div>
    </div>
  );
}

function NavLinks({ collapsed, onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" aria-label="Admin sections">
      {NAV.map(({ label, href, icon: Icon }) => {
        // Exact match for /admin, prefix match for the rest, so Overview isn't
        // highlighted on every child page.
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={`relative flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium
              transition-colors duration-150 ${FOCUS} ${
              active
                ? 'bg-[#F5A623]/12 text-[#F5A623]'
                : 'text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-white/[0.06]'
            }`}
          >
            {/* A 2px rail reads as "selected" without the heavy tinted border
                the previous version used on an otherwise quiet sidebar. */}
            {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F5A623]" aria-hidden />}
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Hides the public site header and footer while the admin panel is mounted.
 *
 * The obvious approach — an `if (pathname.startsWith('/admin')) return children`
 * inside src/Layout.jsx — is NOT hydration-safe. Layout is a client component
 * in the ROOT layout, and usePathname() does not report /admin during the
 * server render of a statically-generated route, so the server emitted the
 * public chrome, the client emitted bare children, and React threw the whole
 * hydrated tree away: blank page with a stuck spinner.
 *
 * A static <style> renders byte-identically on both sides, so there is no
 * branch to mismatch. The chrome stays in the DOM and is simply not displayed.
 */
function HidePublicChrome() {
  return <style>{`.fl-public-chrome{display:none!important}`}</style>;
}

export default function AdminLayout({ children }) {
  const [authState, setAuthState] = useState('loading');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => setAuthState(res.ok ? 'authed' : 'unauthed'))
      .catch(() => setAuthState('unauthed'));
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthState('unauthed');
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <HidePublicChrome />
        <Loader2 className="w-6 h-6 animate-spin text-[#F5A623]" aria-label="Loading" />
      </div>
    );
  }

  if (authState === 'unauthed') return <LoginForm onLogin={checkAuth} />;

  const sidebarWidth = collapsed ? 'lg:w-16' : 'lg:w-60';

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E8EDF5]">
      <HidePublicChrome />
      {/* Mobile bar: the sidebar is fixed, so small screens need a way in. */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-[#0F172A] border-b border-white/[0.08]">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
          className={`p-2 -ml-2 rounded-lg text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-white/[0.06] transition-colors duration-150 ${FOCUS}`}
        >
          <Menu className="w-5 h-5" aria-hidden />
        </button>
        <img src="/logo-white.svg" alt="FirmsLedger" className="h-7 w-auto" />
      </div>

      {mobileOpen && (
        <button
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          aria-label="Close admin menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full flex flex-col bg-[#0F172A] border-r border-white/[0.08]
          transition-transform duration-200 lg:transition-all w-60 ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center gap-2 h-14 px-3 border-b border-white/[0.08]">
          {collapsed ? (
            <img src="/logo-icon.svg" alt="FirmsLedger" className="w-8 h-8 shrink-0 mx-auto" />
          ) : (
            <img src="/logo-white.svg" alt="FirmsLedger" className="h-7 w-auto min-w-0" />
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden lg:inline-flex ml-auto p-1.5 rounded-lg text-[#64748B] hover:text-[#E8EDF5] hover:bg-white/[0.06] transition-colors duration-150 ${FOCUS}`}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" aria-hidden /> : <PanelLeftClose className="w-4 h-4" aria-hidden />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin menu"
            className={`lg:hidden ml-auto p-1.5 rounded-lg text-[#64748B] hover:text-[#E8EDF5] transition-colors duration-150 ${FOCUS}`}
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <NavLinks collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />

        <div className="p-2 border-t border-white/[0.08] space-y-0.5">
          <Link
            href="/"
            title={collapsed ? 'Back to site' : undefined}
            className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-[#64748B] hover:text-[#E8EDF5] hover:bg-white/[0.06] transition-colors duration-150 ${FOCUS}`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            {!collapsed && <span>Back to site</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-[#64748B] hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150 ${FOCUS}`}
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* The previous version rendered {children} with no padding at all, which
          is why content hugged the viewport edge and action buttons clipped. */}
      <main className={`transition-all duration-200 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
