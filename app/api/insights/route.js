import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Module-level cache so repeated visits within the running process don't
// re-call OpenAI for the same agency. Keyed by agency id; entries live for
// 24 hours. Survives across requests on the same server instance.
const cache = new Map();
const TTL = 24 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const { agencyId } = await request.json();
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI insights are not configured.' }, { status: 503 });
    }

    const cached = cache.get(agencyId);
    if (cached && Date.now() - cached.at < TTL) {
      return NextResponse.json(cached.data);
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    const [{ data: agency }, { data: agencyCats }, { data: categories }, { data: reviews }] = await Promise.all([
      supabase.from('agencies').select('id, name, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, hourly_rate, website, verified').eq('id', agencyId).maybeSingle(),
      supabase.from('agency_categories').select('category_id').eq('agency_id', agencyId),
      supabase.from('categories').select('id, name'),
      supabase.from('reviews').select('rating_overall, body, title').eq('agency_id', agencyId).eq('approved', true).limit(10),
    ]);

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found.' }, { status: 404 });
    }

    const catNames = (agencyCats || [])
      .map(ac => (categories || []).find(c => c.id === ac.category_id)?.name)
      .filter(Boolean);

    const reviewSnippets = (reviews || [])
      .filter(r => r.body)
      .map(r => `- "${(r.title ? r.title + ': ' : '') + r.body}" (${r.rating_overall || '?'}/5)`)
      .join('\n') || 'No client reviews yet.';

    const location = [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ') || 'Global';

    const systemPrompt = `You are an analyst writing concise, factual summaries about B2B service providers for a directory called FirmsLedger. You summarize honestly: highlight real strengths, but never invent claims. If data is sparse, keep the summary short rather than padding with generic text.`;

    const userPrompt = `Generate AI insights for this company. Return ONLY valid JSON (no markdown, no commentary).

Company:
- Name: ${agency.name}
- Services: ${catNames.join(', ') || 'General business services'}
- Location: ${location}
- Founded: ${agency.founded_year || 'Unknown'}
- Team size: ${agency.team_size || 'Unknown'}
- Hourly rate: ${agency.hourly_rate || 'Not disclosed'}
- Rating: ${agency.avg_rating ? Number(agency.avg_rating).toFixed(1) + '/5' : 'No rating'} (${agency.review_count || 0} reviews)
- Verified: ${agency.verified ? 'Yes' : 'No'}
- Description: ${agency.description || '(none)'}

Recent reviews:
${reviewSnippets}

Return JSON in this exact format:
{
  "summary": "1-2 sentence overview of what they do and who they serve.",
  "strengths": ["3-5 word strength", "3-5 word strength", "3-5 word strength"],
  "best_for": "1 sentence describing the ideal client or use case for this company.",
  "considerations": "1 sentence with a fair caveat or thing to ask about (e.g. specialization scope, geographic focus, review volume). Be honest, not negative."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    const data = JSON.parse(raw);
    cache.set(agencyId, { data, at: Date.now() });

    return NextResponse.json(data);

  } catch (err) {
    console.error('AI insights error:', err);
    return NextResponse.json({ error: 'Could not generate insights right now.' }, { status: 500 });
  }
}
