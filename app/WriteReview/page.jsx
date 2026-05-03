import WriteReviewForm from '@/components/WriteReviewForm';

export const metadata = {
  title: 'Write a Review',
  robots: { index: false, follow: true },
};

export default function WriteReviewPage() {
  return <WriteReviewForm />;
}
