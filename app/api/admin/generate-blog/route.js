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

// ── DALL-E 3 image generation + Supabase Storage upload ───────────────────────
async function generateAndStoreImage(imagePrompt, slug, apiKey) {
  // 1. Generate with DALL-E 3
  const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:           'dall-e-3',
      prompt:          imagePrompt,
      n:               1,
      size:            '1792x1024',
      quality:         'standard',
      response_format: 'url',
    }),
  });

  if (!dalleRes.ok) {
    const err = await dalleRes.text();
    throw new Error(`DALL-E 3 error: ${err}`);
  }

  const dalleData = await dalleRes.json();
  const tempUrl   = dalleData?.data?.[0]?.url;
  if (!tempUrl) throw new Error('No image URL returned from DALL-E 3');

  // 2. Download the generated image (DALL-E URLs expire in ~1 hour)
  const imgRes = await fetch(tempUrl);
  if (!imgRes.ok) throw new Error('Failed to download generated image');
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

  // 3. Upload to Supabase Storage (bucket: blog-images)
  const supabase  = getServiceSupabase();
  const fileName  = `${slug}-${Date.now()}.png`;
  const { error: uploadErr } = await supabase.storage
    .from('blog-images')
    .upload(fileName, imgBuffer, {
      contentType:  'image/png',
      cacheControl: '31536000',
      upsert:       false,
    });

  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

  // 4. Get permanent public URL
  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(fileName);

  return {
    image_url: urlData.publicUrl,
    image_alt: imagePrompt.slice(0, 120),
  };
}

// ── OpenAI generation ──────────────────────────────────────────────────────────
async function generateBlogContent(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const systemPrompt = `You are a senior SEO content strategist and B2B journalist writing for FirmsLedger (https://firmsledger.com), a global directory of verified business service providers.

TARGET AUDIENCE: Business owners, procurement managers, HR directors, and founders who are actively evaluating vendors and ready to make a decision. Write for decision-makers, not casual readers.

CONTENT DEPTH REQUIREMENTS — This must be a COMPREHENSIVE, in-depth article, NOT a surface-level overview:
- Total target: 3,000–4,500 words across all sections
- intro: 3–4 paragraphs, 300–400 words total. Start with a compelling hook (statistic, bold claim, or direct question). State the primary keyword naturally in the first sentence.
- why_section: 5–6 points, each with a title and 100–150 word description. Include real industry data or research where relevant.
- companies: 8–12 companies minimum, each profile 200–280 words. Include: what they do, who they serve, key services, differentiators, pricing signals, geographic reach, notable clients or certifications.
- services: 5–7 service/product types with 80–120 word descriptions each.
- how_to_choose: 7–9 actionable criteria. Each must include a "questions_to_ask" field with 2 specific questions a buyer should ask vendors.
- trends: 5–6 trends, each 60–90 words (not single sentences).
- faq: 8–10 questions with detailed 80–120 word answers. Include long-tail question variants.
- conclusion: 2–3 paragraphs, 200–250 words. Strong summary + call to action.
- comparison_table: A data table comparing the top 5–6 companies across 5–7 key criteria (pricing, HQ, team size, industries, certifications, standout strength).
- key_takeaways: 5 bullet-point summary sentences for featured snippet capture.
- buying_guide: 4–5 evaluation criteria with name, 80–100 word description, and 2 questions to ask.

SEO RULES:
- Naturally use the primary keyword in: title (within first 60 chars), meta description (within first 30 chars), first paragraph, at least 3 subheadings, and conclusion.
- Include 8–10 LSI (latent semantic indexing) keywords spread throughout — list them in the "lsi_keywords" field.
- Structure content for featured snippets: use numbered lists, definition-style H3s, and clear hierarchy.
- Meta description: exactly 145–160 chars. Must include the primary keyword and a compelling reason to click.

INTERNAL LINKS — Include these naturally:
- "Browse verified companies on FirmsLedger" → https://firmsledger.com/directory (in intro or conclusion)
- "List your company on FirmsLedger" → https://firmsledger.com/ListYourCompany (in conclusion)

COMPANY PROFILES — Write each profile as if you've researched the company:
- Include real, specific details: founded year, HQ city, employee range or team size, key industries, recognisable clients (if public), certifications (ISO, industry-specific), geographic presence.
- Include a "key_strength" (1-sentence USP) and "ideal_for" (specific buyer type this suits best).
- Do NOT make up fake statistics or fabricate financial data. If uncertain, describe capabilities qualitatively.

IMAGE: Return an "image_dalle_prompt" field — a detailed DALL-E 3 image generation prompt for the hero image. Format: "Professional [scene description], [style], [lighting], [composition]. No text or logos." Examples: "Professional recruitment office with diverse team in a modern glass meeting room, photorealistic, natural window light, wide angle shot. No text or logos.", "Solar panel installation on industrial rooftop with blue sky background, photorealistic, golden hour lighting, aerial perspective. No text or logos."

RETURN VALID JSON ONLY — no markdown, no backticks, no preamble. Exact structure:

{
  "slug": "kebab-case-url-slug-max-60-chars",
  "title": "Primary keyword near start, max 65 chars",
  "meta_description": "Primary keyword in first 30 chars, 145-160 chars total, compelling reason to click",
  "excerpt": "1–2 sentence summary for blog listing card, 120–160 chars",
  "category": "Category Name",
  "read_time": "X min read",
  "image_dalle_prompt": "Detailed DALL-E 3 prompt for hero image. Photorealistic style. No text or logos.",
  "lsi_keywords": ["keyword1", "keyword2", "...up to 10"],
  "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"],
  "intro": ["paragraph 1 (hook + primary keyword)", "paragraph 2 (scope and what reader will learn)", "paragraph 3 (why FirmsLedger + internal link)", "optional paragraph 4"],
  "why_section": {
    "heading": "Why [Topic] Matters for [Audience] in [Year]",
    "points": [
      { "title": "Point title (use LSI keyword)", "description": "100-150 word in-depth explanation with data or examples" }
    ]
  },
  "comparison_table": {
    "heading": "Quick Comparison: Top [Category] Companies",
    "headers": ["Company", "HQ", "Team Size", "Key Industries", "Certifications", "Best For", "Pricing Tier"],
    "rows": [
      ["Company Name", "City, Country", "100-500", "IT, Finance", "ISO 9001", "Enterprise clients", "Mid-range"]
    ]
  },
  "companies": [
    {
      "name": "Company Name",
      "founded": "Year",
      "location": "City, Country",
      "team_size": "range e.g. 200-500 employees",
      "specialization": "Primary specialization",
      "industries_served": ["Industry 1", "Industry 2"],
      "certifications": "ISO 9001, other certifications",
      "description": "200-280 word company profile covering what they do, strengths, services, clients, geographic reach, and differentiators",
      "services": ["Service 1", "Service 2", "Service 3"],
      "key_strength": "One-sentence unique selling point",
      "ideal_for": "Specific buyer type or use case this company suits best",
      "pricing_hint": "Pricing signal e.g. 'premium pricing', 'competitive mid-market rates', 'project-based pricing'"
    }
  ],
  "services": {
    "heading": "Types of [Products/Services] Available",
    "items": [
      { "name": "Service/Product type", "description": "80-120 word explanation of what this is, when to use it, and what to expect" }
    ]
  },
  "how_to_choose": {
    "heading": "How to Choose the Right [Company/Vendor]: 8 Key Criteria",
    "steps": [
      {
        "step": "Criterion title",
        "detail": "Actionable 60-80 word guidance for a buyer evaluating vendors",
        "questions_to_ask": ["Specific question 1?", "Specific question 2?"]
      }
    ]
  },
  "buying_guide": {
    "heading": "Buyer's Evaluation Checklist",
    "criteria": [
      {
        "name": "Criterion",
        "description": "80-100 word explanation of why this matters and what good looks like",
        "questions_to_ask": ["Question 1?", "Question 2?"]
      }
    ]
  },
  "trends": {
    "heading": "Key Trends Shaping [Industry] in 2026",
    "points": [
      { "title": "Trend title", "description": "60-90 word description of the trend, its drivers, and impact on buyers" }
    ]
  },
  "faq": [
    {
      "question": "Full question (include long-tail keyword variant)?",
      "answer": "80-120 word detailed, helpful answer with specific guidance or data"
    }
  ],
  "conclusion": {
    "body": "200-250 word conclusion across 2-3 paragraphs. Summarise key findings, give a clear recommendation framework, and close with a call to action.",
    "cta": "Closing sentence with internal link: Browse verified companies on FirmsLedger → https://firmsledger.com/directory"
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
        { role: 'user', content: `Write a comprehensive, in-depth SEO blog article (3,000–4,500 words) about: ${prompt}\n\nEnsure every section meets the word count targets. This must be a definitive, authoritative guide — not a brief overview.` },
      ],
      temperature: 0.65,
      max_tokens: 6000,
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

/**
 * POST /api/admin/generate-blog
 * Body: { prompt: string, topicId?: string }
 */
export async function POST(request) {
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

  if (topicId) {
    await supabase.from('blog_topics').update({ status: 'processing' }).eq('id', topicId);
  }

  let content;
  try {
    content = await generateBlogContent(prompt);
  } catch (err) {
    if (topicId) {
      await supabase.from('blog_topics').update({ status: 'failed', error: err.message }).eq('id', topicId);
    }
    return NextResponse.json({ error: `Generation failed: ${err.message}` }, { status: 500 });
  }

  if (!content.slug || !content.title || !content.meta_description || !content.intro) {
    if (topicId) {
      await supabase.from('blog_topics').update({ status: 'failed', error: 'Invalid content structure from AI' }).eq('id', topicId);
    }
    return NextResponse.json({ error: 'AI returned invalid structure' }, { status: 500 });
  }

  // Generate image with DALL-E 3 and store in Supabase Storage
  const apiKey = process.env.OPENAI_API_KEY;
  let image_url = null;
  let image_alt = null;
  try {
    const dallePrompt = content.image_dalle_prompt ||
      `Professional high-quality photo related to ${content.category || prompt}, photorealistic, clean background, no text or logos.`;
    const result = await generateAndStoreImage(dallePrompt, content.slug, apiKey);
    image_url = result.image_url;
    image_alt = result.image_alt;
  } catch (imgErr) {
    console.error('Image generation failed (non-fatal):', imgErr.message);
    // Continue without image — admin can add one via edit
  }

  const { data: saved, error: dbErr } = await supabase
    .from('blog_posts')
    .upsert(
      {
        slug:             content.slug,
        title:            content.title,
        meta_description: content.meta_description,
        image_url,
        image_alt,
        category:         content.category || 'General',
        read_time:        content.read_time || '12 min read',
        content,
        published:        false,
        topic_id:         topicId || null,
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

  if (topicId) {
    await supabase
      .from('blog_topics')
      .update({ status: 'done', slug: content.slug, processed_at: new Date().toISOString() })
      .eq('id', topicId);
  }

  return NextResponse.json({
    success: true,
    slug:    content.slug,
    title:   content.title,
    url:     `${BASE_URL}/blogs/${content.slug}`,
    post:    saved,
  });
}
