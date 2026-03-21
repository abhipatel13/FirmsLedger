/**
 * blogGenerator.ts
 *
 * Module 1 — AI Blog Generation
 * Calls GPT-4o to produce a Markdown blog post, then persists it
 * to the Supabase `blogs` table with status: 'published'.
 */

import OpenAI from 'openai';
import { getServiceSupabase } from './supabaseClient';
import { markTopicDone, markTopicFailed } from './topicsManager';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiResponse {
  title: string;
  meta_description: string;
  category: string;
  tags: string[];
  target_country: string;
  content: string; // full Markdown body
}

export interface GeneratedBlog {
  id: string;
  slug: string;
  title: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a title string to a URL-safe kebab-case slug.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strips any stray HTML tags from a string to prevent XSS injection
 * before content reaches the database.
 */
function sanitizeMarkdown(md: string): string {
  // Allow Markdown syntax but reject raw <script>, <iframe>, <form> tags
  return md
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '');
}

// ---------------------------------------------------------------------------
// GPT-4o call
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an SEO content writer for FirmsLedger, an Australian business directory.
Write a long-form, SEO-optimized blog post in Markdown.

Your response MUST be valid JSON with exactly these keys:
- "title": string — the H1 title (max 70 chars, include the target keyword)
- "meta_description": string — 120–155 characters, compelling SEO description
- "category": string — one of: Manufacturing, Technology, Services, Staffing, Solar, LED, Industrial
- "tags": string[] — 3–6 relevant keyword tags
- "target_country": string — primary country this post targets
- "content": string — the full Markdown body. Must include:
    • An H1 matching "title"
    • An introduction paragraph (100+ words)
    • 4–6 H2 sections with detailed content (at least 150 words each)
    • Internal links: [anchor text](/directory/category) or [anchor text](/blogs/slug)
    • A FAQ section (H2 "Frequently Asked Questions") with 4–5 Q&A pairs formatted as:
        **Q: Question here?**
        A: Answer here.
    • A conclusion with a CTA to list on FirmsLedger
    Total word count: 1000–1500 words

Rules:
- Use Australian English spelling
- Weave the target keyword naturally (not stuffed)
- All internal links must use relative paths starting with /
- meta_description must be 120–155 characters exactly — count them
- Return only valid JSON, no markdown code fences, no extra text`;

/**
 * Calls GPT-4o to generate a structured blog post for the given topic.
 */
async function callGpt4o(topic: string): Promise<AiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Target keyword / topic: ${topic}\n\nWrite the blog post now.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from OpenAI');

  const parsed: AiResponse = JSON.parse(raw);

  // Validate required fields
  if (!parsed.title || !parsed.meta_description || !parsed.content) {
    throw new Error('AI response missing required fields: title, meta_description, or content');
  }
  if (parsed.meta_description.length > 160) {
    parsed.meta_description = parsed.meta_description.slice(0, 155);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a single blog post for the given topic and persists it to Supabase.
 *
 * @param topic   The blog topic / target keyword (e.g. "Best solar panels in Sydney")
 * @param topicId Optional ID from blog_topics table — used to update status
 * @returns       The saved blog's id, slug, title, and live URL
 */
export async function generateBlogPost(
  topic: string,
  topicId?: string
): Promise<GeneratedBlog> {
  const BASE_URL = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'
  ).replace(/\/$/, '');

  const supabase = getServiceSupabase();

  // Generate content
  let ai: AiResponse;
  try {
    ai = await callGpt4o(topic);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (topicId) await markTopicFailed(topicId, msg);
    throw err;
  }

  const slug = slugify(ai.title);
  const sanitizedContent = sanitizeMarkdown(ai.content);

  // Upsert into blogs table (conflict on slug = update content)
  const { data: saved, error: dbErr } = await supabase
    .from('blogs')
    .upsert(
      {
        title: ai.title,
        slug,
        meta_description: ai.meta_description,
        content: sanitizedContent,
        category: ai.category ?? 'General',
        tags: ai.tags ?? [],
        target_country: ai.target_country ?? 'Australia',
        status: 'published',
        published_at: new Date().toISOString(),
        topic_id: topicId ?? null,
      },
      { onConflict: 'slug' }
    )
    .select('id, slug, title')
    .single();

  if (dbErr) {
    const msg = `DB insert failed: ${dbErr.message}`;
    if (topicId) await markTopicFailed(topicId, msg);
    throw new Error(msg);
  }

  if (topicId) await markTopicDone(topicId, slug);

  return {
    id: saved.id,
    slug: saved.slug,
    title: saved.title,
    url: `${BASE_URL}/blogs/${saved.slug}`,
  };
}

// ---------------------------------------------------------------------------
// Seed topics (used if blog_topics table is empty)
// ---------------------------------------------------------------------------

export const SEED_TOPICS: string[] = [
  'Best solar panel companies in Australia 2026',
  'Top LED light suppliers in Sydney',
  'How to choose a water pump for your home',
  'Business directory listing benefits for Australian SMBs',
  'Top industrial equipment suppliers in Melbourne',
  'Best CNC machining services in Brisbane',
  'Top recruitment agencies in Australia 2026',
  'How to find reliable manufacturing partners in Australia',
  'Best electrical suppliers for commercial construction in Perth',
  'Top 10 IT staffing companies in Australia 2026',
];
