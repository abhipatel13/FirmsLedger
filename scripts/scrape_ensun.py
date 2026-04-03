"""
FirmsLedger – Ensun.io Company Scraper
=======================================
Scrapes company listings from https://ensun.io/search/{category}/{country}
Uses Playwright to render the JS SPA and navigate through pagination.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    # Single category + country
    python scripts/scrape_ensun.py --category aviation --country egypt

    # Multiple categories
    python scripts/scrape_ensun.py --category aviation clothing fertilizer --country egypt

    # Multiple countries per category
    python scripts/scrape_ensun.py --category aviation --country egypt germany usa

    # Just check result counts (no CSV saved)
    python scripts/scrape_ensun.py --category aviation --country egypt --dry-run

    # Show browser window (useful for debugging)
    python scripts/scrape_ensun.py --category aviation --country egypt --show-browser

Output:
    scraped-data/ensun_{category}_{country}.csv
    scraped-data/ensun_summary.csv  ← combined log of all runs
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from playwright.async_api import async_playwright, Page
except ImportError:
    print("\n  ERROR: playwright not installed.")
    print("  Run:  pip install playwright && playwright install chromium\n")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL = "https://ensun.io/search"
OUTPUT_DIR = Path(__file__).parent.parent / "scraped-data"

# Delay between page loads (seconds) — be polite to the server
PAGE_DELAY = 3.0

# Max pages to scrape per search (safety cap; 0 = no limit)
MAX_PAGES = 100

# Timeout waiting for page to settle (ms)
LOAD_TIMEOUT = 30_000


# ── Company card extractor ────────────────────────────────────────────────────

async def extract_company_cards(page: Page) -> list[dict]:
    """
    Extract all visible company cards from the current page.
    Each card structure (from DOM inspection):
      lines[0] = company name
      lines[1] = location (City, Country)
      lines[2] = rating (A/B/C/D)
      lines[3] = employee range
      lines[4] = founding year
      lines[5] = 'Key takeaway' (label, skip)
      lines[6] = description
    """
    return await page.evaluate("""
        () => {
            const companies = [];
            const cards = Array.from(document.querySelectorAll('.MuiPaper-root'));

            for (const card of cards) {
                const text = card.innerText || '';
                // Company cards always mention employees
                if (!text.includes('Employees') && !text.includes('employees')) continue;

                const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
                if (lines.length < 4) continue;

                // Skip the filter/sidebar panel
                if (lines[0] === 'Filter' || text.includes('Result configuration')) continue;

                // Logo img alt text contains company name + "'s Logo"
                const logoImg = card.querySelector('img[alt]');
                const logoAlt = logoImg ? logoImg.alt : '';
                const nameFromLogo = logoAlt.replace(/"'s Logo"$/, '').replace(/['\\u2019]s Logo$/, '').trim();

                const name = nameFromLogo || lines[0];
                if (!name) continue;

                // lines[1] = "City, Country"
                const location = lines[1] || '';

                // lines[2] = rating letter (single char A-F)
                const rating = (lines[2] || '').length === 1 ? lines[2] : '';

                // lines[3] = "XXX-YYY Employees" or "X+ Employees"
                const employees = (lines[3] || '').includes('Employees') ? lines[3] : '';

                // lines[4] = founding year (4 digits)
                const founded = /^\\d{4}$/.test(lines[4] || '') ? lines[4] : '';

                // lines[5] = 'Key takeaway' label — skip
                // lines[6] = actual description text
                let description = '';
                const keyTakeawayIdx = lines.findIndex(l => l === 'Key takeaway');
                if (keyTakeawayIdx !== -1 && lines[keyTakeawayIdx + 1]) {
                    description = lines[keyTakeawayIdx + 1];
                }

                companies.push({ name, location, rating, employees, founded, description });
            }

            return companies;
        }
    """)


# ── Total count extractor ─────────────────────────────────────────────────────

async def get_total_count(page: Page) -> Optional[int]:
    """Extract total company count shown on page (e.g. '45 companies for Aviation')."""
    import re
    text = await page.evaluate("document.body.innerText")
    patterns = [
        r'(\d[\d,]+)\s+companies?\s+for',
        r'Top\s+(\d[\d,]+)\s+',
        r'(\d[\d,]+)\s+compan',
        r'of\s+(\d[\d,]+)',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return int(m.group(1).replace(',', ''))
    return None


# ── Scraper ───────────────────────────────────────────────────────────────────

async def scrape_search(
    page: Page,
    category: str,
    country: str,
    dry_run: bool = False,
) -> tuple[list[dict], Optional[int]]:
    """
    Navigate through all pages of a search and return (companies, total_count).
    """
    url = f"{BASE_URL}/{category}/{country}"
    print(f"\n  URL: {url}")

    await page.goto(url, wait_until="domcontentloaded", timeout=LOAD_TIMEOUT)
    await asyncio.sleep(PAGE_DELAY)

    total_count = await get_total_count(page)
    if total_count:
        print(f"  Total: {total_count} companies")

    if dry_run:
        return [], total_count

    all_companies: list[dict] = []
    seen_names: set[str] = set()
    page_num = 1

    while True:
        await asyncio.sleep(1.5)
        batch = await extract_company_cards(page)

        new = 0
        for c in batch:
            if c['name'] and c['name'] not in seen_names:
                seen_names.add(c['name'])
                all_companies.append(c)
                new += 1

        print(f"  Page {page_num}: {len(batch)} cards, {new} new  (total so far: {len(all_companies)})")

        if MAX_PAGES and page_num >= MAX_PAGES:
            print(f"  Reached MAX_PAGES ({MAX_PAGES}). Stopping.")
            break

        # Find next page button — pagination shows numbered buttons
        # Look for the button after the currently active one
        next_page_num = page_num + 1
        next_btn = await page.query_selector(f"button:text-is('{next_page_num}')")

        if not next_btn:
            # Try aria-label
            next_btn = await page.query_selector("[aria-label='Go to next page'], [aria-label='next page']")

        if not next_btn:
            print("  No more pages.")
            break

        is_disabled = await next_btn.get_attribute("disabled")
        if is_disabled is not None:
            print("  Next page button is disabled.")
            break

        await next_btn.scroll_into_view_if_needed()
        await next_btn.click()
        await asyncio.sleep(PAGE_DELAY)
        page_num += 1

    return all_companies, total_count


# ── CSV writer ────────────────────────────────────────────────────────────────

FIELDNAMES = ["name", "location", "employees", "founded", "rating", "description"]


def save_csv(companies: list[dict], category: str, country: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / f"ensun_{category}_{country}.csv"
    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(companies)
    return out


def log_summary(category: str, country: str, total_on_site: Optional[int], scraped: int):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    summary = OUTPUT_DIR / "ensun_summary.csv"
    exists = summary.exists()
    with open(summary, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["date", "category", "country", "total_on_site", "scraped", "url"])
        if not exists:
            w.writeheader()
        w.writerow({
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "category": category,
            "country": country,
            "total_on_site": total_on_site if total_on_site else "unknown",
            "scraped": scraped,
            "url": f"{BASE_URL}/{category}/{country}",
        })


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(
        description="Scrape company listings from ensun.io",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--category", "-c", nargs="+", required=True,
                        help="Category slug(s) e.g. aviation clothing fertilizer")
    parser.add_argument("--country", "-C", nargs="+", required=True,
                        help="Country slug(s) e.g. egypt germany usa")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print result counts only, do not save CSV")
    parser.add_argument("--show-browser", action="store_true",
                        help="Show the browser window (for debugging)")
    args = parser.parse_args()

    pairs = [
        (cat.lower().replace(' ', '-'), ctr.lower().replace(' ', '-'))
        for cat in args.category
        for ctr in args.country
    ]

    print("\n" + "=" * 60)
    print("  Ensun.io Scraper — FirmsLedger")
    print("=" * 60)
    print(f"  Categories : {', '.join(args.category)}")
    print(f"  Countries  : {', '.join(args.country)}")
    print(f"  Pairs      : {len(pairs)}")
    if args.dry_run:
        print("  Mode       : DRY RUN (counts only)")
    print("=" * 60)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=not args.show_browser)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            viewport={"width": 1280, "height": 900},
        )

        for i, (category, country) in enumerate(pairs):
            page = await context.new_page()
            try:
                companies, total = await scrape_search(page, category, country, dry_run=args.dry_run)
            except Exception as e:
                print(f"\n  ERROR [{category}/{country}]: {e}")
                await page.close()
                log_summary(category, country, None, 0)
                continue

            await page.close()

            if args.dry_run:
                count_str = str(total) if total else "unknown"
                print(f"\n  [{category}/{country}] Total on site: {count_str}")
                log_summary(category, country, total, 0)
            elif companies:
                out = save_csv(companies, category, country)
                log_summary(category, country, total, len(companies))
                print(f"\n  Saved {len(companies)} companies → {out.name}")
            else:
                print(f"\n  No companies scraped for [{category}/{country}]")
                print("  Tip: run with --show-browser to debug visually")
                log_summary(category, country, total, 0)

            # Polite delay between searches
            if i < len(pairs) - 1:
                await asyncio.sleep(4)

        await context.close()
        await browser.close()

    print(f"\n  Summary log: {OUTPUT_DIR / 'ensun_summary.csv'}")
    print("  Done.\n")


if __name__ == "__main__":
    asyncio.run(main())
