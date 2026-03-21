/**
 * topicsManager.ts
 *
 * Manages the blog_topics queue in Supabase.
 * Used by the generate-blog cron to pick topics and track their lifecycle.
 */

import { getServiceSupabase } from './supabaseClient';

export interface BlogTopic {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  slug: string | null;
  error: string | null;
  created_at: string;
  processed_at: string | null;
}

/**
 * Fetches up to `limit` oldest pending topics from blog_topics.
 * Returns an empty array if the queue is empty.
 */
export async function getPendingTopics(limit = 3): Promise<BlogTopic[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('blog_topics')
    .select('id, prompt, status, slug, error, created_at, processed_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch topics: ${error.message}`);
  return (data ?? []) as BlogTopic[];
}

/**
 * Marks a topic as currently being processed to prevent double-picking.
 */
export async function markTopicProcessing(topicId: string): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('blog_topics')
    .update({ status: 'processing' })
    .eq('id', topicId);
  if (error) throw new Error(`Failed to mark topic processing: ${error.message}`);
}

/**
 * Marks a topic as successfully done and stores the resulting slug.
 */
export async function markTopicDone(topicId: string, slug: string): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('blog_topics')
    .update({ status: 'done', slug, processed_at: new Date().toISOString() })
    .eq('id', topicId);
  if (error) throw new Error(`Failed to mark topic done: ${error.message}`);
}

/**
 * Marks a topic as failed and stores the error message.
 */
export async function markTopicFailed(topicId: string, errorMsg: string): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('blog_topics')
    .update({ status: 'failed', error: errorMsg })
    .eq('id', topicId);
  if (error) console.error(`Failed to mark topic failed: ${error.message}`);
}

/**
 * Returns recently published blog URLs (from both blogs + blog_posts tables)
 * that have not yet appeared in submission_logs, up to `limit` items.
 */
export async function getUnsubmittedUrls(limit = 20): Promise<string[]> {
  const BASE_URL = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'
  ).replace(/\/$/, '');

  const supabase = getServiceSupabase();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Collect slugs from the markdown `blogs` table
  const { data: newBlogs } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Collect slugs from the legacy JSON `blog_posts` table
  const { data: legacyPosts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);

  const urls = [
    ...(newBlogs ?? []).map((b) => `${BASE_URL}/blogs/${b.slug}`),
    ...(legacyPosts ?? []).map((b) => `${BASE_URL}/blogs/${b.slug}`),
  ];

  if (urls.length === 0) return [];

  // Filter out URLs already logged as success in the last 7 days
  const { data: alreadyLogged } = await supabase
    .from('submission_logs')
    .select('url')
    .in('url', urls)
    .eq('status', 'success')
    .gte('submitted_at', since);

  const alreadySet = new Set((alreadyLogged ?? []).map((r) => r.url));
  return urls.filter((u) => !alreadySet.has(u));
}
