'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Get current local date in YYYY-MM-DD format
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const today = `${year}-${month}-${day}`;

const filename = `companies_${today}.csv`;
const outputPath1 = path.join(__dirname, '..', filename);
const outputPath2 = path.join(__dirname, '..', '..', 'companies', filename);

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) {
    val = val.join(' | ');
  }
  let str = String(val);
  // Replace double quotes with two double quotes
  str = str.replace(/"/g, '""');
  // Wrap in double quotes if it contains comma, newline, or quotes
  if (/[,\n\r"]/.test(str)) {
    return `"${str}"`;
  }
  return str;
}

async function main() {
  console.log(`[*] Fetching companies created on or after ${today} from PostgreSQL...`);
  const companies = await sql`
    SELECT name, slug, website, phone, address, hq_city, hq_state_label, 
           description, contact_email, avg_rating, review_count, data_source, created_at, images
    FROM companies
    WHERE created_at >= CURRENT_DATE
    ORDER BY created_at DESC
  `;

  console.log(`[+] Found ${companies.length} companies created today.`);

  const headers = [
    'name', 'slug', 'website', 'phone', 'address', 'hq_city', 'hq_state_label', 
    'description', 'contact_email', 'avg_rating', 'review_count', 'data_source', 'created_at', 'images'
  ];

  let csvContent = headers.join(',') + '\n';
  for (const c of companies) {
    const row = headers.map(h => escapeCsvField(c[h]));
    csvContent += row.join(',') + '\n';
  }

  // Write to project root
  fs.writeFileSync(outputPath1, csvContent, 'utf8');
  console.log(`[+] Exported successfully to ${outputPath1}`);

  // Write to parent's companies directory if it exists
  const parentCompaniesDir = path.dirname(outputPath2);
  if (fs.existsSync(parentCompaniesDir)) {
    fs.writeFileSync(outputPath2, csvContent, 'utf8');
    console.log(`[+] Exported successfully to ${outputPath2}`);
  } else {
    console.log(`[!] Warning: Target folder ${parentCompaniesDir} does not exist. Skipping copy.`);
  }
}

main().catch((err) => {
  console.error('[!] Error exporting companies:', err);
  process.exit(1);
});
