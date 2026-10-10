/**
 * Cleans the scraped `products` / `capabilities` / `industries_served` arrays.
 *
 * The crawler captured whole page regions, so these columns are a mix of real
 * capability labels ("Prototype Sheet Metal Fabrication", "Powder Coating") and
 * page furniture that happened to sit nearby — nav links ("Link to: Fabrication"),
 * CTAs ("Explore Our Products"), job titles ("Director of Product Quality") and
 * customer testimonials ("Excellent prices... I would use this supplier again!").
 *
 * Rendering the raw arrays would publish testimonials as products, so everything
 * has to clear these filters first. The bias is deliberately toward dropping:
 * a company showing three real capabilities beats one showing six with a
 * quote among them.
 */

// Page furniture: nav labels, section headers and CTAs the crawler swept up.
const FURNITURE = /^(link to:|explore our|more about|learn more|read more|view all|see all|our |what |who |where |why |how |find out|click here|contact us|get a quote|request a)/i;

// Section headings, either standalone ("Capabilities") or trailing
// ("Manufacturing Capabilities", "Capabilities & Products").
const HEADING_ONLY = /^(products?|capabilities|industries(\s+served)?|services|about|home|overview|solutions)$/i;
const HEADING_TAIL = /\b(capabilities|industries served|overview)$/i;
const HEADING_PAIR = /\b(capabilities|products|industries|services|solutions)\s*(&|and|\+)\s*(capabilities|products|industries|services|solutions)\b/i;

// Site chrome that is never a manufacturing capability.
const SITE_CHROME = /\b(terms of service|privacy policy|customer service|careers?|blog|news|faq|sitemap|testimonials?|newsletter|login|register)\b/i;

// Abstract marketing nouns that don't appear in real capability names —
// "Thought Partnership and Innovation", "Versatile Capabilities and Reliable Results".
const MARKETING = /\b(results?|innovations?|partnerships?|commitments?|excellence|satisfaction|differences?|promises?|values|mission|vision|expertise|dedication|passion|trust|benefits?|located|convenient(ly)?|efficient(ly)?)\b/i;

// "Quality metal fabrication since 1934" — a tagline, not a label.
const TAGLINE_YEAR = /\bsince\s+\d{4}\b/i;

// Store/plant directory rows: "Location Factory Service Center #82-AL".
const LOCATION_ROW = /^location\b|#\s*\d/i;

// Catch-all bucket labels that tell a buyer nothing.
const GENERIC = /^(additional|other|more|misc\.?|miscellaneous)\s/i;

// Article/blog headlines swept up from "latest news" blocks.
const ARTICLE = /^(the|a|an)\s/i;

// Downloadable collateral links, not capabilities.
const COLLATERAL = /\((pdf|docx?|xlsx?)\)|\b(catalogu?e|brochure|download|datasheet|price list)\b/i;

// Contact details swept out of headers/footers.
const CONTACT = /@|https?:|www\.|\+?\d[\d\s().-]{8,}/i;

// Imperative CTAs and greetings: "Connect with...", "Welcome to...".
const CTA = /^(connect|welcome|discover|introducing|meet|call|email|visit|browse|shop|start|join|schedule|book|order|subscribe|sign up)\b/i;

// Numbered process steps lifted from "how it works" sections.
const STEP = /^step\s*\d|^\d+[.):]\s/i;

// Sentence fragments that begin with a preposition are prose, not labels.
const FRAGMENT = /^(from|through|with|without|between|during|across|about)\s/i;

// Role titles — "Director of Product Quality" is a person, not a product.
const JOB_TITLE = /\b(director|manager|engineer|president|ceo|cfo|coo|officer|supervisor|technician|specialist|coordinator|representative)\b/i;

// First person / quoted speech = marketing copy or a testimonial.
const FIRST_PERSON = /\b(we|our|us|i|you|your|they|their)\b/i;
const QUOTED = /["“”']/;

// Decorative glyphs the crawler kept from nav markup.
const DECORATION = /[★☆➤»«▶●■◆→]/;

const MAX_WORDS = 8;
const MIN_CHARS = 3;

// Short words that are joiners, not acronyms — without this the <=3 char rule
// turned "SHEET METAL FABRICATION AND WELDING" into "... Fabrication AND Welding".
const STOPWORDS = new Set(['and', 'or', 'of', 'the', 'for', 'to', 'in', 'on', 'at', 'by', 'a', 'an']);

/** ALL-CAPS headings are common in scraped nav; title-case them for display.
 *  Words of <=3 chars stay uppercase so CNC, PCB, ISO and EDM survive. */
function deShout(label) {
  if (label !== label.toUpperCase()) return label;
  return label.toLowerCase().replace(/\b[a-z]+/g, (w) => {
    if (STOPWORDS.has(w)) return w;
    return w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1);
  });
}

function repairEncoding(text) {
  if (!/[\u00c2-\u00f4][\u0080-\u00bf]/.test(text) || /[^\u0000-\u00ff]/.test(text)) return text;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(text, (ch) => ch.charCodeAt(0)));
  } catch {
    return text;
  }
}

/** One raw entry -> list of candidate labels (pipe-delimited tables are common). */
function splitEntry(raw) {
  return repairEncoding(String(raw ?? ''))
    .split('|')
    .map((part) => part.replace(/\s+/g, ' ').replace(/\s*\([^)]*$/, '').trim())
    .filter(Boolean);
}

function isUsable(label) {
  if (label.length < MIN_CHARS) return false;
  if (DECORATION.test(label)) return false;
  if (FURNITURE.test(label)) return false;
  if (HEADING_ONLY.test(label)) return false;
  if (HEADING_TAIL.test(label)) return false;
  if (HEADING_PAIR.test(label)) return false;
  if (SITE_CHROME.test(label)) return false;
  if (MARKETING.test(label)) return false;
  if (TAGLINE_YEAR.test(label)) return false;
  if (LOCATION_ROW.test(label)) return false;
  if (GENERIC.test(label)) return false;
  if (ARTICLE.test(label)) return false;
  if (COLLATERAL.test(label)) return false;
  if (CONTACT.test(label)) return false;
  if (CTA.test(label)) return false;
  if (STEP.test(label)) return false;
  if (FRAGMENT.test(label)) return false;
  if (JOB_TITLE.test(label)) return false;
  if (QUOTED.test(label)) return false;
  if (FIRST_PERSON.test(label)) return false;
  // A sentence, not a label. Trailing full stops and any other sentence
  // punctuation both indicate prose that was never a capability name.
  if (/[.!?;:]$/.test(label)) return false;
  if (/[,;]/.test(label) && label.split(/\s+/).length > 4) return false;
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return false;
  // Require at least one letter — stray numbers and symbols aren't labels.
  if (!/[a-z]/i.test(label)) return false;
  return true;
}

/**
 * @param {string[] | null | undefined} raw  scraped column value
 * @param {number} limit                     max labels to keep
 * @returns {string[]} deduped, display-ready labels (may be empty)
 */
export function cleanFacets(raw, limit = 6) {
  if (!Array.isArray(raw)) return [];
  const seen = new Map();
  for (const entry of raw) {
    for (const label of splitEntry(entry)) {
      if (!isUsable(label)) continue;
      const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '');
      if (!key || seen.has(key)) continue;
      seen.set(key, deShout(label));
      if (seen.size >= limit) return [...seen.values()];
    }
  }
  return [...seen.values()];
}
