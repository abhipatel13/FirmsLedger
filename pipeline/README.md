# FirmsLedger Data Acquisition Pipeline

A self-contained data pipeline to discover USA manufacturing companies on Google Maps, crawl their websites, perform local duplicate checks, and import them into the production database.

---

## 1. Directory Structure

All pipeline components live inside the `pipeline/` directory:

```
pipeline/
├── README.md                 # This documentation file
├── requirements.txt          # Python dependencies
├── staging.db                # Local SQLite staging database (created on run)
├── scraper.py                # Playwright Google Maps scraper
├── crawler.py                # BeautifulSoup / requests website crawler
├── staging.py                # SQLite database and duplicate checking engine
├── run_pipeline.py           # Pipeline orchestrator (scrapes -> crawls -> dedups)
└── import_helper.cjs         # Node.js production DB importer
```

---

## 2. Requirements & Installation

The pipeline requires **Python 3** and **Node.js**.

### Python Setup
1. Create a virtual environment:
   ```bash
   python3 -m venv pipeline/.venv
   ```
2. Activate it and install dependencies:
   ```bash
   source pipeline/.venv/bin/activate
   pip install -r pipeline/requirements.txt
   playwright install chromium
   ```

---

## 3. How to Run the Pipeline

Run the orchestrator script using the Python virtual environment:

### Dry-Run Test (Scrapes 2 companies & crawls them)
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py --test-only
```

### Full Run (100+ Companies)
Generates queries for 6 major combinations of categories and states:
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py
```

### Crawl/Deduplicate Staged Only (Skip scraping Google Maps)
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py --skip-scrape
```

This generates two output files inside `pipeline/`:
- `pipeline/staged_companies.csv`
- `pipeline/staged_companies.json`

---

## 4. Staging Schema & Duplicate Checking

### SQLite Schema (`staging.db`)
Stores discovered details and crawling results before writing to PostgreSQL:
- `staging_companies`: Main record table. Holds company metadata, crawled website text/fields, and validation statuses.

### Duplicate Checking Engine
The duplicate detection logic in `pipeline/staging.py` runs three distinct checks:
1. **Domain Match**: Normalized website domain matches another record (e.g. `http://company.com` matches `https://www.company.com/about`).
2. **Phone Match**: Normalized phone digits match exactly.
3. **Fuzzy Name + Zip Code**: Cleaned company name matches above 85% similarity (using `difflib.SequenceMatcher`) AND is located in the same ZIP code.

---

## 5. Importing to Production (PostgreSQL)

Once the data is verified in `pipeline/staged_companies.json`, use the Node.js import helper:

### 1. Run Dry-Run Import (Default)
Safe run to preview the insert statements and matches:
```bash
node pipeline/import_helper.cjs
```

### 2. Commit to Production
```bash
node pipeline/import_helper.cjs --commit
```
This inserts ready companies into the `companies` table and resolves category/state UUID associations in the `company_categories` junction table.
