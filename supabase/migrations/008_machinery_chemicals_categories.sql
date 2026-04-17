-- Add Machinery & Equipment and Chemicals & Materials top-level categories

INSERT INTO categories (parent_id, name, slug, description, icon, "order", is_parent) VALUES
  (NULL, 'Machinery & Equipment', 'machinery-equipment', 'Industrial machinery, heavy equipment, CNC, robotics, and automation manufacturers.', 'cog',   16, true),
  (NULL, 'Chemicals & Materials', 'chemicals-materials', 'Chemical producers, specialty materials, polymers, coatings, and industrial suppliers.', 'flask-conical', 17, true)
ON CONFLICT (slug) DO NOTHING;
