# Smart Manufacturing Crawler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `pipeline/crawler.py` from a blind BFS website crawler into a priority-driven "Smart Manufacturing Crawler" that visits the highest-value pages first and extracts richer, deterministic manufacturing data, without using AI or downloading images, and without touching `staging.py` / `import_helper.cjs`.

**Architecture:** Split the current monolithic `crawler.py` into three modules — `pipeline/crawl_utils.py` (URL normalization, skip-list, priority scoring, page-type classification), `pipeline/content_extractor.py` (deterministic HTML/text extraction helpers), and a rewritten `pipeline/crawler.py` (`CompanyWebsiteCrawler`) that drives a priority-queue BFS using `heapq`, capped at a configurable page budget (default 5). `crawl_website()` keeps returning every key `staging.py` currently reads (`raw_description`, `raw_products`, `raw_services`, `raw_industries`, `raw_certifications`, `raw_email`, `social_links`, `images`, `crawl_status`) and adds the new structured fields from the spec (`homepage`, `pages`, `capabilities`, `materials`, `brands`, `years_in_business`, `locations`, `headquarters`, `phones`, `emails`, `imageCandidates`, `metadata`).

**Tech Stack:** Python 3, `requests`, `beautifulsoup4`, `heapq` (stdlib), `pytest` + `unittest.mock` for tests (no network calls in tests).

## Global Constraints

- Max pages per website: 5, configurable via `CompanyWebsiteCrawler(max_pages=...)`.
- Homepage is always crawled first, regardless of score.
- No AI-based extraction — deterministic HTML/keyword/regex extraction only.
- No image downloading — only collect candidate metadata (url, alt, dimensions if available, nearby heading).
- Do NOT modify `pipeline/staging.py` or `pipeline/import_helper.cjs`.
- `crawl_website(start_url)` must remain the public entrypoint with the same signature and must still return every key currently consumed by `staging.py`'s `update_crawl_results` (verified below).
- Existing timeout (10s per request, constructor `timeout=10`) and recursion/page bound (5) must still be respected.
- Skip low-value URLs matching: privacy, terms, cookies, login, register, cart, checkout, search, blog, news, press, events, rss, feed, tag, author, wp-admin, wp-login, account — and obvious PDFs/downloads.
- Normalize URLs before enqueueing: strip fragments, strip tracking query params (`utm_*`, `fbclid`, `gclid`, `ref`, `mc_cid`, `mc_eid`), collapse trailing slash.

**Verified backward-compatibility contract** (from `pipeline/staging.py:96-120`): `update_crawl_results` reads `crawl_data.get(...)` for exactly: `raw_description`, `raw_products`, `raw_services`, `raw_industries`, `raw_certifications`, `raw_email`, `social_links`, `images`, `crawl_status`. Any extra keys in the returned dict are ignored by `staging.py`, so new fields are additive and safe.

---

## File Structure

- Create: `pipeline/crawl_utils.py` — URL normalization, low-value URL detection, link priority scoring, page-type classification. Pure functions, no I/O.
- Create: `pipeline/content_extractor.py` — deterministic extraction functions operating on a `BeautifulSoup` object / raw HTML / plain text: title, meta description, headings, emails, phones, socials, images (with metadata), certifications, keyword-bucketed lists (products/services/capabilities/industries/materials/brands), years-in-business, description, headquarters/locations, clean visible text.
- Modify: `pipeline/crawler.py` — rewrite `CompanyWebsiteCrawler` to use the two new modules and a priority-queue BFS. Keep the module-level `if __name__ == "__main__":` smoke test.
- Create: `pipeline/tests/__init__.py` — empty, makes tests a package.
- Create: `pipeline/tests/test_crawl_utils.py`
- Create: `pipeline/tests/test_content_extractor.py`
- Create: `pipeline/tests/test_crawler.py`
- Modify: `pipeline/requirements.txt` — add `pytest>=8.0.0` (dev/test dependency only).

---

### Task 1: URL utilities and link priority scoring

**Files:**
- Create: `pipeline/crawl_utils.py`
- Test: `pipeline/tests/test_crawl_utils.py`
- Create: `pipeline/tests/__init__.py` (empty file)

**Interfaces:**
- Produces: `normalize_url(url: str) -> str`, `is_low_value_url(url: str) -> bool`, `score_link(url: str, link_text: str) -> int` (3=high, 2=medium, 1=neutral, 0=low), `classify_page_type(url: str) -> str` (one of `"homepage"`, `"about"`, `"capabilities"`, `"products"`, `"services"`, `"contact"`, `"quality"`, `"certifications"`, `"other"`).

- [ ] **Step 1: Create the tests package marker**

Create `pipeline/tests/__init__.py` with empty content.

- [ ] **Step 2: Write the failing tests**

```python
# pipeline/tests/test_crawl_utils.py
from pipeline.crawl_utils import (
    normalize_url,
    is_low_value_url,
    score_link,
    classify_page_type,
)


def test_normalize_url_strips_fragment_and_tracking_params():
    url = "https://example.com/about?utm_source=google&ref=abc#section2"
    assert normalize_url(url) == "https://example.com/about"


def test_normalize_url_collapses_trailing_slash():
    assert normalize_url("https://example.com/products/") == "https://example.com/products"


def test_normalize_url_keeps_non_tracking_query_params():
    url = "https://example.com/search?q=cnc"
    assert normalize_url(url) == "https://example.com/search?q=cnc"


def test_is_low_value_url_flags_known_patterns():
    assert is_low_value_url("https://example.com/blog/post-1")
    assert is_low_value_url("https://example.com/privacy-policy")
    assert is_low_value_url("https://example.com/wp-login.php")


def test_is_low_value_url_flags_pdfs():
    assert is_low_value_url("https://example.com/brochure.pdf")


def test_is_low_value_url_allows_normal_pages():
    assert not is_low_value_url("https://example.com/capabilities")


def test_score_link_ranks_high_medium_low_neutral():
    assert score_link("https://example.com/capabilities", "Capabilities") == 3
    assert score_link("https://example.com/resources", "Resources") == 2
    assert score_link("https://example.com/careers", "Careers") == 0
    assert score_link("https://example.com/random-page", "Random Page") == 1


def test_classify_page_type():
    assert classify_page_type("https://example.com/") == "homepage"
    assert classify_page_type("https://example.com/about-us") == "about"
    assert classify_page_type("https://example.com/capabilities") == "capabilities"
    assert classify_page_type("https://example.com/random") == "other"
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd "pipeline" && ../pipeline/.venv/bin/python -m pytest tests/test_crawl_utils.py -v` (from repo root: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_crawl_utils.py -v`)
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.crawl_utils'` (or import error).

- [ ] **Step 4: Implement `pipeline/crawl_utils.py`**

```python
"""URL normalization, low-value URL filtering, and link priority scoring
for the manufacturing website crawler."""
import urllib.parse

TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "fbclid", "gclid", "ref", "mc_cid", "mc_eid",
}

SKIP_URL_PATTERNS = [
    "privacy", "terms", "cookies", "login", "register", "cart", "checkout",
    "search", "blog", "news", "press", "events", "rss", "feed", "tag",
    "author", "wp-admin", "wp-login", "account",
]

HIGH_PRIORITY_KEYWORDS = [
    "about", "company", "capabilities", "manufacturing capabilities",
    "manufacturing-capabilities", "product", "service", "industries",
    "solutions", "markets", "quality", "certifications", "iso", "contact",
]

MEDIUM_PRIORITY_KEYWORDS = ["resources", "downloads", "catalog", "brochure", "faq"]

LOW_PRIORITY_KEYWORDS = [
    "blog", "news", "careers", "privacy", "terms", "cookies", "login",
    "register", "sitemap", "cart", "checkout",
]

PAGE_TYPE_KEYWORDS = {
    "about": ["about", "company"],
    "capabilities": ["capabilit"],
    "products": ["product"],
    "services": ["service"],
    "contact": ["contact"],
    "quality": ["quality"],
    "certifications": ["certif", "iso"],
}


def normalize_url(url: str) -> str:
    """Strips fragments and tracking query params, collapses trailing slash."""
    parsed = urllib.parse.urlparse(url)
    query_pairs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    filtered_pairs = [(k, v) for k, v in query_pairs if k.lower() not in TRACKING_PARAMS]
    new_query = urllib.parse.urlencode(filtered_pairs)
    path = parsed.path.rstrip("/") or "/"
    if path == "/" and not parsed.path:
        path = ""
    normalized = parsed._replace(fragment="", query=new_query, path=path)
    return urllib.parse.urlunparse(normalized)


def is_low_value_url(url: str) -> bool:
    """True if the URL should be skipped entirely (low value or a download)."""
    lower = url.lower()
    if lower.endswith(".pdf") or "/download" in lower or lower.endswith((".zip", ".doc", ".docx")):
        return True
    return any(pattern in lower for pattern in SKIP_URL_PATTERNS)


def score_link(url: str, link_text: str) -> int:
    """Priority score for a discovered link: 3=high, 2=medium, 1=neutral, 0=low."""
    haystack = f"{url.lower()} {(link_text or '').lower()}"
    if any(kw in haystack for kw in HIGH_PRIORITY_KEYWORDS):
        return 3
    if any(kw in haystack for kw in MEDIUM_PRIORITY_KEYWORDS):
        return 2
    if any(kw in haystack for kw in LOW_PRIORITY_KEYWORDS):
        return 0
    return 1


def classify_page_type(url: str) -> str:
    """Best-effort page type label based on the URL path."""
    path = urllib.parse.urlparse(url).path.lower()
    if path in ("", "/"):
        return "homepage"
    for page_type, keywords in PAGE_TYPE_KEYWORDS.items():
        if any(kw in path for kw in keywords):
            return page_type
    return "other"
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_crawl_utils.py -v`
Expected: PASS (7 tests)

- [ ] **Step 6: Commit**

```bash
git add pipeline/crawl_utils.py pipeline/tests/__init__.py pipeline/tests/test_crawl_utils.py
git commit -m "feat(pipeline): add URL normalization and link priority scoring"
```

---

### Task 2: Deterministic content extraction helpers

**Files:**
- Create: `pipeline/content_extractor.py`
- Test: `pipeline/tests/test_content_extractor.py`

**Interfaces:**
- Consumes: nothing from Task 1 directly (pure HTML/text parsing module), but is used by Task 3.
- Produces: `get_clean_text(soup) -> str`, `extract_title(soup) -> str`, `extract_meta_description(soup) -> str`, `extract_headings(soup) -> list[str]`, `extract_emails(html: str) -> list[str]`, `extract_phones(html: str) -> list[str]`, `extract_socials(soup, current_url: str) -> dict[str, str]`, `extract_certifications(html: str) -> list[str]`, `extract_items_by_keywords(full_text: str, keywords: list[str]) -> list[str]`, `extract_description(full_text: str) -> str`, `extract_years_in_business(full_text: str) -> str`, `extract_locations(full_text: str) -> list[str]`, `extract_images(soup, current_url: str) -> list[dict]` (each dict: `url`, `alt`, `width`, `height`, `nearby_heading`).

- [ ] **Step 1: Write the failing tests**

```python
# pipeline/tests/test_content_extractor.py
from bs4 import BeautifulSoup
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
)

SAMPLE_HTML = """
<html>
<head>
  <title>Acme Precision Manufacturing</title>
  <meta name="description" content="Acme is a precision CNC machining company.">
</head>
<body>
  <header><nav>Home | About</nav></header>
  <h1>About Acme Manufacturing</h1>
  <p>Founded in 1987, Acme Manufacturing is a leading provider of precision CNC machining
  and metal fabrication services for aerospace and medical device industries.</p>
  <h2>Capabilities</h2>
  <ul>
    <li>CNC machining of aluminum and titanium components</li>
    <li>Injection molding services for custom plastic parts</li>
  </ul>
  <p>We are ISO 9001 and AS9100 certified, serving customers nationwide.</p>
  <p>Our headquarters is located in Dayton, Ohio.</p>
  <p>Contact us at sales@acmemfg.com or call (937) 555-0182.</p>
  <img src="/images/factory.jpg" alt="Acme factory floor" width="800" height="600">
  <img src="/images/icon-arrow.png" alt="arrow icon">
  <a href="https://www.linkedin.com/company/acme-mfg">LinkedIn</a>
  <footer>Copyright 2026</footer>
</body>
</html>
"""


def _soup():
    return BeautifulSoup(SAMPLE_HTML, "html.parser")


def test_extract_title():
    assert extract_title(_soup()) == "Acme Precision Manufacturing"


def test_extract_meta_description():
    assert "precision CNC machining company" in extract_meta_description(_soup())


def test_extract_headings():
    headings = extract_headings(_soup())
    assert "About Acme Manufacturing" in headings
    assert "Capabilities" in headings


def test_get_clean_text_excludes_nav_and_footer():
    text = get_clean_text(_soup())
    assert "Founded in 1987" in text
    assert "Copyright 2026" not in text
    assert "Home | About" not in text


def test_extract_emails():
    assert extract_emails(SAMPLE_HTML) == ["sales@acmemfg.com"]


def test_extract_phones():
    phones = extract_phones(SAMPLE_HTML)
    assert "(937) 555-0182" in phones


def test_extract_socials():
    socials = extract_socials(_soup(), "https://acmemfg.com")
    assert socials["linkedin"] == "https://www.linkedin.com/company/acme-mfg"


def test_extract_certifications():
    certs = extract_certifications(SAMPLE_HTML)
    assert "ISO9001" in certs
    assert "AS9100" in certs


def test_extract_items_by_keywords_finds_capability_bullets():
    text = get_clean_text(_soup())
    items = extract_items_by_keywords(text, ["cnc", "machining", "molding"])
    assert any("CNC machining" in item for item in items)


def test_extract_description_prefers_founded_sentence():
    text = get_clean_text(_soup())
    desc = extract_description(text)
    assert "Founded in 1987" in desc


def test_extract_years_in_business():
    text = get_clean_text(_soup())
    assert extract_years_in_business(text) == "1987"


def test_extract_locations_finds_headquarters():
    text = get_clean_text(_soup())
    locations = extract_locations(text)
    assert any("Dayton, Ohio" in loc for loc in locations)


def test_extract_images_includes_metadata_and_filters_icons():
    images = extract_images(_soup(), "https://acmemfg.com")
    urls = [img["url"] for img in images]
    assert "https://acmemfg.com/images/factory.jpg" in urls
    assert not any("icon-arrow" in u for u in urls)
    factory_img = next(img for img in images if "factory.jpg" in img["url"])
    assert factory_img["alt"] == "Acme factory floor"
    assert factory_img["width"] == "800"
    assert factory_img["height"] == "600"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_content_extractor.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.content_extractor'`

- [ ] **Step 3: Implement `pipeline/content_extractor.py`**

```python
"""Deterministic HTML/text extraction helpers for manufacturing company pages.
No AI, no network calls — pure parsing over an already-fetched page."""
import re
import urllib.parse

EMAIL_PATTERN = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
EMAIL_FALSE_POSITIVES = ("example.com", "bootstrap", "w3.org", "domain.com", "sentry.io")

PHONE_PATTERN = r'(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'

SOCIAL_PATTERNS = {
    "linkedin": r"linkedin\.com/(?:company|in)/",
    "facebook": r"facebook\.com/",
    "twitter": r"twitter\.com/|x\.com/",
    "instagram": r"instagram\.com/",
    "youtube": r"youtube\.com/",
}

CERT_REGEXES = [
    r'\bISO\s*9001\b', r'\bAS\s*9100\b', r'\bISO\s*13485\b', r'\bISO\s*14001\b',
    r'\bIATF\s*16949\b', r'\bNADCAP\b', r'\bITAR\b', r'\bUL\s*Listed\b',
    r'\bCE\s*Mark\b', r'\bRoHS\b',
]

ABOUT_KEYWORDS = [
    "founded", "specializes in", "manufacturer of", "custom fabrication",
    "precision machining", "leading provider", "since 19", "since 20",
]

YEAR_PATTERN = r'\b(?:founded|established|since)\s+(?:in\s+)?(\d{4})\b'

LOCATION_KEYWORDS = ["headquarters", "headquartered", "located in", "based in"]
LOCATION_PATTERN = r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b)|([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)'

IMAGE_SKIP_HINTS = ("pixel", "icon", "arrow")


def get_clean_text(soup) -> str:
    """Removes scripts, styles, nav, header, footer and returns clean visible text."""
    for element in soup(["script", "style", "head", "title", "meta", "[document]", "nav", "footer", "header"]):
        element.extract()
    text = soup.get_text(separator="\n")
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    return "\n".join(chunk for chunk in chunks if chunk)


def extract_title(soup) -> str:
    tag = soup.find("title")
    return tag.get_text().strip() if tag else ""


def extract_meta_description(soup) -> str:
    tag = soup.find("meta", attrs={"name": "description"})
    if tag and tag.get("content"):
        return tag["content"].strip()
    og_tag = soup.find("meta", attrs={"property": "og:description"})
    if og_tag and og_tag.get("content"):
        return og_tag["content"].strip()
    return ""


def extract_headings(soup) -> list:
    headings = []
    for level in ("h1", "h2", "h3"):
        for tag in soup.find_all(level):
            text = tag.get_text().strip()
            if text:
                headings.append(text)
    return headings


def extract_emails(html: str) -> list:
    emails = re.findall(EMAIL_PATTERN, html)
    filtered = []
    for e in emails:
        e_lower = e.lower()
        if not any(x in e_lower for x in EMAIL_FALSE_POSITIVES) and e_lower not in filtered:
            filtered.append(e_lower)
    return filtered


def extract_phones(html: str) -> list:
    matches = re.findall(PHONE_PATTERN, html)
    phones = []
    for m in matches:
        cleaned = m.strip()
        if len(re.sub(r'\D', '', cleaned)) >= 10 and cleaned not in phones:
            phones.append(cleaned)
    return phones


def extract_socials(soup, current_url: str) -> dict:
    socials = {}
    for link in soup.find_all("a", href=True):
        href = link["href"].strip()
        absolute_url = urllib.parse.urljoin(current_url, href)
        for platform, pattern in SOCIAL_PATTERNS.items():
            if re.search(pattern, absolute_url, re.IGNORECASE):
                socials[platform] = absolute_url
    return socials


def extract_certifications(html: str) -> list:
    certs = []
    for regex in CERT_REGEXES:
        match = re.search(regex, html, re.IGNORECASE)
        if match:
            normalized = match.group(0).upper().replace(" ", "")
            if normalized not in certs:
                certs.append(normalized)
    return certs


def extract_items_by_keywords(full_text: str, keywords: list) -> list:
    findings = []
    for line in full_text.split("\n"):
        line = line.strip()
        if 15 < len(line) < 120 and any(kw in line.lower() for kw in keywords):
            cleaned = re.sub(r'^[•\-\*\d\.\s]+', '', line).strip()
            if cleaned:
                findings.append(cleaned)
    return findings


def extract_description(full_text: str) -> str:
    paragraphs = [p.strip() for p in full_text.split("\n") if len(p.strip()) > 60]
    for p in paragraphs:
        if any(kw in p.lower() for kw in ABOUT_KEYWORDS):
            return p
    return paragraphs[0] if paragraphs else ""


def extract_years_in_business(full_text: str) -> str:
    match = re.search(YEAR_PATTERN, full_text, re.IGNORECASE)
    return match.group(1) if match else ""


def extract_locations(full_text: str) -> list:
    locations = []
    for line in full_text.split("\n"):
        if any(kw in line.lower() for kw in LOCATION_KEYWORDS):
            match = re.search(LOCATION_PATTERN, line)
            if match:
                found = match.group(0).strip()
                if found not in locations:
                    locations.append(found)
    return locations


def extract_images(soup, current_url: str) -> list:
    images = []
    for img in soup.find_all("img", src=True):
        src = img["src"].strip()
        if any(hint in src.lower() for hint in IMAGE_SKIP_HINTS) or "logo" in src.lower():
            continue
        absolute_url = urllib.parse.urljoin(current_url, src)
        nearby_heading_tag = img.find_previous(["h1", "h2", "h3"])
        images.append({
            "url": absolute_url,
            "alt": img.get("alt", "").strip(),
            "width": img.get("width", ""),
            "height": img.get("height", ""),
            "nearby_heading": nearby_heading_tag.get_text().strip() if nearby_heading_tag else "",
        })
    return images


def extract_special_images(soup, current_url: str) -> list:
    """OpenGraph image, logo (by filename hint), and favicon candidates."""
    candidates = []
    og_image = soup.find("meta", attrs={"property": "og:image"})
    if og_image and og_image.get("content"):
        candidates.append({
            "url": urllib.parse.urljoin(current_url, og_image["content"]),
            "alt": "", "width": "", "height": "", "nearby_heading": "og:image",
        })
    for img in soup.find_all("img", src=True):
        if "logo" in img["src"].lower():
            candidates.append({
                "url": urllib.parse.urljoin(current_url, img["src"]),
                "alt": img.get("alt", "").strip(), "width": img.get("width", ""),
                "height": img.get("height", ""), "nearby_heading": "logo",
            })
    favicon = soup.find("link", rel=lambda v: v and "icon" in v.lower())
    if favicon and favicon.get("href"):
        candidates.append({
            "url": urllib.parse.urljoin(current_url, favicon["href"]),
            "alt": "", "width": "", "height": "", "nearby_heading": "favicon",
        })
    return candidates
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_content_extractor.py -v`
Expected: PASS (12 tests)

- [ ] **Step 5: Commit**

```bash
git add pipeline/content_extractor.py pipeline/tests/test_content_extractor.py
git commit -m "feat(pipeline): add deterministic manufacturing content extraction helpers"
```

---

### Task 3: Rewrite CompanyWebsiteCrawler with priority-queue BFS

**Files:**
- Modify: `pipeline/crawler.py` (full rewrite of internals, same public class name `CompanyWebsiteCrawler` and method `crawl_website(start_url)`)
- Test: `pipeline/tests/test_crawler.py`

**Interfaces:**
- Consumes: `pipeline.crawl_utils.{normalize_url, is_low_value_url, score_link, classify_page_type}` (Task 1), `pipeline.content_extractor.{get_clean_text, extract_title, extract_meta_description, extract_headings, extract_emails, extract_phones, extract_socials, extract_certifications, extract_items_by_keywords, extract_description, extract_years_in_business, extract_locations, extract_images, extract_special_images}` (Task 2).
- Produces: `CompanyWebsiteCrawler(timeout=10, max_pages=5)`, `.crawl_website(start_url: str) -> dict` returning legacy keys (`raw_description`, `raw_products`, `raw_services`, `raw_industries`, `raw_certifications`, `raw_email`, `social_links`, `images`, `crawl_status`) plus new keys (`homepage`, `pages`, `description`, `products`, `services`, `capabilities`, `industries`, `materials`, `brands`, `certifications`, `emails`, `phones`, `socials`, `imageCandidates`, `years_in_business`, `locations`, `headquarters`, `metadata`).

- [ ] **Step 1: Write the failing tests (network calls mocked)**

```python
# pipeline/tests/test_crawler.py
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_crawler.py -v`
Expected: FAIL — current `crawler.py` has no `max_pages` kwarg, no `pages`/`locations`/`years_in_business` keys, and does not do priority ordering (blog/privacy links are only excluded because they don't match old keyword list, but there is no priority queue to guarantee ordering under a tight budget).

- [ ] **Step 3: Rewrite `pipeline/crawler.py`**

```python
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

        while heap and len(pages) < self.max_pages:
            neg_score, _, url, _link_text = heapq.heappop(heap)
            if url in visited or is_low_value_url(url):
                continue
            visited.add(url)

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_crawler.py -v`
Expected: PASS (5 tests)

- [ ] **Step 5: Run the full pipeline test suite**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/ -v`
Expected: PASS (all tests across Task 1, 2, 3)

- [ ] **Step 6: Commit**

```bash
git add pipeline/crawler.py pipeline/tests/test_crawler.py
git commit -m "feat(pipeline): rewrite crawler as priority-driven smart manufacturing crawler"
```

---

### Task 4: Verify staging.py compatibility and finalize requirements

**Files:**
- Modify: `pipeline/requirements.txt`
- Test: `pipeline/tests/test_staging_compat.py`

**Interfaces:**
- Consumes: `CompanyWebsiteCrawler.crawl_website` (Task 3) and `pipeline.staging.StagingDB.update_crawl_results` (existing, unmodified).

- [ ] **Step 1: Add pytest to requirements**

Edit `pipeline/requirements.txt`, append a line:

```
pytest>=8.0.0
```

- [ ] **Step 2: Write the failing compatibility test**

```python
# pipeline/tests/test_staging_compat.py
import json
import os
import tempfile

from pipeline.staging import StagingDB
from pipeline.crawler import CompanyWebsiteCrawler


def test_update_crawl_results_accepts_new_crawler_output():
    """Guards against the smart crawler's output shape breaking staging.py."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        db = StagingDB(db_path=path)
        company_id = db.insert_place({
            "source": "test", "source_url": "https://maps.google.com/x",
            "company_name": "Acme Mfg", "website": "https://acmemfg.com",
            "phone": "", "address": "", "city": "", "state_slug": "oh", "zip_code": "",
            "category": "cnc-machining", "rating": "", "reviews": "",
        }) if hasattr(db, "insert_place") else None

        empty_crawl = CompanyWebsiteCrawler().crawl_website("")
        assert empty_crawl["crawl_status"] == "failed"

        if company_id is not None:
            db.update_crawl_results(company_id, empty_crawl)
    finally:
        os.remove(path)
```

- [ ] **Step 3: Run test to check current staging.py API**

Run: `./pipeline/.venv/bin/python -m pytest pipeline/tests/test_staging_compat.py -v`

If `StagingDB` does not expose `insert_place` or takes different constructor args, open `pipeline/staging.py` and adjust the test's setup calls to match its actual public API (read `pipeline/staging.py:1-95` for the real method names/signatures) — do not modify `staging.py` itself. Update the test until it exercises the real `insert` + `update_crawl_results` path successfully.
Expected after adjustment: PASS

- [ ] **Step 4: Commit**

```bash
git add pipeline/requirements.txt pipeline/tests/test_staging_compat.py
git commit -m "test(pipeline): verify staging.py compatibility with smart crawler output"
```

---

## Self-Review Notes

- **Spec coverage:** link prioritization (Task 1/3), crawl budget default 5 configurable (Task 3 `max_pages`), content extraction incl. title/meta/headings/text/links/images/emails/phones/socials/page-type (Task 2/3), manufacturing field extraction incl. materials/brands/years/locations/HQ (Task 2/3), image candidate collection with metadata, no downloads (Task 2), skip low-value URLs (Task 1), priority-queue BFS with normalization/dedup (Task 1/3), structured output object (Task 3 `_aggregate`), backward compatibility with `staging.py` (Task 4), no AI / no image downloads (respected throughout — no such code added).
- **Placeholder scan:** none found; all steps contain complete runnable code.
- **Type consistency:** `crawl_website`, `_fetch_url`, `_build_page_result`, `_discover_links`, `_aggregate`, `_empty_result` names and return shapes match across Task 3 steps and Task 4's usage.
