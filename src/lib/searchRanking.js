/**
 * Relevance ranking for /api/search results.
 *
 * The search SQL is inclusion-only: a row is returned if any stemmed query
 * token appears in its name, description, city or state. Postgres then hands
 * them back in primary-key order, so a company matched only by a stray
 * "craftsmanship" in its bio outranked the one literally named "Centuries
 * Crafts". This scores each row so name matches win.
 *
 * Higher is better. Name signal dominates; description/location are weak;
 * quality (verified, rating, reviews) is a small tiebreaker that can never
 * overtake a single name-token hit.
 */

export const normalizeText = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function relevanceScore(c, qNorm, tokens) {
  const name = (c.name || '').toLowerCase();
  const nameNorm = normalizeText(c.name);
  let score = 0;

  if (qNorm) {
    if (nameNorm === qNorm) score += 1000;
    else if (nameNorm.startsWith(qNorm)) score += 500;
    else if (nameNorm.includes(qNorm)) score += 250;
  }

  let nameHits = 0;
  for (const t of tokens) if (name.includes(t)) nameHits += 1;
  score += nameHits * 40;
  if (tokens.length && nameHits === tokens.length) score += 60;

  const desc = (c.description || '').toLowerCase();
  for (const t of tokens) if (desc.includes(t)) score += 3;

  const loc = `${c.hq_city || ''} ${c.hq_state_label || ''}`.toLowerCase();
  for (const t of tokens) if (loc.includes(t)) score += 8;

  if (c.is_verified) score += 5;
  score += Math.min(Number(c.avg_rating) || 0, 5);
  score += Math.min((c.review_count || 0) * 0.1, 3);

  return score;
}

/** Sorts `results` in place by relevance to the raw query + its stemmed tokens. */
export function rankSearchResults(results, rawQuery, tokens) {
  const qNorm = normalizeText(rawQuery);
  const scored = new Map(results.map((c) => [c, relevanceScore(c, qNorm, tokens)]));
  results.sort(
    (a, b) => scored.get(b) - scored.get(a) || (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0),
  );
  return results;
}
