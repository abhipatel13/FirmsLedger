#!/usr/bin/env python3
import sys
import os
import time
import signal
import subprocess
import json
import random

# List of all 50 US States
STATE_NAMES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

# Mapping of categories and keywords to search
CATEGORIES = [
    {"slug": "plastics-packaging", "terms": ["Plastic Packaging Manufacturer", "Plastics Molding"]},
    {"slug": "metal-fabrication", "terms": ["Metal Fabrication", "Sheet Metal Fabricator"]},
    {"slug": "automotive-parts", "terms": ["Automotive Parts Manufacturer", "Auto Parts Mfg"]},
    {"slug": "textile-apparel", "terms": ["Textile Manufacturer", "Apparel Manufacturer"]},
    {"slug": "furniture-woodworking", "terms": ["Furniture Manufacturer", "Woodworking Manufacturer"]},
    {"slug": "medical-devices", "terms": ["Medical Device Manufacturer"]},
    {"slug": "electrical-components", "terms": ["Electrical Components Manufacturer", "Electronic Components Mfg"]},
    {"slug": "electronics-semiconductor", "terms": ["Semiconductor Manufacturer", "Electronics Manufacturer"]},
    {"slug": "solar-panels", "terms": ["Solar Panel Manufacturer"]},
    {"slug": "switchgear", "terms": ["Switchgear Manufacturer"]},
    {"slug": "food-beverage-processing", "terms": ["Food Processing Equipment", "Food Manufacturer"]},
    {"slug": "electrical-wire-cable", "terms": ["Electrical Wire Manufacturer", "Cable Manufacturer"]},
    {"slug": "semiconductor-chips", "terms": ["Microchip Manufacturer", "Semiconductor Chips Manufacturer"]}
]

keep_running = True

def handle_sigint(signum, frame):
    global keep_running
    print("\n[!] Received stop signal (SIGINT). Finishing up current query and stopping cleanly...")
    keep_running = False

signal.signal(signal.SIGINT, handle_sigint)

def load_completed_queries(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def mark_query_completed(filepath, query):
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(f"{query}\n")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Continuous Scraper Worker")
    parser.add_argument("--worker-id", type=int, default=1, help="Worker ID (1-based)")
    parser.add_argument("--total-workers", type=int, default=1, help="Total number of workers")
    args = parser.parse_args()

    # Worker-specific paths
    completed_file = f"pipeline/completed_queries_w{args.worker_id}.txt"
    staged_db = f"pipeline/staging_w{args.worker_id}.db"
    staged_csv = f"pipeline/staged_companies_w{args.worker_id}.csv"
    staged_json = f"pipeline/staged_companies_w{args.worker_id}.json"
    existing_companies_json = f"pipeline/existing_companies_w{args.worker_id}.json"

    print("=" * 60)
    print(f"      FirmsLedger Continuous Data Enrichment Pipeline - Worker {args.worker_id}/{args.total_workers}")
    print("=" * 60)
    print("[*] Press Ctrl+C at any time to request a clean stop.")
    
    completed = load_completed_queries(completed_file)
    print(f"[*] Loaded {len(completed)} previously completed queries for worker {args.worker_id}.")
    
    # Generate all query combinations
    all_combinations = []
    for cat in CATEGORIES:
        for term in cat["terms"]:
            for state in STATE_NAMES:
                query_str = f"{term} {state}"
                all_combinations.append({
                    "query": query_str,
                    "slug": cat["slug"]
                })
                
    # Shuffle queue using a fixed seed so all workers generate the exact same order
    random.seed(42)
    random.shuffle(all_combinations)

    # Filter queue to only process every Nth query based on worker_id
    query_queue = [item for idx, item in enumerate(all_combinations) if idx % args.total_workers == (args.worker_id - 1)]
    print(f"[*] Partitioned queue: Worker {args.worker_id} will process {len(query_queue)} of the total {len(all_combinations)} queries.")
    
    # 1. Startup fetch of existing PostgreSQL companies
    print("[*] Performing startup fetch of existing companies from production PostgreSQL...")
    try:
        import subprocess
        subprocess.run(["node", "pipeline/fetch_existing.cjs", existing_companies_json], check=True)
    except Exception as e:
        print(f"[!] Warning: Could not run startup fetch_existing.cjs: {e}")
        
    total_new_imported = 0
    
    for idx, item in enumerate(query_queue):
        if not keep_running:
            break
            
        query = item["query"]
        slug = item["slug"]
        
        if query in completed:
            continue
            
        print("\n" + "-" * 50)
        print(f"[*] [{idx+1}/{len(query_queue)}] Starting query: '{query}'")
        print(f"[*] Category: {slug}")
        print("-" * 50)
        
        # 2. Run the discovery & crawl pipeline
        cmd_pipeline = [
            sys.executable, "-u", "pipeline/run_pipeline.py",
            "--queries", query,
            "--category-slug", slug,
            "--max-per-query", "25",
            "--db-path", staged_db,
            "--csv-path", staged_csv,
            "--json-path", staged_json,
            "--existing-companies-path", existing_companies_json,
            "--skip-fetch"
        ]
        
        try:
            res = subprocess.run(cmd_pipeline, check=True)
        except subprocess.CalledProcessError as e:
            print(f"[!] Error running pipeline for query '{query}': {e}")
            continue
            
        # 2. Check if there are staged companies to import
        has_staged = False
        if os.path.exists(staged_json):
            try:
                with open(staged_json, "r", encoding="utf-8") as f:
                    records = json.load(f)
                    has_staged = len(records) > 0
                    print(f"[+] Found {len(records)} unique non-duplicate staged companies.")
            except Exception as e:
                print(f"[!] Warning: Could not parse staged_json: {e}")
                
        # 4. Import if staged records found
        if has_staged:
            print("[*] Importing clean records to production PostgreSQL DB...")
            cmd_import = ["node", "pipeline/import_helper.cjs", "--commit", "--json", staged_json]
            try:
                subprocess.run(cmd_import, check=True)
                total_new_imported += len(records)
            except subprocess.CalledProcessError as e:
                print(f"[!] Error running import helper: {e}")
        else:
            print("[*] No new unique companies found for this query.")
            
        # 4. Mark query as completed
        mark_query_completed(completed_file, query)
        completed.add(query)
        
        # 5. Sleep between queries to avoid rate limiting
        sleep_time = random.randint(10, 20)
        print(f"[+] Query completed. Sleeping for {sleep_time} seconds before next run...")
        for s in range(sleep_time):
            if not keep_running:
                break
            time.sleep(1)
            
    print("\n" + "=" * 60)
    print(f"      Continuous Enrichment Run Finished / Stopped - Worker {args.worker_id}")
    print(f"      Total new unique companies imported: {total_new_imported}")
    print("=" * 60)
    
    if total_new_imported > 0:
        print("[*] Running final dated CSV export...")
        try:
            subprocess.run(["node", "pipeline/export_today_csv_dated.cjs"], check=True)
        except Exception as e:
            print(f"[!] Warning: Could not run final export: {e}")

if __name__ == "__main__":
    main()
