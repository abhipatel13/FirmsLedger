"""
FirmsLedger – Ensun CSV → Supabase Importer
============================================
Reads scraped-data/ensun_full_companies.csv and inserts companies into:
  - agencies table
  - agency_categories junction table

Requirements:
    pip install supabase python-dotenv

Usage:
    python scripts/import_ensun_to_supabase.py
    python scripts/import_ensun_to_supabase.py --dry-run       # preview only
    python scripts/import_ensun_to_supabase.py --limit 500     # first 500 rows
    python scripts/import_ensun_to_supabase.py --resume        # skip already-imported slugs
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: python-dotenv not installed. Run: pip install python-dotenv")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase not installed. Run: pip install supabase")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
CSV_PATH = ROOT / "scraped-data" / "ensun_full_companies.csv"
PROGRESS_PATH = ROOT / "scraped-data" / "ensun_import_progress.csv"
ENV_PATH = ROOT / ".env"

# ── Config ────────────────────────────────────────────────────────────────────

BATCH_SIZE = 50          # rows to process before a brief pause
DELAY_BETWEEN_BATCHES = 1.0  # seconds


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_json_field(value: str) -> list:
    """Parse a JSON array string like '["a","b"]' → ['a','b']. Returns [] on failure."""
    if not value or value.strip() in ("", "[]"):
        return []
    try:
        result = json.loads(value)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, ValueError):
        return []


def safe_int(value: str) -> int | None:
    try:
        return int(value.strip()) if value and value.strip() else None
    except (ValueError, AttributeError):
        return None


def load_progress() -> set[str]:
    """Return set of agency slugs already imported."""
    if not PROGRESS_PATH.exists():
        return set()
    done: set[str] = set()
    with open(PROGRESS_PATH, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            done.add(row["slug"])
    return done


def record_progress(slug: str, status: str):
    exists = PROGRESS_PATH.exists()
    with open(PROGRESS_PATH, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["slug", "status"])
        if not exists:
            w.writeheader()
        w.writerow({"slug": slug, "status": status})


def make_unique_slug(base_slug: str, existing: set[str]) -> str:
    slug = base_slug
    i = 2
    while slug in existing:
        slug = f"{base_slug}-{i}"
        i += 1
    existing.add(slug)
    return slug


# ── Category cache ────────────────────────────────────────────────────────────

def load_category_map(supabase: Client) -> dict[str, str]:
    """Returns {slug: id} for all categories in the database (handles pagination)."""
    print("  Loading categories from database...")
    cat_map: dict[str, str] = {}
    page_size = 1000
    offset = 0
    while True:
        result = (
            supabase.table("categories")
            .select("id,slug")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        rows = result.data or []
        for row in rows:
            cat_map[row["slug"]] = row["id"]
        if len(rows) < page_size:
            break
        offset += page_size
    print(f"  Loaded {len(cat_map)} categories.")
    return cat_map


# ── Import one row ────────────────────────────────────────────────────────────

def import_row(
    supabase: Client,
    row: dict,
    category_map: dict[str, str],
    known_slugs: set[str],
    dry_run: bool,
) -> str:
    """
    Import one CSV row. Returns: 'inserted', 'skipped', or 'error'.
    """
    name = row.get("name", "").strip()
    if not name:
        return "skipped"

    base_slug = row.get("slug", "").strip()
    category_slug = row.get("category_slug", "").strip()

    # Resolve category
    category_id = category_map.get(category_slug)
    if not category_id:
        # Try parent-only lookup (e.g. "automotive-glass" → "automotive")
        parent = category_slug.split("-")[0] if category_slug else ""
        category_id = category_map.get(parent)

    services_offered = parse_json_field(row.get("services_offered", ""))
    industries_served = parse_json_field(row.get("industries_served", ""))

    agency_slug = make_unique_slug(base_slug or name.lower().replace(" ", "-")[:60], known_slugs)

    agency_payload = {
        "name": name,
        "slug": agency_slug,
        "description": row.get("description") or None,
        "logo_url": row.get("logo_url") or None,
        "website": row.get("website") or None,
        "hq_city": row.get("hq_city") or None,
        "hq_state": row.get("hq_state") or None,
        "hq_country": row.get("hq_country") or None,
        "founded_year": safe_int(row.get("founded_year", "")),
        "team_size": row.get("team_size") or None,
        "pricing_model": row.get("pricing_model") or None,
        "min_project_size": row.get("min_project_size") or None,
        "services_offered": services_offered if services_offered else None,
        "industries_served": industries_served if industries_served else None,
        "client_focus": {
            "small": safe_int(row.get("client_focus_small", "")) or 33,
            "medium": safe_int(row.get("client_focus_medium", "")) or 34,
            "large": safe_int(row.get("client_focus_large", "")) or 33,
        },
        "service_focus": parse_json_field(row.get("service_focus", "")) or None,
        "approved": True,
        "verified": False,
        "featured": False,
        "remote_support": False,
    }

    if dry_run:
        cat_status = f"cat={category_id[:8]}..." if category_id else "cat=NOT FOUND"
        print(f"    [DRY RUN] {name[:50]:<50} | slug={agency_slug:<40} | {cat_status}")
        return "dry_run"

    try:
        res = supabase.table("agencies").insert(agency_payload).execute()
        if not res.data:
            return "error"
        agency_id = res.data[0]["id"]
    except Exception as e:
        err = str(e)
        if "duplicate" in err.lower() or "unique" in err.lower():
            return "skipped"
        print(f"    ERROR inserting {name}: {e}")
        return "error"

    # Link to category
    if category_id and agency_id:
        try:
            supabase.table("agency_categories").insert({
                "agency_id": agency_id,
                "category_id": category_id,
            }).execute()
        except Exception:
            pass  # junction insert fail is non-fatal

    return "inserted"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import ensun CSV into Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not insert")
    parser.add_argument("--limit", type=int, default=0, help="Max rows to process (0 = all)")
    parser.add_argument("--resume", action="store_true", default=True,
                        help="Skip slugs already in progress log (default: on)")
    parser.add_argument("--no-resume", dest="resume", action="store_false",
                        help="Re-process all rows even if previously imported")
    args = parser.parse_args()

    # Load env
    load_dotenv(ENV_PATH)
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env")
        sys.exit(1)

    supabase: Client = create_client(url, key)

    if not CSV_PATH.exists():
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    print("\n" + "=" * 65)
    print("  Ensun → Supabase Importer  —  FirmsLedger")
    print("=" * 65)
    if args.dry_run:
        print("  Mode: DRY RUN (nothing will be inserted)")
    print(f"  CSV : {CSV_PATH}")
    print()

    category_map = load_category_map(supabase)

    # Load already-done slugs from DB to avoid duplicate slug collisions
    print("  Loading existing agency slugs from database...")
    known_slugs: set[str] = set()
    pg_size = 1000
    pg_off = 0
    while True:
        er = supabase.table("agencies").select("slug").range(pg_off, pg_off + pg_size - 1).execute()
        for r in (er.data or []):
            known_slugs.add(r["slug"])
        if len(er.data or []) < pg_size:
            break
        pg_off += pg_size
    print(f"  {len(known_slugs)} existing agencies found.")

    # Progress log (CSV-based)
    done_slugs: set[str] = load_progress() if args.resume else set()
    if done_slugs:
        print(f"  Resuming — {len(done_slugs)} slugs already imported (from progress log).")

    # Read CSV
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    total_rows = len(rows)
    if args.limit:
        rows = rows[: args.limit]
    print(f"  Rows to process: {len(rows)} / {total_rows}")
    print("=" * 65 + "\n")

    inserted = skipped = errors = dry_runs = 0

    for i, row in enumerate(rows, 1):
        slug = row.get("slug", "").strip()

        if args.resume and slug in done_slugs:
            skipped += 1
            continue

        status = import_row(supabase, row, category_map, known_slugs, dry_run=args.dry_run)

        if status == "inserted":
            inserted += 1
            record_progress(slug, "inserted")
            name = row.get("name", "")[:45]
            print(f"  [{i:>5}/{len(rows)}] + {name:<45} ({row.get('hq_country','')})")
        elif status == "dry_run":
            dry_runs += 1
        elif status == "skipped":
            skipped += 1
            record_progress(slug, "skipped")
        else:
            errors += 1
            record_progress(slug, "error")

        # Brief pause between batches to avoid rate limits
        if i % BATCH_SIZE == 0:
            print(f"\n  --- Batch {i // BATCH_SIZE} complete | inserted={inserted} skipped={skipped} errors={errors} ---\n")
            time.sleep(DELAY_BETWEEN_BATCHES)

    print("\n" + "=" * 65)
    print("  IMPORT COMPLETE")
    print("=" * 65)
    if args.dry_run:
        print(f"  Would insert : {dry_runs}")
    else:
        print(f"  Inserted     : {inserted}")
        print(f"  Skipped      : {skipped}")
        print(f"  Errors       : {errors}")
    print(f"  Progress log : {PROGRESS_PATH}")
    print()


if __name__ == "__main__":
    main()
