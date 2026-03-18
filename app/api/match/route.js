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

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length < 5) {
      return NextResponse.json({ error: 'Please describe what you are looking for.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI matching is not configured.' }, { status: 503 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    // Fetch agencies + their categories
    const [{ data: agencies }, { data: agencyCategories }, { data: categories }] = await Promise.all([
      supabase.from('agencies').select('id, name, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, slug').eq('approved', true).order('avg_rating', { ascending: false }).limit(80),
      supabase.from('agency_categories').select('agency_id, category_id'),
      supabase.from('categories').select('id, name, slug'),
    ]);

    if (!agencies || agencies.length === 0) {
      return NextResponse.json({ error: 'No agencies found.' }, { status: 404 });
    }

    // Build a compact agency list for the prompt
    const categoryMap = Object.fromEntries((categories || []).map(c => [c.id, c.name]));
    const agencyCatMap = {};
    for (const ac of (agencyCategories || [])) {
      if (!agencyCatMap[ac.agency_id]) agencyCatMap[ac.agency_id] = [];
      const catName = categoryMap[ac.category_id];
      if (catName) agencyCatMap[ac.agency_id].push(catName);
    }

    const agencyList = agencies.map((a, i) => {
      const cats = (agencyCatMap[a.id] || []).join(', ') || 'General Services';
      const location = [a.hq_city, a.hq_state, a.hq_country].filter(Boolean).join(', ') || 'Global';
      const rating = a.avg_rating ? `${Number(a.avg_rating).toFixed(1)}/5` : 'No rating';
      const desc = a.description ? a.description.slice(0, 120) : '';
      return `[${i + 1}] ID:${a.id} | ${a.name} | Services: ${cats} | Location: ${location} | Team: ${a.team_size || 'N/A'} | Rating: ${rating} (${a.review_count || 0} reviews)${desc ? ` | "${desc}"` : ''}`;
    }).join('\n');

    const systemPrompt = `You are an expert B2B vendor matching assistant for FirmsLedger, a business services directory.
Your job is to analyze a user's requirement and match them to the most relevant agencies from the provided list.

Rules:
- Return ONLY valid JSON, no markdown, no explanation outside the JSON
- Return exactly 3 matches (or fewer if fewer are relevant)
- Match score must be 0-100
- "reason" must be 1-2 sentences explaining WHY this agency fits the user's specific need
- "highlight" is a single short phrase (3-6 words) like "Fast IT placement" or "Strong Chicago presence"
- If no agencies match well, return your best guesses with lower scores and honest reasons`;

    const userPrompt = `User requirement: "${query.trim()}"

Available agencies:
${agencyList}

Return JSON in this exact format:
{
  "matches": [
    {
      "id": "agency-uuid-here",
      "name": "Agency Name",
      "score": 92,
      "highlight": "Short highlight phrase",
      "reason": "Why this agency fits the user's specific need in 1-2 sentences."
    }
  ],
  "summary": "One sentence summary of what the user needs and what you found."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    const result = JSON.parse(raw);

    // Enrich matches with full agency data
    const agencyById = Object.fromEntries(agencies.map(a => [a.id, a]));
    const enriched = (result.matches || []).map(match => {
      const agency = agencyById[match.id];
      if (!agency) return null;
      return {
        ...match,
        slug: agency.slug,
        location: [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ') || 'Global',
        avg_rating: agency.avg_rating,
        review_count: agency.review_count || 0,
        team_size: agency.team_size,
        services: agencyCatMap[agency.id] || [],
      };
    }).filter(Boolean);

    return NextResponse.json({
      matches: enriched,
      summary: result.summary || '',
    });

  } catch (err) {
    console.error('AI match error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
