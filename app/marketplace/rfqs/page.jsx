import RFQList from '@/views/marketplace/RFQList';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Open RFQs — Buyers Looking for Suppliers | ${SITE_NAME}`,
  description: 'Browse open purchase requests from buyers worldwide. Find RFQs matching your products and respond directly.',
  alternates: { canonical: `${_BASE}/marketplace/rfqs` },
};

export default function RFQsPage() {
  return <RFQList />;
}
