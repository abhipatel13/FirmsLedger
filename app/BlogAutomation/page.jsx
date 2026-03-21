import BlogAutomation from '@/views/BlogAutomation';
import { SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: `Blog Automation | Admin | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function BlogAutomationPage() {
  return <BlogAutomation />;
}
