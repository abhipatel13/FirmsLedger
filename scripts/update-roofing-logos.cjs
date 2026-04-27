/**
 * Backfill logo_url for the 8 Top Roofing US companies inserted on 2026-04-26.
 * Uses DuckDuckGo icon endpoint (Clearbit was discontinued).
 *
 *   node scripts/update-roofing-logos.cjs            # dry-run
 *   node scripts/update-roofing-logos.cjs --commit
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const COMMIT = process.argv.includes('--commit');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ROOFING_SLUGS = [
  'tecta-america',
  'centimark-corporation',
  'baker-roofing-company',
  'kalkreuth-roofing-and-sheet-metal',
  'nations-roof',
  'latite-roofing-and-sheet-metal',
  'beldon-roofing-company',
  'best-roofing',
];

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

(async () => {
  const { data, error } = await sb
    .from('agencies').select('id,name,slug,website,logo_url')
    .in('slug', ROOFING_SLUGS);
  if (error) throw error;

  for (const a of data) {
    const d = domainOf(a.website);
    if (!d) { console.log(`✗ no domain for ${a.name}`); continue; }
    const logo = `https://icons.duckduckgo.com/ip3/${d}.ico`;
    if (COMMIT) {
      const { error: ue } = await sb.from('agencies').update({ logo_url: logo }).eq('id', a.id);
      if (ue) console.log(`✗ ${a.name}: ${ue.message}`);
      else console.log(`✓ ${a.name} → ${logo}`);
    } else {
      console.log(`+ would set ${a.name} → ${logo}`);
    }
  }
  console.log(COMMIT ? 'Done.' : 'Dry run — pass --commit to write.');
})();
