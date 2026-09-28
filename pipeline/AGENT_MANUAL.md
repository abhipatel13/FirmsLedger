# FirmsLedger Data Pipeline: Agent Operations Manual

This document provides complete instructions for running the manufacturing data acquisition pipeline, understanding the duplicate prevention engine, and orchestrating parallel deduplication checks.

---

## 1. Pipeline Overview

The data acquisition pipeline discovered USA-based manufacturing companies via Google Maps, crawls their websites to extract rich capabilities/metadata, performs deduplication, and commits the clean records to the PostgreSQL production database.

```
+------------------------------------+
|  Google Maps Scraper (Playwright)  |  <-- crawler.py / scraper.py
+------------------------------------+
                  |
                  v
+------------------------------------+
|   Local SQLite Staging (staging.db)|  <-- staging.py
+------------------------------------+
                  |
                  v
+------------------------------------+
|     Duplicate Detection Engine     |  <-- staging.py (detect_duplicates)
|  Checks: Domain, Phone, Fuzzy Name |
+------------------------------------+
                  |
                  v
+------------------------------------+
|  PostgreSQL Production Importer   |  <-- import_helper.cjs --commit
+------------------------------------+
```

---

## 2. Setup and Requirements

The pipeline requires **Python 3** and **Node.js**.

### Virtual Environment & Dependencies
```bash
# Navigate to FirmsLedger directory
cd FirmsLedger

# Activate virtual environment
source pipeline/.venv/bin/activate

# Install dependencies (if not already installed)
pip install -r pipeline/requirements.txt
playwright install chromium
```

---

## 3. Daily Scraper Operations

To gather companies daily, choose one of the options below.

### Option A: Run Default Queries (Approx. 120 candidates)
Runs a pre-defined set of 6 queries covering main states and categories.
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py
```

### Option B: Run Specific Target Queries
Specify your own search query and results limit (e.g. for regional targeting):
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py --queries "CNC Machining Indiana" "Metal Fabrication Kentucky" --max-per-query 15
```

### Option C: Dry-Run / Testing (Scrapes 2 companies)
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py --test-only
```

---

## 4. Duplicate Prevention Mechanism

The deduplication engine matches candidates against both **other staged records in the batch** and **the existing production database** (local copy `pipeline/existing_companies.json` generated at run time).

It executes three criteria:
1. **Domain Match**: Compares normalized domains (e.g. `http://mfg-inc.com/about` resolves to `mfg-inc.com`).
2. **Phone Match**: Compares digits-only phone numbers (e.g., `+1 (123) 456-7890` matches `1234567890`).
3. **Fuzzy Name + Zip Code**: Compares normalized names using `difflib.SequenceMatcher` (threshold > 85% similarity) AND matches the first 5 digits of the ZIP code.

If any check matches, the record is marked `duplicate` in `staging.db` and is omitted from standard exports/imports. Unique records are marked `ready`.

---

## 5. Running Multiple Crawlers in Parallel (High-Throughput Mode)

To scale data collection quickly, you can run multiple crawler instances in parallel using `pipeline/run_continuous.py`. This script implements a multi-worker architecture that crawls and imports companies concurrently without generating duplicates or database lock conflicts.

### How Parallel Deduplication and Safety Work

1. **Queue Partitioning (No Query Overlaps)**:
   All combinations of states and categories are compiled into a master queue. When you start a worker, you specify `--worker-id` and `--total-workers`. The worker handles every $N$-th query (where $N = \text{total-workers}$).
   *For example, if you run 3 workers, Worker 1 processes index `0, 3, 6...`, Worker 2 processes `1, 4, 7...`, and Worker 3 processes `2, 5, 8...`.* This prevents multiple workers from searching the same term at the same time.

2. **Worker-Isolated Local Staging**:
   To prevent SQLite database lock contention (`database is locked` errors) and race conditions when writing JSON files, each worker is allocated its own file namespace based on its worker ID:
   - Staging DB: `pipeline/staging_w{worker_id}.db`
   - Staged JSON: `pipeline/staged_companies_w{worker_id}.json`
   - Staged CSV: `pipeline/staged_companies_w{worker_id}.csv`
   - Completed queries log: `pipeline/completed_queries_w{worker_id}.txt`
   - Local DB cache: `pipeline/existing_companies_w{worker_id}.json`

3. **Real-time Production Check (Anti-Duplicate Guarantee)**:
   Even if two workers discover the same company from different queries (e.g., Worker 1 finds a company under "Textile Manufacturer Georgia" and Worker 2 finds the same company under "Apparel Manufacturer Georgia"), duplicates are prevented at the time of commit:
   - Right before committing to the Neon PostgreSQL database, `pipeline/import_helper.cjs` connects to the live database.
   - It queries all existing company names and slugs in real-time.
   - It normalizes the names (removes punctuation, suffixes like LLC, Inc., Co., etc.) and matches slug/domains.
   - If a company matches any existing record, it is dynamically skipped in the insertion phase:
     ```javascript
     if (existingNames.has(normName)) {
       console.log(`  [skip-dup]   ${rec.company_name} (already in DB)`);
       continue;
     }
     ```
   This ensures that no duplicate records can ever be committed to the production database.

### How to Run 3 Parallel Workers

To start 3 parallel crawlers, open three separate terminal windows (or tmux panes) and run the following commands:

**Worker 1:**
```bash
./pipeline/.venv/bin/python pipeline/run_continuous.py --worker-id 1 --total-workers 3
```

**Worker 2:**
```bash
./pipeline/.venv/bin/python pipeline/run_continuous.py --worker-id 2 --total-workers 3
```

**Worker 3:**
```bash
./pipeline/.venv/bin/python pipeline/run_continuous.py --worker-id 3 --total-workers 3
```

Each worker will run continuously, saving its progress in its own `completed_queries_w{id}.txt` file so they can resume from where they left off if interrupted.

---

## 6. Periodic Staging Duplicate Check (Single-Worker Mode)

If you are running the scraper in single-worker mode (`run_pipeline.py`) over a very long query list, you can periodically clean up/mark duplicates in the background to keep the staging database fresh.

### Command to Run Deduplication Only
To run deduplication on the staging database without triggering new Playwright scraping sessions, use the `--skip-scrape` flag:
```bash
./pipeline/.venv/bin/python pipeline/run_pipeline.py --skip-scrape
```

### Automated Periodic Duplicate Checker Loop
You can start a lightweight background loop that updates the duplicate matches every 20 minutes:

```bash
# Run this in a separate terminal/screen/background session
while true; do
  echo "[*] [$(date)] Running scheduled duplicate check..."
  # 1. Fetch latest production database records to check against
  node pipeline/fetch_existing.cjs
  
  # 2. Run deduplication engine on SQLite staged records
  ./pipeline/.venv/bin/python -c "from pipeline.staging import StagingDatabase; db = StagingDatabase(); db.detect_duplicates()"
  
  echo "[+] Duplicate check completed. Waiting 20 minutes..."
  sleep 1200
done
```

---

## 7. DB Import and CSV Export

Once a batch completes or after background deduplication is done:

### 1. View / Validate Staged Candidates (Dry Run)
Check what would be imported:
```bash
node pipeline/import_helper.cjs
```

### 2. Commit to PostgreSQL
Write the non-duplicate entries to the production database:
```bash
node pipeline/import_helper.cjs --commit
```

### 3. Export Today's Companies to CSV
To export all companies added today into a file named with today's date (e.g. `companies_2026-07-31.csv`):
```bash
node pipeline/export_today_csv_dated.cjs
```
This generates the CSV in the following locations:
- `FirmsLedger/companies_YYYY-MM-DD.csv`
- `companies/companies_YYYY-MM-DD.csv` (main export folder)
