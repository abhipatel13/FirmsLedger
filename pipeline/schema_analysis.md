# Database Analysis & Schema Mapping (Phase 1)

This document provides a thorough analysis of the existing FirmsLedger database schemas, relationships, and the field mappings required to integrate the new manufacturing company data acquisition pipeline.

---

## 1. Database Architecture & Technologies
- **Database Engine**: PostgreSQL (Neon Serverless).
- **ORM / Migrations**: Drizzle ORM (referencing `drizzle-orm/pg-core`).
- **Core Entities**:
  - `companies`: The main table storing company profiles.
  - `states`: Stores the 50 US states, abbreviations, and slugs.
  - `categories`: Stores hierarchical categories/subcategories (self-referencing via `parent_id`).
  - `company_categories`: A many-to-many junction table linking companies and categories.

---

## 2. Table Schemas & Definitions

### `states` Table
Used to resolve state names/slugs to UUID references.
- `id`: `uuid` (primary key, default random)
- `name`: `text` (not null, e.g. "Texas")
- `slug`: `text` (not null, unique, e.g. "texas")
- `region`: `text` (nullable)

### `categories` Table
Stores both parent categories and child subcategories.
- `id`: `uuid` (primary key, default random)
- `parent_id`: `uuid` (self-referencing foreign key to `categories.id`, nullable)
- `name`: `text` (not null)
- `slug`: `text` (not null, unique)
- `is_parent`: `boolean` (default false)

### `companies` Table
The primary company entity.
- `id`: `uuid` (primary key)
- `name`: `text` (not null)
- `slug`: `text` (not null, unique)
- `website`: `text` (nullable)
- `phone`: `text` (nullable)
- `address`: `text` (nullable)
- `hq_city`: `text` (nullable)
- `hq_state_id`: `uuid` (foreign key to `states.id`)
- `hq_state_label`: `text` (denormalized state name for rendering convenience)
- `description`: `text` (nullable)
- `products`: `text[]` (nullable, array of products)
- `capabilities`: `text[]` (nullable, array of services/manufacturing capabilities)
- `industries_served`: `text[]` (nullable, array of target markets)
- `certifications`: `text[]` (nullable, array of standards like ISO 9001)
- `contact_email`: `text` (nullable)
- `avg_rating`: `numeric(3, 2)` (default 0)
- `review_count`: `integer` (default 0)
- `data_source`: `text` (default 'manual')
- `source_url`: `text` (nullable)
- `approved`: `boolean` (default false)
- `is_verified`: `boolean` (default false)

---

## 3. Scraper to Database Field Mappings

The data acquisition pipeline will collect fields from Google Maps and crawl the respective corporate websites. Below is the mapping from the scraper/crawler to the destination production database columns.

| Scraper/Crawler Source Field | Staging Column | Production Column | Data Type | Import Transformation & Validation |
| :--- | :--- | :--- | :--- | :--- |
| Google Maps Name | `company_name` | `companies.name` | `text` | Clean whitespace. Not Null constraint. |
| (Generated from Name) | `slug` | `companies.slug` | `text` | Lowercase, hyphenated slug (`abc-mfg`). Must be unique in DB. |
| Google Maps Website | `website` | `companies.website` | `text` | Normalize URL (e.g., lowercased, strip trailing slash). |
| Google Maps Phone | `phone` | `companies.phone` | `text` | Clean to numeric digits for matching/indexing. |
| Google Maps Address | `address` | `companies.address` | `text` | Raw full address string. |
| Google Maps City | `city` | `companies.hq_city` | `text` | Cleaned city name. |
| Google Maps State | `state_slug` | `companies.hq_state_id` | `uuid` | Match `state_slug` against `states.slug` to retrieve `id`. |
| Google Maps State Name | `state_name` | `companies.hq_state_label` | `text` | Store matched state name (e.g. "Texas"). |
| Google Maps Rating | `rating` | `companies.avg_rating` | `numeric` | Parse float value or default to `0`. |
| Google Maps Review Count | `reviews` | `companies.review_count` | `integer` | Parse integer value or default to `0`. |
| Google Maps Detail URL | `source_url` | `companies.source_url` | `text` | Store as audit source. |
| Web Crawl Email | `raw_email` | `companies.contact_email` | `text` | Extracted email address(es). |
| Web Crawl Description | `raw_description` | `companies.description` | `text` | Consolidated clean company text. |
| Web Crawl Products | `raw_products` | `companies.products` | `text[]` | Parsed array of products. |
| Web Crawl Services | `raw_services` | `companies.capabilities` | `text[]` | Parsed array of services/manufacturing capabilities. |
| Web Crawl Industries | `raw_industries` | `companies.industries_served`| `text[]` | Parsed array of industries served. |
| Web Crawl Certifications | `raw_certifications`| `companies.certifications` | `text[]` | Parsed array of certs (ISO, UL, AS9100). |
| Constant ('google_maps') | `source` | `companies.data_source` | `text` | Hardcoded source identification tag. |
| Constant (false) | N/A | `companies.approved` | `boolean` | Requires human verification before publishing. |

---

## 4. Junction Table Insertion
For each imported company, a new row must be inserted into the many-to-many junction table `company_categories`:
- `company_id`: UUID of the newly inserted company.
- `category_id`: UUID of the matched subcategory/category slug in `categories`.
