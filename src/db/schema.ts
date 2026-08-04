import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

// ── States ────────────────────────────────────────────────────────────────────

export const states = pgTable('states', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       text('name').notNull(),          // "California"
  slug:       text('slug').notNull().unique(),  // "california"
  region:     text('region'),                  // "West" | "Midwest" | "South" | "Northeast"
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Categories ────────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id:          uuid('id').primaryKey().defaultRandom(),
  parent_id:   uuid('parent_id').references((): any => categories.id),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  description: text('description'),
  icon:        text('icon'),
  order:       integer('order').default(0),
  is_parent:   boolean('is_parent').default(false),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:  timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Companies ─────────────────────────────────────────────────────────────────

export const companies = pgTable('companies', {
  id:              uuid('id').primaryKey().defaultRandom(),
  name:            text('name').notNull(),
  slug:            text('slug').notNull().unique(),
  description:     text('description'),
  website:         text('website'),
  logo_url:        text('logo_url'),
  founded_year:    integer('founded_year'),
  employee_count:  text('employee_count'),
  // State FK — source of truth
  hq_state_id:     uuid('hq_state_id').references(() => states.id),
  // Denormalized display label kept for rendering convenience (no extra join)
  hq_state_label:  text('hq_state_label'),
  hq_city:         text('hq_city'),
  contact_email:   text('contact_email'),
  certifications:  text('certifications').array(),
  // Extended manufacturing fields
  phone:           text('phone'),
  address:         text('address'),
  country:         text('country').default('United States'),
  products:        text('products').array(),
  industries_served: text('industries_served').array(),
  capabilities:    text('capabilities').array(),
  images:          text('images').array(),
  naics_code:      text('naics_code'),
  linkedin_url:    text('linkedin_url'),
  data_source:     text('data_source').default('manual'),
  source_url:      text('source_url'),
  is_verified:     boolean('is_verified').default(false),
  featured:        boolean('featured').default(false),
  approved:        boolean('approved').default(false),
  owner_user_id:   text('owner_user_id'),
  avg_rating:      numeric('avg_rating', { precision: 3, scale: 2 }).default('0'),
  review_count:    integer('review_count').default(0),
  created_at:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Company–Category links ────────────────────────────────────────────────────

export const company_categories = pgTable(
  'company_categories',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    company_id:  uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    category_id: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.company_id, t.category_id)],
);

// ── Reviews ───────────────────────────────────────────────────────────────────

export const reviews = pgTable('reviews', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  company_id:            uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  reviewer_name:         text('reviewer_name'),
  reviewer_company:      text('reviewer_company'),
  user_id:               text('user_id'),
  rating_overall:        numeric('rating_overall', { precision: 2, scale: 1 }).notNull(),
  rating_quality:        numeric('rating_quality', { precision: 2, scale: 1 }),
  rating_communication:  numeric('rating_communication', { precision: 2, scale: 1 }),
  rating_value:          numeric('rating_value', { precision: 2, scale: 1 }),
  rating_timeliness:     numeric('rating_timeliness', { precision: 2, scale: 1 }),
  title:                 text('title').notNull(),
  body:                  text('body').notNull(),
  work_duration:         text('work_duration'),
  role_hired:            text('role_hired'),
  verified:              boolean('verified').default(false),
  approved:              boolean('approved').default(false),
  company_response:      text('company_response'),
  company_response_date: timestamp('company_response_date', { withTimezone: true }),
  created_at:            timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:            timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Company Leads (Request Proposal submissions) ──────────────────────────────

export const company_leads = pgTable('company_leads', {
  id:         uuid('id').primaryKey().defaultRandom(),
  company_id: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  email:      text('email').notNull(),
  phone:      text('phone'),
  message:    text('message').notNull(),
  status:     text('status').default('new'), // new | contacted | closed
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Listing Requests ──────────────────────────────────────────────────────────

export const listing_requests = pgTable('listing_requests', {
  id:            uuid('id').primaryKey().defaultRandom(),
  company_name:  text('company_name').notNull(),
  contact_email: text('contact_email').notNull(),
  contact_phone: text('contact_phone'),
  website:       text('website'),
  hq_state_id:   uuid('hq_state_id').references(() => states.id),
  hq_state_label: text('hq_state_label'),
  hq_city:       text('hq_city'),
  category_slug: text('category_slug'),
  description:   text('description'),
  status:        text('status').default('pending'),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Company Invites ───────────────────────────────────────────────────────────

export const company_invites = pgTable('company_invites', {
  id:           uuid('id').primaryKey().defaultRandom(),
  token:        text('token').notNull().unique(),
  email:        text('email').notNull(),
  company_name: text('company_name'),
  expires_at:   timestamp('expires_at', { withTimezone: true }).notNull(),
  used_at:      timestamp('used_at', { withTimezone: true }),
  company_id:   uuid('company_id').references(() => companies.id),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Email Campaigns ───────────────────────────────────────────────────────────

export const email_campaigns = pgTable('email_campaigns', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  subject:     text('subject').notNull(),
  html_body:   text('html_body').notNull(),
  status:      text('status').default('draft'),   // draft | sent | scheduled
  sent_count:  integer('sent_count').default(0),
  open_count:  integer('open_count').default(0),
  click_count: integer('click_count').default(0),
  sent_at:     timestamp('sent_at', { withTimezone: true }),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Email Logs ────────────────────────────────────────────────────────────────

export const email_logs = pgTable('email_logs', {
  id:               uuid('id').primaryKey().defaultRandom(),
  campaign_id:      uuid('campaign_id').references(() => email_campaigns.id),
  recipient_email:  text('recipient_email').notNull(),
  status:           text('status').default('sent'),  // sent | opened | clicked | bounced
  opened_at:        timestamp('opened_at', { withTimezone: true }),
  clicked_at:       timestamp('clicked_at', { withTimezone: true }),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Submission Logs (URL indexing cron) ───────────────────────────────────────

export const submission_logs = pgTable('submission_logs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  url:          text('url').notNull(),
  platform:     text('platform'),   // "google" | "bing" | "ping"
  status:       text('status'),     // "success" | "failed" | "skipped"
  response:     text('response'),
  submitted:    boolean('submitted').default(false),
  submitted_at: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
});

// ── Marketplace: RFQs ─────────────────────────────────────────────────────────

export const marketplace_rfqs = pgTable('marketplace_rfqs', {
  id:                uuid('id').primaryKey().defaultRandom(),
  title:             text('title').notNull(),
  product_name:      text('product_name').notNull(),
  specifications:    text('specifications'),
  quantity:          integer('quantity'),
  unit:              text('unit').default('units'),
  budget_range:      text('budget_range'),
  payment_terms:     text('payment_terms'),
  delivery_deadline: text('delivery_deadline'),
  category:          text('category'),
  contact_name:      text('contact_name').notNull(),
  contact_email:     text('contact_email').notNull(),
  company_name:      text('company_name'),
  country:           text('country'),
  status:            text('status').default('open'),   // open | closed | fulfilled
  response_count:    integer('response_count').default(0),
  created_at:        timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Marketplace: Suppliers ────────────────────────────────────────────────────

export const marketplace_suppliers = pgTable('marketplace_suppliers', {
  id:              uuid('id').primaryKey().defaultRandom(),
  company_name:    text('company_name').notNull(),
  product_name:    text('product_name').notNull(),
  description:     text('description'),
  certifications:  text('certifications').array(),
  min_order_qty:   text('min_order_qty'),
  lead_time:       text('lead_time'),
  price_range:     text('price_range'),
  category:        text('category'),
  contact_name:    text('contact_name').notNull(),
  contact_email:   text('contact_email').notNull(),
  website:         text('website'),
  country:         text('country'),
  patents:         text('patents'),
  status:          text('status').default('active'),  // active | inactive
  inquiry_count:   integer('inquiry_count').default(0),
  created_at:      timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Marketplace: Responses ────────────────────────────────────────────────────

export const marketplace_responses = pgTable('marketplace_responses', {
  id:                uuid('id').primaryKey().defaultRandom(),
  rfq_id:            uuid('rfq_id').references(() => marketplace_rfqs.id, { onDelete: 'cascade' }),
  supplier_id:       uuid('supplier_id').references(() => marketplace_suppliers.id, { onDelete: 'cascade' }),
  responder_name:    text('responder_name').notNull(),
  responder_email:   text('responder_email').notNull(),
  responder_company: text('responder_company'),
  message:           text('message').notNull(),
  created_at:        timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── State–Category Rankings (precomputed, low-priority) ───────────────────────

export const state_category_rankings = pgTable(
  'state_category_rankings',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    state_id:     uuid('state_id').notNull().references(() => states.id, { onDelete: 'cascade' }),
    category_id:  uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    company_count: integer('company_count').default(0),
    updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.state_id, t.category_id)],
);

// ── Users & Sessions (public account auth) ─────────────────────────────────────

export const users = pgTable('users', {
  id:            uuid('id').primaryKey().defaultRandom(),
  email:         text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name:     text('full_name'),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sessions = pgTable('sessions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull().unique(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type State                   = typeof states.$inferSelect;
export type Category                = typeof categories.$inferSelect;
export type Company                 = typeof companies.$inferSelect;
export type CompanyCategory         = typeof company_categories.$inferSelect;
export type Review                  = typeof reviews.$inferSelect;
export type CompanyLead             = typeof company_leads.$inferSelect;
export type ListingRequest          = typeof listing_requests.$inferSelect;
export type CompanyInvite           = typeof company_invites.$inferSelect;
export type EmailCampaign           = typeof email_campaigns.$inferSelect;
export type EmailLog                = typeof email_logs.$inferSelect;
export type SubmissionLog           = typeof submission_logs.$inferSelect;
export type MarketplaceRfq          = typeof marketplace_rfqs.$inferSelect;
export type MarketplaceSupplier     = typeof marketplace_suppliers.$inferSelect;
export type MarketplaceResponse     = typeof marketplace_responses.$inferSelect;
export type StateCategoryRanking    = typeof state_category_rankings.$inferSelect;
export type User                    = typeof users.$inferSelect;
export type Session                 = typeof sessions.$inferSelect;
