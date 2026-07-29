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
