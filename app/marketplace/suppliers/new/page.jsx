import PostSupplier from '@/views/marketplace/PostSupplier';
import { SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: `List Your Products | ${SITE_NAME}`,
  description: 'List your products and capabilities to reach buyers actively searching for suppliers.',
  robots: { index: false, follow: true },
};

export default function PostSupplierPage() {
  return <PostSupplier />;
}
