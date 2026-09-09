'use client';

/**
 * Admin UI primitives.
 *
 * Product-register surface: the job is earned familiarity, not decoration —
 * the tool should disappear into the task. Five admin pages shared no vocabulary
 * before this, so the same "card" was four different borders and the same
 * "badge" three different shapes.
 *
 * Palette is FirmsLedger's own dark, not Tailwind slate: navy #0F172A/#070D18
 * (the claim-page hero gradient) with gold #F5A623 as the single accent. Gold is
 * reserved for primary actions, current selection and state — never decoration.
 * Numbers use IBM Plex Mono per the site's type rules; everything else is Inter.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

// ── Tokens ────────────────────────────────────────────────────────────────────
export const T = {
  surface: '#0B1220',   // page background
  panel:   '#111C2E',   // cards, rows
  raised:  '#16233A',   // hover / nested
  sidebar: '#0F172A',   // second neutral layer
  border:  'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  gold:    '#F5A623',
  text:    '#E8EDF5',
  muted:   '#94A3B8',
  faint:   '#64748B',
};

// Focus is visible on every interactive element, keyboard-only so it never
// fires on mouse click.
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]';

// ── Page scaffold ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#E8EDF5]">{title}</h1>
        {subtitle && <p className="text-sm text-[#94A3B8] mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </header>
  );
}

export function Card({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-xl border border-white/[0.08] bg-[#111C2E] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.08]">
      <h2 className="text-sm font-semibold text-[#E8EDF5]">{title}</h2>
      {children}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
// One button component so "save" cannot look different on two screens.
const VARIANTS = {
  primary: 'bg-[#F5A623] text-[#0B1220] hover:bg-[#e0961c] active:bg-[#c9861a] font-semibold',
  secondary: 'border border-white/[0.14] text-[#E8EDF5] hover:bg-white/[0.06] active:bg-white/[0.1]',
  ghost: 'text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-white/[0.06]',
  danger: 'border border-red-500/30 text-red-300 hover:bg-red-500/10 active:bg-red-500/20',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 font-semibold',
};

export function Button({
  variant = 'secondary', loading = false, disabled = false,
  icon: Icon, children, className = '', ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg text-sm
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${FOCUS} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : Icon && <Icon className="w-4 h-4" aria-hidden />}
      {children}
    </button>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────
const TONES = {
  neutral: 'bg-white/[0.06] text-[#94A3B8] border-white/[0.12]',
  gold:    'bg-[#F5A623]/12 text-[#F5A623] border-[#F5A623]/30',
  green:   'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
  amber:   'bg-amber-500/12 text-amber-300 border-amber-500/30',
  red:     'bg-red-500/12 text-red-300 border-red-500/30',
  blue:    'bg-sky-500/12 text-sky-300 border-sky-500/30',
};

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border
      text-[11px] font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden />}
      {children}
    </span>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
export function FilterTabs({ options, value, onChange, counts = {} }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={`h-8 px-3 rounded-lg text-xs font-semibold capitalize border transition-colors duration-150 ${FOCUS} ${
              active
                ? 'bg-[#F5A623] text-[#0B1220] border-[#F5A623]'
                : 'border-white/[0.12] text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-white/[0.06]'
            }`}
          >
            {opt}
            {counts[opt] !== undefined && (
              <span className={active ? 'opacity-70' : 'opacity-60'}> ({counts[opt]})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Data display ──────────────────────────────────────────────────────────────
export function Stat({ label, value, icon: Icon, hint }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wide text-[#64748B] flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" aria-hidden />} {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-[#E8EDF5] font-mono tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-[#64748B] mt-0.5">{hint}</p>}
    </Card>
  );
}

export function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-[#64748B]">{label}</dt>
      <dd className="text-sm text-[#E8EDF5] truncate">{value ?? '—'}</dd>
    </div>
  );
}

// ── Loading / empty / error ───────────────────────────────────────────────────
// Skeletons, not a spinner parked in the middle of the content area: the page
// keeps its shape while data arrives so nothing jumps on load.
export function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.08] bg-[#111C2E] p-5">
          <div className="h-4 w-1/3 rounded bg-white/[0.08] animate-pulse" />
          <div className="mt-3 h-3 w-2/3 rounded bg-white/[0.05] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/** Empty states teach the surface — never a bare "nothing here". */
export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <Card className="p-10 text-center">
      {Icon && <Icon className="w-9 h-9 mx-auto text-[#334155]" aria-hidden />}
      <h3 className="mt-4 text-base font-semibold text-[#E8EDF5]">{title}</h3>
      {children && <p className="mt-1.5 text-sm text-[#94A3B8] max-w-md mx-auto">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

export function Notice({ tone = 'neutral', children }) {
  const map = {
    neutral: 'border-white/[0.12] bg-white/[0.04] text-[#E8EDF5]',
    red: 'border-red-500/30 bg-red-500/10 text-red-200',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  };
  return (
    <div role="status" className={`text-sm px-4 py-3 rounded-lg border ${map[tone]}`}>
      {children}
    </div>
  );
}

export const INPUT = `w-full h-9 rounded-lg border border-white/[0.14] bg-[#0B1220] px-3 text-sm
  text-[#E8EDF5] placeholder-[#64748B] transition-colors duration-150
  hover:border-white/25 focus-visible:outline-none focus-visible:border-[#F5A623]
  focus-visible:ring-1 focus-visible:ring-[#F5A623]`;
