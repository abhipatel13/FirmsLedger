'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, Trash2, RefreshCw, ExternalLink, CheckCircle,
  XCircle, Clock, Loader2, Zap, FileText, List
} from 'lucide-react';

const STATUS_BADGE = {
  pending:    { label: 'Pending',    color: 'bg-slate-100 text-slate-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 animate-pulse' },
  done:       { label: 'Published',  color: 'bg-green-100 text-green-700' },
  failed:     { label: 'Failed',     color: 'bg-red-100 text-red-700' },
};

export default function BlogAutomation() {
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [generatingId, setGeneratingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => { fetchTopics(); fetchPosts(); }, []);

  async function fetchTopics() {
    setLoadingTopics(true);
    try {
      const res = await fetch('/api/admin/blog-topics');
      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch { setTopics([]); }
    setLoadingTopics(false);
  }

  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/admin/blog-posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch { setPosts([]); }
    setLoadingPosts(false);
  }

  async function addTopics(e) {
    e.preventDefault();
    const raw = bulkInput.trim() || promptInput.trim();
    if (!raw) return;

    // Support one prompt per line
    const prompts = raw.split('\n').map((s) => s.trim()).filter(Boolean);
    setAdding(true);
    try {
      await fetch('/api/admin/blog-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts }),
      });
      setPromptInput('');
      setBulkInput('');
      await fetchTopics();
    } catch { /* show nothing */ }
    setAdding(false);
  }

  async function deleteTopic(id) {
    if (!confirm('Remove this topic from the queue?')) return;
    await fetch(`/api/admin/blog-topics?id=${id}`, { method: 'DELETE' });
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }

  async function generateNow(topic) {
    setGeneratingId(topic.id);
    try {
      const res = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic.prompt, topicId: topic.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Published! /blogs/${data.slug}`);
        await fetchTopics();
        await fetchPosts();
      } else {
        alert(`Failed: ${data.error}`);
        await fetchTopics();
      }
    } catch { alert('Network error'); }
    setGeneratingId(null);
  }

  const pendingCount = topics.filter((t) => t.status === 'pending').length;
  const doneCount = topics.filter((t) => t.status === 'done').length;
  const failedCount = topics.filter((t) => t.status === 'failed').length;

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0D1B2A]">Blog Automation</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Queue prompts → AI writes the article → auto-publishes + pings Google daily at 8 AM UTC.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'In Queue',   value: pendingCount,    icon: Clock,       color: 'text-slate-600' },
            { label: 'Published',  value: doneCount,       icon: CheckCircle, color: 'text-green-600' },
            { label: 'Failed',     value: failedCount,     icon: XCircle,     color: 'text-red-500'   },
            { label: 'Total Posts',value: posts.length,    icon: FileText,    color: 'text-blue-600'  },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-slate-200">
              <CardContent className="p-5 flex items-center gap-3">
                <Icon className={`w-6 h-6 ${color}`} />
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Topics */}
        <Card className="border-slate-200 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-500" />
              Add Blog Topics to Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTopics} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Single Prompt
                </label>
                <input
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder='e.g. "Top CNC manufacturers in Texas 2026 — include 5 companies"'
                  className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Bulk Add (one prompt per line)
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={4}
                  placeholder={"Top solar panel installers in Arizona 2026\nBest aerospace manufacturers in California 2026\nTop EV charging companies in Nevada 2026"}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={adding} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                  Add to Queue
                </Button>
                <Button type="button" variant="outline" onClick={fetchTopics} className="border-slate-200">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'queue', label: 'Topic Queue', icon: List },
            { key: 'posts', label: 'Published Posts', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === key
                  ? 'bg-[#0D1B2A] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Topic Queue */}
        {activeTab === 'queue' && (
          <Card className="border-slate-200">
            <CardContent className="p-0">
              {loadingTopics ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No topics yet. Add prompts above to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topics.map((topic) => {
                    const badge = STATUS_BADGE[topic.status] || STATUS_BADGE.pending;
                    const isGenerating = generatingId === topic.id;
                    return (
                      <div key={topic.id} className="flex items-start gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 font-medium truncate">{topic.prompt}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                            {topic.slug && (
                              <Link
                                href={`/blogs/${topic.slug}`}
                                target="_blank"
                                className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                              >
                                /blogs/{topic.slug} <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                            {topic.error && (
                              <span className="text-xs text-red-500 truncate max-w-xs">{topic.error}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Added {new Date(topic.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(topic.status === 'pending' || topic.status === 'failed') && (
                            <Button
                              size="sm"
                              onClick={() => generateNow(topic)}
                              disabled={isGenerating}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-3"
                            >
                              {isGenerating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><Zap className="w-3 h-3 mr-1" /> Generate Now</>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTopic(topic.id)}
                            className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Published Posts */}
        {activeTab === 'posts' && (
          <Card className="border-slate-200">
            <CardContent className="p-0">
              {loadingPosts ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No AI-generated posts yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-start gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-semibold">
                            {post.category}
                          </span>
                          {post.indexed_at && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Indexed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/blogs/${post.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-orange-500 hover:underline flex-shrink-0"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-slate-200 mt-8 bg-slate-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-3">How the automation works</h3>
            <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
              <li>Add prompts to the queue above (one per blog article)</li>
              <li>Every day at <strong>8 AM UTC</strong>, Vercel cron picks the oldest pending topic</li>
              <li>OpenAI <strong>GPT-4o</strong> generates a full 1,400-word structured article</li>
              <li>Article is saved to <strong>Supabase</strong> and immediately live at <code className="bg-slate-200 px-1 rounded">/blogs/[slug]</code></li>
              <li>Google is pinged via <strong>Indexing API + sitemap</strong> to request crawling</li>
              <li>Bing is notified via <strong>IndexNow</strong></li>
            </ol>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
