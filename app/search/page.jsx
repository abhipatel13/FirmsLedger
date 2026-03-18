import { Suspense } from 'react';
import SearchPage from '@/views/Search';

export const metadata = {
  title: 'Search Results | FirmsLedger',
  description: 'Search for verified staffing agencies, consultants, and business service providers on FirmsLedger.',
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}
