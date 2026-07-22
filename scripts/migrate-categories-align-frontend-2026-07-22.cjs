/**
 * One-off migration: align DB `categories` slugs with the frontend's 10
 * top-level industries (src/lib/manufacturingCategories.js), and fold the
 * DB-only "orphan" parent categories (electrical-manufacturing,
 * electronics-manufacturing, precision-manufacturing-cnc) into the matching
 * frontend category as real subcategories, instead of separate top-level rows.
 *
 * Steps:
 *  1. Rename 7 category slugs to match the frontend exactly.
 *  2. Promote electrical-components and mechanical-components to is_parent=true.
 *  3. Reparent cnc-machining -> mechanical-components
 *     Reparent electrical-wire-cable, solar-panels, switchgear -> electrical-components
 *     Reparent semiconductor-chips -> electronics-semiconductor
 *  4. Re-tag companies directly on electronics-manufacturing -> electronics-semiconductor
 *     Re-tag companies directly on precision-manufacturing-cnc -> mechanical-components
 *     (electrical-manufacturing has 0 direct company tags, nothing to re-tag)
 *  5. Delete the 3 now-empty orphan parent rows.
 *
 *   node scripts/migrate-categories-align-frontend-2026-07-22.cjs            # dry-run (default)
 *   node scripts/migrate-categories-align-frontend-2026-07-22.cjs --commit    # write to DB
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const COMMIT = process.argv.includes('--commit');

const SLUG_RENAMES = [
  ['plastics-packaging-manufacturers', 'plastics-packaging'],
  ['metal-fabrication-machining', 'metal-fabrication'],
  ['electronics-semiconductor-manufacturers', 'electronics-semiconductor'],
  ['automotive-parts-manufacturers', 'automotive-parts'],
  ['textile-apparel-manufacturers', 'textile-apparel'],
  ['furniture-woodworking-manufacturers', 'furniture-woodworking'],
  ['medical-device-manufacturers', 'medical-devices'],
];

const PROMOTE_TO_PARENT = ['electrical-components', 'mechanical-components'];

const REPARENT = [
  ['cnc-machining', 'mechanical-components'],
  ['electrical-wire-cable', 'electrical-components'],
  ['solar-panels', 'electrical-components'],
  ['switchgear', 'electrical-components'],
  ['semiconductor-chips', 'electronics-semiconductor'],
];

// orphan parent slug (as it is BEFORE renames) -> new home slug (AFTER renames) for its direct company tags
const RETAG_DIRECT = [
  ['electronics-manufacturing', 'electronics-semiconductor'],
  ['precision-manufacturing-cnc', 'mechanical-components'],
];

const DELETE_ORPHAN_PARENTS = ['electrical-manufacturing', 'electronics-manufacturing', 'precision-manufacturing-cnc'];

async function main() {
  const before = await sql`SELECT id, slug, name, is_parent, parent_id FROM categories`;
  const bySlug = new Map(before.map((c) => [c.slug, c]));

  console.log(`── Step 1: rename ${SLUG_RENAMES.length} slugs ──────────────────`);
  for (const [oldSlug, newSlug] of SLUG_RENAMES) {
    const cat = bySlug.get(oldSlug);
    if (!cat) { console.log(`  [skip] ${oldSlug} not found`); continue; }
    console.log(`  ${COMMIT ? '[rename]' : '[dry-run]'} ${oldSlug} -> ${newSlug}`);
    if (COMMIT) await sql`UPDATE categories SET slug = ${newSlug} WHERE id = ${cat.id}`;
    // Keep the in-memory map in sync so later steps can resolve the new slug
    // (both in dry-run simulation and in a real commit run).
    bySlug.delete(oldSlug);
    cat.slug = newSlug;
    bySlug.set(newSlug, cat);
  }

  console.log(`\n── Step 2: promote to is_parent=true ─────────────────────`);
  for (const slug of PROMOTE_TO_PARENT) {
    const cat = bySlug.get(slug);
    if (!cat) { console.log(`  [skip] ${slug} not found`); continue; }
    console.log(`  ${COMMIT ? '[promote]' : '[dry-run]'} ${slug}`);
    if (COMMIT) await sql`UPDATE categories SET is_parent = true WHERE id = ${cat.id}`;
  }

  console.log(`\n── Step 3: reparent subcategories ────────────────────────`);
  for (const [childSlug, newParentSlug] of REPARENT) {
    const child = bySlug.get(childSlug);
    const parent = bySlug.get(newParentSlug);
    if (!child || !parent) { console.log(`  [skip] ${childSlug} -> ${newParentSlug} (missing row)`); continue; }
    console.log(`  ${COMMIT ? '[reparent]' : '[dry-run]'} ${childSlug} -> parent ${newParentSlug}`);
    if (COMMIT) await sql`UPDATE categories SET parent_id = ${parent.id} WHERE id = ${child.id}`;
  }

  console.log(`\n── Step 4: re-tag companies directly on orphan parents ───`);
  for (const [orphanSlug, newHomeSlug] of RETAG_DIRECT) {
    const orphan = bySlug.get(orphanSlug);
    const newHome = bySlug.get(newHomeSlug);
    if (!orphan || !newHome) { console.log(`  [skip] ${orphanSlug} -> ${newHomeSlug} (missing row)`); continue; }

    const links = await sql`SELECT company_id FROM company_categories WHERE category_id = ${orphan.id}`;
    console.log(`  ${orphanSlug}: ${links.length} companies to re-tag onto ${newHomeSlug}`);
    for (const { company_id } of links) {
      if (!COMMIT) { console.log(`    [dry-run] company ${company_id}`); continue; }
      await sql`
        INSERT INTO company_categories (company_id, category_id)
        VALUES (${company_id}, ${newHome.id})
        ON CONFLICT DO NOTHING
      `;
      await sql`DELETE FROM company_categories WHERE company_id = ${company_id} AND category_id = ${orphan.id}`;
    }
  }

  console.log(`\n── Step 5: delete now-empty orphan parent rows ───────────`);
  for (const slug of DELETE_ORPHAN_PARENTS) {
    const cat = bySlug.get(slug);
    if (!cat) { console.log(`  [skip] ${slug} not found`); continue; }
    const remaining = await sql`SELECT count(*)::int as n FROM company_categories WHERE category_id = ${cat.id}`;
    const stillHasChildren = await sql`SELECT count(*)::int as n FROM categories WHERE parent_id = ${cat.id}`;
    if (remaining[0].n > 0 || stillHasChildren[0].n > 0) {
      console.log(`  [BLOCKED] ${slug} still has ${remaining[0].n} company tags / ${stillHasChildren[0].n} child categories — not deleting`);
      continue;
    }
    console.log(`  ${COMMIT ? '[delete]' : '[dry-run]'} ${slug}`);
    if (COMMIT) await sql`DELETE FROM categories WHERE id = ${cat.id}`;
  }

  console.log(`\n── Final state ────────────────────────────────────────`);
  const after = await sql`
    SELECT c.slug, c.is_parent, p.slug as parent_slug, count(cc.company_id)::int as n
    FROM categories c
    LEFT JOIN categories p ON p.id = c.parent_id
    LEFT JOIN company_categories cc ON cc.category_id = c.id
    GROUP BY c.slug, c.is_parent, p.slug
    ORDER BY c.is_parent DESC, p.slug NULLS FIRST, c.slug
  `;
  for (const r of after) {
    console.log(`  ${r.slug.padEnd(35)} is_parent=${r.is_parent} parent=${r.parent_slug || '-'} companies=${r.n}`);
  }

  if (!COMMIT) console.log(`\nDry-run only (categories table wasn't touched). Re-run with --commit to apply.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
