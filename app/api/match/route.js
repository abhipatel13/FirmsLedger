import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generic words that, on their own, match nearly every agency name or
// description. Stripped from the keyword `ilike` fallback so we don't drag in
// 60 unrelated companies just because the query said "manufacturers".
const STOPWORDS = new Set([
  'best', 'top', 'verified', 'leading', 'good', 'great',
  'company', 'companies', 'firm', 'firms', 'agency', 'agencies',
  'manufacturer', 'manufacturers', 'manufacturing',
  'supplier', 'suppliers', 'vendor', 'vendors',
  'provider', 'providers', 'service', 'services',
  'business', 'businesses', 'corporation', 'corporations',
  'inc', 'llc', 'ltd', 'corp', 'pte', 'pvt',
  'the', 'and', 'for', 'with', 'from', 'into', 'that', 'this',
  'us', 'usa', 'uk', 'uae', 'eu',
  // Country/region words — already covered by the dedicated country filter,
  // and will trash the keyword `ilike` if left in (matches half the table).
  'united', 'states', 'kingdom', 'america',
  'india', 'china', 'japan', 'korea', 'singapore', 'germany', 'france',
  'canada', 'australia', 'mexico', 'brazil', 'spain', 'italy',
  'denmark', 'sweden', 'norway', 'finland', 'ireland',
  'philippines', 'indonesia', 'thailand', 'vietnam',
  'kenya', 'nigeria', 'qatar', 'saudi', 'arabia', 'emirates',
]);

// Strip stopwords/short tokens from inside each keyword phrase. A multi-word
// LLM keyword like "toy manufacturers" becomes "toy" — we don't want
// "manufacturers" leaking back into the ilike filter.
function meaningfulKeywords(keywords) {
  const out = [];
  for (const raw of keywords || []) {
    const cleaned = String(raw || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
      .join(' ')
      .trim();
    if (cleaned && !out.includes(cleaned)) out.push(cleaned);
    if (out.length >= 4) break;
  }
  return out;
}

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

  // Pre-filter the catalog by token overlap with the query. The catalog has
  // thousands of entries; a blind alphabetical slice misses the tail (a query
  // for "artificial turf" never sees "Artificial Turf" if it sorts past 200).
  // Substring overlap (not exact) so "transformer" matches "Transformers".
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  const overlap = [];
  for (const n of knownCategoryNames) {
    const toks = n.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
    let s = 0;
    for (const qt of queryTokens) {
      for (const ct of toks) {
        if (ct === qt || ct.startsWith(qt) || qt.startsWith(ct)) { s++; break; }
      }
    }
    if (s > 0) overlap.push({ n, s });
  }
  overlap.sort((a, b) => b.s - a.s);
  const overlapNames = overlap.slice(0, 150).map((o) => o.n);
  // Pad with an alphabetical tail so the LLM still has a small browsable
  // sample if the user query had no token hits at all.
  const padding = knownCategoryNames.slice(0, Math.max(0, 200 - overlapNames.length));
  const sample = [...new Set([...overlapNames, ...padding])].join(', ');

  const userPrompt = `User query: "${query}"

Known service categories (pre-filtered for this query): ${sample}

Return JSON in this exact format:
{
  "categories": ["category name 1", "category name 2"],   // up to 5 EXACT category names from the list above that the user's query maps to. Match liberally on synonyms and word forms (e.g. "toy manufacturers" → "Toy Manufacturing", "transformer makers" → "Transformers"). Empty only if truly nothing in the list applies.
  "keywords":   ["keyword1", "keyword2"],                  // up to 4 specific service-related keywords from the query. NEVER include country names, "United States", "manufacturers", "companies", "best", "top".
  "country":    "Country name or null",                    // expand abbreviations: "US"/"USA"/"the US" → "United States", "UK" → "United Kingdom", "UAE" → "United Arab Emirates"
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
    .select('id, name, slug, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, website, logo_url, verified')
    .eq('approved', true);

  if (candidateIds && candidateIds.length > 0) {
    q = q.in('id', candidateIds.slice(0, 1000));
  }
  // When the LLM didn't pick any category, narrow by keyword over name/desc
  // so the ranker doesn't get fed every approved agency in the country.
  // Generic words ("manufacturers", "US") are stripped — they OR-match
  // nearly every row and turn a focused search into noise.
  const noCategoryMatch = !candidateIds || candidateIds.length === 0;
  const usefulKeywords = meaningfulKeywords(intent.keywords);
  if (noCategoryMatch && usefulKeywords.length > 0) {
    const ors = usefulKeywords
      .flatMap((kw) => [`name.ilike.%${kw}%`, `description.ilike.%${kw}%`])
      .join(',');
    q = q.or(ors);
  }
  if (intent.country) q = q.ilike('hq_country', intent.country);
  if (intent.state)   q = q.ilike('hq_state',   intent.state);
  if (intent.city)    q = q.ilike('hq_city',    `%${intent.city}%`);
  if (intent.min_rating != null) q = q.gte('avg_rating', Number(intent.min_rating));

  q = q.order('avg_rating', { ascending: false }).limit(60);

  let { data: candidates } = await q;
  candidates = candidates || [];

  // Last-resort fallback: drop the location filter and try keywords alone.
  // Useful when the user names a country we have no agencies in yet.
  if (candidates.length === 0 && usefulKeywords.length > 0) {
    const ors = usefulKeywords
      .flatMap((kw) => [`name.ilike.%${kw}%`, `description.ilike.%${kw}%`])
      .join(',');
    const { data: kwHits } = await supabase
      .from('agencies')
      .select('id, name, slug, description, hq_city, hq_state, hq_country, team_size, founded_year, avg_rating, review_count, website, logo_url, verified')
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
        description: agency.description,
        hq_city: agency.hq_city,
        hq_state: agency.hq_state,
        hq_country: agency.hq_country,
        location: [agency.hq_city, agency.hq_state, agency.hq_country].filter(Boolean).join(', ') || 'Global',
        avg_rating: agency.avg_rating,
        review_count: agency.review_count || 0,
        team_size: agency.team_size,
        founded_year: agency.founded_year,
        website: agency.website,
        logo_url: agency.logo_url,
        verified: agency.verified,
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
