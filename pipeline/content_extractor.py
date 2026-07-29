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
LOCATION_PATTERN = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}\b|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*))\b'

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
