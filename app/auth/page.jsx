'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signUpWithPassword, signInWithPassword, useSession } from '@/lib/auth';

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup';
  const reason = searchParams.get('reason'); // e.g. 'claim'

  const { user, loading: sessionLoading } = useSession();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionLoading && user) router.replace(next);
  }, [sessionLoading, user, next, router]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const res = await signUpWithPassword(form);
        if (!res.session) {
          toast.success('Account created. Check your email to confirm, then sign in.');
          setMode('signin');
        } else {
          toast.success('Welcome to FirmsLedger!');
          router.replace(next);
        }
      } else {
        await signInWithPassword(form);
        toast.success('Signed in.');
        router.replace(next);
      }
    } catch (err) {
      toast.error(err?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {reason === 'claim' && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <p className="font-bold">Sign up to claim your listing</p>
              <p className="text-orange-800/90 mt-0.5 text-xs leading-relaxed">
                Create a free account first. We use it to verify ownership and let you manage your profile.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100">
            {['signup', 'signin'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-4 text-sm font-bold transition-colors ${
                  mode === m
                    ? 'text-[#1A2E4A] border-b-2 border-orange-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {m === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#1A2E4A]">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {mode === 'signup'
                  ? 'Free forever. No credit card required.'
                  : 'Sign in to manage your listings and reviews.'}
              </p>
            </div>

            {mode === 'signup' && (
              <Field
                icon={User}
                label="Full Name"
                required
                value={form.fullName}
                onChange={(v) => set('fullName', v)}
                placeholder="Jane Doe"
              />
            )}
            <Field
              icon={Mail}
              label="Work Email"
              type="email"
              required
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="you@company.com"
            />
            <Field
              icon={Lock}
              label="Password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(v) => set('password', v)}
              placeholder="At least 8 characters"
            />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-lg"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('signin')} className="font-semibold text-orange-600 hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to FirmsLedger?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="font-semibold text-orange-600 hover:underline">
                    Create an account
                  </button>
                </>
              )}
            </p>
          </form>
        </div>

        <p className="text-xs text-slate-400 text-center mt-5">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="hover:text-slate-600">Terms</Link> &{' '}
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', required, value, onChange, placeholder, minLength }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type={type}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
        />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}>
      <AuthInner />
    </Suspense>
  );
}
