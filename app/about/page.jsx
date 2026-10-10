import About from '@/views/About';
import { SITE_NAME, BASE_URL, OG_IMAGES } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'About Our US Manufacturer Directory',
  description: 'Learn about FirmsLedger — an independent directory built to connect industrial buyers directly with manufacturers across the US.',
  alternates: { canonical: `${_BASE}/about` },
  openGraph: {
    images: OG_IMAGES,
    title: `About Our US Manufacturer Directory | ${SITE_NAME}`,
    description: 'Learn about FirmsLedger — an independent US manufacturer directory.',
    type: 'website',
    url: `${_BASE}/about`,
  },
};

export default function AboutPage() {
  return <About />;
}
