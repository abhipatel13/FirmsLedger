import SupplierDetail from '@/views/marketplace/SupplierDetail';

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function SupplierDetailPage({ params }) {
  const { id } = await params;
  return <SupplierDetail supplierId={id} />;
}
