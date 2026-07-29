"""Test that staging.py compatibility is maintained with smart crawler output."""
import os
import tempfile

from pipeline.staging import StagingDatabase
from pipeline.crawler import CompanyWebsiteCrawler


def test_update_crawl_results_accepts_new_crawler_output():
    """Guards against the smart crawler's output shape breaking staging.py.

    Verifies that CompanyWebsiteCrawler().crawl_website("") (empty-result path)
    round-trips through StagingDatabase.update_crawl_results without error.
    """
    # Create temp SQLite database for this test
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    try:
        # Initialize staging database
        db = StagingDatabase(db_path=db_path)

        # Insert a test company record
        company_id = db.add_discovered_company({
            "source": "test",
            "source_url": "https://maps.google.com/test",
            "name": "Acme Mfg",
            "website": "https://acmemfg.com",
            "phone": "(555) 123-4567",
            "address": "123 Factory St",
            "city": "Cleveland",
            "state": "OH",
            "zip": "44101",
            "rating": 4.5,
            "reviews": 12,
            "google_category": "CNC Machining"
        })

        assert company_id is not None, "add_discovered_company should return a valid company_id"

        # Get empty crawl result (empty URL path)
        crawler = CompanyWebsiteCrawler()
        empty_crawl = crawler.crawl_website("")

        assert empty_crawl["crawl_status"] == "failed", "empty URL should return failed status"

        # Update staging record with crawl result — this must not raise an error
        db.update_crawl_results(company_id, empty_crawl)

        # Verify the update succeeded by retrieving the record
        conn = db._get_connection()
        row = conn.execute(
            "SELECT crawl_status, raw_description FROM staging_companies WHERE id = ?",
            (company_id,)
        ).fetchone()
        conn.close()

        assert row is not None, "Company record should exist after update"
        assert row["crawl_status"] == "failed", "Crawl status should be set to failed"
        assert row["raw_description"] == "", "Raw description should be empty string"

    finally:
        # Clean up temp database
        if os.path.exists(db_path):
            os.remove(db_path)


def test_deduplication_against_production_db():
    """Verifies that StagingDatabase.detect_duplicates checks duplicates against existing_companies.json."""
    import json
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    json_path = "pipeline/existing_companies.json"
    backup_path = "pipeline/existing_companies.json.bak"
    has_backup = False

    # Back up existing_companies.json if it exists
    if os.path.exists(json_path):
        os.rename(json_path, backup_path)
        has_backup = True

    try:
        # Create mock production DB data
        mock_production_data = [
            {
                "name": "Acme Manufacturing LLC",
                "website": "https://www.acme-mfg.com",
                "phone": "(555) 123-4567",
                "address": "123 Factory Rd, Cleveland, OH 44101"
            }
        ]
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(mock_production_data, f)

        # Initialize staging database
        db = StagingDatabase(db_path=db_path)

        # Add duplicate by Domain
        dup_domain_id = db.add_discovered_company({
            "name": "Acme Inc",
            "website": "https://acme-mfg.com/about",
            "phone": "",
            "address": "999 Another St",
            "city": "",
            "state": "",
            "zip": "",
            "google_category": ""
        })

        # Add duplicate by Phone
        dup_phone_id = db.add_discovered_company({
            "name": "Different Name",
            "website": "",
            "phone": "5551234567",
            "address": "999 Another St",
            "city": "",
            "state": "",
            "zip": "",
            "google_category": ""
        })

        # Add duplicate by Fuzzy Name + ZIP
        dup_fuzzy_id = db.add_discovered_company({
            "name": "Acme Manufacturing",
            "website": "",
            "phone": "",
            "address": "125 Factory Rd",
            "city": "Cleveland",
            "state": "OH",
            "zip": "44101",
            "google_category": ""
        })

        # Add unique company
        unique_id = db.add_discovered_company({
            "name": "Completely Unique Company",
            "website": "https://unique.com",
            "phone": "555-999-9999",
            "address": "777 Unique Blvd",
            "city": "Austin",
            "state": "TX",
            "zip": "78701",
            "google_category": ""
        })

        db.detect_duplicates()

        # Check import_status in database
        conn = db._get_connection()
        rows = {row["id"]: row["import_status"] for row in conn.execute("SELECT id, import_status FROM staging_companies")}
        conn.close()

        assert rows[dup_domain_id] == "duplicate"
        assert rows[dup_phone_id] == "duplicate"
        assert rows[dup_fuzzy_id] == "duplicate"
        assert rows[unique_id] == "ready"

    finally:
        # Clean up temp database and restore backup
        if os.path.exists(db_path):
            os.remove(db_path)
        if os.path.exists(json_path):
            os.remove(json_path)
        if has_backup:
            os.rename(backup_path, json_path)

