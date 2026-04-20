-- Seed 15 parent categories across all industries (not just staffing)

INSERT INTO categories (parent_id, name, slug, description, icon, "order", is_parent) VALUES
  (NULL, 'Staffing & Recruiting',         'staffing-recruiting',         'Verified staffing and recruitment firms across every specialization.',            'users',          1,  true),
  (NULL, 'IT & Technology',               'it-technology',               'Software development, cloud, cybersecurity, and technology services companies.',  'cpu',            2,  true),
  (NULL, 'Healthcare',                    'healthcare',                  'Hospitals, clinics, telehealth, medical device makers, and healthcare services.', 'heart-pulse',    3,  true),
  (NULL, 'Travel & Cruises',              'travel-cruises',              'Cruise lines, travel agencies, tour operators, and hospitality providers.',       'ship',           4,  true),
  (NULL, 'Education',                     'education',                   'Schools, universities, online learning platforms, and edtech companies.',         'graduation-cap', 5,  true),
  (NULL, 'Marketing & Advertising',       'marketing-advertising',       'Digital marketing, SEO, branding, and advertising agencies.',                     'megaphone',      6,  true),
  (NULL, 'Finance & Accounting',          'finance-accounting',          'Accounting firms, CPAs, wealth managers, and financial service providers.',       'briefcase',      7,  true),
  (NULL, 'Legal Services',                'legal',                       'Law firms, legal consulting, and legal process outsourcing providers.',           'scale',          8,  true),
  (NULL, 'Construction & Manufacturing',  'construction-manufacturing',  'Builders, contractors, factories, and industrial manufacturers.',                 'factory',        9,  true),
  (NULL, 'Real Estate',                   'real-estate',                 'Real estate agencies, property managers, and commercial brokers.',                'home',           10, true),
  (NULL, 'Retail & E-commerce',           'retail-ecommerce',            'Retailers, e-commerce platforms, and direct-to-consumer brands.',                 'shopping-bag',   11, true),
  (NULL, 'Design & Creative',             'design-creative',             'Design studios, UX agencies, and creative production houses.',                    'palette',        12, true),
  (NULL, 'Engineering',                   'engineering',                 'Engineering consultants, mechanical, civil, and electrical firms.',               'zap',            13, true),
  (NULL, 'Logistics & Transportation',    'logistics-transportation',    'Freight, shipping, warehousing, and supply chain providers.',                     'truck',          14, true),
  (NULL, 'Aviation & Aerospace',          'aviation-aerospace',          'Airlines, aviation services, and aerospace manufacturers.',                       'plane',          15, true)
ON CONFLICT (slug) DO NOTHING;
