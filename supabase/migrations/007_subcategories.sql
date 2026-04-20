-- Seed subcategories under each parent category.
-- parent_id is resolved by looking up each parent's slug at insert time.

INSERT INTO categories (parent_id, name, slug, description, icon, "order", is_parent)
SELECT
  (SELECT id FROM categories WHERE slug = v.parent_slug),
  v.name, v.slug, v.description, v.icon, v.ord, false
FROM (VALUES
  -- ── Staffing & Recruiting ─────────────────────────────────────────────
  ('staffing-recruiting', 'IT Staffing',             'it-staffing',             'Technology and software staffing agencies.',                  'cpu',           1),
  ('staffing-recruiting', 'Healthcare Staffing',     'healthcare-staffing',     'Medical and healthcare professionals staffing.',              'heart-pulse',   2),
  ('staffing-recruiting', 'Executive Search',        'executive-search',        'C-level and senior leadership recruitment.',                  'briefcase',     3),
  ('staffing-recruiting', 'Temporary Staffing',      'temporary-staffing',      'Short-term and contract staffing solutions.',                 'clock',         4),
  ('staffing-recruiting', 'Permanent Staffing',      'permanent-staffing',      'Full-time placement and direct hire services.',               'user-check',    5),
  ('staffing-recruiting', 'Remote Staffing',         'remote-staffing',         'Distributed team and remote workforce staffing.',             'globe',         6),
  ('staffing-recruiting', 'Industrial Staffing',     'industrial-staffing',     'Manufacturing, warehouse and trades staffing.',               'factory',       7),

  -- ── IT & Technology ───────────────────────────────────────────────────
  ('it-technology', 'Software Development',          'software-development',    'Custom software engineering and product development.',        'code',          1),
  ('it-technology', 'Cloud Services',                'cloud-services',          'AWS, Azure, GCP migration and cloud-native services.',        'cloud',         2),
  ('it-technology', 'Cybersecurity',                 'cybersecurity',           'Security audits, pen-testing, and managed security.',          'shield',        3),
  ('it-technology', 'Data & Analytics',              'data-analytics',          'Data warehousing, BI, and analytics consulting.',             'bar-chart',     4),
  ('it-technology', 'DevOps & SRE',                  'devops-sre',              'CI/CD, infrastructure-as-code, and reliability engineering.', 'settings',      5),
  ('it-technology', 'AI & Machine Learning',         'ai-machine-learning',     'AI/ML model development and applied research.',               'sparkles',      6),
  ('it-technology', 'Mobile App Development',        'mobile-app-development',  'iOS, Android, and cross-platform app studios.',               'smartphone',    7),

  -- ── Healthcare ────────────────────────────────────────────────────────
  ('healthcare', 'Hospitals & Health Systems',       'hospitals',               'Acute care hospitals and integrated health systems.',          'building-2',    1),
  ('healthcare', 'Clinics & Private Practice',       'clinics',                 'Outpatient clinics and physician practices.',                  'stethoscope',   2),
  ('healthcare', 'Telehealth',                       'telehealth',              'Virtual care, remote monitoring, and telemedicine services.',  'video',         3),
  ('healthcare', 'Medical Devices',                  'medical-devices',         'Medical device manufacturers and diagnostics.',                'activity',      4),
  ('healthcare', 'Pharmaceuticals',                  'pharmaceuticals',         'Drug manufacturers, CROs, and biotech.',                       'pill',          5),
  ('healthcare', 'Mental Health Services',           'mental-health',           'Therapy, counseling, and behavioral health providers.',        'brain',         6),
  ('healthcare', 'Dental Services',                  'dental-services',         'Dentistry, orthodontics, and oral surgery.',                   'tooth',         7),

  -- ── Travel & Cruises ──────────────────────────────────────────────────
  ('travel-cruises', 'Cruise Lines',                 'cruise-lines',            'Ocean, river, and expedition cruise operators.',               'ship',          1),
  ('travel-cruises', 'Travel Agencies',              'travel-agencies',         'Leisure and corporate travel agencies.',                       'map',           2),
  ('travel-cruises', 'Tour Operators',               'tour-operators',          'Guided tour companies and adventure trip specialists.',        'compass',       3),
  ('travel-cruises', 'Luxury Travel',                'luxury-travel',           'High-end and bespoke travel providers.',                       'gem',           4),
  ('travel-cruises', 'Hotels & Resorts',             'hotels-resorts',          'Hotels, resorts, and hospitality groups.',                     'bed',           5),
  ('travel-cruises', 'Airlines',                     'airlines',                'Commercial and regional airline carriers.',                    'plane',         6),

  -- ── Education ─────────────────────────────────────────────────────────
  ('education', 'K–12 Schools',                      'k12-schools',             'Primary and secondary education providers.',                   'school',        1),
  ('education', 'Universities & Colleges',           'universities-colleges',   'Higher education institutions.',                               'graduation-cap', 2),
  ('education', 'Online Learning',                   'online-learning',         'MOOCs and online course platforms.',                           'laptop',        3),
  ('education', 'EdTech Platforms',                  'edtech',                  'Learning software and education technology vendors.',          'monitor',       4),
  ('education', 'Tutoring Services',                 'tutoring',                'Private tutoring and academic coaching.',                      'users',         5),
  ('education', 'Corporate Training',                'corporate-training',      'Workforce learning, L&D, and corporate education.',            'briefcase',     6),
  ('education', 'Language Schools',                  'language-schools',        'Language instruction and translation academies.',              'languages',     7),

  -- ── Marketing & Advertising ───────────────────────────────────────────
  ('marketing-advertising', 'Digital Marketing',     'digital-marketing',       'Full-service digital marketing agencies.',                     'megaphone',     1),
  ('marketing-advertising', 'SEO Services',          'seo-services',            'Search engine optimization and content SEO.',                  'search',        2),
  ('marketing-advertising', 'Social Media Marketing','social-media-marketing',  'Paid social, community management, and influencer.',           'share-2',       3),
  ('marketing-advertising', 'Content Marketing',     'content-marketing',       'Content strategy, blogging, and editorial.',                   'pen-tool',      4),
  ('marketing-advertising', 'PR Agencies',           'pr-agencies',             'Public relations and communications firms.',                   'mic',           5),
  ('marketing-advertising', 'Branding & Identity',   'branding',                'Brand strategy, logos, and visual identity.',                  'palette',       6),
  ('marketing-advertising', 'Advertising Agencies',  'advertising-agencies',    'Traditional and integrated advertising firms.',                'tv',            7),

  -- ── Finance & Accounting ──────────────────────────────────────────────
  ('finance-accounting', 'Accounting Firms',         'accounting-firms',        'General accounting and bookkeeping firms.',                    'calculator',    1),
  ('finance-accounting', 'CPA Services',             'cpa-services',            'Certified public accountants.',                                'file-check',    2),
  ('finance-accounting', 'Tax Services',             'tax-services',            'Tax preparation, advisory, and compliance.',                   'receipt',       3),
  ('finance-accounting', 'Wealth Management',        'wealth-management',       'Financial planning and investment advisory.',                   'trending-up',   4),
  ('finance-accounting', 'Bookkeeping',              'bookkeeping',             'Small business bookkeeping and AR/AP services.',               'book',          5),
  ('finance-accounting', 'Investment Banking',       'investment-banking',      'M&A advisory and capital markets.',                            'landmark',      6),

  -- ── Legal Services ────────────────────────────────────────────────────
  ('legal', 'Corporate Law',                         'corporate-law',           'Business formation, contracts, and corporate governance.',     'briefcase',     1),
  ('legal', 'Family Law',                            'family-law',              'Divorce, custody, and family-related legal matters.',          'heart',         2),
  ('legal', 'Criminal Defense',                      'criminal-defense',        'Criminal defense attorneys.',                                  'gavel',         3),
  ('legal', 'Immigration Law',                       'immigration-law',         'Visas, green cards, and immigration services.',                'flag',          4),
  ('legal', 'Intellectual Property',                 'intellectual-property',   'Patents, trademarks, and IP protection.',                      'lightbulb',     5),
  ('legal', 'Personal Injury',                       'personal-injury',         'Personal injury and tort litigation.',                         'alert-circle',  6),
  ('legal', 'Real Estate Law',                       'real-estate-law',         'Real estate transactions and property law.',                   'home',          7),

  -- ── Construction & Manufacturing ──────────────────────────────────────
  ('construction-manufacturing', 'General Contractors',      'general-contractors',      'General contracting for commercial and residential.', 'hard-hat',      1),
  ('construction-manufacturing', 'Residential Construction', 'residential-construction', 'Home builders and residential contractors.',          'home',          2),
  ('construction-manufacturing', 'Commercial Construction',  'commercial-construction',  'Office, retail, and commercial builders.',            'building',      3),
  ('construction-manufacturing', 'Industrial Manufacturing', 'industrial-manufacturing', 'Factories and industrial producers.',                 'factory',       4),
  ('construction-manufacturing', 'CNC Manufacturing',        'cnc-manufacturing',        'Precision machining and CNC shops.',                  'cog',           5),
  ('construction-manufacturing', 'Electrical Contractors',   'electrical-contractors',   'Licensed electricians and electrical firms.',         'zap',           6),
  ('construction-manufacturing', 'Plumbing Contractors',     'plumbing-contractors',     'Licensed plumbers and plumbing firms.',               'droplet',       7),

  -- ── Real Estate ───────────────────────────────────────────────────────
  ('real-estate', 'Residential Real Estate',         'residential-real-estate', 'Home sales and residential brokerages.',                       'home',          1),
  ('real-estate', 'Commercial Real Estate',          'commercial-real-estate',  'Office, retail, and industrial property brokers.',             'building',      2),
  ('real-estate', 'Property Management',             'property-management',     'Multifamily and commercial property management.',              'key',           3),
  ('real-estate', 'Real Estate Investment',          'real-estate-investment',  'REITs and private real estate investment firms.',              'trending-up',   4),
  ('real-estate', 'Property Developers',             'property-developers',     'Real estate developers and builders.',                         'crane',         5),
  ('real-estate', 'Real Estate Brokerages',          'real-estate-brokerages',  'Licensed real estate brokerages.',                             'handshake',     6),

  -- ── Retail & E-commerce ───────────────────────────────────────────────
  ('retail-ecommerce', 'E-commerce Platforms',       'ecommerce-platforms',     'Online store operators and marketplaces.',                     'shopping-cart', 1),
  ('retail-ecommerce', 'Fashion & Apparel',          'fashion-apparel',         'Clothing, footwear, and fashion retailers.',                   'shirt',         2),
  ('retail-ecommerce', 'Electronics Retail',         'electronics-retail',      'Consumer electronics and technology retailers.',               'monitor',       3),
  ('retail-ecommerce', 'Home Goods',                 'home-goods',              'Furniture, decor, and home supply retailers.',                 'sofa',          4),
  ('retail-ecommerce', 'Direct-to-Consumer Brands',  'direct-to-consumer',      'DTC and digitally-native brands.',                             'package',       5),
  ('retail-ecommerce', 'Specialty Stores',           'specialty-stores',        'Niche and specialty retail.',                                  'shopping-bag',  6),

  -- ── Design & Creative ─────────────────────────────────────────────────
  ('design-creative', 'Graphic Design',              'graphic-design',          'Graphic design and visual communication studios.',             'palette',       1),
  ('design-creative', 'UX/UI Design',                'ux-ui-design',            'Product design, UX research, and UI studios.',                 'layout',        2),
  ('design-creative', 'Web Design',                  'web-design',              'Web design agencies and studios.',                             'monitor',       3),
  ('design-creative', 'Interior Design',             'interior-design',         'Residential and commercial interior designers.',               'sofa',          4),
  ('design-creative', 'Video Production',            'video-production',        'Video production, editing, and post-production houses.',       'video',         5),
  ('design-creative', 'Animation Studios',           'animation-studios',       '2D/3D animation and motion design studios.',                   'film',          6),
  ('design-creative', 'Product Design',              'product-design',          'Industrial and consumer product design firms.',                'box',           7),

  -- ── Engineering ───────────────────────────────────────────────────────
  ('engineering', 'Mechanical Engineering',          'mechanical-engineering',  'Mechanical engineering consulting and design firms.',          'cog',           1),
  ('engineering', 'Civil Engineering',               'civil-engineering',       'Civil and infrastructure engineering firms.',                  'hard-hat',      2),
  ('engineering', 'Electrical Engineering',          'electrical-engineering',  'Electrical engineering consultancies.',                        'zap',           3),
  ('engineering', 'Chemical Engineering',            'chemical-engineering',    'Chemical and process engineering firms.',                      'flask',         4),
  ('engineering', 'Structural Engineering',          'structural-engineering',  'Structural engineering and analysis firms.',                   'building',      5),
  ('engineering', 'Environmental Engineering',       'environmental-engineering','Environmental engineering and consulting.',                   'leaf',          6),

  -- ── Logistics & Transportation ────────────────────────────────────────
  ('logistics-transportation', 'Freight Forwarding', 'freight-forwarding',      'International and domestic freight forwarders.',               'container',     1),
  ('logistics-transportation', 'Warehousing',        'warehousing',             '3PL warehousing and distribution.',                            'warehouse',     2),
  ('logistics-transportation', 'Trucking & Shipping','trucking-shipping',       'Trucking, LTL, and FTL carriers.',                             'truck',         3),
  ('logistics-transportation', 'Last-Mile Delivery', 'last-mile-delivery',      'Last-mile and same-day delivery providers.',                   'package',       4),
  ('logistics-transportation', 'Supply Chain Consulting','supply-chain-consulting','Supply chain and logistics consulting.',                    'network',       5),
  ('logistics-transportation', 'Cold Chain Logistics','cold-chain-logistics',   'Temperature-controlled logistics and storage.',                'thermometer',   6),

  -- ── Aviation & Aerospace ──────────────────────────────────────────────
  ('aviation-aerospace', 'Commercial Airlines',      'commercial-airlines',     'Mainline commercial airlines.',                                'plane',         1),
  ('aviation-aerospace', 'Regional Airlines',        'regional-airlines',       'Regional and short-haul carriers.',                            'plane',         2),
  ('aviation-aerospace', 'Charter Services',         'charter-services',        'Private jet and charter flight providers.',                    'plane-takeoff', 3),
  ('aviation-aerospace', 'Aerospace Manufacturing',  'aerospace-manufacturing', 'Aircraft and aerospace component manufacturers.',              'rocket',        4),
  ('aviation-aerospace', 'Aircraft Maintenance',     'aircraft-maintenance',    'MRO and aircraft maintenance providers.',                      'wrench',        5),
  ('aviation-aerospace', 'Airport Services',         'airport-services',        'Ground handling and airport service providers.',               'navigation',    6)
) AS v(parent_slug, name, slug, description, icon, ord)
ON CONFLICT (slug) DO NOTHING;
