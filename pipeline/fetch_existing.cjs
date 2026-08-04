'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'existing_companies.json');

async function main() {
  console.log('[*] Connecting to PostgreSQL via Neon...');
  const companies = await sql`
    SELECT name, website, phone, address
    FROM companies
  `;
  console.log(`[+] Fetched ${companies.length} existing companies.`);
  fs.writeFileSync(outputPath, JSON.stringify(companies, null, 2), 'utf8');
  console.log(`[+] Saved to ${outputPath}`);
}

main().catch((err) => {
  console.error('[!] Error fetching existing companies:', err);
  process.exit(1);
});
