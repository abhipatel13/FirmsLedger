import Contact from '@/views/Contact';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Contact Us | ${SITE_NAME}`,
  description: 'Get in touch with FirmsLedger. Send a message or email us for questions, feedback, or partnership inquiries.',
  alternates: { canonical: `${_BASE}/contact` },
  openGraph: {
    title: 'Contact FirmsLedger',
    description: 'Get in touch with FirmsLedger for questions, feedback, or partnership inquiries.',
    type: 'website',
    url: `${_BASE}/contact`,
  },
};

export default function ContactPage() {
  return <Contact />;
}
