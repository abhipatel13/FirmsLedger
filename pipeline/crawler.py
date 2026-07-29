import re
import urllib.parse
import requests
from bs4 import BeautifulSoup

class CompanyWebsiteCrawler:
    def __init__(self, timeout=10):
        self.timeout = timeout
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def crawl_website(self, start_url):
        """
        Crawls a company website starting at homepage, discovering and visiting
        about, products, services, and contact pages (up to 5 pages max).
        """
        if not start_url:
            return self._empty_result()

        # Normalize start_url
        if not start_url.startswith("http://") and not start_url.startswith("https://"):
            start_url = "https://" + start_url
            
        try:
            domain = urllib.parse.urlparse(start_url).netloc
        except Exception:
            return self._empty_result()

        print(f"[*] Starting crawl on: {start_url}")
        
        # Phase 1: Fetch homepage and find internal links
        homepage_html = self._fetch_url(start_url)
        if not homepage_html:
            # Try HTTP if HTTPS failed
            if start_url.startswith("https://"):
                start_url = start_url.replace("https://", "http://")
                homepage_html = self._fetch_url(start_url)
                
        if not homepage_html:
            print(f"[!] Could not fetch homepage: {start_url}")
            return self._empty_result()

        soup = BeautifulSoup(homepage_html, "html.parser")
        
        # Extract direct findings from homepage
        emails = self._extract_emails(homepage_html)
        socials = self._extract_socials(soup, start_url)
        
        # Find internal links to crawl
        to_crawl = self._find_relevant_links(soup, start_url, domain)
        # Ensure start_url is crawled
        to_crawl.insert(0, start_url)
        
        # Deduplicate while preserving order
        unique_to_crawl = []
        for url in to_crawl:
            if url not in unique_to_crawl:
                unique_to_crawl.append(url)

        # Limit to max 5 pages
        unique_to_crawl = unique_to_crawl[:5]
        print(f"[*] Identified links to crawl: {unique_to_crawl}")
        
        # Crawl each page and aggregate content
        aggregated_text_blocks = []
        crawled_certs = set()
        crawled_emails = set(emails)
        crawled_images = []
        
        for url in unique_to_crawl:
            print(f"  [~] Crawling page: {url}")
            html = self._fetch_url(url)
            if not html:
                continue
                
            page_soup = BeautifulSoup(html, "html.parser")
            
            # Extract emails
            page_emails = self._extract_emails(html)
            crawled_emails.update(page_emails)
            
            # Extract certifications
            certs = self._extract_certifications(html)
            crawled_certs.update(certs)
            
            # Extract images (look for logos or potential product images)
            images = self._extract_images(page_soup, url)
            crawled_images.extend(images)
            
            # Extract clean visible text
            clean_text = self._get_clean_text(page_soup)
            aggregated_text_blocks.append(clean_text)
            
        # Combine all visible texts
        full_text = "\n\n".join(aggregated_text_blocks)
        
        # Extract features from the combined texts
        raw_description = self._extract_description(full_text)
        products = self._extract_items_by_keywords(full_text, ["product", "part", "component", "assembly", "assemblies", "wiring", "cnc", "machined", "hardware"])
        services = self._extract_items_by_keywords(full_text, ["service", "capability", "capabilities", "machining", "fabrication", "molding", "extrusion", "casting", "stamping", "coating"])
        industries = self._extract_items_by_keywords(full_text, ["industry", "industries", "served", "aerospace", "automotive", "medical", "defense", "energy", "telecom"])
        
        # Deduplicate lists
        products = list(set(products))[:20]
        services = list(set(services))[:20]
        industries = list(set(industries))[:15]
        crawled_images = list(set(crawled_images))[:10]
        
        return {
            "raw_description": raw_description,
            "raw_products": products,
            "raw_services": services,
            "raw_industries": industries,
            "raw_certifications": list(crawled_certs),
            "raw_email": list(crawled_emails)[0] if crawled_emails else "",
            "social_links": socials,
            "images": crawled_images,
            "crawl_status": "success"
        }

    def _fetch_url(self, url):
        try:
            # Ignore SSL verify errors since we want maximum success rate on legacy manufacturing sites
            response = requests.get(
                url, 
                headers=self.headers, 
                timeout=self.timeout, 
                verify=False
            )
            if response.status_code == 200:
                return response.text
        except Exception as e:
            print(f"  [!] Failed requesting {url}: {e}")
        return None

    def _get_clean_text(self, soup):
        """
        Removes scripts, styles, headers, footers, and returns clean visible text.
        """
        # Remove unwanted tags
        for element in soup(["script", "style", "head", "title", "meta", "[document]", "nav", "footer", "header"]):
            element.extract()
            
        # Get visible text
        text = soup.get_text(separator="\n")
        # Collapse whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        return "\n".join(chunk for chunk in chunks if chunk)

    def _extract_emails(self, html):
        # Match common email patterns, avoiding common false positives
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, html)
        # Filter out design assets/placeholders
        filtered = []
        for e in emails:
            e_lower = e.lower()
            if not any(x in e_lower for x in ["example.com", "bootstrap", "w3.org", "domain.com", "sentry.io"]):
                filtered.append(e_lower)
        return filtered

    def _extract_socials(self, soup, current_url):
        socials = {}
        social_patterns = {
            "linkedin": r"linkedin\.com/(?:company|in)/",
            "facebook": r"facebook\.com/",
            "twitter": r"twitter\.com/|x\.com/",
            "instagram": r"instagram\.com/",
            "youtube": r"youtube\.com/"
        }
        
        for link in soup.find_all("a", href=True):
            href = link["href"].strip()
            absolute_url = urllib.parse.urljoin(current_url, href)
            
            for platform, pattern in social_patterns.items():
                if re.search(pattern, absolute_url, re.IGNORECASE):
                    socials[platform] = absolute_url
                    
        return socials

    def _extract_certifications(self, html):
        certs = []
        # Standard manufacturing certifications
        cert_regexes = [
            r'\bISO\s*9001\b',
            r'\bAS\s*9100\b',
            r'\bISO\s*13485\b',
            r'\bISO\s*14001\b',
            r'\bIATF\s*16949\b',
            r'\bNADCAP\b',
            r'\bITAR\b',
            r'\bUL\s*Listed\b',
            r'\bCE\s*Mark\b',
            r'\bRoHS\b'
        ]
        
        for regex in cert_regexes:
            match = re.search(regex, html, re.IGNORECASE)
            if match:
                # Normalize the output
                certs.append(match.group(0).upper().replace(" ", ""))
        return list(set(certs))

    def _extract_images(self, soup, current_url):
        images = []
        # Find img tags
        for img in soup.find_all("img", src=True):
            src = img["src"].strip()
            # Filter out tracking pixels / tiny icons
            if not any(x in src.lower() for x in ["pixel", "icon", "arrow", "logo"]):
                absolute_url = urllib.parse.urljoin(current_url, src)
                images.append(absolute_url)
        return images

    def _find_relevant_links(self, soup, base_url, domain):
        """
        Discovers internal links relevant to About, Products, Services, and Contacts.
        """
        links = []
        keywords = ["about", "product", "service", "capability", "capabilities", "facility", "contact", "cert", "quality"]
        
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            text = a.get_text().lower()
            
            # Avoid hashes / javascript
            if href.startswith("#") or href.startswith("javascript:") or href.startswith("tel:") or href.startswith("mailto:"):
                continue
                
            absolute_url = urllib.parse.urljoin(base_url, href)
            parsed_absolute = urllib.parse.urlparse(absolute_url)
            
            # Ensure it is internal to the domain
            if parsed_absolute.netloc == domain:
                # Check path or text for keywords
                path_lower = parsed_absolute.path.lower()
                if any(kw in path_lower or kw in text for kw in keywords):
                    links.append(absolute_url)
                    
        return links

    def _extract_description(self, full_text):
        """
        Heuristically extracts a paragraph or description from the text blocks.
        """
        paragraphs = [p.strip() for p in full_text.split("\n") if len(p.strip()) > 60]
        
        # Look for paragraphs containing descriptive keywords
        about_keywords = ["founded", "specializes in", "manufacturer of", "custom fabrication", "precision machining", "leading provider", "since 19", "since 20"]
        for p in paragraphs:
            if any(kw in p.lower() for kw in about_keywords):
                return p
                
        # Fallback to the first long paragraph found
        if paragraphs:
            return paragraphs[0]
            
        return ""

    def _extract_items_by_keywords(self, full_text, keywords):
        """
        Extracts single sentences or list items containing specified keywords.
        """
        findings = []
        lines = full_text.split("\n")
        for line in lines:
            line = line.strip()
            # Look for bullet-point like lines or short sentences
            if 15 < len(line) < 120:
                if any(kw in line.lower() for kw in keywords):
                    # Clean up list markers
                    cleaned = re.sub(r'^[•\-\*\d\.\s]+', '', line).strip()
                    findings.append(cleaned)
        return findings

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
            "crawl_status": "failed"
        }

# Quick test helper
if __name__ == "__main__":
    crawler = CompanyWebsiteCrawler()
    res = crawler.crawl_website("https://www.depcopower.com")
    print(res)
