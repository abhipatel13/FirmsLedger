'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, RefreshCw, Loader2, Trash2, X, Pencil, ChevronDown, ChevronRight, FolderTree,
} from 'lucide-react';

const INPUT = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500';

const EMPTY_FORM = { name: '', slug: '', description: '', icon: '', order: 0, parent_id: '' };

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function FormField({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function CategoryModal({ open, onClose, onSaved, initial, parents }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name || '',
        slug: initial.slug || '',
        description: initial.description || '',
        icon: initial.icon || '',
        order: initial.order ?? 0,
        parent_id: initial.parent_id || '',
      });
      setSlugTouched(true);
    } else {
      setForm(EMPTY_FORM);
      setSlugTouched(false);
    }
    setError('');
  }, [open, initial]);

  if (!open) return null;

  const isEdit = !!initial?.id;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const url = isEdit ? `/api/admin/categories/${initial.id}` : '/api/admin/categories';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          slug: form.slug.trim() || slugify(form.name),
          parent_id: form.parent_id || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">{isEdit ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <FormField label="Parent Category" hint="Leave empty to create a top-level parent category.">
            <select
              value={form.parent_id}
              onChange={(e) => setField('parent_id', e.target.value)}
              className={INPUT}
            >
              <option value="">— None (top-level parent) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id} disabled={isEdit && p.id === initial?.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                const v = e.target.value;
                setField('name', v);
                if (!slugTouched) setField('slug', slugify(v));
              }}
              className={INPUT}
              placeholder="e.g., IT Staffing"
            />
          </FormField>

          <FormField label="Slug" required hint="URL-safe identifier. Auto-generated from name.">
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => { setField('slug', e.target.value); setSlugTouched(true); }}
              className={INPUT}
              placeholder="it-staffing"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={INPUT}
              placeholder="Short description shown on category pages."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Icon" hint="Lucide icon name, e.g. 'users', 'cpu'.">
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setField('icon', e.target.value)}
                className={INPUT}
                placeholder="users"
              />
            </FormField>

            <FormField label="Order" hint="Lower = shown first.">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField('order', e.target.value)}
                className={INPUT}
              />
            </FormField>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-800 bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load categories');
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { parents, childrenByParent } = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_id);
    const childrenByParent = {};
    for (const c of categories) {
      if (c.parent_id) {
        if (!childrenByParent[c.parent_id]) childrenByParent[c.parent_id] = [];
        childrenByParent[c.parent_id].push(c);
      }
    }
    return { parents, childrenByParent };
  }, [categories]);

  const filteredParents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter((p) => {
      if (p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)) return true;
      const kids = childrenByParent[p.id] || [];
      return kids.some((k) => k.name.toLowerCase().includes(q) || k.slug.toLowerCase().includes(q));
    });
  }, [parents, childrenByParent, search]);

  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const expandAll = () => setExpanded(Object.fromEntries(parents.map((p) => [p.id, true])));
  const collapseAll = () => setExpanded({});

  const openNew = (parent_id = null) => {
    setEditing(parent_id ? { parent_id } : null);
    setModalOpen(true);
  };
  const openEdit = (cat) => {
    setEditing(cat);
    setModalOpen(true);
  };

  const remove = async (cat) => {
    const kids = childrenByParent[cat.id] || [];
    const msg = kids.length
      ? `Delete "${cat.name}"? It has ${kids.length} subcategories — you'll need to delete those first.`
      : `Delete "${cat.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Delete failed'); return; }
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const totalSubs = Object.values(childrenByParent).reduce((a, b) => a + b.length, 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-orange-400" />
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {parents.length} parents · {totalSubs} subcategories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => openNew(null)}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-gray-800 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button onClick={expandAll} className="text-xs text-gray-400 hover:text-white transition-colors">Expand all</button>
        <span className="text-gray-700">·</span>
        <button onClick={collapseAll} className="text-xs text-gray-400 hover:text-white transition-colors">Collapse all</button>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            {search ? 'No categories match your search.' : 'No categories yet. Create one to start.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredParents.map((parent) => {
              const kids = childrenByParent[parent.id] || [];
              const open = expanded[parent.id];
              return (
                <div key={parent.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="flex items-center px-4 py-3 gap-3">
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{parent.name}</span>
                        <span className="text-xs text-gray-500">/{parent.slug}</span>
                      </div>
                      {parent.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{parent.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{kids.length} subs</span>
                    <button
                      onClick={() => openNew(parent.id)}
                      className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-800 rounded transition-colors"
                      title="Add subcategory"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(parent)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(parent)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {open && kids.length > 0 && (
                    <div className="border-t border-gray-800 divide-y divide-gray-800/50 bg-gray-950/50">
                      {kids.map((kid) => (
                        <div key={kid.id} className="flex items-center pl-12 pr-4 py-2.5 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-200 text-sm truncate">{kid.name}</span>
                              <span className="text-xs text-gray-500">/{kid.slug}</span>
                            </div>
                            {kid.description && (
                              <p className="text-xs text-gray-600 mt-0.5 truncate">{kid.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => openEdit(kid)}
                            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => remove(kid)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {open && kids.length === 0 && (
                    <div className="border-t border-gray-800 px-4 py-3 bg-gray-950/50">
                      <button
                        onClick={() => openNew(parent.id)}
                        className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
                      >
                        + Add first subcategory
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={load}
        initial={editing}
        parents={parents}
      />
    </div>
  );
}
