import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Search Manufacturers & Suppliers | ${SITE_NAME}`,
  description: 'Search US manufacturers and suppliers by category and state on FirmsLedger.',
  alternates: { canonical: `${_BASE}/search` },
  // Query-driven results, not stable indexable content — the dedicated
  // /{category}/{state} pages are the canonical crawlable listing pages.
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }) {
  return children;
}
