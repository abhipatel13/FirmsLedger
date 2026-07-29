"""Smart Manufacturing Crawler: priority-driven BFS over a company website,
extracting deterministic manufacturing data. No AI, no image downloads."""
import heapq
import itertools
import urllib.parse

import requests
from bs4 import BeautifulSoup

from pipeline.crawl_utils import (
    normalize_url,
    is_low_value_url,
    score_link,
    classify_page_type,
)
from pipeline.content_extractor import (
    get_clean_text,
    extract_title,
    extract_meta_description,
    extract_headings,
    extract_emails,
    extract_phones,
    extract_socials,
    extract_certifications,
    extract_items_by_keywords,
    extract_description,
    extract_years_in_business,
    extract_locations,
    extract_images,
    extract_special_images,
)

PRODUCT_KEYWORDS = ["product", "part", "component", "assembly", "assemblies", "wiring", "cnc", "machined", "hardware"]
SERVICE_KEYWORDS = ["service", "capability", "capabilities", "machining", "fabrication", "molding", "extrusion", "casting", "stamping", "coating"]
INDUSTRY_KEYWORDS = ["industry", "industries", "served", "aerospace", "automotive", "medical", "defense", "energy", "telecom"]
MATERIAL_KEYWORDS = ["aluminum", "steel", "stainless", "titanium", "brass", "copper", "plastic", "polymer", "alloy", "carbon fiber"]
BRAND_KEYWORDS = ["brand", "trademark", "authorized dealer", "distributor of"]


class CompanyWebsiteCrawler:
    def __init__(self, timeout=10, max_pages=5):
        self.timeout = timeout
        self.max_pages = max_pages
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def crawl_website(self, start_url):
        """Crawls a company website starting at the homepage, visiting up to
        `max_pages` internal pages ranked by manufacturing-relevance priority."""
        if not start_url:
            return self._empty_result()

        if not start_url.startswith("http://") and not start_url.startswith("https://"):
            start_url = "https://" + start_url

        try:
            domain = urllib.parse.urlparse(start_url).netloc
        except Exception:
            return self._empty_result()

        print(f"[*] Starting crawl on: {start_url}")

        homepage_html = self._fetch_url(start_url)
        if not homepage_html and start_url.startswith("https://"):
            start_url = start_url.replace("https://", "http://")
            homepage_html = self._fetch_url(start_url)

        if not homepage_html:
            print(f"[!] Could not fetch homepage: {start_url}")
            return self._empty_result()

        start_url = normalize_url(start_url)
        pages = []
        visited = set()
        counter = itertools.count()
        heap = []  # (-score, order, url, link_text)
        heapq.heappush(heap, (-99, next(counter), start_url, "homepage"))

        # Hard cap on total fetch *attempts* (not just successful pages). A page
        # full of dead/slow links must not turn a "max_pages" crawl into
        # unbounded HTTP requests: only successes count toward `pages`, so we
        # also bound `attempts` at max_pages * 3 (allows some fetch failures
        # without unbounded work).
        max_attempts = self.max_pages * 3
        attempts = 0

        while heap and len(pages) < self.max_pages and attempts < max_attempts:
            neg_score, _, url, _link_text = heapq.heappop(heap)
            if url in visited or is_low_value_url(url):
                continue
            visited.add(url)
            attempts += 1

            print(f"  [~] Crawling page ({-neg_score}): {url}")
            html = self._fetch_url(url)
            if not html:
                continue

            soup = BeautifulSoup(html, "html.parser")
            page_type = "homepage" if url == start_url else classify_page_type(url)
            page_result = self._build_page_result(url, page_type, html, soup)
            pages.append(page_result)

            for link_url, link_text in self._discover_links(soup, url, domain):
                norm_link = normalize_url(link_url)
                if norm_link in visited or is_low_value_url(norm_link):
                    continue
                link_score = score_link(norm_link, link_text)
                heapq.heappush(heap, (-link_score, next(counter), norm_link, link_text))

        return self._aggregate(start_url, pages)

    def _build_page_result(self, url, page_type, html, soup):
        return {
            "url": url,
            "page_type": page_type,
            "title": extract_title(soup),
            "meta_description": extract_meta_description(soup),
            "headings": extract_headings(soup),
            "text": get_clean_text(soup),
            "emails": extract_emails(html),
            "phones": extract_phones(html),
            "socials": extract_socials(soup, url),
            "images": extract_images(soup, url) + extract_special_images(soup, url),
        }

    def _discover_links(self, soup, base_url, domain):
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith("#") or href.startswith("javascript:") or href.startswith("tel:") or href.startswith("mailto:"):
                continue
            absolute_url = urllib.parse.urljoin(base_url, href)
            parsed = urllib.parse.urlparse(absolute_url)
            if parsed.netloc == domain:
                links.append((absolute_url, a.get_text().strip()))
        return links

    def _aggregate(self, start_url, pages):
        if not pages:
            return self._empty_result()

        full_text = "\n\n".join(p["text"] for p in pages)
        emails, phones, certs, images = [], [], [], []
        socials = {}
        for p in pages:
            for e in p["emails"]:
                if e not in emails:
                    emails.append(e)
            for ph in p["phones"]:
                if ph not in phones:
                    phones.append(ph)
            socials.update(p["socials"])
            images.extend(p["images"])

        for p in pages:
            for c in extract_certifications(p["text"]):
                if c not in certs:
                    certs.append(c)

        products = list(dict.fromkeys(extract_items_by_keywords(full_text, PRODUCT_KEYWORDS)))[:20]
        services = list(dict.fromkeys(extract_items_by_keywords(full_text, SERVICE_KEYWORDS)))[:20]
        capabilities = list(dict.fromkeys(extract_items_by_keywords(full_text, SERVICE_KEYWORDS + ["capability", "capabilities"])))[:20]
        industries = list(dict.fromkeys(extract_items_by_keywords(full_text, INDUSTRY_KEYWORDS)))[:15]
        materials = list(dict.fromkeys(extract_items_by_keywords(full_text, MATERIAL_KEYWORDS)))[:15]
        brands = list(dict.fromkeys(extract_items_by_keywords(full_text, BRAND_KEYWORDS)))[:10]

        description = extract_description(full_text)
        years_in_business = extract_years_in_business(full_text)
        locations = extract_locations(full_text)
        headquarters = locations[0] if locations else ""

        homepage_page = next((p for p in pages if p["url"] == start_url), pages[0])

        return {
            # Legacy keys consumed by staging.py — DO NOT rename.
            "raw_description": description,
            "raw_products": products,
            "raw_services": services,
            "raw_industries": industries,
            "raw_certifications": certs,
            "raw_email": emails[0] if emails else "",
            "social_links": socials,
            "images": list({img["url"]: img for img in images}.values())[:10],
            "crawl_status": "success",
            # New structured fields.
            "homepage": start_url,
            "pages": pages,
            "description": description,
            "products": products,
            "services": services,
            "capabilities": capabilities,
            "industries": industries,
            "materials": materials,
            "brands": brands,
            "certifications": certs,
            "emails": emails,
            "phones": phones,
            "socials": socials,
            "imageCandidates": list({img["url"]: img for img in images}.values()),
            "years_in_business": years_in_business,
            "locations": locations,
            "headquarters": headquarters,
            "metadata": {
                "title": homepage_page["title"],
                "meta_description": homepage_page["meta_description"],
                "pages_crawled": [p["url"] for p in pages],
            },
        }

    def _fetch_url(self, url):
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout, verify=False)
            if response.status_code == 200:
                return response.text
        except Exception as e:
            print(f"  [!] Failed requesting {url}: {e}")
        return None

    def _empty_result(self):
        return {
            "raw_description": "",
            "raw_products": [],
            "raw_services": [],
            "raw_industries": [],
            "raw_certifications": [],
            "raw_email": "",
            "social_links": {},
            "images": [],
            "crawl_status": "failed",
            "homepage": "",
            "pages": [],
            "description": "",
            "products": [],
            "services": [],
            "capabilities": [],
            "industries": [],
            "materials": [],
            "brands": [],
            "certifications": [],
            "emails": [],
            "phones": [],
            "socials": {},
            "imageCandidates": [],
            "years_in_business": "",
            "locations": [],
            "headquarters": "",
            "metadata": {},
        }


if __name__ == "__main__":
    crawler = CompanyWebsiteCrawler()
    res = crawler.crawl_website("https://www.depcopower.com")
    print(res)
