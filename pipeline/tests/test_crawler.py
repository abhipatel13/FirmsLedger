from unittest.mock import patch
from pipeline.crawler import CompanyWebsiteCrawler

HOMEPAGE_HTML = """
<html><head><title>Acme Mfg</title>
<meta name="description" content="Precision CNC manufacturer since 1987."></head>
<body>
<h1>Acme Manufacturing</h1>
<p>Acme is a leading provider of precision CNC machining founded in 1987.</p>
<a href="/about">About Us</a>
<a href="/capabilities">Capabilities</a>
<a href="/blog/news-1">Blog</a>
<a href="/privacy">Privacy Policy</a>
<a href="/contact">Contact</a>
<img src="/img/factory.jpg" alt="Factory floor" width="640" height="480">
</body></html>
"""

ABOUT_HTML = """
<html><head><title>About Acme</title></head>
<body><h1>About</h1><p>Acme is ISO 9001 certified and headquartered in Dayton, Ohio.</p>
<p>Contact: info@acmemfg.com</p></body></html>
"""

CAPABILITIES_HTML = """
<html><head><title>Capabilities</title></head>
<body><h1>Capabilities</h1>
<ul><li>CNC machining of aluminum components</li>
<li>Injection molding for automotive industries</li></ul>
</body></html>
"""

CONTACT_HTML = """
<html><head><title>Contact</title></head>
<body><h1>Contact</h1><p>Call us at (937) 555-0182 or email sales@acmemfg.com</p></body></html>
"""

PAGES_BY_URL = {
    "https://acmemfg.com": HOMEPAGE_HTML,
    "https://acmemfg.com/about": ABOUT_HTML,
    "https://acmemfg.com/capabilities": CAPABILITIES_HTML,
    "https://acmemfg.com/contact": CONTACT_HTML,
}


def _fake_fetch(self, url):
    return PAGES_BY_URL.get(url)


def test_crawl_website_returns_empty_result_for_blank_url():
    crawler = CompanyWebsiteCrawler()
    result = crawler.crawl_website("")
    assert result["crawl_status"] == "failed"
    assert result["raw_description"] == ""


@patch.object(CompanyWebsiteCrawler, "_fetch_url", _fake_fetch)
def test_crawl_website_prioritizes_high_value_pages_over_blog():
    crawler = CompanyWebsiteCrawler(max_pages=3)
    result = crawler.crawl_website("https://acmemfg.com")
    crawled_urls = [p["url"] for p in result["pages"]]
    assert "https://acmemfg.com" in crawled_urls
    assert not any("blog" in u for u in crawled_urls)
    assert not any("privacy" in u for u in crawled_urls)
    assert len(crawled_urls) <= 3


@patch.object(CompanyWebsiteCrawler, "_fetch_url", _fake_fetch)
def test_crawl_website_aggregates_manufacturing_fields():
    crawler = CompanyWebsiteCrawler(max_pages=4)
    result = crawler.crawl_website("https://acmemfg.com")
    assert result["crawl_status"] == "success"
    assert "1987" in result["years_in_business"] or result["years_in_business"] == "1987"
    assert "ISO9001" in result["raw_certifications"]
    assert any("Dayton" in loc for loc in result["locations"])
    assert "sales@acmemfg.com" in result["raw_email"] or result["raw_email"] != ""


@patch.object(CompanyWebsiteCrawler, "_fetch_url", _fake_fetch)
def test_crawl_website_legacy_keys_still_present():
    crawler = CompanyWebsiteCrawler(max_pages=4)
    result = crawler.crawl_website("https://acmemfg.com")
    for key in ("raw_description", "raw_products", "raw_services", "raw_industries",
                "raw_certifications", "raw_email", "social_links", "images", "crawl_status"):
        assert key in result


@patch.object(CompanyWebsiteCrawler, "_fetch_url", lambda self, url: None)
def test_crawl_website_returns_failed_status_when_homepage_unreachable():
    crawler = CompanyWebsiteCrawler()
    result = crawler.crawl_website("https://unreachable-example.test")
    assert result["crawl_status"] == "failed"
