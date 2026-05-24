-- B2B Marketplace tables

CREATE TABLE IF NOT EXISTS marketplace_rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  product_name TEXT NOT NULL,
  specifications TEXT,
  quantity INT,
  unit TEXT DEFAULT 'units',
  budget_range TEXT,
  payment_terms TEXT,
  delivery_deadline TEXT,
  category TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  company_name TEXT,
  country TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'fulfilled')),
  response_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  certifications TEXT[],
  min_order_qty TEXT,
  lead_time TEXT,
  price_range TEXT,
  category TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website TEXT,
  country TEXT,
  patents TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  inquiry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES marketplace_rfqs(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES marketplace_suppliers(id) ON DELETE CASCADE,
  responder_name TEXT NOT NULL,
  responder_email TEXT NOT NULL,
  responder_company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: public read, no direct insert (use service role via API)
ALTER TABLE marketplace_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read rfqs" ON marketplace_rfqs FOR SELECT USING (true);
CREATE POLICY "public read suppliers" ON marketplace_suppliers FOR SELECT USING (true);
