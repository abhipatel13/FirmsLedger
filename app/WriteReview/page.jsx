import { Suspense } from 'react';
import WriteReviewForm from '@/components/WriteReviewForm';

export const metadata = {
  title: 'Write a Review | FirmsLedger',
  robots: { index: false, follow: false },
};

export default function WriteReviewPage() {
  return (
    <Suspense fallback={null}>
      <WriteReviewForm />
    </Suspense>
  );
}
