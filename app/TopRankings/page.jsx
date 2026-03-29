import Link from 'next/link';
import { createPageUrl } from '@/utils';

export const metadata = {
  title: 'Top Rankings – Coming Soon',
  description:
    'FirmsLedger Top Rankings — discover the highest-rated business service providers worldwide. Rankings based on verified reviews, expertise, and client satisfaction. Coming soon.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Top Rankings – Coming Soon | FirmsLedger',
    description:
      'Discover the highest-rated business service providers worldwide. Rankings based on verified reviews, expertise, and client satisfaction.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Rankings – Coming Soon | FirmsLedger',
    description:
      'Discover the highest-rated business service providers worldwide. Rankings based on verified reviews, expertise, and client satisfaction.',
  },
};

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
