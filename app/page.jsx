import Home from '@/views/Home';
import { SITE_NAME, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';

export const metadata = {
  title: `Top Companies List in ${SEO_COUNTRY} ${SEO_YEAR} | Verified Service Providers | ${SITE_NAME}`,
  description: `FirmsLedger delivers India's definitive top companies list. Discover verified staffing agencies, consultants, and business service providers. Browse by expertise, project needs, and pricing—all in one trusted directory.`,
  openGraph: {
    title: `Top Companies List in ${SEO_COUNTRY} | ${SITE_NAME}`,
    description: "Discover verified business service providers and staffing agencies. Browse the top companies list by expertise, project needs, and pricing.",
    type: 'website',
  },
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://firmsledger.com' },
};

export default function HomePage() {
  return <Home />;
}
