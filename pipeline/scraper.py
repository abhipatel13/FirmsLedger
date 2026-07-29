import time
import re
import urllib.parse
from playwright.sync_api import sync_playwright

class GoogleMapsScraper:
    def __init__(self, headless=True):
        self.headless = headless

    def scrape_query(self, query, max_results=20):
        """
        Scrapes Google Maps for a given query and returns a list of company details.
        """
        results = []
        encoded_query = urllib.parse.quote_plus(query)
        search_url = f"https://www.google.com/maps/search/{encoded_query}"

        print(f"[*] Starting scraper for query: '{query}'")
        with sync_playwright() as p:
            # Set up browser with standard viewport and user agent
            browser = p.chromium.launch(
                headless=self.headless,
                args=["--disable-gpu", "--no-sandbox"]
            )
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            try:
                page.goto(search_url, wait_until="networkidle")
            except Exception as e:
                print(f"[!] Warning: initial navigation did not reach networkidle: {e}")

            # Give it a moment to render results
            page.wait_for_timeout(3000)

            # Accept cookies if the popup appears (common in European environments/clean browser sessions)
            try:
                consent_buttons = page.locator('button:has-text("Accept all"), button:has-text("I agree")')
                if consent_buttons.count() > 0:
                    consent_buttons.first.click()
                    page.wait_for_timeout(2000)
            except Exception:
                pass

            # Identify the left-side scrolling feed container
            feed_selector = 'div[role="feed"]'
            
            # Scroll to load enough results
            print("[*] Scrolling to load results...")
            scroll_attempts = 0
            last_count = 0
            
            while scroll_attempts < 15:
                # Find all place link elements in the feed
                place_links = page.locator('a[href*="/maps/place/"]')
                count = place_links.count()
                
                if count >= max_results:
                    print(f"[*] Found {count} results, which meets or exceeds max_results ({max_results}).")
                    break
                
                # Check if we've hit the end of list marker
                end_marker = page.locator('span:has-text("You\'ve reached the end of the list")')
                if end_marker.count() > 0:
                    print("[*] Reached end of the search results list.")
                    break
                
                # Try scrolling the feed container
                feed = page.locator(feed_selector)
                if feed.count() > 0:
                    feed.first.evaluate("el => el.scrollTop = el.scrollHeight")
                else:
                    # Fallback scroll on page
                    page.mouse.wheel(0, 1000)
                
                page.wait_for_timeout(1500)
                
                # Check if count increased; if not, retry a few times before breaking
                place_links = page.locator('a[href*="/maps/place/"]')
                new_count = place_links.count()
                if new_count == last_count:
                    scroll_attempts += 1
                else:
                    scroll_attempts = 0
                    last_count = new_count
            
            # Retrieve all links
            place_links = page.locator('a[href*="/maps/place/"]')
            links_count = place_links.count()
            urls = []
            for i in range(links_count):
                href = place_links.nth(i).get_attribute("href")
                if href and href not in urls:
                    urls.append(href)
            
            print(f"[*] Extracting details for {len(urls[:max_results])} places...")
            
            for idx, url in enumerate(urls[:max_results]):
                try:
                    # Navigate to each place detail page directly (highly reliable)
                    page.goto(url, wait_until="load")
                    page.wait_for_timeout(2000)
                    
                    # Extract name
                    name_el = page.locator('h1')
                    if name_el.count() == 0:
                        continue
                    name = name_el.first.inner_text().strip()
                    
                    # Extract website
                    website = ""
                    website_el = page.locator('a[data-item-id="authority"]')
                    if website_el.count() > 0:
                        website = website_el.first.get_attribute("href") or ""
                        # Resolve redirects if standard google format
                        if "google.com/url" in website:
                            parsed_url = urllib.parse.urlparse(website)
                            qs = urllib.parse.parse_qs(parsed_url.query)
                            if "q" in qs:
                                website = qs["q"][0]
                    
                    # Extract Phone
                    phone = ""
                    phone_el = page.locator('button[data-item-id^="phone:tel:"]')
                    if phone_el.count() > 0:
                        raw_phone = phone_el.first.get_attribute("data-item-id") or ""
                        phone = raw_phone.replace("phone:tel:", "").strip()
                    
                    # Extract Address, City, State, ZIP
                    address = ""
                    address_el = page.locator('button[data-item-id="address"]')
                    if address_el.count() > 0:
                        address = address_el.first.inner_text().strip()
                    
                    city, state, zip_code = self._parse_address(address)
                    
                    # Extract Rating
                    rating = 0.0
                    rating_el = page.locator('div.F7nice span[aria-hidden="true"]')
                    if rating_el.count() > 0:
                        try:
                            rating = float(rating_el.first.inner_text().strip())
                        except ValueError:
                            pass
                    
                    # Extract Reviews count
                    reviews = 0
                    reviews_el = page.locator('div.F7nice span:has-text("reviews"), div.F7nice span:has-text("review")')
                    if reviews_el.count() > 0:
                        try:
                            # Extract number like (145) or 145 reviews
                            raw_rev = reviews_el.first.inner_text()
                            match = re.search(r'\d+', raw_rev)
                            if match:
                                reviews = int(match.group())
                        except ValueError:
                            pass
                    
                    # Extract Google category
                    google_category = ""
                    category_el = page.locator('button[jsaction*="category"]')
                    if category_el.count() > 0:
                        google_category = category_el.first.inner_text().strip()
                    
                    record = {
                        "name": name,
                        "website": website,
                        "phone": phone,
                        "address": address,
                        "city": city,
                        "state": state,
                        "zip": zip_code,
                        "rating": rating,
                        "reviews": reviews,
                        "google_category": google_category,
                        "source_url": url,
                        "source": "google_maps"
                    }
                    
                    print(f"  [+] Scraped: {name} (Website: {website or 'None'})")
                    results.append(record)
                    
                except Exception as e:
                    print(f"  [!] Error scraping detail page {url}: {e}")
            
            browser.close()
            
        print(f"[*] Scraped {len(results)} records successfully.")
        return results

    def _parse_address(self, address_str):
        """
        Parses US address into City, State, and ZIP.
        Example: "123 Main St, Austin, TX 78701, United States"
        """
        city, state, zip_code = "", "", ""
        if not address_str:
            return city, state, zip_code
            
        # Strip Country name if present
        address_str = re.sub(r',\s*United States$', '', address_str, flags=re.IGNORECASE).strip()
        parts = [p.strip() for p in address_str.split(',')]
        
        if len(parts) >= 2:
            # The second to last part usually contains State and ZIP (e.g. "TX 78701")
            state_zip_part = parts[-1]
            city_part = parts[-2]
            
            # Match State abbreviation (2 letters) + ZIP code (5 digits or 5+4 digits)
            match = re.search(r'\b([A-Z]{2})\b\s*(\d{5}(?:-\d{4})?)?', state_zip_part)
            if match:
                state = match.group(1)
                if match.group(2):
                    zip_code = match.group(2)
            else:
                # Fallback matching state names directly
                state = state_zip_part
                
            city = city_part
            
        return city, state, zip_code

# Quick test helper
if __name__ == "__main__":
    scraper = GoogleMapsScraper(headless=True)
    res = scraper.scrape_query("PCB Manufacturer Dallas Texas", max_results=3)
    print(res)
