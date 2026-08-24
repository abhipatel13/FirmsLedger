import About from '@/views/About';
import { SITE_NAME, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'About Us',
  description: 'Learn about FirmsLedger — an independent, verified directory built to connect industrial buyers directly with verified manufacturers across the US.',
  alternates: { canonical: `${_BASE}/about` },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description: 'Learn about FirmsLedger — an independent, verified US manufacturer directory.',
    type: 'website',
    url: `${_BASE}/about`,
  },
};

export default function AboutPage() {
  return <About />;
}
