import { Suspense } from 'react';
import Directory from '@/views/Directory';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY, getCategoryTitle } from '@/lib/seo';

export async function generateMetadata() {
  const title = getCategoryTitle('Staffing Companies');
  const description = "Discover the top staffing companies at FirmsLedger. Browse verified staffing agencies—executive search, healthcare staffing, IT staffing, and more. Compare the most reliable staffing providers in India by expertise, project needs, and pricing.";
  const canonical = `${BASE_URL.replace(/\/$/, '')}/directory/staffing`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: canonical },
    alternates: { canonical },
  };
}

export default function DirectoryStaffingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <Directory underStaffing />
    </Suspense>
  );
}
