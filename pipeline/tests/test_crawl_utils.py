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
