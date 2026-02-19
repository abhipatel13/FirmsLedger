import Link from 'next/link';
import { createPageUrl } from '@/utils';

export default function TopRankingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Top Rankings</h1>
        <p className="text-slate-600 mb-6">This page is coming soon.</p>
        <Link href={createPageUrl('Home')} className="text-blue-600 hover:underline font-medium">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
