import { Suspense } from 'react';
import AIMatchPage from '@/views/AIMatch';

export const metadata = {
  title: 'AI Match Results | FirmsLedger',
  description: 'AI-powered agency matching — find the best verified business service provider for your specific requirement.',
};

function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AIMatchPage />
    </Suspense>
  );
}
