"""
FirmsLedger – Free Business Email Collector
============================================
Searches DuckDuckGo for Indian businesses by category + city,
visits their websites, extracts publicly listed contact emails,
and saves to a CSV ready to upload to FirmsLedger campaigns.

Requirements:
    pip install requests beautifulsoup4

Usage:
    python collect_emails.py

Output:
    emails_output.csv  ← upload this to FirmsLedger
"""

pip install requests beautifulsoup4import requests
from bs4 import BeautifulSoup
import re
import csv
import time
import random
from urllib.parse import quote_plus, urljoin, urlparse

# ── Config ────────────────────────────────────────────────────────────────────

CATEGORIES = [
    "CA firm",
    "GST consultant",
    "chartered accountant",
    "legal services law firm",
    "PR agency",
    "business consulting firm",
    "content writing agency",
]

CITIES = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Pune",
    "Hyderabad",
    "Chennai",
    "Ahmedabad",
    "Gurgaon",
]

# How many search results to visit per (category + city) combo
RESULTS_PER_QUERY = 5

# Pause between requests so we don't get blocked
MIN_DELAY = 1.5  # seconds
MAX_DELAY = 3.5

OUTPUT_FILE = "emails_output.csv"

# Domains to skip (not real business emails)
SKIP_DOMAINS = {
    "example.com", "gmail.com", "yahoo.com", "hotmail.com",
    "sentry.io", "googleapis.com", "facebook.com", "twitter.com",
    "instagram.com", "youtube.com", "wixpress.com", "squarespace.com",
    "wordpress.com", "shopify.com", "w3.org", "schema.org",
    "cloudflare.com", "jsdelivr.net", "bootstrap.com",
}

EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,7}\b')

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def sleep():
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))


def duckduckgo_search(query: str, max_results: int = RESULTS_PER_QUERY) -> list[str]:
    """Return a list of URLs from DuckDuckGo HTML search."""
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        soup = BeautifulSoup(resp.text, "html.parser")
        urls = []
        for a in soup.select("a.result__url"):
            href = a.get("href", "").strip()
            if href and href.startswith("http"):
                parsed = urlparse(href)
                # Skip big directories (justdial, sulekha etc. often block scrapers)
                if any(d in parsed.netloc for d in ["duckduckgo", "google", "bing", "facebook", "linkedin"]):
                    continue
                urls.append(href)
                if len(urls) >= max_results:
                    break
        return urls
    except Exception as e:
        print(f"  Search error: {e}")
        return []


def get_contact_page_urls(base_url: str) -> list[str]:
    """Try to find a /contact or /about page on the site."""
    paths = ["/contact", "/contact-us", "/about", "/about-us", "/reach-us"]
    extras = []
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    for p in paths:
        extras.append(root + p)
    return [base_url] + extras


def extract_emails_from_html(html: str, site_domain: str) -> list[str]:
    """Pull emails from raw HTML, filter out junk."""
    raw = EMAIL_REGEX.findall(html)
    clean = set()
    for email in raw:
        email = email.lower().strip(".")
        domain = email.split("@")[-1]
        if domain in SKIP_DOMAINS:
            continue
        if domain == site_domain:
            clean.add(email)
        elif "." in domain and len(domain) > 4:
            # Accept any domain that looks real
            clean.add(email)
    return list(clean)


def fetch_emails_from_url(url: str) -> tuple[list[str], str]:
    """Fetch a URL and extract emails + company name."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        if resp.status_code != 200:
            return [], ""
        soup = BeautifulSoup(resp.text, "html.parser")

        # Try to get company name from title or og:site_name
        company_name = ""
        og = soup.find("meta", property="og:site_name")
        if og and og.get("content"):
            company_name = og["content"].strip()
        elif soup.title and soup.title.string:
            company_name = soup.title.string.strip().split("|")[0].split("-")[0].strip()

        domain = urlparse(url).netloc.replace("www.", "")
        emails = extract_emails_from_html(resp.text, domain)
        return emails, company_name
    except Exception:
        return [], ""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  FirmsLedger Email Collector")
    print("=" * 60)

    collected: list[dict] = []   # list of {email, company, category, city, source}
    seen_emails: set[str] = set()

    total_queries = len(CATEGORIES) * len(CITIES)
    query_num = 0

    for category in CATEGORIES:
        for city in CITIES:
            query_num += 1
            query = f"{category} {city} India contact email"
            print(f"\n[{query_num}/{total_queries}] Searching: {query}")

            urls = duckduckgo_search(query)
            print(f"  Found {len(urls)} URLs")

            for url in urls:
                print(f"  → {url[:70]}")
                pages_to_check = get_contact_page_urls(url)

                for page_url in pages_to_check:
                    emails, company = fetch_emails_from_url(page_url)
                    for email in emails:
                        if email not in seen_emails:
                            seen_emails.add(email)
                            collected.append({
                                "email":    email,
                                "company":  company,
                                "category": category,
                                "city":     city,
                                "source":   url,
                            })
                            print(f"    ✓ {email}  ({company})")
                    sleep()

            print(f"  Running total: {len(collected)} emails")
            sleep()

    # ── Save CSV ──────────────────────────────────────────────────────────────
    if collected:
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["email", "company", "category", "city", "source"])
            writer.writeheader()
            writer.writerows(collected)
        print(f"\n{'=' * 60}")
        print(f"  Done! Saved {len(collected)} emails to {OUTPUT_FILE}")
        print(f"  Upload this CSV to FirmsLedger Admin → Email Campaigns")
        print(f"{'=' * 60}")
    else:
        print("\n  No emails found. Try running again — search results vary.")


if __name__ == "__main__":
    main()
