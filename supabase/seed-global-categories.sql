-- Seed parent categories across ALL industries (not just staffing)
-- Run this in Supabase SQL Editor for the new DB:
-- https://ewxgflpheyxjunthfpcl.supabase.co
--
-- Safe to re-run: uses ON CONFLICT to skip existing slugs.

INSERT INTO categories (id, parent_id, name, slug, description, icon, "order", is_parent)
VALUES
  (gen_random_uuid(), NULL, 'Staffing & Recruiting', 'staffing-recruiting',
   'Verified staffing and recruitment firms across every specialization.', 'users', 1, true),
  (gen_random_uuid(), NULL, 'IT & Technology', 'it-technology',
   'Software development, cloud, cybersecurity, and technology services companies.', 'cpu', 2, true),
  (gen_random_uuid(), NULL, 'Healthcare', 'healthcare',
   'Hospitals, clinics, telehealth, medical device makers, and healthcare services.', 'heart-pulse', 3, true),
  (gen_random_uuid(), NULL, 'Travel & Cruises', 'travel-cruises',
   'Cruise lines, travel agencies, tour operators, and hospitality providers.', 'ship', 4, true),
  (gen_random_uuid(), NULL, 'Education', 'education',
   'Schools, universities, online learning platforms, and edtech companies.', 'graduation-cap', 5, true),
  (gen_random_uuid(), NULL, 'Marketing & Advertising', 'marketing-advertising',
   'Digital marketing, SEO, branding, and advertising agencies.', 'megaphone', 6, true),
  (gen_random_uuid(), NULL, 'Finance & Accounting', 'finance-accounting',
   'Accounting firms, CPAs, wealth managers, and financial service providers.', 'briefcase', 7, true),
  (gen_random_uuid(), NULL, 'Legal Services', 'legal',
   'Law firms, legal consulting, and legal process outsourcing providers.', 'scale', 8, true),
  (gen_random_uuid(), NULL, 'Construction & Manufacturing', 'construction-manufacturing',
   'Builders, contractors, factories, and industrial manufacturers.', 'factory', 9, true),
  (gen_random_uuid(), NULL, 'Real Estate', 'real-estate',
   'Real estate agencies, property managers, and commercial brokers.', 'home', 10, true),
  (gen_random_uuid(), NULL, 'Retail & E-commerce', 'retail-ecommerce',
   'Retailers, e-commerce platforms, and direct-to-consumer brands.', 'shopping-bag', 11, true),
  (gen_random_uuid(), NULL, 'Design & Creative', 'design-creative',
   'Design studios, UX agencies, and creative production houses.', 'palette', 12, true),
  (gen_random_uuid(), NULL, 'Engineering', 'engineering',
   'Engineering consultants, mechanical, civil, and electrical firms.', 'zap', 13, true),
  (gen_random_uuid(), NULL, 'Logistics & Transportation', 'logistics-transportation',
   'Freight, shipping, warehousing, and supply chain providers.', 'truck', 14, true),
  (gen_random_uuid(), NULL, 'Aviation & Aerospace', 'aviation-aerospace',
   'Airlines, aviation services, and aerospace manufacturers.', 'plane', 15, true),
  (gen_random_uuid(), NULL, 'Machinery & Equipment', 'machinery-equipment',
   'Industrial machinery, heavy equipment, CNC, robotics, and automation manufacturers.', 'cog', 16, true),
  (gen_random_uuid(), NULL, 'Chemicals & Materials', 'chemicals-materials',
   'Chemical producers, specialty materials, polymers, coatings, and industrial suppliers.', 'flask-conical', 17, true)
ON CONFLICT (slug) DO NOTHING;
