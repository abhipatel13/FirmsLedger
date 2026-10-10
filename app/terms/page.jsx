import { BASE_URL, SITE_NAME, OG_IMAGE } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FirmsLedger, the US manufacturer and supplier directory.',
  alternates: { canonical: `${_BASE}/terms` },
  robots: { index: true, follow: true },
  openGraph: { images: [OG_IMAGE],
    title: `Terms of Service | ${SITE_NAME}`,
    description: 'Terms of Service for FirmsLedger, the US manufacturer and supplier directory.',
    type: 'website',
    url: `${_BASE}/terms`,
  },
};

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: `By accessing or using ${SITE_NAME} ("the Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site.`,
  },
  {
    heading: '2. Description of Service',
    body: `${SITE_NAME} is a directory that helps buyers discover and compare US-based manufacturers and suppliers. Company listings, ratings, and reviews are provided for informational purposes only. We do not guarantee the accuracy, completeness, or reliability of any listing, and we are not a party to any transaction between a buyer and a listed company.`,
  },
  {
    heading: '3. Company Listings and Reviews',
    body: 'Companies may submit information to be listed on the Site. Reviews, where present, are intended to reflect genuine customer experiences. We reserve the right to remove any listing or review that we determine, in our sole discretion, to be fraudulent, abusive, or in violation of these terms. Listings are organised by category and location — paid placement does not affect listing position.',
  },
  {
    heading: '4. User Conduct',
    body: 'You agree not to misuse the Site, including by submitting false information, scraping or harvesting data without permission, attempting to manipulate rankings or reviews, or using the Site for any unlawful purpose.',
  },
  {
    heading: '5. Intellectual Property',
    body: `All content on the Site, including the ${SITE_NAME} name, logo, and design, is the property of ${SITE_NAME} or its licensors and is protected by applicable intellectual property laws. Company names, logos, and trademarks displayed in listings remain the property of their respective owners.`,
  },
  {
    heading: '6. Disclaimer of Warranties',
    body: 'The Site and its content are provided "as is" without warranties of any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, or that any company listed meets any particular standard of quality.',
  },
  {
    heading: '7. Limitation of Liability',
    body: `To the fullest extent permitted by law, ${SITE_NAME} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or any transaction with a company discovered through the Site.`,
  },
  {
    heading: '8. Changes to These Terms',
    body: 'We may update these Terms of Service from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised terms.',
  },
  {
    heading: '9. Contact',
    body: 'Questions about these Terms of Service can be sent through our Contact page.',
  },
];

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 40 }}>Last updated: July 2026</p>

        {SECTIONS.map((s) => (
          <section key={s.heading} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>{s.heading}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569', margin: 0 }}>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
