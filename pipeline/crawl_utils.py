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
