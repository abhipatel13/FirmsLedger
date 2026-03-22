'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Trash2, RefreshCw, ExternalLink,
  Loader2, Zap, Pencil, Eye, EyeOff, X, Save,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLE = {
  pending:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  processing: 'bg-blue-900/40   text-blue-300   border-blue-700/40',
  done:       'bg-green-900/40  text-green-300  border-green-700/40',
  failed:     'bg-red-900/40    text-red-300    border-red-700/40',
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ post, onClose, onSaved }) {
  const [tab, setTab]   = useState('meta');
  const [saving, setSaving] = useState(false);

  // Meta fields
  const [title, setTitle]           = useState(post.title || '');
  const [slug, setSlug]             = useState(post.slug || '');
  const [category, setCategory]     = useState(post.category || '');
  const [readTime, setReadTime]     = useState(post.read_time || '');
  const [metaDesc, setMetaDesc]     = useState(post.meta_description || '');
  const [published, setPublished]   = useState(!!post.published);

  // Content fields (derived from post.content)
  const [introText, setIntroText]   = useState(
    Array.isArray(post.content?.intro) ? post.content.intro.join('\n\n') : ''
  );
  const [contentJson, setContentJson] = useState(
    post.content ? JSON.stringify(post.content, null, 2) : '{}'
  );
  const [jsonError, setJsonError]   = useState('');

  const handleIntroBlur = () => {
    // Sync intro back into contentJson
    try {
      const parsed = JSON.parse(contentJson);
      parsed.intro = introText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      setContentJson(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch { /* ignore */ }
  };

  const handleJsonChange = (val) => {
    setContentJson(val);
    try {
      const parsed = JSON.parse(val);
      setIntroText(Array.isArray(parsed.intro) ? parsed.intro.join('\n\n') : '');
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const save = async () => {
    if (jsonError) { toast.error('Fix JSON errors before saving'); return; }
    setSaving(true);
    try {
      let parsedContent = post.content;
      try { parsedContent = JSON.parse(contentJson); } catch { /* keep original */ }

      const res = await fetch('/api/admin/blog-posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: post.id,
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim(),
          read_time: readTime.trim(),
          meta_description: metaDesc.trim(),
          published,
          content: parsedContent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Save failed'); return; }
      toast.success('Post saved');
      onSaved(data);
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  const INPUT = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-white">Edit Post</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">{post.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3">
          {['meta', 'content'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t === 'meta' ? 'Meta & Settings' : 'Content (JSON)'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'meta' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                  <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug</label>
                  <input className={INPUT} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                  <input className={INPUT} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Manufacturing" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Read Time</label>
                  <input className={INPUT} value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 8 min read" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta Description</label>
                <textarea className={`${INPUT} resize-none`} rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="145–155 chars for SEO" />
                <p className="text-xs text-gray-600 mt-1">{metaDesc.length} chars</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Intro Paragraphs</label>
                <textarea
                  className={`${INPUT} resize-none`}
                  rows={6}
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  onBlur={handleIntroBlur}
                  placeholder="Separate paragraphs with a blank line"
                />
                <p className="text-xs text-gray-600 mt-1">Separate paragraphs with a blank line. Changes sync to JSON tab on blur.</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">Publish Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">{published ? 'Visible to all visitors' : 'Draft — only visible to admins'}</p>
                </div>
                <button
                  onClick={() => setPublished((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </>
          )}

          {tab === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">Full Content JSON</label>
                {jsonError && <span className="text-xs text-red-400">{jsonError}</span>}
              </div>
              <textarea
                className={`${INPUT} resize-none font-mono text-xs`}
                rows={30}
                value={contentJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
              />
              <p className="text-xs text-gray-600 mt-1">Edit the full blog content structure. Changes to "intro" here also update the Intro field on the Meta tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogsAdminPage() {
  const [topics, setTopics]           = useState([]);
  const [posts, setPosts]             = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingPosts, setLoadingPosts]   = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [bulkInput, setBulkInput]     = useState('');
  const [bulkOpen, setBulkOpen]       = useState(false);
  const [adding, setAdding]           = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [activeTab, setActiveTab]     = useState('queue');
  const [editPost, setEditPost]       = useState(null);
  const [togglingId, setTogglingId]   = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  const loadTopics = useCallback(() => {
    setLoadingTopics(true);
    fetch('/api/admin/blog-topics', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setTopics(Array.isArray(d) ? d : []))
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, []);

  const loadPosts = useCallback(() => {
    setLoadingPosts(true);
    fetch('/api/admin/blog-posts', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, []);

  useEffect(() => { loadTopics(); loadPosts(); }, [loadTopics, loadPosts]);

  const addTopic = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/blog-topics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ prompt: promptInput.trim() }),
      });
      if (!res.ok) { toast.error('Failed to add topic'); return; }
      toast.success('Topic added to queue');
      setPromptInput('');
      loadTopics();
    } catch { toast.error('Something went wrong'); }
    finally { setAdding(false); }
  };

  const addBulk = async () => {
    const prompts = bulkInput.split('\n').map((p) => p.trim()).filter(Boolean);
    if (!prompts.length) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/blog-topics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ prompts }),
      });
      if (!res.ok) { toast.error('Failed to add topics'); return; }
      toast.success(`${prompts.length} topics added`);
      setBulkInput('');
      setBulkOpen(false);
      loadTopics();
    } catch { toast.error('Something went wrong'); }
    finally { setAdding(false); }
  };

  const deleteTopic = async (id) => {
    try {
      const res = await fetch(`/api/admin/blog-topics?id=${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { toast.error('Failed to delete'); return; }
      toast.success('Deleted');
      setTopics((t) => t.filter((x) => x.id !== id));
    } catch { toast.error('Something went wrong'); }
  };

  const generateNow = async (topic) => {
    setGeneratingId(topic.id);
    try {
      const res = await fetch('/api/admin/generate-blog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ prompt: topic.prompt, topicId: topic.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Generation failed'); return; }
      toast.success(`Saved as draft: ${data.title || data.slug}`);
      loadTopics();
      loadPosts();
      setActiveTab('posts');
    } catch { toast.error('Something went wrong'); }
    finally { setGeneratingId(null); }
  };

  const togglePublish = async (post) => {
    setTogglingId(post.id);
    try {
      const res = await fetch('/api/admin/blog-posts', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }
      toast.success(data.published ? 'Published' : 'Moved to draft');
      setPosts((ps) => ps.map((p) => p.id === post.id ? { ...p, published: data.published } : p));
    } catch { toast.error('Something went wrong'); }
    finally { setTogglingId(null); }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blog-posts?id=${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { toast.error('Delete failed'); return; }
      toast.success('Post deleted');
      setPosts((ps) => ps.filter((p) => p.id !== id));
    } catch { toast.error('Something went wrong'); }
    finally { setDeletingId(null); }
  };

  const draftCount     = posts.filter((p) => !p.published).length;
  const publishedCount = posts.filter((p) => p.published).length;
  const pendingCount   = topics.filter((t) => t.status === 'pending').length;
  const failedCount    = topics.filter((t) => t.status === 'failed').length;

  return (
    <div className="p-6 w-full space-y-6">
      {editPost && (
        <EditModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onSaved={(updated) => {
            setPosts((ps) => ps.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
            setEditPost(null);
          }}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Blog Automation</h1>
        <p className="text-gray-400 text-sm mt-0.5">Add topics to the queue — GPT-4o generates drafts. Review and publish manually.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'In Queue',  value: pendingCount,   color: 'text-yellow-400' },
          { label: 'Drafts',    value: draftCount,     color: 'text-blue-400' },
          { label: 'Published', value: publishedCount, color: 'text-green-400' },
          { label: 'Failed',    value: failedCount,    color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add topic form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Add to Queue</h2>
        <form onSubmit={addTopic} className="flex gap-2">
          <input
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. Best solar panel companies in Sydney 2026"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={adding || !promptInput.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
          <button type="button" onClick={() => setBulkOpen((v) => !v)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors">
            Bulk
          </button>
        </form>

        {bulkOpen && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-gray-500">One topic per line</p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={6}
              placeholder={"Best solar panels in Sydney\nTop electricians in Melbourne\nLED suppliers in Perth"}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={addBulk} disabled={adding || !bulkInput.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add {bulkInput.split('\n').filter((l) => l.trim()).length || 0} topics
              </button>
              <button onClick={() => setBulkOpen(false)} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit mb-4">
          {[
            { id: 'queue', label: `Topic Queue (${topics.length})` },
            { id: 'posts', label: `Posts (${posts.length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Topic Queue */}
        {activeTab === 'queue' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">Topic Queue</h2>
              <button onClick={loadTopics} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            {loadingTopics ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
            ) : topics.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No topics yet. Add some above.</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {topics.map((topic) => (
                  <div key={topic.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 truncate">{topic.prompt}</p>
                      {topic.error && <p className="text-xs text-red-400 mt-0.5 truncate">{topic.error}</p>}
                      {topic.slug && (
                        <a href={`/blogs/${topic.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
                          /blogs/{topic.slug} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLE[topic.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                      {topic.status}
                    </span>
                    {(topic.status === 'pending' || topic.status === 'failed') && (
                      <button
                        onClick={() => generateNow(topic)}
                        disabled={generatingId === topic.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-900/40 border border-green-700/40 text-green-300 text-xs rounded-lg hover:bg-green-900/60 disabled:opacity-50 transition-colors"
                        title="Generate now"
                      >
                        {generatingId === topic.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        {generatingId === topic.id ? 'Generating…' : 'Generate'}
                      </button>
                    )}
                    <button onClick={() => deleteTopic(topic.id)} className="text-gray-600 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts */}
        {activeTab === 'posts' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">All Posts</h2>
              <button onClick={loadPosts} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            {loadingPosts ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
            ) : posts.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No posts yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/50">
                      {['Title', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium text-gray-100 max-w-xs">
                          <p className="truncate">{post.title}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">/blogs/{post.slug}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{post.category}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${post.published ? 'bg-green-900/40 text-green-300 border-green-700/40' : 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Edit */}
                            <button
                              onClick={() => setEditPost(post)}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>

                            {/* Publish / Unpublish */}
                            <button
                              onClick={() => togglePublish(post)}
                              disabled={togglingId === post.id}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${post.published ? 'bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300' : 'bg-green-900/40 hover:bg-green-900/60 text-green-300'}`}
                              title={post.published ? 'Move to draft' : 'Publish'}
                            >
                              {togglingId === post.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : post.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />
                              }
                              {post.published ? 'Unpublish' : 'Publish'}
                            </button>

                            {/* View */}
                            {post.published && (
                              <a
                                href={`/blogs/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 text-xs rounded transition-colors"
                                title="View"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => deletePost(post.id)}
                              disabled={deletingId === post.id}
                              className="flex items-center gap-1 px-2 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 text-xs rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
