'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, CheckCircle, Star, Globe,
  Loader2, Trash2, X, Pencil, BadgeCheck, ExternalLink,} from 'lucide-react';

const INDUSTRIES = [
  'IT & Software', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Real Estate', 'Marketing', 'Legal', 'Construction',
  'Hospitality', 'Logistics', 'Energy', 'Automotive', 'Other',
];

const PRICING_MODELS = ['Hourly', 'Fixed Price', 'Retainer', 'Value-Based', 'Mixed'];
const TEAM_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

const EMPTY_FORM = {
  name: '', contact_email: '', phone: '', website: '', logo_url: '',
  tagline: '', description: '', address: '',
  hq_city: '', hq_state: '', hq_country: '',
  team_size: '', founded_year: '', hourly_rate: '',
  pricing_model: '', min_project_size: '', remote_support: false,
  industries_served: [], approved: true, verified: false, featured: false,
  linkedin_url: '', twitter_url: '', facebook_url: '', instagram_url: '',
  service_focus: [], industry_focus: [], client_focus: { small_business: 0, medium_business: 0, large_business: 0 },
};

function Badge({ label, color }) {
  const map = {
    green:  'bg-green-900/40 text-green-300 border-green-700/40',
    orange: 'bg-[#F5A623]/12 text-[#F5A623] border-[#F5A623]/30',
    slate:  'bg-[#16233A] text-[#94A3B8] border-white/[0.14]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[color] || map.slate}`}>
      {label}
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#F5A623]' : 'bg-[#1D2C46]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-[#94A3B8]">{label}</span>
    </label>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = 'w-full bg-[#16233A] border border-white/[0.14] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#F5A623]';

const SERVICE_CATEGORIES = [
  'Digital Marketing', 'SEO', 'Web Development', 'Mobile App Development',
  'IT Services', 'Staffing', 'Accounting', 'Legal', 'Public Relations',
  'Graphic Design', 'Content Marketing', 'Social Media', 'PPC / Paid Ads', 'Other',
];

function ServiceFocusEditor({ value, onChange }) {
  const rows = Array.isArray(value) ? value : [];
  const add = () => onChange([...rows, { service: '', category: '', percentage: 0 }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(rows.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className={INPUT + ' flex-1 min-w-0'}
            placeholder="Service name"
            value={row.service}
            onChange={(e) => update(i, 'service', e.target.value)}
          />
          <select
            className={INPUT + ' w-40'}
            value={row.category}
            onChange={(e) => update(i, 'category', e.target.value)}
          >
            <option value="">Category</option>
            {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number" min="0" max="100"
              className="w-16 bg-[#16233A] border border-white/[0.14] rounded-lg px-2 py-2.5 text-white text-sm text-center focus:outline-none focus:border-[#F5A623]"
              value={row.percentage}
              onChange={(e) => update(i, 'percentage', parseInt(e.target.value) || 0)}
            />
            <span className="text-[#64748B] text-sm">%</span>
          </div>
          <button type="button" onClick={() => remove(i)} className="text-[#475569] hover:text-red-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-[#F5A623] hover:text-[#F5A623] transition-colors mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add Service
      </button>
    </div>
  );
}

function IndustryFocusEditor({ value, onChange }) {
  const rows = Array.isArray(value) ? value : [];
  const add = () => onChange([...rows, { industry: '', percentage: 0 }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(rows.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className={INPUT + ' flex-1 min-w-0'}
            placeholder="Industry (e.g. Healthcare)"
            value={row.industry}
            onChange={(e) => update(i, 'industry', e.target.value)}
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number" min="0" max="100"
              className="w-16 bg-[#16233A] border border-white/[0.14] rounded-lg px-2 py-2.5 text-white text-sm text-center focus:outline-none focus:border-[#F5A623]"
              value={row.percentage}
              onChange={(e) => update(i, 'percentage', parseInt(e.target.value) || 0)}
            />
            <span className="text-[#64748B] text-sm">%</span>
          </div>
          <button type="button" onClick={() => remove(i)} className="text-[#475569] hover:text-red-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-[#F5A623] hover:text-[#F5A623] transition-colors mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add Industry
      </button>
    </div>
  );
}

function ClientFocusEditor({ value, onChange }) {
  const cf = (value && typeof value === 'object' && !Array.isArray(value))
    ? value
    : { small_business: 0, medium_business: 0, large_business: 0 };
  const update = (key, val) => onChange({ ...cf, [key]: parseInt(val) || 0 });
  const labels = [
    { key: 'small_business', label: 'Small Business' },
    { key: 'medium_business', label: 'Mid-Market' },
    { key: 'large_business', label: 'Enterprise' },
  ];
  return (
    <div className="flex gap-4">
      {labels.map(({ key, label }) => (
        <div key={key} className="flex-1">
          <p className="text-xs text-[#64748B] mb-1">{label}</p>
          <div className="flex items-center gap-1">
            <input
              type="number" min="0" max="100"
              className="w-full bg-[#16233A] border border-white/[0.14] rounded-lg px-2 py-2.5 text-white text-sm text-center focus:outline-none focus:border-[#F5A623]"
              value={cf[key] ?? 0}
              onChange={(e) => update(key, e.target.value)}
            />
            <span className="text-[#64748B] text-sm shrink-0">%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RegisterModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleIndustry = (ind) => {
    setForm((f) => ({
      ...f,
      industries_served: f.industries_served.includes(ind)
        ? f.industries_served.filter((i) => i !== ind)
        : [...f.industries_served, ind],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create agency'); return; }
      onCreated(data);
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10">
      <div className="relative w-full max-w-2xl bg-[#111C2E] rounded-2xl border border-white/[0.08] mb-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white">Register Agency</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Add a new agency directly to the directory</p>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="px-3 py-2 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Agency Name" required>
              <input className={INPUT} required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme Staffing" />
            </FormField>
            <FormField label="Contact Email">
              <input className={INPUT} type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="hello@acme.com" />
            </FormField>
            <FormField label="Phone">
              <input className={INPUT} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
            </FormField>
            <FormField label="Website">
              <input className={INPUT} type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://acme.com" />
            </FormField>
            <FormField label="Logo URL">
              <input className={INPUT} type="url" value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://..." />
            </FormField>
            <FormField label="Founded Year">
              <input className={INPUT} type="number" min="1900" max="2030" value={form.founded_year} onChange={(e) => set('founded_year', e.target.value)} placeholder="2010" />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              className={`${INPUT} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief overview of the agency…"
            />
          </FormField>

          <FormField label="Tagline">
            <input className={INPUT} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Award-winning digital marketing agency" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="City">
              <input className={INPUT} value={form.hq_city} onChange={(e) => set('hq_city', e.target.value)} placeholder="New York" />
            </FormField>
            <FormField label="State">
              <input className={INPUT} value={form.hq_state} onChange={(e) => set('hq_state', e.target.value)} placeholder="NY" />
            </FormField>
            <FormField label="Country">
              <input className={INPUT} value={form.hq_country} onChange={(e) => set('hq_country', e.target.value)} placeholder="United States" />
            </FormField>
            <FormField label="Hourly Rate">
              <input className={INPUT} value={form.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)} placeholder="$100 - $149/hr" />
            </FormField>
          </div>

          <FormField label="Full Address">
            <input className={INPUT} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main St, Suite 100, New York, NY 10001" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Team Size">
              <select className={INPUT} value={form.team_size} onChange={(e) => set('team_size', e.target.value)}>
                <option value="">Select…</option>
                {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Pricing Model">
              <select className={INPUT} value={form.pricing_model} onChange={(e) => set('pricing_model', e.target.value)}>
                <option value="">Select…</option>
                {PRICING_MODELS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Min. Project Size">
              <input className={INPUT} value={form.min_project_size} onChange={(e) => set('min_project_size', e.target.value)} placeholder="$5,000" />
            </FormField>
          </div>

          {/* Social Media */}
          <div className="pt-2 border-t border-white/[0.08]">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Social Media</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="LinkedIn URL">
                <input className={INPUT} type="url" value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </FormField>
              <FormField label="Twitter / X URL">
                <input className={INPUT} type="url" value={form.twitter_url} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/..." />
              </FormField>
              <FormField label="Facebook URL">
                <input className={INPUT} type="url" value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
              </FormField>
              <FormField label="Instagram URL">
                <input className={INPUT} type="url" value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
              </FormField>
            </div>
          </div>

          {/* Focus fields */}
          <div className="pt-2 border-t border-white/[0.08] space-y-4">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Focus Data</p>
            <FormField label="Service Focus">
              <ServiceFocusEditor value={form.service_focus} onChange={(v) => set('service_focus', v)} />
            </FormField>
            <FormField label="Industry Focus">
              <IndustryFocusEditor value={form.industry_focus} onChange={(v) => set('industry_focus', v)} />
            </FormField>
            <FormField label="Client Focus (%)">
              <ClientFocusEditor value={form.client_focus} onChange={(v) => set('client_focus', v)} />
            </FormField>
          </div>

          <FormField label="Industries Served">
            <div className="flex flex-wrap gap-2 mt-1">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.industries_served.includes(ind)
                      ? 'bg-[#F5A623] text-[#0B1220] border-[#F5A623]'
                      : 'bg-[#16233A] text-[#94A3B8] border-white/[0.14] hover:border-white/30'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <Toggle checked={form.approved} onChange={(v) => set('approved', v)} label="Approved" />
            <Toggle checked={form.verified} onChange={(v) => set('verified', v)} label="Verified" />
            <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" />
            <Toggle checked={form.remote_support} onChange={(v) => set('remote_support', v)} label="Remote Support" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white border border-white/[0.14] rounded-lg hover:border-white/25 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#F5A623] hover:bg-[#e0961c] disabled:opacity-50 text-[#0B1220] text-sm font-medium rounded-lg transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Registering…' : 'Register Agency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ agency, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:             agency.name             ?? '',
    contact_email:    agency.contact_email    ?? '',
    phone:            agency.phone            ?? '',
    website:          agency.website          ?? '',
    logo_url:         agency.logo_url         ?? '',
    description:      agency.description      ?? '',
    tagline:          agency.tagline          ?? '',
    address:          agency.address          ?? '',
    hq_city:          agency.hq_city          ?? '',
    hq_state:         agency.hq_state         ?? '',
    hq_country:       agency.hq_country       ?? '',
    team_size:        agency.team_size        ?? '',
    founded_year:     agency.founded_year     ?? '',
    hourly_rate:      agency.hourly_rate      ?? '',
    pricing_model:    agency.pricing_model    ?? '',
    min_project_size: agency.min_project_size ?? '',
    remote_support:   agency.remote_support   ?? false,
    industries_served:Array.isArray(agency.industries_served) ? agency.industries_served : [],
    approved:         agency.approved         ?? false,
    verified:         agency.verified         ?? false,
    featured:         agency.featured         ?? false,
    linkedin_url:     agency.linkedin_url     ?? '',
    twitter_url:      agency.twitter_url      ?? '',
    facebook_url:     agency.facebook_url     ?? '',
    instagram_url:    agency.instagram_url    ?? '',
    service_focus:    Array.isArray(agency.service_focus)  ? agency.service_focus  : [],
    industry_focus:   Array.isArray(agency.industry_focus) ? agency.industry_focus : [],
    client_focus:     (agency.client_focus && typeof agency.client_focus === 'object' && !Array.isArray(agency.client_focus))
                        ? agency.client_focus
                        : { small_business: 0, medium_business: 0, large_business: 0 },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleIndustry = (ind) =>
    setForm((f) => ({
      ...f,
      industries_served: f.industries_served.includes(ind)
        ? f.industries_served.filter((i) => i !== ind)
        : [...f.industries_served, ind],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: agency.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      onSaved(data);
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10">
      <div className="relative w-full max-w-2xl bg-[#111C2E] rounded-2xl border border-white/[0.08] mb-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Agency</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{agency.name}</p>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="px-3 py-2 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Agency Name" required>
              <input className={INPUT} required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme Staffing" />
            </FormField>
            <FormField label="Contact Email">
              <input className={INPUT} type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="hello@acme.com" />
            </FormField>
            <FormField label="Phone">
              <input className={INPUT} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
            </FormField>
            <FormField label="Website">
              <input className={INPUT} type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://acme.com" />
            </FormField>
            <FormField label="Logo URL">
              <input className={INPUT} type="url" value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://..." />
            </FormField>
            <FormField label="Founded Year">
              <input className={INPUT} type="number" min="1900" max="2030" value={form.founded_year} onChange={(e) => set('founded_year', e.target.value)} placeholder="2010" />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              className={`${INPUT} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief overview of the agency…"
            />
          </FormField>

          <FormField label="Tagline">
            <input className={INPUT} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Award-winning digital marketing agency" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="City">
              <input className={INPUT} value={form.hq_city} onChange={(e) => set('hq_city', e.target.value)} placeholder="New York" />
            </FormField>
            <FormField label="State">
              <input className={INPUT} value={form.hq_state} onChange={(e) => set('hq_state', e.target.value)} placeholder="NY" />
            </FormField>
            <FormField label="Country">
              <input className={INPUT} value={form.hq_country} onChange={(e) => set('hq_country', e.target.value)} placeholder="United States" />
            </FormField>
            <FormField label="Hourly Rate">
              <input className={INPUT} value={form.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)} placeholder="$100 - $149/hr" />
            </FormField>
          </div>

          <FormField label="Full Address">
            <input className={INPUT} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main St, Suite 100, New York, NY 10001" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Team Size">
              <select className={INPUT} value={form.team_size} onChange={(e) => set('team_size', e.target.value)}>
                <option value="">Select…</option>
                {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Pricing Model">
              <select className={INPUT} value={form.pricing_model} onChange={(e) => set('pricing_model', e.target.value)}>
                <option value="">Select…</option>
                {PRICING_MODELS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Min. Project Size">
              <input className={INPUT} value={form.min_project_size} onChange={(e) => set('min_project_size', e.target.value)} placeholder="$5,000" />
            </FormField>
          </div>

          {/* Social Media */}
          <div className="pt-2 border-t border-white/[0.08]">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Social Media</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="LinkedIn URL">
                <input className={INPUT} type="url" value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </FormField>
              <FormField label="Twitter / X URL">
                <input className={INPUT} type="url" value={form.twitter_url} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/..." />
              </FormField>
              <FormField label="Facebook URL">
                <input className={INPUT} type="url" value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
              </FormField>
              <FormField label="Instagram URL">
                <input className={INPUT} type="url" value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
              </FormField>
            </div>
          </div>

          {/* Focus fields */}
          <div className="pt-2 border-t border-white/[0.08] space-y-4">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Focus Data</p>
            <FormField label="Service Focus">
              <ServiceFocusEditor value={form.service_focus} onChange={(v) => set('service_focus', v)} />
            </FormField>
            <FormField label="Industry Focus">
              <IndustryFocusEditor value={form.industry_focus} onChange={(v) => set('industry_focus', v)} />
            </FormField>
            <FormField label="Client Focus (%)">
              <ClientFocusEditor value={form.client_focus} onChange={(v) => set('client_focus', v)} />
            </FormField>
          </div>

          <FormField label="Industries Served">
            <div className="flex flex-wrap gap-2 mt-1">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.industries_served.includes(ind)
                      ? 'bg-[#F5A623] text-[#0B1220] border-[#F5A623]'
                      : 'bg-[#16233A] text-[#94A3B8] border-white/[0.14] hover:border-white/30'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <Toggle checked={form.approved}       onChange={(v) => set('approved', v)}       label="Approved" />
            <Toggle checked={form.verified}       onChange={(v) => set('verified', v)}       label="Verified" />
            <Toggle checked={form.featured}       onChange={(v) => set('featured', v)}       label="Featured" />
            <Toggle checked={form.remote_support} onChange={(v) => set('remote_support', v)} label="Remote Support" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white border border-white/[0.14] rounded-lg hover:border-white/25 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#F5A623] hover:bg-[#e0961c] disabled:opacity-50 text-[#0B1220] text-sm font-medium rounded-lg transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ agency, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await fetch('/api/admin/agencies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: agency.id, action: 'delete' }),
      });
      onDeleted(agency.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-[#111C2E] rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Red top bar */}
        <div className="h-1 bg-red-500 w-full" />

        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-700/40 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">Delete Agency</h2>
          <p className="text-[#94A3B8] text-sm mb-1">
            You are about to permanently delete:
          </p>
          <p className="text-white font-semibold text-sm mb-4 truncate">
            "{agency.name}"
          </p>
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-300 text-xs leading-relaxed">
              This will remove the agency and all associated data. <span className="font-semibold">This action cannot be undone.</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm text-[#CBD5E1] border border-white/[0.14] rounded-lg hover:border-white/25 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [deletingAgency, setDeletingAgency] = useState(null);
  const [updating, setUpdating] = useState({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [counts, setCounts] = useState({ total: 0, approved: 0, pending: 0, verified: 0, featured: 0 });
  const [truncated, setTruncated] = useState(false);

  // Filtering and searching are done by the server. The page used to pull all
  // ~12,800 companies and filter in the browser, which made the unapproved
  // queue unreachable without scrolling the whole table.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status, limit: '200' });
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/admin/agencies?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAgencies(json.data ?? []);
      setCounts(json.counts ?? counts);
      setTruncated(Boolean(json.truncated));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  // Debounced so typing doesn't fire a query per keystroke.
  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const patch = async (id, updates) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setAgencies((list) => list.map((a) => (a.id === id ? { ...a, ...data } : a)));
      }
    } finally {
      setUpdating((u) => ({ ...u, [id]: false }));
    }
  };

  const remove = (id) => {
    setAgencies((list) => list.filter((a) => a.id !== id));
  };

  // The server already filtered; rendering `agencies` directly keeps the counts
  // and the rows describing the same thing.
  const filtered = agencies;
  const { total, approved, pending } = counts;

  const TABS = [
    { key: 'pending',  label: 'Pending',  n: counts.pending },
    { key: 'approved', label: 'Approved', n: counts.approved },
    { key: 'verified', label: 'Verified', n: counts.verified },
    { key: 'featured', label: 'Featured', n: counts.featured },
    { key: 'all',      label: 'All',      n: counts.total },
  ];

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Agencies</h1>
          <p className="text-[#94A3B8] text-sm mt-0.5">
            {total} total · {approved} approved · {pending} pending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 bg-[#16233A] border border-white/[0.14] rounded-lg text-sm text-[#CBD5E1] hover:bg-white/[0.1] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#e0961c] text-[#0B1220] text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Register Agency
          </button>
        </div>
      </div>

      {/* Status tabs — this is how the unapproved queue is reached. */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TABS.map(({ key, label, n }) => {
          const active = status === key;
          return (
            <button
              key={key}
              onClick={() => setStatus(key)}
              aria-pressed={active}
              className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70 ${
                active
                  ? 'bg-[#F5A623] text-[#0B1220] border-[#F5A623]'
                  : 'border-white/[0.12] text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-white/[0.06]'
              }`}
            >
              {label} <span className={active ? 'opacity-70' : 'opacity-60'}>({n.toLocaleString()})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="w-full max-w-sm bg-[#16233A] border border-white/[0.14] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#F5A623]"
          placeholder="Search by name, email or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {truncated && !loading && (
        <p className="mb-3 text-xs text-[#64748B]">
          Showing the newest 200 of {status === 'all' ? total.toLocaleString() : `${(counts[status] ?? 0).toLocaleString()}`} — narrow it with the search box.
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 text-[#64748B] py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="bg-red-900/40 border border-red-700/40 rounded-xl p-6 text-red-300 text-sm">
          {error} —{' '}
          <button onClick={load} className="underline hover:no-underline">retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111C2E] border border-white/[0.08] rounded-xl p-12 text-center">
          <p className="text-[#64748B] text-sm">
            {search ? 'No agencies match your search.' : 'No agencies yet.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-[#0B1220] text-sm font-medium rounded-lg mx-auto"
            >
              <Plus className="w-4 h-4" /> Register First Agency
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#111C2E] border border-white/[0.08] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0B1220]/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Agency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden lg:table-cell">Rating</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.06] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {/* Reviewing a listing starts by reading it, so the name
                          itself opens the detail form — the pencil in the
                          actions column was the only way in before. */}
                      <button
                        type="button"
                        onClick={() => setEditingAgency(a)}
                        title="Open details"
                        className="text-left font-semibold text-[#E8EDF5] hover:text-[#F5A623] transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
                      >
                        {a.name}
                      </button>
                      {/* Unapproved listings still render at /company/[slug]
                          (that route only 404s when the row is missing), so
                          this shows exactly how it would look published. */}
                      {a.slug && (
                        <a
                          href={`/company/${a.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View public page"
                          aria-label={`View public page for ${a.name}`}
                          className="text-[#475569] hover:text-[#F5A623] transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {a.contact_email && (
                      <p className="text-xs text-[#64748B] mt-0.5">{a.contact_email}</p>
                    )}
                    {a.website && (
                      <a
                        href={a.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#F5A623] hover:underline mt-0.5"
                      >
                        <Globe className="w-3 h-3" />
                        {a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </td>

                  <td className="px-5 py-4 text-[#64748B] text-xs hidden md:table-cell">
                    {[a.hq_city, a.hq_state_label].filter(Boolean).join(', ') || '—'}
                  </td>

                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge label={a.approved ? 'Approved' : 'Pending'} color={a.approved ? 'green' : 'orange'} />
                      {a.verified && <Badge label="Verified" color="green" />}
                      {a.featured && <Badge label="Featured" color="orange" />}
                    </div>
                  </td>

                  <td className="px-5 py-4 hidden lg:table-cell">
                    {a.avg_rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#F5A623] fill-orange-400" />
                        <span className="text-[#CBD5E1] font-medium">{Number(a.avg_rating).toFixed(1)}</span>
                        <span className="text-[#64748B] text-xs">({a.review_count})</span>
                      </div>
                    ) : (
                      <span className="text-[#475569] text-xs">No reviews</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {updating[a.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#64748B]" />
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingAgency(a)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F5A623]/10 hover:text-[#F5A623] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Approving is the primary job on this screen, so an
                              unapproved row gets a labelled button rather than
                              an icon whose meaning lives in a tooltip. */}
                          {a.approved ? (
                            <button
                              onClick={() => patch(a.id, { approved: false })}
                              title="Revoke approval"
                              aria-label="Revoke approval"
                              className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/30 transition-colors duration-150"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => patch(a.id, { approved: true })}
                              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          {/* BadgeCheck, not CheckCircle: this button and the
                              approve button above it were the same icon, so the
                              only difference was colour. */}
                          <button
                            onClick={() => patch(a.id, { verified: !a.verified })}
                            title={a.verified ? 'Unverify' : 'Verify'}
                            aria-label={a.verified ? 'Unverify' : 'Verify'}
                            className={`p-1.5 rounded-lg transition-colors duration-150 ${a.verified ? 'text-[#F5A623] hover:bg-[#F5A623]/10' : 'text-[#475569] hover:bg-white/[0.06] hover:text-[#F5A623]'}`}
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => patch(a.id, { featured: !a.featured })}
                            title={a.featured ? 'Unfeature' : 'Feature'}
                            className={`p-1.5 rounded-lg transition-colors ${a.featured ? 'text-[#F5A623] hover:bg-[#F5A623]/10' : 'text-[#475569] hover:bg-white/[0.06] hover:text-[#F5A623]'}`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAgency(a)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-[#475569] hover:bg-red-900/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <RegisterModal
          onClose={() => setShowForm(false)}
          onCreated={(agency) => setAgencies((list) => [agency, ...list])}
        />
      )}

      {editingAgency && (
        <EditModal
          agency={editingAgency}
          onClose={() => setEditingAgency(null)}
          onSaved={(updated) => {
            setAgencies((list) => list.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
            setEditingAgency(null);
          }}
        />
      )}

      {deletingAgency && (
        <DeleteModal
          agency={deletingAgency}
          onClose={() => setDeletingAgency(null)}
          onDeleted={(id) => remove(id)}
        />
      )}
    </div>
  );
}
