import RFQDetail from '@/views/marketplace/RFQDetail';

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function RFQDetailPage({ params }) {
  const { id } = await params;
  return <RFQDetail rfqId={id} />;
}
