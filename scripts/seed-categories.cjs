/**
 * Seed manufacturing category tree into the categories table.
 *
 * Tree:
 *   Electrical Manufacturing        [parent]
 *     ├── Switchgear
 *     ├── Solar Panels
 *     └── Electrical Wire
 *
 *   Electronics Manufacturing       [parent]
 *     └── Semiconductor / Chips
 *
 *   Precision Manufacturing / CNC   [parent]
 *     └── CNC Machining
 *
 * Run: node scripts/seed-categories.cjs
 */
'use strict';

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const PARENTS = [
  {
    name: 'Electrical Manufacturing',
    slug: 'electrical-manufacturing',
    description: 'Manufacturers of electrical equipment, switchgear, panels, wiring devices, and power distribution components.',
    icon: 'zap',
    order: 1,
    children: [
      {
        name: 'Switchgear',
        slug: 'switchgear',
        description: 'Manufacturers of low, medium, and high voltage switchgear for industrial, commercial, and utility applications.',
        icon: 'toggle-left',
        order: 1,
      },
      {
        name: 'Solar Panels',
        slug: 'solar-panels',
        description: 'Manufacturers and suppliers of photovoltaic solar panels and solar energy systems.',
        icon: 'sun',
        order: 2,
      },
      {
        name: 'Electrical Wire & Cable',
        slug: 'electrical-wire-cable',
        description: 'Manufacturers of electrical wire, cable, and wiring harnesses for industrial and commercial use.',
        icon: 'cable',
        order: 3,
      },
    ],
  },
  {
    name: 'Electronics Manufacturing',
    slug: 'electronics-manufacturing',
    description: 'Manufacturers of electronic components, semiconductors, PCBs, and electronic assemblies.',
    icon: 'cpu',
    order: 2,
    children: [
      {
        name: 'Semiconductor / Chips',
        slug: 'semiconductor-chips',
        description: 'Manufacturers of semiconductors, integrated circuits, microchips, and related electronic components.',
        icon: 'microchip',
        order: 1,
      },
    ],
  },
  {
    name: 'Precision Manufacturing / CNC',
    slug: 'precision-manufacturing-cnc',
    description: 'Manufacturers offering precision machining, CNC machining, and high-tolerance component manufacturing.',
    icon: 'settings',
    order: 3,
    children: [
      {
        name: 'CNC Machining',
        slug: 'cnc-machining',
        description: 'Shops and manufacturers offering CNC milling, turning, drilling, and precision machined parts.',
        icon: 'cog',
        order: 1,
      },
    ],
  },
];

async function upsertCategory({ name, slug, description, icon, order, is_parent, parent_id }) {
  const existing = await sql`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
  if (existing.length > 0) {
    console.log(`  SKIP  ${slug} (already exists)`);
    return existing[0].id;
  }

  const rows = await sql`
    INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
    VALUES (
      ${name},
      ${slug},
      ${description},
      ${icon},
      ${order},
      ${is_parent},
      ${parent_id ?? null}
    )
    RETURNING id
  `;
  console.log(`  INSERT ${slug}`);
  return rows[0].id;
}

async function main() {
  console.log('Seeding categories...\n');

  for (const parent of PARENTS) {
    console.log(`[${parent.name}]`);
    const parentId = await upsertCategory({
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      icon: parent.icon,
      order: parent.order,
      is_parent: true,
      parent_id: null,
    });

    for (const child of parent.children) {
      await upsertCategory({
        name: child.name,
        slug: child.slug,
        description: child.description,
        icon: child.icon,
        order: child.order,
        is_parent: false,
        parent_id: parentId,
      });
    }
    console.log('');
  }

  console.log('Category seed complete.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
