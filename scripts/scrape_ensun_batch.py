"""
FirmsLedger – Ensun.io BATCH Company Scraper
=============================================
Reads all category/country pairs from ensun-categories-report.csv,
scrapes every combination, and saves company profiles in Agency import format.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    # Scrape all categories (NEW ones only by default)
    python scripts/scrape_ensun_batch.py

    # Scrape all (including already-existing categories)
    python scripts/scrape_ensun_batch.py --all

    # Dry run — just show counts for every pair, no CSV
    python scripts/scrape_ensun_batch.py --dry-run

    # Limit to specific categories (comma-separated)
    python scripts/scrape_ensun_batch.py --only aviation,clothing,fertilizer

    # Resume: skip combos already scraped (default behaviour)
    # Delete scraped-data/ensun_{cat}_{country}.csv to re-scrape that pair

Output:
    scraped-data/ensun_{category}_{country}.csv   ← per-search raw data
    scraped-data/ensun_all_companies.csv          ← merged Agency import file
    scraped-data/ensun_batch_summary.csv          ← run log

Agency import fields:
    name, slug, hq_city, hq_state, hq_country, description,
    founded_year, team_size, logo_url, category, category_slug
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from playwright.async_api import async_playwright, Page
except ImportError:
    print("\n  ERROR: playwright not installed.")
    print("  Run:  pip install playwright && playwright install chromium\n")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────

SCRIPT_DIR   = Path(__file__).parent
PROJECT_DIR  = SCRIPT_DIR.parent
CATEGORIES_CSV = PROJECT_DIR / "scraped-data" / "ensun-categories-report.csv"
OUTPUT_DIR   = PROJECT_DIR / "scraped-data"
ALL_CSV      = OUTPUT_DIR / "ensun_all_companies.csv"
SUMMARY_CSV  = OUTPUT_DIR / "ensun_batch_summary.csv"

BASE_URL = "https://ensun.io/search"

# ── Top countries to use when category lists "Global" ────────────────────────
# Picked from the most-represented countries across ensun.io categories

GLOBAL_COUNTRIES = [
    "united-states",
    "germany",
    "united-kingdom",
    "india",
    "china",
    "canada",
    "australia",
    "france",
    "netherlands",
    "italy",
]

# ── Delays ────────────────────────────────────────────────────────────────────

PAGE_DELAY     = 3.0   # seconds between pagination clicks
SEARCH_DELAY   = 5.0   # seconds between different searches
MAX_PAGES      = 100   # safety cap per search
DEFAULT_LIMIT  = 10    # companies per search (1 page = 10)

# ── Country slug normaliser ───────────────────────────────────────────────────

COUNTRY_SLUG_MAP = {
    "usa": "united-states",
    "u.s.": "united-states",
    "us": "united-states",
    "uk": "united-kingdom",
    "u.k.": "united-kingdom",
    "uae": "united-arab-emirates",
    "czechia": "czechia",
    "czech republic": "czechia",
    "south korea": "south-korea",
    "new zealand": "new-zealand",
    "saudi arabia": "saudi-arabia",
    "south africa": "south-africa",
}


def country_to_slug(country: str) -> str:
    c = country.strip().lower()
    return COUNTRY_SLUG_MAP.get(c, c.replace(" ", "-"))


def slugify(text: str) -> str:
    """Convert any string to a URL-safe slug."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


# ── Category list reader ──────────────────────────────────────────────────────

def load_categories(only_new: bool = True, only_slugs: Optional[list[str]] = None) -> list[dict]:
    """
    Read ensun-categories-report.csv and return list of:
      { slug, name, parent, countries: [slug, ...] }
    """
    if not CATEGORIES_CSV.exists():
        print(f"  ERROR: {CATEGORIES_CSV} not found.")
        print("  Run:  node scripts/generate-ensun-excel.cjs  first.")
        sys.exit(1)

    results = []
    with open(CATEGORIES_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            status = row.get("Status", "").strip().upper()
            if only_new and status != "NEW":
                continue

            cat_slug = row.get("Slug", "").strip()
            cat_name = row.get("Category", "").strip()
            parent   = row.get("Parent Group", "").strip()
            countries_raw = row.get("Countries (from ensun.io)", "").strip()

            if not cat_slug:
                continue

            if only_slugs and cat_slug not in only_slugs:
                continue

            # Parse countries
            if countries_raw.lower() == "global":
                country_slugs = GLOBAL_COUNTRIES
            else:
                country_slugs = [
                    country_to_slug(c.strip())
                    for c in countries_raw.split(",")
                    if c.strip()
                ]

            results.append({
                "slug":      cat_slug,
                "name":      cat_name,
                "parent":    parent,
                "countries": country_slugs,
                "status":    status,
            })

    return results


# ── DOM extractor (same as single scraper) ────────────────────────────────────

async def extract_company_cards(page: Page) -> list[dict]:
    return await page.evaluate("""
        () => {
            const companies = [];
            const cards = Array.from(document.querySelectorAll('.MuiPaper-root'));

            for (const card of cards) {
                const text = card.innerText || '';
                if (!text.includes('Employees') && !text.includes('employees')) continue;
                if (text.includes('Result configuration')) continue;

                const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
                if (lines.length < 4) continue;
                if (lines[0] === 'Filter') continue;

                const logoImg = card.querySelector('img[alt]');
                const logoAlt = logoImg ? logoImg.alt : '';
                const nameFromLogo = logoAlt.replace(/['\\u2019]s Logo$/, '').trim();
                const name = nameFromLogo || lines[0];
                if (!name) continue;

                const location  = lines[1] || '';
                const rating    = (lines[2] || '').length === 1 ? lines[2] : '';
                const employees = (lines[3] || '').includes('Employees') ? lines[3] : '';
                const founded   = /^\\d{4}$/.test(lines[4] || '') ? lines[4] : '';

                let description = '';
                const ktIdx = lines.findIndex(l => l === 'Key takeaway');
                if (ktIdx !== -1 && lines[ktIdx + 1]) description = lines[ktIdx + 1];

                // Parse city + country from "City, Country" or "City, State, Country"
                const locParts = location.split(',').map(s => s.trim());
                const city    = locParts[0] || '';
                const country = locParts[locParts.length - 1] || '';
                const state   = locParts.length >= 3 ? locParts[1] : '';

                companies.push({ name, city, state, country, employees, founded, rating, description });
            }
            return companies;
        }
    """)


async def get_total_count(page: Page) -> Optional[int]:
    text = await page.evaluate("document.body.innerText")
    for pattern in [r'(\d[\d,]+)\s+compan', r'Top\s+(\d[\d,]+)', r'Show\s+(\d[\d,]+)\s+result']:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return int(m.group(1).replace(',', ''))
    return None


# ── Single-search scraper ─────────────────────────────────────────────────────

async def scrape_one(
    page: Page,
    category_slug: str,
    country_slug: str,
    dry_run: bool = False,
    limit: int = DEFAULT_LIMIT,
) -> tuple[list[dict], Optional[int]]:
    url = f"{BASE_URL}/{category_slug}/{country_slug}"
    await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    await asyncio.sleep(PAGE_DELAY)

    total = await get_total_count(page)

    if dry_run:
        return [], total

    all_companies: list[dict] = []
    seen: set[str] = set()
    page_num = 1

    while True:
        await asyncio.sleep(1.5)
        batch = await extract_company_cards(page)

        for c in batch:
            if c['name'] not in seen:
                seen.add(c['name'])
                all_companies.append(c)
            if limit and len(all_companies) >= limit:
                break

        print(f"    Page {page_num}: {len(all_companies)}/{limit} collected")

        # Stop once we have enough
        if limit and len(all_companies) >= limit:
            break

        if MAX_PAGES and page_num >= MAX_PAGES:
            break

        next_btn = await page.query_selector(f"button:text-is('{page_num + 1}')")
        if not next_btn:
            next_btn = await page.query_selector("[aria-label='Go to next page']")
        if not next_btn:
            break

        disabled = await next_btn.get_attribute("disabled")
        if disabled is not None:
            break

        await next_btn.scroll_into_view_if_needed()
        await next_btn.click()
        await asyncio.sleep(PAGE_DELAY)
        page_num += 1

    return all_companies[:limit] if limit else all_companies, total


# ── CSV I/O ───────────────────────────────────────────────────────────────────

PER_SEARCH_FIELDS = ["name", "city", "state", "country", "employees", "founded", "rating", "description"]

AGENCY_FIELDS = [
    "name", "slug", "hq_city", "hq_state", "hq_country",
    "description", "founded_year", "team_size", "logo_url",
    "category", "category_slug", "parent_group",
]


def per_search_path(category_slug: str, country_slug: str) -> Path:
    return OUTPUT_DIR / f"ensun_{category_slug}_{country_slug}.csv"


def save_per_search(companies: list[dict], category_slug: str, country_slug: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = per_search_path(category_slug, country_slug)
    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=PER_SEARCH_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(companies)
    return out


def company_to_agency_row(c: dict, cat: dict) -> dict:
    name = c.get("name", "").strip()
    return {
        "name":         name,
        "slug":         slugify(name),
        "hq_city":      c.get("city", ""),
        "hq_state":     c.get("state", ""),
        "hq_country":   c.get("country", ""),
        "description":  c.get("description", ""),
        "founded_year": c.get("founded", ""),
        "team_size":    c.get("employees", "").replace(" Employees", "").replace(" employees", ""),
        "logo_url":     (
            f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}"
            f"&background=4F46E5&color=fff&size=200&bold=true"
        ),
        "category":     cat.get("name", ""),
        "category_slug": cat.get("slug", ""),
        "parent_group": cat.get("parent", ""),
    }


def append_to_all_csv(rows: list[dict]):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    exists = ALL_CSV.exists()
    with open(ALL_CSV, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=AGENCY_FIELDS, extrasaction="ignore")
        if not exists:
            w.writeheader()
        w.writerows(rows)


def log_summary(cat_slug: str, country_slug: str, total_on_site: Optional[int], scraped: int, status: str):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    exists = SUMMARY_CSV.exists()
    with open(SUMMARY_CSV, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["date", "category", "country", "total_on_site", "scraped", "status", "url"],
        )
        if not exists:
            w.writeheader()
        w.writerow({
            "date":         datetime.now().strftime("%Y-%m-%d %H:%M"),
            "category":     cat_slug,
            "country":      country_slug,
            "total_on_site": total_on_site or "unknown",
            "scraped":      scraped,
            "status":       status,
            "url":          f"{BASE_URL}/{cat_slug}/{country_slug}",
        })


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(
        description="Batch scrape all ensun.io category/country combos",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--all", action="store_true",
                        help="Include EXISTS categories (default: NEW only)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print result counts only, do not save CSV")
    parser.add_argument("--only",
                        help="Comma-separated category slugs to run (e.g. aviation,clothing)")
    parser.add_argument("--show-browser", action="store_true",
                        help="Show the browser window")
    parser.add_argument("--resume", action="store_true", default=True,
                        help="Skip already-scraped pairs (default: on)")
    parser.add_argument("--no-resume", dest="resume", action="store_false",
                        help="Re-scrape all pairs even if CSV already exists")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT,
                        help=f"Max companies per search page (default: {DEFAULT_LIMIT}). Use 0 for no limit.")
    args = parser.parse_args()

    only_slugs = [s.strip() for s in args.only.split(",")] if args.only else None
    categories = load_categories(only_new=not args.all, only_slugs=only_slugs)

    # Build flat list of (category, country_slug) pairs
    pairs: list[tuple[dict, str]] = []
    for cat in categories:
        for country in cat["countries"]:
            pairs.append((cat, country))

    print("\n" + "=" * 65)
    print("  Ensun.io BATCH Scraper — FirmsLedger")
    print("=" * 65)
    limit = args.limit
    print(f"  Categories loaded : {len(categories)}")
    print(f"  Total pairs       : {len(pairs)}")
    print(f"  Companies/page    : {limit if limit else 'unlimited'}")
    if args.dry_run:
        print("  Mode              : DRY RUN (counts only)")
    if args.resume and not args.dry_run:
        already = sum(1 for cat, ctr in pairs if per_search_path(cat['slug'], ctr).exists())
        print(f"  Already scraped   : {already} (will skip)")
    print("=" * 65)

    grand_total = 0
    skipped = 0
    errors = 0

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

        for i, (cat, country_slug) in enumerate(pairs, 1):
            cat_slug = cat["slug"]
            label = f"[{i}/{len(pairs)}] {cat_slug}/{country_slug}"

            # Resume: skip if already done
            if args.resume and not args.dry_run and per_search_path(cat_slug, country_slug).exists():
                print(f"\n  {label}  → SKIPPED (already scraped)")
                skipped += 1
                log_summary(cat_slug, country_slug, None, 0, "skipped")
                continue

            print(f"\n  {label}")

            page = await context.new_page()
            try:
                companies, total = await scrape_one(
                    page, cat_slug, country_slug, dry_run=args.dry_run, limit=limit
                )
            except Exception as e:
                print(f"    ERROR: {e}")
                await page.close()
                errors += 1
                log_summary(cat_slug, country_slug, None, 0, f"error: {e}")
                await asyncio.sleep(SEARCH_DELAY)
                continue

            await page.close()

            count_str = str(total) if total else "unknown"

            if args.dry_run:
                print(f"    Total on site: {count_str}")
                log_summary(cat_slug, country_slug, total, 0, "dry-run")
            elif companies:
                save_per_search(companies, cat_slug, country_slug)
                agency_rows = [company_to_agency_row(c, cat) for c in companies]
                append_to_all_csv(agency_rows)
                log_summary(cat_slug, country_slug, total, len(companies), "ok")
                grand_total += len(companies)
                print(f"    Saved {len(companies)}/{count_str}  →  ensun_{cat_slug}_{country_slug}.csv")
            else:
                print(f"    No companies found  (site total: {count_str})")
                log_summary(cat_slug, country_slug, total, 0, "empty")

            # Polite delay between searches
            if i < len(pairs):
                await asyncio.sleep(SEARCH_DELAY)

        await context.close()
        await browser.close()

    # ── Final summary ─────────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  BATCH COMPLETE")
    print("=" * 65)
    print(f"  Pairs processed : {len(pairs)}")
    print(f"  Skipped         : {skipped}")
    print(f"  Errors          : {errors}")
    if not args.dry_run:
        print(f"  Companies saved : {grand_total}")
        print(f"  Master CSV      : {ALL_CSV}")
    print(f"  Run log         : {SUMMARY_CSV}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
