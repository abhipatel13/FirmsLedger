import Blogs from '@/views/Blog';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';

export const metadata = {
  title: `Business Insights & Resources ${SEO_YEAR} | Industry Guides for Products & Services | ${SITE_NAME}`,
  description: `Expert insights and resources on manufacturing, staffing, consulting, and business products & services in ${SEO_COUNTRY}. Guides to choosing the right suppliers, industry trends, and success stories.`,
  openGraph: {
    title: `Insights & Resources | ${SITE_NAME}`,
    description: `Expert advice and guides on manufacturing, staffing, consulting, and business products & services in ${SEO_COUNTRY}.`,
    type: 'website',
    url: `${BASE_URL.replace(/\/$/, '')}/blogs`,
  },
  alternates: { canonical: `${BASE_URL.replace(/\/$/, '')}/blogs` },
};

export default function BlogsPage() {
  return <Blogs />;
}
