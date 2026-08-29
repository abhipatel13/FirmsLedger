'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[,.]/g, '')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|group|holdings|industries)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function backfillFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`[!] File not found: ${filePath}`);
    return;
  }

  console.log(`[*] Processing ${filename}...`);
  const staged = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  // Fetch all companies from DB to match by normalized name
  const dbCompanies = await sql`SELECT id, name, images FROM companies`;
  const companyMap = new Map();
  for (const c of dbCompanies) {
    companyMap.set(normalizeName(c.name), c);
  }

  for (const rec of staged) {
    if (!rec.images || rec.images.length === 0) continue;

    const normName = normalizeName(rec.company_name);
    const dbCompany = companyMap.get(normName);

    if (dbCompany) {
      // Parse images and extract URLs
      let urls = [];
      try {
        const parsed = typeof rec.images === 'string' ? JSON.parse(rec.images) : rec.images;
        if (Array.isArray(parsed)) {
          urls = parsed.map(img => img.url).filter(Boolean);
        }
      } catch (err) {
        continue;
      }

      if (urls.length > 0) {
        // Only update if database images is empty or null
        if (!dbCompany.images || dbCompany.images.length === 0) {
          try {
            await sql`
              UPDATE companies
              SET images = ${urls}
              WHERE id = ${dbCompany.id}
            `;
            updatedCount++;
            // Update local map to avoid duplicate logs/updates
            dbCompany.images = urls;
          } catch (err) {
            console.error(`  [error] Failed to update ${rec.company_name}:`, err.message);
          }
        }
      }
    }
  }

  console.log(`[+] Successfully updated ${updatedCount} companies from ${filename}.`);
}

async function main() {
  await backfillFile('staged_companies_batch_200.json');
  await backfillFile('staged_companies.json');
}

main().catch(console.error);
