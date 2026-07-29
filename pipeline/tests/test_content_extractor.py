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
