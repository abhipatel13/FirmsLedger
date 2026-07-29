import sqlite3
import json
import os
import re
import difflib
import urllib.parse

class StagingDatabase:
    def __init__(self, db_path="pipeline/staging.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """
        Creates SQLite database tables if they do not exist.
        """
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS staging_companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT DEFAULT 'google_maps',
            source_url TEXT,
            company_name TEXT NOT NULL,
            website TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state_slug TEXT,
            zip TEXT,
            rating REAL DEFAULT 0.0,
            reviews INTEGER DEFAULT 0,
            google_category TEXT,
            raw_description TEXT,
            raw_products TEXT, -- JSON array
            raw_services TEXT, -- JSON array
            raw_industries TEXT, -- JSON array
            raw_certifications TEXT, -- JSON array
            raw_email TEXT,
            social_links TEXT, -- JSON dict
            images TEXT, -- JSON array
            crawl_status TEXT DEFAULT 'pending', -- pending | success | failed
            import_status TEXT DEFAULT 'pending', -- pending | ready | duplicate | needs_review
            duplicate_of_id INTEGER,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(duplicate_of_id) REFERENCES staging_companies(id)
        );
        """
        
        with self._get_connection() as conn:
            conn.execute(create_table_sql)
            conn.commit()

    def add_discovered_company(self, data):
        """
        Inserts a discovered company record from Google Maps.
        """
        insert_sql = """
        INSERT INTO staging_companies (
            source, source_url, company_name, website, phone, address, city, state_slug, zip, rating, reviews, google_category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        # Normalize state slug (lowercase)
        state_slug = data.get("state", "").strip().lower()
        if len(state_slug) == 2:
            # Map state abbreviation if present (e.g. TX -> texas)
            state_slug = self._abbr_to_slug(state_slug)
            
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(insert_sql, (
                data.get("source", "google_maps"),
                data.get("source_url", ""),
                data.get("name", "").strip(),
                data.get("website", "").strip(),
                data.get("phone", "").strip(),
                data.get("address", "").strip(),
                data.get("city", "").strip(),
                state_slug,
                data.get("zip", "").strip(),
                data.get("rating", 0.0),
                data.get("reviews", 0),
                data.get("google_category", "")
            ))
            conn.commit()
            return cursor.lastrowid

    def update_crawl_results(self, company_id, crawl_data):
        """
        Updates a staging record with crawled website details.
        """
        update_sql = """
        UPDATE staging_companies SET
            raw_description = ?,
            raw_products = ?,
            raw_services = ?,
            raw_industries = ?,
            raw_certifications = ?,
            raw_email = ?,
            social_links = ?,
            images = ?,
            crawl_status = ?
        WHERE id = ?
        """
        
        with self._get_connection() as conn:
            conn.execute(update_sql, (
                crawl_data.get("raw_description", ""),
                json.dumps(crawl_data.get("raw_products", [])),
                json.dumps(crawl_data.get("raw_services", [])),
                json.dumps(crawl_data.get("raw_industries", [])),
                json.dumps(crawl_data.get("raw_certifications", [])),
                crawl_data.get("raw_email", ""),
                json.dumps(crawl_data.get("social_links", {})),
                json.dumps(crawl_data.get("images", [])),
                crawl_data.get("crawl_status", "success"),
                company_id
            ))
            conn.commit()

    def get_pending_crawl_companies(self):
        """
        Retrieves all companies that have websites and have not been crawled yet.
        """
        query = "SELECT id, website FROM staging_companies WHERE website IS NOT NULL AND website != '' AND crawl_status = 'pending'"
        with self._get_connection() as conn:
            return conn.execute(query).fetchall()

    def detect_duplicates(self):
        """
        Runs duplicate check over all pending records in the staging database.
        Marks duplicate rows and updates status to ready/duplicate.
        Also checks against production database records if pipeline/existing_companies.json exists.
        """
        print("[*] Starting duplicate detection engine...")
        
        # Load existing companies from production DB if exported
        db_companies = []
        json_path = "pipeline/existing_companies.json"
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    db_companies = json.load(f)
                print(f"[*] Loaded {len(db_companies)} existing production companies to check against.")
            except Exception as e:
                print(f"[!] Warning: Failed to load {json_path}: {e}")
        else:
            print("[*] No existing production companies file found. Only checking staging batch duplicates.")

        # Pre-normalize existing production companies
        norm_db_companies = []
        for c in db_companies:
            c_name = c.get("name") or ""
            c_website = c.get("website") or ""
            c_phone = c.get("phone") or ""
            c_address = c.get("address") or ""
            norm_db_companies.append({
                "name": c_name,
                "norm_name": self._normalize_name(c_name),
                "norm_domain": self._normalize_domain(c_website),
                "norm_phone": self._normalize_phone(c_phone),
                "zip": self._extract_zip(c_address)
            })

        # Load all records
        with self._get_connection() as conn:
            records = conn.execute("SELECT * FROM staging_companies ORDER BY id").fetchall()
            
        ready_records = []
        
        for record in records:
            company_id = record["id"]
            name = record["company_name"]
            website = record["website"]
            phone = record["phone"]
            address = record["address"]
            zip_code = record["zip"]
            
            # Normalize fields
            norm_name = self._normalize_name(name)
            norm_phone = self._normalize_phone(phone)
            norm_domain = self._normalize_domain(website)
            
            is_dup = False
            dup_of_id = None
            dup_reason = ""
            
            # 1. Compare against production DB companies
            for db_c in norm_db_companies:
                # Check 1: Match Domain
                if norm_domain and db_c["norm_domain"] and norm_domain == db_c["norm_domain"]:
                    print(f"  [!] Duplicate of DB: '{name}' matches '{db_c['name']}' by Domain ({website})")
                    is_dup = True
                    dup_reason = f"DB Domain Match ({website})"
                    break
                # Check 2: Match Phone
                if norm_phone and db_c["norm_phone"] and norm_phone == db_c["norm_phone"]:
                    print(f"  [!] Duplicate of DB: '{name}' matches '{db_c['name']}' by Phone ({phone})")
                    is_dup = True
                    dup_reason = f"DB Phone Match ({phone})"
                    break
                # Check 3: Match Fuzzy Name + Zip Code
                if db_c["zip"] and zip_code and db_c["zip"][:5] == zip_code[:5]:
                    name_similarity = difflib.SequenceMatcher(None, norm_name, db_c["norm_name"]).ratio()
                    if name_similarity > 0.85:
                        print(f"  [!] Duplicate of DB: '{name}' fuzzy matches '{db_c['name']}' (Ratio: {name_similarity:.2f}) within ZIP {zip_code}")
                        is_dup = True
                        dup_reason = f"DB Fuzzy Name Match ({name_similarity:.2f})"
                        break
            
            if not is_dup:
                # 2. Compare against already approved 'ready' records in this staging batch
                for primary in ready_records:
                    p_id = primary["id"]
                    p_name = primary["company_name"]
                    p_website = primary["website"]
                    p_phone = primary["phone"]
                    p_address = primary["address"]
                    p_zip = primary["zip"]
                    
                    p_norm_name = self._normalize_name(p_name)
                    p_norm_phone = self._normalize_phone(p_phone)
                    p_norm_domain = self._normalize_domain(p_website)
                    
                    # Check 1: Match Domain (very reliable)
                    if norm_domain and p_norm_domain and norm_domain == p_norm_domain:
                        print(f"  [!] Duplicate found in batch: '{name}' matches '{p_name}' by Domain ({website})")
                        is_dup = True
                        dup_of_id = p_id
                        break
                        
                    # Check 2: Match Phone (very reliable)
                    if norm_phone and p_norm_phone and norm_phone == p_norm_phone:
                        print(f"  [!] Duplicate found in batch: '{name}' matches '{p_name}' by Phone ({phone})")
                        is_dup = True
                        dup_of_id = p_id
                        break
                        
                    # Check 3: Match Fuzzy Name + Zip Code
                    if p_zip and zip_code and p_zip[:5] == zip_code[:5]:
                        name_similarity = difflib.SequenceMatcher(None, norm_name, p_norm_name).ratio()
                        if name_similarity > 0.85:
                            print(f"  [!] Duplicate found in batch: '{name}' fuzzy matches '{p_name}' (Ratio: {name_similarity:.2f}) within ZIP {zip_code}")
                            is_dup = True
                            dup_of_id = p_id
                            break
            
            if is_dup:
                # Mark as duplicate in SQLite
                with self._get_connection() as conn:
                    conn.execute(
                        "UPDATE staging_companies SET import_status = 'duplicate', duplicate_of_id = ? WHERE id = ?",
                        (dup_of_id, company_id)
                    )
                    conn.commit()
            else:
                # Mark as ready
                with self._get_connection() as conn:
                    conn.execute(
                        "UPDATE staging_companies SET import_status = 'ready' WHERE id = ?",
                        (company_id,)
                    )
                    conn.commit()
                # Add to local tracking list so subsequent records check against it
                ready_records.append(record)
                
        print(f"[*] Duplicate detection completed. Staged ready: {len(ready_records)}, duplicates marked: {len(records) - len(ready_records)}")

    def export_to_csv(self, file_path="pipeline/staged_companies.csv"):
        """
        Exports all 'ready' staging companies to a CSV file.
        """
        import pandas as pd
        
        query = "SELECT * FROM staging_companies WHERE import_status = 'ready'"
        with self._get_connection() as conn:
            df = pd.read_sql_query(query, conn)
            
        df.to_csv(file_path, index=False)
        print(f"[*] Exported {len(df)} ready records to {file_path}")

    def export_to_json(self, file_path="pipeline/staged_companies.json"):
        """
        Exports all 'ready' staging companies as an array of structured JSON records.
        """
        query = "SELECT * FROM staging_companies WHERE import_status = 'ready'"
        with self._get_connection() as conn:
            rows = conn.execute(query).fetchall()
            
        records = []
        for r in rows:
            rec = dict(r)
            # Parse JSON serialized arrays/dicts back to objects
            for field in ["raw_products", "raw_services", "raw_industries", "raw_certifications", "images"]:
                if rec.get(field):
                    try:
                        rec[field] = json.loads(rec[field])
                    except Exception:
                        rec[field] = []
                else:
                    rec[field] = []
            if rec.get("social_links"):
                try:
                    rec["social_links"] = json.loads(rec["social_links"])
                except Exception:
                    rec["social_links"] = {}
            else:
                rec["social_links"] = {}
                
            records.append(rec)
            
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)
        print(f"[*] Exported {len(records)} ready records to {file_path}")

    # --- Helper methods ---
    
    def _normalize_name(self, name):
        """
        Removes common suffixes, punctuation, and returns lowercase clean string.
        """
        if not name:
            return ""
        name = name.lower()
        # Remove punctuation
        name = re.sub(r'[^\w\s]', '', name)
        # Remove legal suffixes
        suffixes = [
            r'\bllc\b', r'\binc\b', r'\bltd\b', r'\bcorp\b', r'\bco\b', r'\bincorporated\b',
            r'\bcorporation\b', r'\bmanufacturing\b', r'\bmfg\b', r'\bcomponents\b', r'\bparts\b'
        ]
        for suffix in suffixes:
            name = re.sub(suffix, '', name)
        return " ".join(name.split())

    def _normalize_phone(self, phone):
        if not phone:
            return ""
        # Strip all non-digits
        return re.sub(r'\D', '', phone)

    def _normalize_domain(self, website):
        if not website:
            return ""
        # Extract host domain
        website = website.lower()
        parsed = urllib.parse.urlparse(website)
        netloc = parsed.netloc or parsed.path
        netloc = netloc.replace("www.", "")
        return netloc.split("/")[0].strip()

    def _abbr_to_slug(self, abbr):
        state_map = {
            'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
            'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
            'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
            'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
            'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi', 'mo': 'missouri',
            'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new-hampshire', 'nj': 'new-jersey',
            'nm': 'new-mexico', 'ny': 'new-york', 'nc': 'north-carolina', 'nd': 'north-dakota', 'oh': 'ohio',
            'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode-island', 'sc': 'south-carolina',
            'sd': 'south-dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont',
            'va': 'virginia', 'wa': 'washington', 'wv': 'west-virginia', 'wi': 'wisconsin', 'wy': 'wyoming'
        }
        return state_map.get(abbr.lower(), abbr.lower())

    def _extract_zip(self, address):
        if not address:
            return ""
        match = re.search(r'\b\d{5}(?:-\d{4})?\b', address)
        return match.group(0)[:5] if match else ""


# Quick test helper
if __name__ == "__main__":
    db = StagingDatabase("pipeline/test_staging.db")
    db.add_discovered_company({
        "name": "ABC Manufacturing Inc.",
        "website": "https://www.abc-mfg.com",
        "phone": "(123) 456-7890",
        "address": "123 Silicon Way, Austin, TX 78701",
        "city": "Austin",
        "state": "TX",
        "zip": "78701",
        "rating": 4.5,
        "reviews": 12,
        "google_category": "Machine shop",
        "source_url": "https://google.com/maps/place/abc"
    })
    db.add_discovered_company({
        "name": "ABC Manufacturing LLC",
        "website": "https://abc-mfg.com/about",
        "phone": "123.456.7890",
        "address": "123 Silicon Way, Austin, TX 78701",
        "city": "Austin",
        "state": "Texas",
        "zip": "78701",
        "rating": 4.2,
        "reviews": 4,
        "google_category": "CNC Machining",
        "source_url": "https://google.com/maps/place/abc2"
    })
    db.detect_duplicates()
