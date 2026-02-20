import { Suspense } from 'react';
import AgencyProfile from '@/views/AgencyProfile';

export default async function CompanyProfilePage({ params }) {
  const resolved = await params;
  const slug = typeof resolved?.slug === 'string' ? resolved.slug.trim() : '';
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <AgencyProfile companySlug={slug || undefined} />
    </Suspense>
  );
}
