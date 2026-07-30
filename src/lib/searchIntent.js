/**
 * Parses a free-text search query into category / subcategory / state intent.
 *
 * "cnc machines in california"      -> { categorySlug: 'mechanical-components',
 *                                        subcategorySlug: 'cnc-machining',
 *                                        stateSlug: 'california' }
 * "Electronics components in Texas" -> { categorySlug: 'electronics-semiconductor',
 *                                        stateSlug: 'texas' }
 *
 * Case-insensitive and word-order independent. Matching is stem-based rather than
 * substring-based: "machines" and "machining" both stem to "machin" and match,
 * while "electronics" and "electrical" stem apart and do NOT (a plain shared-prefix
 * test would wrongly conflate them).
 *
 * Candidates are scored by inverse document frequency, so a rare word like "cnc"
 * outweighs a word like "components" that half the categories share. A winner must
 * beat the runner-up outright, so a genuinely ambiguous query resolves to nothing
 * rather than to a coin flip.
 */
import { MANUFACTURING_CATEGORIES } from './manufacturingCategories.js';
import { ALL_US_STATES } from './usStates.js';

// Filler words that carry no routing signal. Deliberately does NOT include
// "manufacturing" — that word distinguishes real subcategories such as
// "Contract Manufacturing" and "Gear Manufacturing".
const STOPWORDS = new Set([
  'a', 'an', 'and', 'the', 'in', 'at', 'on', 'of', 'for', 'to', 'near', 'me', 'my',
  'best', 'top', 'find', 'get', 'good', 'great', 'cheap', 'local',
  'company', 'companies', 'manufacturer', 'manufacturers', 'supplier', 'suppliers',
  'firm', 'firms', 'business', 'businesses', 'vendor', 'vendors', 'shop',
  'us', 'usa', 'america', 'american', 'state', 'states',
]);

const MIN_SCORE = 0.6;

/** Collapses plural/gerund variants so "machines", "machining" and "machine" agree. */
export function stem(word) {
  if (word.length <= 4) return word;
  let w = word;
  for (const suffix of ['ing', 'ies', 'es', 'ed', 's']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) {
      w = w.slice(0, w.length - suffix.length);
      break;
    }
  }
  // Drop a trailing silent "e" so machine/machines/machining all reach "machin",
  // and package/packaging both reach "packag".
  if (w.endsWith('e') && w.length - 1 >= 4) w = w.slice(0, -1);
  return w;
}

function normalize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Significant stems of a phrase, stopwords removed. */
function stemsOf(phrase) {
  return normalize(phrase)
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w))
    .map(stem);
}

// ─── Candidate index, built once ─────────────────────────────────────────────

const CANDIDATES = [];

for (const cat of MANUFACTURING_CATEGORIES) {
  CANDIDATES.push({
    categorySlug: cat.slug,
    subcategorySlug: null,
    isSub: false,
    // shortName avoids dragging the generic word "Manufacturers" from `name`
    stems: new Set(stemsOf(cat.shortName || cat.name)),
  });
  for (const sub of cat.subcategories || []) {
    CANDIDATES.push({
      categorySlug: cat.slug,
      subcategorySlug: sub.slug,
      isSub: true,
      stems: new Set(stemsOf(sub.name)),
    });
  }
}

// How many candidates each stem appears in — rare stems are the discriminating ones.
const DOC_FREQ = new Map();
for (const c of CANDIDATES) {
  for (const s of c.stems) DOC_FREQ.set(s, (DOC_FREQ.get(s) || 0) + 1);
}

// Longest state names first so "west virginia" wins over "virginia".
const STATE_INDEX = ALL_US_STATES
  .map((s) => ({ slug: s.slug, needle: normalize(s.name) }))
  .sort((a, b) => b.needle.length - a.needle.length);

// ─── Parsing ─────────────────────────────────────────────────────────────────

function matchState(normalizedQuery) {
  // ponytail: full state names only. Abbreviations ("ca", "tx") are ambiguous as
  // bare tokens — add a standalone-token check here if users start typing them.
  for (const s of STATE_INDEX) {
    if (normalizedQuery.includes(s.needle)) return s;
  }
  return null;
}

function matchCategory(queryStems) {
  const queryStemSet = new Set(queryStems);
  const scored = [];

  for (const c of CANDIDATES) {
    let idf = 0;
    let hits = 0;
    for (const s of c.stems) {
      if (queryStemSet.has(s)) {
        idf += 1 / (DOC_FREQ.get(s) || 1);
        hits += 1;
      }
    }
    if (!hits) continue;
    // Rarity plus coverage. Rarity alone under-rates a complete match made of
    // common words ("Electronic Components"); coverage alone over-rates a
    // one-word brush against a long name.
    scored.push({ c, score: idf + hits / c.stems.size });
  }

  if (!scored.length) return null;

  // Highest score first; on a tie prefer the broader category over its own
  // subcategory, since the safer answer when unsure is the parent listing.
  scored.sort((a, b) => b.score - a.score || Number(a.c.isSub) - Number(b.c.isSub));

  const [top, next] = scored;
  if (top.score < MIN_SCORE) return null;
  // A tie between two *different* categories is genuine ambiguity — refuse it.
  // A tie between a category and its own subcategory is not.
  if (next && next.score === top.score && next.c.categorySlug !== top.c.categorySlug) return null;
  return top.c;
}

/**
 * @returns {{ categorySlug: string|null, subcategorySlug: string|null,
 *             stateSlug: string|null, rest: string }}
 *          `rest` holds the words no filter consumed — pass it on as the text query.
 */
export function parseSearchIntent(query) {
  const normalized = normalize(query);
  const empty = { categorySlug: null, subcategorySlug: null, stateSlug: null, rest: '' };
  if (!normalized) return empty;

  const state = matchState(normalized);
  // Remove the state words before category matching so "Texas" can't sway it.
  const withoutState = state ? normalized.replace(state.needle, ' ') : normalized;

  const queryStems = stemsOf(withoutState);
  const category = matchCategory(queryStems);

  const consumed = new Set(category ? category.stems : []);
  const rest = queryStems.filter((s) => !consumed.has(s)).join(' ');

  return {
    categorySlug: category?.categorySlug ?? null,
    subcategorySlug: category?.subcategorySlug ?? null,
    stateSlug: state?.slug ?? null,
    rest,
  };
}

/**
 * Canonical listing URL for a parsed intent, or null when there is nothing to
 * route to. Path order is `/{category}/{subcategory}/{state}` — see
 * app/[category]/[state]/[subcategory]/page.jsx, where the second segment is the
 * subcategory and the third is the state.
 */
export function canonicalPathFor({ categorySlug, subcategorySlug, stateSlug }) {
  if (!categorySlug) return null;
  let path = `/${categorySlug}`;
  if (subcategorySlug) path += `/${subcategorySlug}`;
  if (stateSlug) path += `/${stateSlug}`;
  return path;
}

/** Search tokens for the API: stopwords dropped, stemmed for LIKE matching. */
export function searchTokens(query) {
  return stemsOf(query).filter((t) => t.length >= 2);
}
