-- Split "Construction & Manufacturing" into two parents so contractors show
-- up under Services (Find By Services) and actual manufacturers show up under
-- Products (Find By Products).

-- 1. Rename the existing parent to "Construction" (keeps the id; re-slugs URL).
UPDATE categories
SET name        = 'Construction',
    slug        = 'construction',
    description = 'Builders, contractors, and construction service providers.',
    icon        = 'hard-hat'
WHERE slug = 'construction-manufacturing'
  AND parent_id IS NULL;

-- 2. Create the new "Manufacturing" parent (products side).
INSERT INTO categories (parent_id, name, slug, description, icon, "order", is_parent) VALUES
  (NULL, 'Manufacturing', 'manufacturing', 'Factories, industrial producers, and precision machining.', 'factory', 9, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Move manufacturing subcategories to the new Manufacturing parent.
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'manufacturing' AND parent_id IS NULL)
WHERE slug IN ('industrial-manufacturing', 'cnc-manufacturing');
