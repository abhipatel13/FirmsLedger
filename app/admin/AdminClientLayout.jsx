'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Search, Globe, Mail, Building2,
  LogOut, X, ChevronRight, Loader2,
} from 'lucide-react';

const NAV = [
  { label: 'Overview',        href: '/admin',             icon: LayoutDashboard },
  { label: 'Agencies',        href: '/admin/agencies',    icon: Building2 },
  { label: 'Blog Automation', href: '/admin/blogs',       icon: FileText },
  { label: 'SEO Audit',       href: '/admin/seo-audit',  icon: Search },
  { label: 'URL Submissions', href: '/admin/submissions', icon: Globe },
  { label: 'Email Campaigns', href: '/admin/campaigns',  icon: Mail },
];

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
      if (!res.ok) { setError(data.error || 'Invalid credentials'); return; }
      onLogin();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="FirmsLedger" className="h-12 w-auto" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-slate-900 font-semibold text-lg mb-5">Sign in</h1>
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0D1B2A] focus:ring-1 focus:ring-[#0D1B2A]"
                placeholder="admin@firmsledger.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0D1B2A] focus:ring-1 focus:ring-[#0D1B2A]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D1B2A] hover:bg-[#162336] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <Link href="/" className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

function Sidebar({ onLogout, collapsed, setCollapsed }) {
  const pathname = usePathname();

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#0D1B2A] flex flex-col transition-all duration-200 z-30 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-white/10 gap-2">
        {collapsed ? (
          <img src="/logo-icon.svg" alt="FirmsLedger" className="w-9 h-9 shrink-0" />
        ) : (
          <img src="/logo-white.svg" alt="FirmsLedger" className="h-9 w-auto flex-1 min-w-0" />
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-white/40 hover:text-white transition-colors shrink-0 ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }) {
  const [authState, setAuthState] = useState('loading');
  const [collapsed, setCollapsed] = useState(false);

  const checkAuth = useCallback(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => setAuthState(res.ok ? 'authed' : 'unauthed'))
      .catch(() => setAuthState('unauthed'));
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthState('unauthed');
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0D1B2A]" />
      </div>
    );
  }

  if (authState === 'unauthed') {
    return <LoginForm onLogin={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        {children}
      </main>
    </div>
  );
}
