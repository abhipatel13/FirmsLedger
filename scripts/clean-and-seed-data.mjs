import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { MANUFACTURING_CATEGORIES } from '../src/lib/manufacturingCategories.js';

dotenv.config({ path: './.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const COMMIT = process.argv.includes('--commit');

async function main() {
  console.log(`\n==========================================`);
  console.log(`FirmsLedger Database Clean & Seed Utility`);
  console.log(`Mode: ${COMMIT ? 'COMMIT (Writing to DB)' : 'DRY-RUN (ReadOnly)'}`);
  console.log(`==========================================\n`);

  // ─── Step 1: Clean Address Unicode Glyphs ───────────────────────────
  console.log('Step 1: Cleaning broken [NO GLYPH] icon "" from addresses...');
  const addrCheck = await sql`
    SELECT COUNT(*) as count 
    FROM companies 
    WHERE address LIKE '%%'
  `;
  const badAddrCount = parseInt(addrCheck[0].count, 10);
  console.log(`  Found ${badAddrCount} addresses containing the broken "" character.`);

  if (badAddrCount > 0 && COMMIT) {
    const res = await sql`
      UPDATE companies
      SET address = trim(both E' \\t\\r\\n' from replace(address, '', ''))
      WHERE address LIKE '%%'
    `;
    console.log(`  [UPDATE] Cleaned ${badAddrCount} addresses in database.`);
  } else if (badAddrCount > 0) {
    console.log(`  [DRY-RUN] Would clean ${badAddrCount} addresses.`);
  }

  // ─── Step 2: Clean Scraping/Block Descriptions ─────────────────────
  console.log('\nStep 2: Cleaning invalid/bot-blocked descriptions...');
  const descCheck = await sql`
    SELECT COUNT(*) as count
    FROM companies
    WHERE description IS NOT NULL
      AND (
        description LIKE '%|%|%'
        OR description ILIKE '%Incident ID%'
        OR description ILIKE '%Access Denied%'
        OR description ILIKE '%enable javascript%'
        OR description ILIKE '%requires javascript%'
        OR description ILIKE '%checking your browser%'
        OR description ILIKE '%request unsuccessful%'
        OR description ILIKE '%incapsula%'
        OR description ILIKE '%cloudflare%'
        OR description ILIKE '%please enable js%'
        OR description ILIKE '%security check%'
        OR description ILIKE '%error 403%'
        OR description ILIKE '%forbidden%'
        OR description ILIKE '%captcha%'
        OR length(trim(description)) < 15
      )
  `;
  const badDescCount = parseInt(descCheck[0].count, 10);
  console.log(`  Found ${badDescCount} companies with invalid descriptions.`);

  if (badDescCount > 0 && COMMIT) {
    const res = await sql`
      UPDATE companies
      SET description = NULL
      WHERE description IS NOT NULL
        AND (
          description LIKE '%|%|%'
          OR description ILIKE '%Incident ID%'
          OR description ILIKE '%Access Denied%'
          OR description ILIKE '%enable javascript%'
          OR description ILIKE '%requires javascript%'
          OR description ILIKE '%checking your browser%'
          OR description ILIKE '%request unsuccessful%'
          OR description ILIKE '%incapsula%'
          OR description ILIKE '%cloudflare%'
          OR description ILIKE '%please enable js%'
          OR description ILIKE '%security check%'
          OR description ILIKE '%error 403%'
          OR description ILIKE '%forbidden%'
          OR description ILIKE '%captcha%'
          OR length(trim(description)) < 15
        )
    `;
    console.log(`  [UPDATE] Set descriptions to NULL for ${badDescCount} companies.`);
  } else if (badDescCount > 0) {
    console.log(`  [DRY-RUN] Would set descriptions to NULL for ${badDescCount} companies.`);
  }

  // ─── Step 3: Seed Missing Subcategories ────────────────────────────
  console.log('\nStep 3: Seeding missing subcategories...');
  
  // Load parent categories from DB to map slug -> ID
  const dbCategories = await sql`SELECT id, slug, name FROM categories`;
  const catMap = new Map(dbCategories.map(c => [c.slug, c]));

  let seededCount = 0;
  for (const cat of MANUFACTURING_CATEGORIES) {
    const parent = catMap.get(cat.slug);
    if (!parent) {
      console.warn(`  [warning] Parent category ${cat.name} (${cat.slug}) not found in database.`);
      continue;
    }

    for (const sub of cat.subcategories) {
      const existing = catMap.get(sub.slug);
      if (existing) {
        // Already exists
        continue;
      }

      console.log(`  Seeding subcategory: ${sub.name} (${sub.slug}) under parent ${parent.name}`);
      if (COMMIT) {
        const rows = await sql`
          INSERT INTO categories (name, slug, description, is_parent, parent_id)
          VALUES (${sub.name}, ${sub.slug}, ${sub.name + ' manufacturers.'}, false, ${parent.id})
          RETURNING id
        `;
        // Keep our in-memory map updated
        catMap.set(sub.slug, { id: rows[0].id, slug: sub.slug, name: sub.name });
      }
      seededCount++;
    }
  }
  console.log(`  Total subcategories seeded: ${seededCount}`);

  // ─── Step 4: Classify & Tag Companies ──────────────────────────────
  console.log('\nStep 4: Classifying and tagging companies to subcategories...');
  
  // Reload categories map to ensure we have all subcategory IDs
  const dbCategoriesAll = await sql`SELECT id, slug, name, parent_id FROM categories`;
  const allCatMap = new Map(dbCategoriesAll.map(c => [c.slug, c]));

  let totalTaggedCount = 0;

  for (const cat of MANUFACTURING_CATEGORIES) {
    const parent = allCatMap.get(cat.slug);
    if (!parent) continue;

    for (const sub of cat.subcategories) {
      const subCat = allCatMap.get(sub.slug);
      if (!subCat) {
        console.warn(`  [warning] Subcategory ${sub.name} (${sub.slug}) ID not found.`);
        continue;
      }

      // Build regex pattern using word boundaries '\y' for keywords
      // Escaping special regex chars is not needed as keywords are plain word phrases
      const pattern = '\\y(' + sub.keywords.join('|') + ')\\y';

      // Count matching companies linked to the parent category
      const matchCountRes = await sql`
        SELECT COUNT(*) as count
        FROM companies c
        INNER JOIN company_categories cc ON cc.company_id = c.id
        WHERE cc.category_id = ${parent.id}
          AND (
            c.name ~* ${pattern}
            OR c.description ~* ${pattern}
            OR array_to_string(c.products, ' ') ~* ${pattern}
            OR array_to_string(c.capabilities, ' ') ~* ${pattern}
          )
      `;
      const matches = parseInt(matchCountRes[0].count, 10);
      console.log(`  Subcategory: ${sub.name} (${sub.slug}) -> matched ${matches} companies`);

      if (matches > 0 && COMMIT) {
        const insertRes = await sql`
          INSERT INTO company_categories (company_id, category_id)
          SELECT c.id, ${subCat.id}
          FROM companies c
          INNER JOIN company_categories cc ON cc.company_id = c.id
          WHERE cc.category_id = ${parent.id}
            AND (
              c.name ~* ${pattern}
              OR c.description ~* ${pattern}
              OR array_to_string(c.products, ' ') ~* ${pattern}
              OR array_to_string(c.capabilities, ' ') ~* ${pattern}
            )
          ON CONFLICT DO NOTHING
        `;
        totalTaggedCount += matches;
      }
    }
  }

  if (COMMIT) {
    console.log(`\n  Successfully created ${totalTaggedCount} category associations in database.`);
  } else {
    console.log(`\n  [DRY-RUN] Finished simulation. Re-run with --commit to apply changes to Neon DB.`);
  }
}

main().catch(console.error);
