import sys
import os
import argparse

# Ensure current directory is in search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper import GoogleMapsScraper
from crawler import CompanyWebsiteCrawler
from staging import StagingDatabase

def main():
    parser = argparse.ArgumentParser(description="FirmsLedger Data Acquisition Pipeline")
    parser.add_argument("--test-only", action="store_true", help="Run a quick 2-company test")
    parser.add_argument("--skip-scrape", action="store_true", help="Skip scraping and crawl/deduplicate existing database entries")
    args = parser.parse_args()

    # Initialize components
    db = StagingDatabase()
    crawler = CompanyWebsiteCrawler()
    
    # 1. Company Discovery Phase (Scraping)
    if not args.skip_scrape:
        scraper = GoogleMapsScraper(headless=True)
        
        # Test queries
        if args.test_only:
            queries = ["PCB Manufacturer Dallas Texas"]
            max_per_query = 2
        else:
            # 6 target search combinations (approx. 20 results each = 120 total candidates)
            queries = [
                "PCB Manufacturer Texas",
                "CNC Machining Ohio",
                "Metal Fabrication Michigan",
                "Injection Molding California",
                "Electrical Components Illinois",
                "Plastic Manufacturer Texas"
            ]
            max_per_query = 20

        print(f"[*] Starting Discovery Scraper over {len(queries)} queries...")
        for query in queries:
            try:
                scraped_data = scraper.scrape_query(query, max_results=max_per_query)
                for item in scraped_data:
                    # Add target subcategory/category tag hints for import step
                    if "PCB" in query:
                        item["google_category"] = "pcb-manufacturing"
                    elif "CNC" in query:
                        item["google_category"] = "cnc-machining"
                    elif "Metal" in query:
                        item["google_category"] = "sheet-metal-fabrication"
                    elif "Molding" in query:
                        item["google_category"] = "injection-molding"
                    elif "Electrical" in query:
                        item["google_category"] = "electrical-components"
                    elif "Plastic" in query:
                        item["google_category"] = "plastics-packaging"
                        
                    db.add_discovered_company(item)
            except Exception as e:
                print(f"[!] Error processing query '{query}': {e}")
                
    # 2. Crawler Phase (Enrichment)
    print("\n[*] Starting Crawler Phase...")
    pending_crawls = db.get_pending_crawl_companies()
    print(f"[*] Found {len(pending_crawls)} websites pending crawl.")
    
    for idx, row in enumerate(pending_crawls):
        company_id = row["id"]
        website = row["website"]
        print(f"[{idx+1}/{len(pending_crawls)}] Crawling website ID {company_id}: {website}")
        
        try:
            crawl_data = crawler.crawl_website(website)
            db.update_crawl_results(company_id, crawl_data)
        except Exception as e:
            print(f"  [!] Error crawling website {website}: {e}")
            db.update_crawl_results(company_id, {"crawl_status": "failed"})

    # 3. Deduplication & Cleanup Phase
    print("\n[*] Starting Deduplication Phase...")
    db.detect_duplicates()

    # 4. Export Clean Data to CSV
    print("\n[*] Exporting Staged Data...")
    db.export_to_csv()
    db.export_to_json()
    
    print("\n[+] Data acquisition pipeline run completed successfully.")

if __name__ == "__main__":
    main()
