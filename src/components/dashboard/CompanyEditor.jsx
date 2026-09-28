'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const INPUT = 'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors';
const LABEL = 'block text-xs font-medium text-slate-600 mb-1.5';

// Array fields are edited as comma-separated text. Deliberately not a tag
// widget: it's one input, people already paste lists like this, and the server
// splits, trims, dedupes and caps anyway.
const LIST_FIELDS = [
  { key: 'certifications',    label: 'Certifications',    placeholder: 'ISO 9001, AS9100D, ITAR' },
  { key: 'capabilities',      label: 'Capabilities',      placeholder: 'CNC machining, 5-axis milling' },
  { key: 'products',          label: 'Products',          placeholder: 'Brackets, housings, fasteners' },
  { key: 'industries_served', label: 'Industries served', placeholder: 'Aerospace, medical, automotive' },
];

const TEXT_FIELDS = [
  { key: 'address',        label: 'Address',        type: 'text',  placeholder: '123 Industrial Way' },
  { key: 'hq_city',        label: 'City',           type: 'text',  placeholder: 'Idaho Falls' },
  { key: 'phone',          label: 'Phone',          type: 'tel',   placeholder: '+1 555 010 0100' },
  { key: 'contact_email',  label: 'Contact email',  type: 'email', placeholder: 'sales@company.com' },
  { key: 'website',        label: 'Website',        type: 'url',   placeholder: 'https://company.com' },
  { key: 'linkedin_url',   label: 'LinkedIn',       type: 'url',   placeholder: 'https://linkedin.com/company/...' },
  { key: 'employee_count', label: 'Employees',      type: 'text',  placeholder: '50-100' },
];

const toText = (v) => (Array.isArray(v) ? v.join(', ') : v || '');
const toList = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);

export default function CompanyEditor({ company, categories, selectedCategoryIds }) {
  const [form, setForm] = useState(() => ({
    description: company.description || '',
    address: company.address || '',
    hq_city: company.hq_city || '',
    phone: company.phone || '',
    contact_email: company.contact_email || '',
    website: company.website || '',
    linkedin_url: company.linkedin_url || '',
    employee_count: company.employee_count || '',
    certifications: toText(company.certifications),
    capabilities: toText(company.capabilities),
    products: toText(company.products),
    industries_served: toText(company.industries_served),
  }));
  const [selected, setSelected] = useState(() => new Set(selectedCategoryIds));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Parents with their children beneath them, so a 96-item flat list stays readable.
  const grouped = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_id);
    return parents.map((p) => ({
      ...p,
      children: categories.filter((c) => c.parent_id === p.id),
    }));
  }, [categories]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (selected.size === 0) {
      toast.error('Select at least one category.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/company/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          address: form.address,
          hq_city: form.hq_city,
          phone: form.phone,
          contact_email: form.contact_email,
          website: form.website,
          linkedin_url: form.linkedin_url,
          employee_count: form.employee_count,
          certifications: toList(form.certifications),
          capabilities: toList(form.capabilities),
          products: toList(form.products),
          industries_served: toList(form.industries_served),
          category_ids: [...selected],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save your changes.');
      toast.success('Saved. Your public page will show the update shortly.');
    } catch (err) {
      toast.error(err?.message || 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="px-6 py-6 space-y-6">
      <div>
        <label htmlFor={`desc-${company.id}`} className={LABEL}>
          Description
        </label>
        <textarea
          id={`desc-${company.id}`}
          rows={5}
          maxLength={4000}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
          placeholder="What your company makes, who you serve, and what sets you apart."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {form.description.length}/4000 — a specific description helps buyers shortlist you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TEXT_FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label htmlFor={`${key}-${company.id}`} className={LABEL}>{label}</label>
            <input
              id={`${key}-${company.id}`}
              type={type}
              className={INPUT}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {LIST_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label htmlFor={`${key}-${company.id}`} className={LABEL}>{label}</label>
            <input
              id={`${key}-${company.id}`}
              className={INPUT}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">Separate with commas.</p>
          </div>
        ))}
      </div>

      <div>
        <p className={LABEL}>Categories <span className="text-orange-500">*</span></p>
        <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-3">
          {grouped.map((parent) => (
            <div key={parent.id}>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2E4A]">
                <input
                  type="checkbox"
                  className="accent-orange-500"
                  checked={selected.has(parent.id)}
                  onChange={() => toggle(parent.id)}
                />
                {parent.name}
              </label>
              {parent.children.length > 0 && (
                <div className="ml-6 mt-1.5 grid sm:grid-cols-2 gap-1">
                  {parent.children.map((child) => (
                    <label key={child.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="accent-orange-500"
                        checked={selected.has(child.id)}
                        onChange={() => toggle(child.id)}
                      />
                      {child.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {selected.size} selected. Changing these moves your listing between directory pages.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          : <><Save className="w-4 h-4" /> Save changes</>}
      </button>
    </form>
  );
}
