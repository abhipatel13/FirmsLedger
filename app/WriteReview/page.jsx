import Link from 'next/link';
import { createPageUrl } from '@/utils';

export default function WriteReviewPage({ searchParams }) {
  const agencyId = searchParams?.agency;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Write a Review</h1>
        <p className="text-slate-600 mb-6">
          {agencyId ? `Review flow for agency ${agencyId} — coming soon.` : 'Write a review — coming soon.'}
        </p>
        <Link href={createPageUrl('Directory')} className="text-blue-600 hover:underline font-medium">
          Browse Agencies
        </Link>
      </div>
    </div>
  );
}
