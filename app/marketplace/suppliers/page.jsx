import SupplierList from '@/views/marketplace/SupplierList';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Supplier Directory — Find Verified B2B Suppliers | ${SITE_NAME}`,
  description: 'Browse verified suppliers across all industries. Find manufacturers, distributors, and wholesalers ready to fulfill your orders.',
  alternates: { canonical: `${_BASE}/marketplace/suppliers` },
};

export default function SuppliersPage() {
  return <SupplierList />;
}
