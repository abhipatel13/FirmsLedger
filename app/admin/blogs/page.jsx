'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2, RefreshCw, ExternalLink, Loader2, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLE = {
  pending:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  processing: 'bg-blue-900/40   text-blue-300   border-blue-700/40',
  done:       'bg-green-900/40  text-green-300  border-green-700/40',
  failed:     'bg-red-900/40    text-red-300    border-red-700/40',
};

export default function BlogsAdminPage() {
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');

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
      toast.success(`Published: ${data.title || data.slug}`);
      loadTopics();
      loadPosts();
    } catch { toast.error('Something went wrong'); }
    finally { setGeneratingId(null); }
  };

  const pendingCount = topics.filter((t) => t.status === 'pending').length;
  const doneCount    = topics.filter((t) => t.status === 'done').length;
  const failedCount  = topics.filter((t) => t.status === 'failed').length;

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Blog Automation</h1>
        <p className="text-gray-400 text-sm mt-0.5">Add topics to the queue — GPT-4o generates posts daily at 6 AM UTC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'In Queue',  value: pendingCount, color: 'text-yellow-400' },
          { label: 'Published', value: posts.length, color: 'text-green-400' },
          { label: 'Failed',    value: failedCount,  color: 'text-red-400' },
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
            { id: 'posts', label: `Published (${posts.length})` },
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

        {/* Published posts */}
        {activeTab === 'posts' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">Published Posts</h2>
              <button onClick={loadPosts} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            {loadingPosts ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
            ) : posts.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No published posts yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/50">
                      {['Title', 'Category', 'Read Time', 'Published', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium text-gray-100 max-w-xs truncate">{post.title}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{post.category}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{post.read_time}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
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
