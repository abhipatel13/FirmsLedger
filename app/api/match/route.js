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

/**
 * Step 1: Parse the user's natural-language query into structured filters
 * the database can act on.
 */
async function extractIntent(query, knownCategoryNames) {
  const systemPrompt = `You convert a user's natural-language description of a B2B vendor need into a structured filter spec for searching a directory of business service providers. Return ONLY valid JSON, no commentary.`;

  // Send a sample of category names so the AI can map intent to real categories.
  // We sample 200 to keep tokens bounded; the AI can also infer free-text keywords.
  const sample = knownCategoryNames.slice(0, 200).join(', ');

  const userPrompt = `User query: "${query}"

Known service categories (sample): ${sample}

Return JSON in this exact format:
{
  "categories": ["category name 1", "category name 2"],   // up to 5 categories from the sample list that match the user's need; empty if none match
  "keywords":   ["keyword1", "keyword2"],                  // up to 6 free-text keywords describing the service (used for fuzzy matching when no category matches)
  "country":    "Country name or null",
  "state":      "State/region name or null",
  "city":       "City name or null",
  "min_rating": null,                                       // 0-5 number, or null
  "team_size":  null,                                       // string like "11-50" or null
  "intent":     "1-sentence restatement of what the user wants"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty intent response');
  return JSON.parse(raw);
}

/**
 * Step 2: Query the database based on extracted intent. Returns up to 60
 * candidates that the LLM can rank in the next step.
 */
async function fetchCandidates(supabase, intent, allCategories, agencyCategories) {
  const wantedCategoryNames = (intent.categories || []).map((s) => s.toLowerCase().trim());
  const matchedCats = (allCategories || []).filter((c) =>
    wantedCategoryNames.includes((c.name || '').toLowerCase().trim()),
  );
  const categoryIds = matchedCats.map((c) => c.id);

  // Find agencies that link to those categories.
  let candidateIds = null;
  if (categoryIds.length > 0) {
    const set = new Set(
      (agencyCategories || [])
        .filter((ac) => categoryIds.includes(ac.category_id))
        .map((ac) => ac.agency_id),
    );
    candidateIds = [...set];
  }

  // Build the agency query with location + rating filters layered on top.
  let q = supabase
    .from('agencies')
    .select('id, name, slug, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, website')
    .eq('approved', true);

  if (candidateIds && candidateIds.length > 0) {
    q = q.in('id', candidateIds.slice(0, 1000));
  }
  if (intent.country) q = q.ilike('hq_country', intent.country);
  if (intent.state)   q = q.ilike('hq_state',   intent.state);
  if (intent.city)    q = q.ilike('hq_city',    `%${intent.city}%`);
  if (intent.min_rating != null) q = q.gte('avg_rating', Number(intent.min_rating));

  q = q.order('avg_rating', { ascending: false }).limit(60);

  let { data: candidates } = await q;
  candidates = candidates || [];

  // Fallback: if structured filters returned nothing, try keyword search across
  // name + description so we always have something to rank.
  if (candidates.length === 0 && Array.isArray(intent.keywords) && intent.keywords.length > 0) {
    const ors = intent.keywords
      .slice(0, 4)
      .flatMap((kw) => [`name.ilike.%${kw}%`, `description.ilike.%${kw}%`])
      .join(',');
    const { data: kwHits } = await supabase
      .from('agencies')
      .select('id, name, slug, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, website')
      .eq('approved', true)
      .or(ors)
      .order('avg_rating', { ascending: false })
      .limit(60);
    candidates = kwHits || [];
  }

  return { candidates, matchedCategoryNames: matchedCats.map((c) => c.name) };
}

/**
 * Step 3: Have the LLM rank the candidate shortlist and explain each pick.
 */
async function rankCandidates(query, intent, candidates, agencyCatMap, categoryMap) {
  const list = candidates.map((a, i) => {
    const cats = (agencyCatMap[a.id] || []).map((id) => categoryMap[id]).filter(Boolean).join(', ') || 'General Services';
    const location = [a.hq_city, a.hq_state, a.hq_country].filter(Boolean).join(', ') || 'Global';
    const rating = a.avg_rating ? `${Number(a.avg_rating).toFixed(1)}/5` : 'No rating';
    const desc = a.description ? a.description.slice(0, 120) : '';
    return `[${i + 1}] ID:${a.id} | ${a.name} | Services: ${cats} | Location: ${location} | Team: ${a.team_size || 'N/A'} | Rating: ${rating} (${a.review_count || 0} reviews)${desc ? ` | "${desc}"` : ''}`;
  }).join('\n');

  const systemPrompt = `You are an expert B2B vendor matching assistant. Pick the most relevant matches for the user from the candidate list. Return ONLY valid JSON, no markdown, no explanation outside the JSON.

Rules:
- Return up to 5 matches
- Match score must be 0-100 reflecting how well each one fits the *specific* request
- "reason" must be 1-2 sentences citing concrete details from the candidate (services, location, team, rating) — never vague
- "highlight" is a 3-6 word phrase summarising why this is a fit
- If genuinely poor fits, score them lower honestly rather than inflating`;

  const userPrompt = `Original request: "${query}"
AI-parsed intent: ${intent.intent || query}

Candidates:
${list}

Return JSON in this exact format:
{
  "matches": [
    {
      "id": "agency-uuid-from-the-list",
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
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty ranking response');
  return JSON.parse(raw);
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

    // Pull the full category catalog and category-link map. Both are small and
    // get reused across the pipeline. Page through agency_categories so we
    // don't truncate at 1000.
    const [catRes, agencies] = await Promise.all([
      supabase.from('categories').select('id, name, slug').limit(10000),
      (async () => {
        let all = [];
        let from = 0;
        const PAGE = 1000;
        while (true) {
          const { data } = await supabase.from('agency_categories').select('agency_id, category_id').range(from, from + PAGE - 1);
          if (!data?.length) break;
          all = all.concat(data);
          if (data.length < PAGE) break;
          from += PAGE;
        }
        return all;
      })(),
    ]);

    const allCategories = catRes.data || [];
    const agencyCategories = agencies || [];
    const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
    const agencyCatMap = {};
    for (const ac of agencyCategories) {
      if (!agencyCatMap[ac.agency_id]) agencyCatMap[ac.agency_id] = [];
      agencyCatMap[ac.agency_id].push(ac.category_id);
    }

    // Step 1: extract structured intent
    const intent = await extractIntent(query, allCategories.map((c) => c.name));

    // Step 2: query DB with extracted filters (+ keyword fallback)
    const { candidates, matchedCategoryNames } = await fetchCandidates(supabase, intent, allCategories, agencyCategories);

    if (candidates.length === 0) {
      return NextResponse.json({
        matches: [],
        summary: `We couldn't find any verified companies matching "${query}". Try broadening the location or service.`,
        intent,
      });
    }

    // Step 3: AI ranks the shortlist
    const result = await rankCandidates(query.trim(), intent, candidates, agencyCatMap, categoryMap);

    // Enrich matches with full agency data for the UI
    const agencyById = Object.fromEntries(candidates.map((a) => [a.id, a]));
    const enriched = (result.matches || []).map((match) => {
      const agency = agencyById[match.id];
      if (!agency) return null;
      return {
        ...match,
        slug: agency.slug,
        location: [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ') || 'Global',
        avg_rating: agency.avg_rating,
        review_count: agency.review_count || 0,
        team_size: agency.team_size,
        website: agency.website,
        services: (agencyCatMap[agency.id] || []).map((id) => categoryMap[id]).filter(Boolean),
      };
    }).filter(Boolean);

    return NextResponse.json({
      matches: enriched,
      summary: result.summary || '',
      intent,
      meta: {
        candidates_searched: candidates.length,
        categories_matched: matchedCategoryNames,
      },
    });

  } catch (err) {
    console.error('AI match error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
