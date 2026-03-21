import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

/**
 * Calls OpenAI to generate a fully structured blog post JSON from a prompt.
 * Returns parsed JSON content ready to store in blog_posts.content (jsonb).
 */
async function generateBlogContent(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const systemPrompt = `You are an expert SEO content writer for FirmsLedger (https://firmsledger.com), a B2B business directory platform that helps buyers discover and connect with verified companies across industries including manufacturing, industrial supplies, solar energy, electrical equipment, and professional services.

Your job is to write comprehensive, SEO-optimized blog articles targeting:
- Business owners and procurement managers sourcing vendors
- Startup founders comparing service providers
- SMEs looking for local or industry-specific suppliers

WRITING STYLE:
- Tone: Authoritative, practical, and buyer-focused (not academic)
- Reading level: Clear enough for a non-technical business owner
- Use active voice and avoid filler phrases like "In today's fast-paced world"
- Every section must deliver real, actionable value

SEO RULES:
- Naturally include the primary keyword in: title, meta description, intro paragraph, and at least 2 subheadings
- Use semantic variations of the keyword throughout (do NOT keyword-stuff)
- Structure content for featured snippets: use numbered lists, short definitions, and clear H2/H3 hierarchy

INTERNAL LINKING:
- Where relevant, include this exact anchor text and URL: "Browse verified companies on FirmsLedger" → https://firmsledger.com/directory
- Place this link naturally at least once — ideally near the end of the intro or within the how_to_choose section

IMAGES:
- Do NOT generate or guess Unsplash photo IDs or URLs
- For the "image" field in companies or sections, return null — the CMS will handle image assignment

ALWAYS return valid JSON only — no markdown, no backticks, no preamble. Exact structure:

{
  "slug": "kebab-case-url-slug",
  "title": "SEO-optimized H1 title (60–65 chars)",
  "meta_description": "Compelling meta description (145–155 chars, includes primary keyword)",
  "category": "Category Name",
  "read_time": "X min read",
  "intro": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "why_section": {
    "heading": "Why [Topic] Matters for Your Business",
    "points": [
      { "title": "Point title", "description": "2–3 sentence explanation" }
    ]
  },
  "companies": [
    {
      "name": "Company Name",
      "description": "3–4 sentence profile covering what they do, industries served, and key strengths",
      "location": "City, State, Country",
      "specialization": "e.g. CNC Turning Centers, VMC Machines",
      "founded": "Year or null",
      "image": null
    }
  ],
  "services": {
    "heading": "Types of [Products/Services] Available",
    "items": [
      { "name": "Service/Product type", "description": "Brief explanation" }
    ]
  },
  "how_to_choose": {
    "heading": "How to Choose the Right [Company/Product]",
    "steps": [
      { "step": "Step title", "detail": "Actionable guidance for a buyer" }
    ]
  },
  "trends": {
    "heading": "Latest Trends in [Industry] (2025–2026)",
    "points": ["trend 1", "trend 2", "trend 3", "trend 4"]
  },
  "faq": [
    { "question": "Buyer-intent question?", "answer": "Concise, helpful answer (2–4 sentences)" }
  ],
  "conclusion": {
    "body": "2 paragraph conclusion summarizing key takeaways",
    "cta": "Single CTA sentence with internal link anchor: Browse verified companies on FirmsLedger → https://firmsledger.com/directory"
  }
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a comprehensive SEO blog article about: ${prompt}` },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty response from OpenAI');

  return JSON.parse(raw);
}

/** Ping Google Indexing API (simple sitemap ping — no OAuth needed) */
async function pingGoogleSitemap() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  } catch {
    // non-critical — ignore failures
  }
}

/** Call our index-url route to submit the URL to Google Indexing API */
async function requestGoogleIndexing(slug) {
  try {
    const url = `${BASE_URL}/blogs/${slug}`;
    await fetch(`${BASE_URL}/api/admin/index-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': process.env.CRON_SECRET || '' },
      body: JSON.stringify({ url }),
    });
  } catch {
    // non-critical
  }
}

/**
 * POST /api/admin/generate-blog
 * Body: { prompt: string, topicId?: string }
 *
 * Generates an AI blog post, saves it to Supabase, and triggers Google indexing.
 * Requires admin login OR a valid CRON_SECRET header (for cron use).
 */
export async function POST(request) {
  // Accept both admin cookie auth and cron secret auth
  const cronSecret = request.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, topicId } = await request.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Mark topic as processing
  if (topicId) {
    await supabase.from('blog_topics').update({ status: 'processing' }).eq('id', topicId);
  }

  let content;
  try {
    content = await generateBlogContent(prompt);
  } catch (err) {
    if (topicId) {
      await supabase
        .from('blog_topics')
        .update({ status: 'failed', error: err.message })
        .eq('id', topicId);
    }
    return NextResponse.json({ error: `Generation failed: ${err.message}` }, { status: 500 });
  }

  // Validate required fields
  if (!content.slug || !content.title || !content.meta_description || !content.intro) {
    if (topicId) {
      await supabase.from('blog_topics').update({ status: 'failed', error: 'Invalid content structure from AI' }).eq('id', topicId);
    }
    return NextResponse.json({ error: 'AI returned invalid structure' }, { status: 500 });
  }

  // Save to Supabase (upsert in case of duplicate slug)
  const { data: saved, error: dbErr } = await supabase
    .from('blog_posts')
    .upsert(
      {
        slug: content.slug,
        title: content.title,
        meta_description: content.meta_description,
        image_url: content.image_url || null,
        image_alt: content.image_alt || null,
        category: content.category || 'Manufacturing',
        read_time: content.read_time || '10 min read',
        content,
        published: true,
        topic_id: topicId || null,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();

  if (dbErr) {
    if (topicId) {
      await supabase.from('blog_topics').update({ status: 'failed', error: dbErr.message }).eq('id', topicId);
    }
    return NextResponse.json({ error: `DB error: ${dbErr.message}` }, { status: 500 });
  }

  // Mark topic as done
  if (topicId) {
    await supabase
      .from('blog_topics')
      .update({ status: 'done', slug: content.slug, processed_at: new Date().toISOString() })
      .eq('id', topicId);
  }

  // Trigger Google indexing (non-blocking)
  await Promise.all([
    pingGoogleSitemap(),
    requestGoogleIndexing(content.slug),
  ]);

  return NextResponse.json({
    success: true,
    slug: content.slug,
    title: content.title,
    url: `${BASE_URL}/blogs/${content.slug}`,
    post: saved,
  });
}
