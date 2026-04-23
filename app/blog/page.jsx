import Blog from '@/views/Blog';
import { SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: 'Insights, guides, and news on staffing, recruiting, and hiring.',
};

export default function BlogPage() {
  return <Blog />;
}
