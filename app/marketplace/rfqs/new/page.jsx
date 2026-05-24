import PostRFQ from '@/views/marketplace/PostRFQ';
import { SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: `Post an RFQ | ${SITE_NAME}`,
  description: 'Post your purchase requirement and get quotes from verified suppliers worldwide.',
  robots: { index: false, follow: true },
};

export default function PostRFQPage() {
  return <PostRFQ />;
}
