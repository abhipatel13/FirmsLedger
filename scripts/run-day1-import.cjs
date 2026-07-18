/**
 * FirmsLedger — Day 1 Manufacturer Import Orchestrator
 *
 * Runs scrape-thomasnet-pup.cjs → import-manufacturers.cjs
 * for all 15 category×state combinations in priority order.
 *
 * Priority order (per brief):
 *   1. Switchgear      → CA, TX, NY
 *   2. Solar Panels    → CA, TX, NY
 *   3. Electrical Wire → CA, TX, NY
 *   4. Semiconductor   → CA, TX, NY
 *   5. CNC Machining   → CA, TX, NY
 *
 * Usage:
 *   node scripts/run-day1-import.cjs
 *   node scripts/run-day1-import.cjs --dry-run
 *   node scripts/run-day1-import.cjs --skip-scrape          # import from existing JSON files only
 *   node scripts/run-day1-import.cjs --only-category=switchgear
 *   node scripts/run-day1-import.cjs --only-state=california
 *   node scripts/run-day1-import.cjs --headless=false        # show browser (for debugging)
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SCRIPTS_DIR = __dirname;
const DATA_DIR    = path.join(SCRIPTS_DIR, 'data');

const ARGV = {};
process.argv.slice(2).forEach(arg => {
  const [k, v] = arg.replace(/^--/, '').split('=');
  ARGV[k] = v ?? true;
});

const DRY_RUN       = ARGV['dry-run'] === true || ARGV['dry-run'] === 'true';
const SKIP_SCRAPE   = ARGV['skip-scrape'] === true || ARGV['skip-scrape'] === 'true';
const ONLY_CATEGORY = ARGV['only-category'];
const ONLY_STATE    = ARGV['only-state'];
const HEADLESS      = ARGV.headless !== 'false' ? 'true' : 'false';

// Priority-ordered list of category × state jobs
const JOBS = [
  // ── Switchgear (priority 1) ────────────────────────────────────────────────
  { category: 'switchgear',            state: 'california', stateLabel: 'California' },
  { category: 'switchgear',            state: 'texas',      stateLabel: 'Texas' },
  { category: 'switchgear',            state: 'new-york',   stateLabel: 'New York' },

  // ── Solar Panels (priority 2) ──────────────────────────────────────────────
  { category: 'solar-panels',          state: 'california', stateLabel: 'California' },
  { category: 'solar-panels',          state: 'texas',      stateLabel: 'Texas' },
  { category: 'solar-panels',          state: 'new-york',   stateLabel: 'New York' },

  // ── Electrical Wire (priority 3) ──────────────────────────────────────────
  { category: 'electrical-wire-cable', state: 'california', stateLabel: 'California' },
  { category: 'electrical-wire-cable', state: 'texas',      stateLabel: 'Texas' },
  { category: 'electrical-wire-cable', state: 'new-york',   stateLabel: 'New York' },

  // ── Semiconductor / Chips (priority 4) ────────────────────────────────────
  { category: 'semiconductor-chips',   state: 'california', stateLabel: 'California' },
  { category: 'semiconductor-chips',   state: 'texas',      stateLabel: 'Texas' },
  { category: 'semiconductor-chips',   state: 'new-york',   stateLabel: 'New York' },

  // ── CNC Machining (priority 5) ────────────────────────────────────────────
  { category: 'cnc-machining',         state: 'california', stateLabel: 'California' },
  { category: 'cnc-machining',         state: 'texas',      stateLabel: 'Texas' },
  { category: 'cnc-machining',         state: 'new-york',   stateLabel: 'New York' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function run(scriptPath, args, label) {
  console.log(`\n  $ node ${path.relative(process.cwd(), scriptPath)} ${args.join(' ')}`);
  const result = spawnSync('node', [scriptPath, ...args], {
    cwd: path.join(SCRIPTS_DIR, '..'),  // FirmsLedger/ as CWD
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 10 * 60 * 1000, // 10 min per job
  });
  if (result.error) {
    console.error(`  [error] ${label}: ${result.error.message}`);
    return false;
  }
  if (result.status !== 0) {
    console.error(`  [error] ${label}: exited with code ${result.status}`);
    return false;
  }
  return true;
}

function banner(text) {
  const line = '─'.repeat(text.length + 4);
  console.log(`\n┌${line}┐`);
  console.log(`│  ${text}  │`);
  console.log(`└${line}┘`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('FirmsLedger Day 1 Manufacturer Import');
  console.log(`  dry-run     : ${DRY_RUN}`);
  console.log(`  skip-scrape : ${SKIP_SCRAPE}`);
  console.log(`  headless    : ${HEADLESS}`);
  if (ONLY_CATEGORY) console.log(`  filter cat  : ${ONLY_CATEGORY}`);
  if (ONLY_STATE)    console.log(`  filter state: ${ONLY_STATE}`);

  // Ensure data/ directory exists
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Filter jobs
  let jobs = JOBS;
  if (ONLY_CATEGORY) jobs = jobs.filter(j => j.category === ONLY_CATEGORY);
  if (ONLY_STATE)    jobs = jobs.filter(j => j.state === ONLY_STATE);

  if (!jobs.length) {
    console.error('\n❌ No jobs matched the filters.');
    process.exit(1);
  }

  console.log(`\n📋 ${jobs.length} job(s) to run:\n`);
  jobs.forEach((j, i) => console.log(`  ${i + 1}. ${j.category} × ${j.stateLabel}`));

  const results = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const jobLabel = `${job.category} × ${job.stateLabel}`;
    banner(`Job ${i + 1}/${jobs.length}: ${jobLabel}`);

    const jsonFile = path.join(DATA_DIR, `${job.category}-${job.state}.json`);
    let scraped = false;
    let imported = false;

    // ── Step 1: Scrape Thomasnet ─────────────────────────────────────────────
    if (!SKIP_SCRAPE) {
      console.log(`\n  [1/2] Scraping Thomasnet...`);
      const scrapeArgs = [
        `--category=${job.category}`,
        `--state=${job.state}`,
        `--max-pages=5`,
        `--headless=${HEADLESS}`,
      ];
      scraped = run(
        path.join(SCRIPTS_DIR, 'scrape-thomasnet-pup.cjs'),
        scrapeArgs,
        `scrape ${jobLabel}`
      );
    } else {
      scraped = true; // assume JSON file exists
    }

    // ── Step 2: Import to Neon ───────────────────────────────────────────────
    if (fs.existsSync(jsonFile)) {
      const fileSize = fs.statSync(jsonFile).size;
      if (fileSize < 10) {
        console.log(`  ⚠️  JSON file is empty/too small (${fileSize} bytes) — skipping import`);
      } else {
        console.log(`\n  [2/2] Importing to Neon DB... (file: ${path.basename(jsonFile)}, ${fileSize} bytes)`);
        const importArgs = [
          `--industry=${job.category}`,
          `--state=${job.state}`,
          `--input-file=scripts/data/${job.category}-${job.state}.json`,
          `--source=thomasnet`,
        ];
        if (DRY_RUN) importArgs.push('--dry-run=true');
        imported = run(
          path.join(SCRIPTS_DIR, 'import-manufacturers.cjs'),
          importArgs,
          `import ${jobLabel}`
        );
      }
    } else if (!SKIP_SCRAPE && scraped) {
      console.log(`  ⚠️  No JSON file produced (scraping may have been blocked). Skipping import.`);
      console.log(`       Try: node scripts/scrape-thomasnet-pup.cjs --category=${job.category} --state=${job.state} --headless=false`);
    } else {
      console.log(`  ⚠️  JSON file not found: ${jsonFile}`);
    }

    results.push({ job: jobLabel, scraped, imported });

    // Pause between jobs to avoid hammering Thomasnet
    if (i < jobs.length - 1 && !SKIP_SCRAPE) {
      console.log('\n  ⏳ Pausing 10s before next job...');
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  banner('Summary');
  results.forEach(r => {
    const status = r.imported ? '✅' : r.scraped ? '⚠️ scrape-ok/import-failed' : '❌';
    console.log(`  ${status} ${r.job}`);
  });

  const done   = results.filter(r => r.imported).length;
  const failed = results.length - done;
  console.log(`\n  Total: ${done} completed, ${failed} failed/skipped`);

  if (failed > 0) {
    console.log('\n  Tip: For jobs where scraping was blocked, run manually with:');
    console.log('    node scripts/scrape-thomasnet-pup.cjs --category=CATEGORY --state=STATE --headless=false');
    console.log('  Then re-run the importer:');
    console.log('    node scripts/import-manufacturers.cjs --industry=CATEGORY --state=STATE --input-file=scripts/data/CATEGORY-STATE.json');
  }
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
